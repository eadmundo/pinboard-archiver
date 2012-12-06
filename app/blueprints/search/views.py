from pprint import pprint
from flask import request, render_template
import rawes
from app.helpers import Pagination
from . import blueprint


@blueprint.route('/')
def results():

    page = int(request.args.get('page', 1))
    qstr = request.args.get('q', '')
    size = 20

    es = rawes.Elastic('localhost:9200')

    if qstr == '':
        query = {
            'match_all': {}
        }
        sort = {
            'last_updated': 'desc'
        }
    else:
        query = {
            'term': {
                '_all': qstr
            }
        }
        sort = {
            '_score': 'desc'
        }

    #print qstr
    #print query

    results = es.get('bookmarks/bookmark/_search', data={
        'version': True,
        'query': query,
        'fields': ['title', 'archive_url', 'last_updated'],
        'size': size,
        'from': (page * size) - size,
        'sort': sort,
    })

    print results

    pagination = Pagination(page, size, results['hits']['total'], results['hits']['hits'])

    pprint(pagination.pages)

    return render_template('srp.jinja', pagination=pagination, qstr=qstr)
