class ruby {
  package { ['ruby', 'rubygems']:
    ensure => present,
  }
}
