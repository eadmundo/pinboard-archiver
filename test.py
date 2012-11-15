from boilerpipe.extract import Extractor
url = 'http://www.guardian.co.uk/technology/gamesblog/2012/nov/12/grand-theft-auto-v-preview-gta-5'
extractor = Extractor(extractor='ArticleExtractor', url=url)

print extractor.getText()
