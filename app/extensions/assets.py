import os
import json
from flask.ext.assets import Environment, Bundle
from webassets.ext.jinja2 import assets as jinja_assets

js_main = [
    ]
css_main = [
    'css/default.css',
    'css/bootstrap.css',
    ]


def configure_assets(app):
    """
    Configures asset Environment.
    """
    assets = Environment()
    # webassets seems to require the environment to be bound to an application
    # before you can change the environment options.
    assets.init_app(app)

    # main css bundle
    assets.register('css_main',
        Bundle(
            *css_main
        ),
        #filters='cssrewrite',
        output='assets/css/main.%(version)s.css',
    )
