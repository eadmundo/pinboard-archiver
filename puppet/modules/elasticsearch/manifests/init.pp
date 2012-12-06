class elasticsearch {

  $version = '0.20.0.RC1'
  $java_package = 'default-jdk'
  $download = "http://cloud.github.com/downloads/elasticsearch/elasticsearch/elasticsearch-${version}.tar.gz"

  exec { 'download-elasticsearch':
    cwd     => '/tmp',
    command => "/usr/bin/wget -q ${download} -O elasticsearch-${version}.tar.gz",
    timeout => 120,
    unless => "/usr/bin/test -f /tmp/elasticsearch-${version}.tar.gz"
  }

  exec { 'extract-elasticsearch':
    cwd     => '/tmp',
    command => "/bin/tar xzf /tmp/elasticsearch-${version}.tar.gz",
    creates => "/tmp/elasticsearch-${version}",
    require => Exec[download-elasticsearch]
  }

  exec { "elasticsearch-${version}":
    command => "/bin/mv /tmp/elasticsearch-${version} /usr/share/elasticsearch",
    cwd     => "/tmp",
    creates => "/usr/share/elasticsearch",
    require => Exec[extract-elasticsearch],
  }

  file { '/usr/bin/elasticsearch':
    ensure  => link,
    target  => '/usr/share/elasticsearch/bin/elasticsearch',
    require => Exec["elasticsearch-${version}"],
  }

  file { '/usr/share/elasticsearch.in.sh':
    ensure => link,
    target => '/usr/share/bin/elasticsearch.in.sh',
    require => Exec["elasticsearch-${version}"],
  }

  group { 'elasticsearch':
    ensure => present,
    system  => true,
  }

  user { 'elasticsearch':
    ensure  => present,
    system  => true,
    home    => '/usr/share/elasticsearch',
    shell   => '/bin/false',
    gid     => 'elasticsearch',
    require => Group['elasticsearch'],
  }

  file { '/var/lib/elasticsearch':
    ensure  => directory,
    owner   => 'elasticsearch',
    group   => 'elasticsearch',
    mode    => '0755',
    require => User['elasticsearch'],
  }

  file { '/var/log/elasticsearch':
    ensure  => directory,
    owner   => 'elasticsearch',
    group   => 'elasticsearch',
    mode    => '0755',
    require => User['elasticsearch'],
  }

  file { '/etc/elasticsearch':
    ensure => directory
  }

  file { '/etc/elasticsearch/elasticsearch.yml':
    ensure  => present,
    content => template("elasticsearch/elasticsearch.yml"),
    owner => root,
    group => root,
  }

  file { '/etc/elasticsearch/logging.yml':
    ensure  => present,
    content => template("elasticsearch/logging.yml"),
    owner => root,
    group => root,
  }

  file { '/etc/default/elasticsearch':
    ensure  => present,
    content => template("elasticsearch/etc-default-elasticsearch"),
    require => File["/usr/share/elasticsearch.in.sh"],
  }

  file { "/etc/init/elasticsearch.conf":
    ensure => present,
    content => template("elasticsearch/etc-init-elasticsearch.conf"),
    require => File["/etc/default/elasticsearch"],
  }

  service { 'elasticsearch':
    ensure   => running,
    enable   => true,
    provider => upstart,
    require => File["/etc/init/elasticsearch.conf"],
  }

  file { '/tmp/bookmarks-index-settings.json':
    ensure => present,
    content => template('elasticsearch/bookmarks-index-settings.json'),
  }

  #exec { 'bookmarks-index':
  #  command => "/usr/bin/curl -XPUT http://localhost:9200/bookmarks/ -d @bookmarks-index-settings.json",
  #  cwd => '/tmp',
  #  require => [Service[elasticsearch], Package[curl], File['/tmp/bookmarks-index-settings.json']],
  #}

}
