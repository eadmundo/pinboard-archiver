from boilerpipe.extract import Extractor
#url = 'http://www.guardian.co.uk/technology/gamesblog/2012/nov/12/grand-theft-auto-v-preview-gta-5'

#html = open('/vagrant/archive/wikipedia/en.wikipedia.org/wiki/ISC_license.html').read()

#extractor = Extractor(extractor='ArticleExtractor', html=html)

#print extractor.getText()

#import requests

#r = requests.get('https://api.pinboard.in/v1/posts/recent?auth_token=edwardjstone:13204B53B64A2C29FA8D&count=1&format=json')

#print r.json

import json
import re
from tasks import post_archive, posts_index_all, posts_update, get_posts

#post = json.loads('{"description": "isolani - Web Standards: Web App Mistakes: Condemned to repeat","extended": "","hash": "3d97600671eec824e1e00a568593568a","href": "http://isolani.co.uk/blog/standards/WebAppMistakesWeAreCondemnedToRepeat","meta": "2da2ce176998ead694fcb2ae5e406024","shared": "no","tags": "","time": "2012-11-16T12:08:27Z","toread": "yes"}')

#json_data = open('debug-api/start=100&results=50.json').read()
#posts = json.loads(json_data)

#for post in posts:
#    print post['href']

#text = open('test-re-match.txt').read()

#match = re.search("Saving to: %s(.*)'" % re.escape('`'), text, re.MULTILINE)

#print match.groups()

#print posts[19]
#post_archive(posts[19], '2012-11-20T12:45:30Z')
#get_posts(1, 2, None)

#posts_index_all.delay()

posts_update()
#posts_update.delay()
#print posts[0]

#for i, post in enumerate(posts):
    #print i, post['href']
    #if i > 4:
    #    post_archive(post)
#test_extraction.delay()
#post_archive.delay(posts[1], '2012-11-20T12:45:30Z')
#post_archive(posts[1], '2012-11-20T12:45:30Z')
#post_index(posts[0])
