import socket

# no debugging by default - this is overriden in runserver for local dev
DEBUG = False

# override with something sensible
SECRET_KEY = 'SecretKeyForSessionSigning'

# Email address that emails originate from. Make sure it's real, you own it,
# and SPF allows you to send from it.
DEFAULT_MAIL_SENDER = 'vagrant@%s' % socket.getfqdn()

# General email address for admins and errors
ADMIN_RECIPIENTS = ERROR_EMAIL = ['vagrant@localhost']
