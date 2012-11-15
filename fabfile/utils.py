"""
fabfile module that provides generic helper functions for other modules.
"""
import os
from fabric.api import env, local, run as fab_run
from fabric.context_managers import cd, lcd


def do(cmd, capture=False, *args, **kwargs):
    """
    Runs command locally or remotely depending on whether a remote host has
    been specified.
    """
    if env.host_string:
        with cd(env.remote_path):
            return fab_run(cmd, *args, **kwargs)
    else:
        # project root path is the default working directory
        path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if env['lcwd']:
            # lcd has already been invoked. If it's with a relative path, let's
            # make that relative to the project root
            if not env['lcwd'].startswith('/'):
                path = '%s/%s' % (path, env['lcwd'])
            else:
                # Honour the current lcd contact if it's an absolute path
                path = env['lcwd']
        with lcd(path):
            return local(cmd, *args, capture=capture, **kwargs)
