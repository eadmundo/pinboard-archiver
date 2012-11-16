import requests
from celery import Celery
import celeryconfig

celery = Celery()
celery.config_from_object(celeryconfig)

api_url = 'https://api.pinboard.in/v1/posts/update?auth_token=edwardjstone:13204B53B64A2C29FA8D&format=json'


@celery.task
def posts_update():
    r = requests.get(api_url)
    print r.json.get('update_time')
    return r.json
