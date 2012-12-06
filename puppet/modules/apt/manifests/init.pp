class apt {
  exec { 'apt-update':
    command => '/usr/bin/apt-get -qq update'
  }
}

class apt::sources::ubuntu( $dist = 'precise', $mirror = 'http://us.archive.ubuntu.com/ubuntu/') {
  file { '/etc/apt/sources.list':
    content => template("apt/${dist}.list.tpl"),
    before  => Exec['apt-update'],
  }
}
