from fabric.decorators import task

import virtualenv
import app


@task
def build():
    """
    Execute build tasks.
    """
    virtualenv.build()


@task
def run():
    """
    Run app in debug mode (for development).
    """
    app.run()


@task
def freeze():
    """Build app as static site"""
    app.freeze()


@task
def serve_frozen():
    """Build and serve static site up on development server"""
    app.freeze()
    app.serve_frozen()
