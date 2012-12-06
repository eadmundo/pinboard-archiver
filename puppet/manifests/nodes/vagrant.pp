node precise64 {

  include common
  include vagrant

  # Gunicorn
  upstart::job { 'gunicorn':
    ensure   => present,
    env      => [['FLASK_CONFIG' => 'config/dev.py']],
    # Gunicorn service in Vagrant can't start on init becuase /vagrant doesn't
    # get mounted until boot is finished. Puppet will start it instead.
    startup  => false,
  }

  # Celery
  upstart::job { 'celery':
    ensure  => present,
    cmd     => '.venv/bin/celery --config=celeryconfig worker -B --loglevel=info',
    startup => false,
    setuid     => 'vagrant',
    setgid     => 'vagrant',
  }

}