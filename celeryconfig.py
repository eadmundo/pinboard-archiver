# celery
import os
import sys
sys.path.append(os.getcwd())
CELERY_IMPORTS = ("tasks", )
BROKER_URL = "amqp://guest:guest@localhost:5672//"
CELERY_RESULT_BACKEND = "amqp"
CELERY_TASK_RESULT_EXPIRES = 3600

from datetime import timedelta

CELERYBEAT_SCHEDULE = {
    'check-pinboard-update': {
        'task': 'tasks.posts_update',
        'schedule': timedelta(seconds=15),
        #'args': (16, 16)
    },
}

CELERY_TIMEZONE = 'UTC'
