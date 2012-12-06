class vagrant {
  line { 'line-venv-activate':
    ensure => present,
    file   => '/home/vagrant/.bashrc',
    line   => 'cd /vagrant && source .venv/bin/activate',
  }
  file { '/srv/www':
    ensure => directory,
  }
  file { '/srv/www/app':
    ensure => link,
    target => '/vagrant',
  }
}
