class jpype {
  package { 'python-jpype':
    ensure => 'installed',
    require => Package[default-jdk],
  }
}