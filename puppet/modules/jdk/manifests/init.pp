class jdk {
  package { 'default-jdk':
    ensure => 'installed',
  }
  file { "/etc/profile.d/set_java_home.sh":
    ensure  => present,
    content => template("jdk/set_java_home.sh"),
  }
}