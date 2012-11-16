#from boilerpipe.extract import Extractor
#url = 'http://www.guardian.co.uk/technology/gamesblog/2012/nov/12/grand-theft-auto-v-preview-gta-5'
#extractor = Extractor(extractor='ArticleExtractor', url=url)

#print extractor.getText()

import requests

r = requests.get('https://api.pinboard.in/v1/posts/recent?auth_token=edwardjstone:13204B53B64A2C29FA8D&count=1&format=json')

print r.json
