class upstart {
  # Don't ensure upstart is automatically installed here, as it may force
  # sysvinit to be removed on some versions of Debian.
}

define upstart::job( $ensure = 'present',
                     $template = 'upstart.conf.tpl',
                     $startup = 'runlevel [2345]',
                     $env = [],
                     $chdir = '/srv/www/app',
                     $setuid = 'www-data',
                     $setgid = 'www-data',
                     $cmd = ".venv/bin/gunicorn --config gunicorn.conf 'app:create_app()'"
                    ) {
  file { "/etc/init/${name}.conf":
    ensure  => $ensure,
    content => template("upstart/${template}"),
    notify  => Service[$name],
  }
  file { "/etc/sudoers.d/upstart-${name}":
    mode    => 440,
    content => "tobias ALL = (root) NOPASSWD: /sbin/start ${name}, /sbin/stop ${name}, /sbin/reload ${name}, /sbin/restart ${name}\n"
  }
  service { "${name}":
    ensure   => running,
    provider => upstart,
    require  => [
      File["/etc/init.d/${name}"],
    ],
  }
  # Bug in Puppet <=2.7.14 requires symlink to exist in /etc/init.d, even for
  # upstart job
  file { "/etc/init.d/${name}":
    ensure => link,
    target => '/lib/init/upstart-job',
  }
}
