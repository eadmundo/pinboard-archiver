from urlparse import urlparse
import requests
import envoy
from celery import Celery
import celeryconfig
from boilerpipe.extract import Extractor
from bs4 import UnicodeDammit
import json
import re
import sys
import os
from datetime import datetime

celery = Celery()
celery.config_from_object(celeryconfig)

auth_token = 'edwardjstone:MGRKNJYZNTNIMTC4NZK4'
base_qstr = '?format=json&auth_token=%s' % auth_token
base_api_url = 'https://api.pinboard.in/v1/'

get_results = 50
start_from = 0
wait_for = 300  # seconds

es_host = 'http://localhost:9200/'
es_index = 'bookmarks'

datetime_mask = "%Y-%m-%dT%H:%M:%SZ"


def posts_update_date():
    r = requests.get('%sposts/update%s' % (base_api_url, base_qstr))
    return datetime.strptime(r.json.get('update_time'), "%Y-%m-%dT%H:%M:%SZ")
    #return datetime.strptime('2012-11-20T12:45:30Z', datetime_mask)


@celery.task
def posts_update():
    most_recent = posts_update_date()
    print most_recent
    query = {
        "from": 0,
        "size": 1,
        "query": {
            "match_all": {}
        },
        "sort": {
            "posts_update": {
                "order": "desc"
            }
        },
        "fields": ["posts_update"]
    }
    r = requests.get('%s%s/_search' % (es_host, es_index), data=json.dumps(query))
    last_update_str = r.json['hits']['hits'][0]['fields']['posts_update']
    last_update = datetime.strptime(last_update_str, datetime_mask)
    print last_update
    if last_update < most_recent:
        print "there's an update - getting posts"
        get_posts.delay(start_from, get_results, from_date=last_update_str)


@celery.task
def posts_index_all():
    get_posts.apply_async((start_from, get_results, None))


@celery.task
def get_posts(start, results, from_date):
    url = '%sposts/all%s&start=%d&results=%d' % (base_api_url, base_qstr, start, results)
    if from_date is not None:
        url = '%s&fromdt=%s' % (url, from_date)
        index_date = from_date
    else:
        index_date = datetime.strftime(posts_update_date(), datetime_mask)
    r = requests.get(url)
    rjson = r.json
    #print from_date
    #rjson = json.loads(open('all.json').read())[start:start+results]
    print len(rjson)
    print start, results
    #last_update = datetime.strptime(from_date, datetime_mask)
    if len(rjson):
        get_posts.apply_async((start + results, results, from_date), countdown=wait_for)
        for post in rjson:
            #print post['href']
            post_archive.delay(post, index_date)


@celery.task
def test_extraction():
    extractor = Extractor(extractor='ArticleExtractor', url='http://paulgraham.com/startupideas.html')
    print 'extractor created'
    print extractor.getText()


@celery.task
def post_archive(post, update_date):
    post_id = post['hash']
    get = requests.get('%s%s/bookmark/%s' % (es_host, es_index, post_id))
    indexed = get.json['exists']
    o = urlparse(post['href'])
    archive_directory = 'archive/%s/' % (post['hash'])
    fetched = os.path.exists(archive_directory)

    if indexed:
        changed = post['meta'] != get.json['_source']['meta']
    else:
        changed = False

    if changed:
        url_changed = post['href'] != get.json['_source']['url']
    else:
        url_changed = False

    #print "url_changed", url_changed
    #print "fetched", fetched
    #print "changed", changed
    #print "indexed", indexed

    archive_path = '%s%s%s' % (archive_directory, o.netloc, o.path)
    if len(o.query):
        archive_path = '%s?%s' % (archive_path, o.query)

    if not fetched or url_changed:
        print "wget -E -H -k -K -p -P 'archive/%s' '%s'" % (post['hash'], post['href'])
        e = envoy.run("wget -E -H -k -K -p -P 'archive/%s' '%s'" % (post['hash'], post['href']))
        match = re.search('(%s.*)\' saved' % re.escape(archive_path), e.std_err)
        archive_url = 'http://localhost:8080/%s' % match.group(1)
        archive_path = '/vagrant/%s' % match.group(1)
        changed = True
    else:
        if indexed:
            archive_url = get.json['_source']['archive_url']
            archive_path = archive_url.replace('http://localhost:8080/', '/vagrant/')
        else:
            archive_directory = os.path.dirname(archive_path)
            archive_path = '/vagrant/%s/%s' % (archive_directory, [path for path
                            in os.listdir(archive_directory)
                                if path.endswith('.html')][0])
            archive_url = archive_path.replace('/vagrant/', 'http://localhost:8080/')

    #print archive_url
    #print archive_path

    #sys.exit()

    #print "changed", changed

    if not indexed or changed:
        #sys.exit()
        e2 = envoy.run(".venv/bin/python extractor.py %s" % archive_path)
        post_text = e2.std_out.replace('\n', ' ')
        #html = open(archive_path).read()
        #unicode_html = UnicodeDammit(html)
        #extractor = Extractor(extractor='ArticleExtractor', html=html)
        #post_text = extractor.getText().replace('\n', ' ')
        #unicode_text = UnicodeDammit(post_text, unicode_html.original_encoding).unicode_markup
        url = 'http://localhost:9200/bookmarks/bookmark/%s/_update' % post['hash']
        post_data = {
            "title": post['description'],
            "url": post['href'],
            "text": post_text.replace('"', '\\"'),
            "meta": post['meta'],
            "posts_update": update_date,
            "hash": post['hash'],
            "archive_url": archive_url,
        }
        data = {
            "doc": post_data,
            "upsert": post_data,
        }
        #print json.dumps(data).encode('utf-8')
        r = requests.post(url, data=json.dumps(data).encode('utf-8'))
        print r.status_code


@celery.task
def post_index(post):
    extractor = Extractor(extractor='ArticleExtractor', url=post['href'])
    post_text = extractor.getText().replace('\n', ' ')
    url = 'http://localhost:9200/bookmarks/bookmark/%s/_create' % post['hash']
    data = '{"title":"%s", "url":"%s", "text":"%s"}' % (post['description'], post['href'], post_text.replace('"', '\\"'))
    r = requests.put(url, data=data)
    print r.status_code
