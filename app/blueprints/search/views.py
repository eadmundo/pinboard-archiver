from pprint import pprint
from flask import render_template
import rawes
from . import blueprint


@blueprint.route('/')
def results():
    es = rawes.Elastic('localhost:9200')
    results = es.get('bookmarks/bookmark/_search', data={
        'version': True,
        'query': {
            'term': {
                '_all': 'python'
            }
        },
        'fields': ['title', 'archive_url'],
        'size': 5,
        'from': 5,
        'sort': {
            '_score': 'desc'
        }
    })
    pprint(results)
    return render_template('srp.jinja', results=results['hits']['hits'])
