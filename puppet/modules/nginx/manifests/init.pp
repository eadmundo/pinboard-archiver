class nginx {
  package { 'nginx':
    ensure => 'installed',
  }
  # Disable default nginx site
  file { '/etc/nginx/sites-enabled/default':
    ensure => 'absent',
    before => Service['nginx']
  }
  service { 'nginx':
    ensure => 'running',
  }
}

class nginx::site::archive() {
  file { "/etc/nginx/sites-enabled/bookmark-archive":
    ensure  => present,
    owner   => root,
    group   => root,
    mode    => '644',
    content => template("nginx/sites-enabled/bookmark-archive.tpl"),
    require => Package['nginx'],
    notify  => Service['nginx'],
  }
}