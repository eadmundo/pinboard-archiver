from app.helpers import Pagination
import rawes

class BookmarksQuery(object):

    def __init__(self, q=None, ):
        self.es = rawes.Elastic('localhost:9200')

