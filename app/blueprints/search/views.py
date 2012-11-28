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
    else:
        query = {
            'term': {
                '_all': qstr
            }
        }

    #print qstr
    #print query

    results = es.get('bookmarks/bookmark/_search', data={
        'version': True,
        'query': query,
        'fields': ['title', 'archive_url'],
        'size': size,
        'from': (page * size) - size,
        'sort': {
            '_score': 'desc'
        }
    })

    #print results

    pagination = Pagination(page, size, results['hits']['total'], results['hits']['hits'])

    pprint(pagination.pages)

    return render_template('srp.jinja', pagination=pagination, qstr=qstr)
