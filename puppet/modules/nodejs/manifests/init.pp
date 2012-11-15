# Original recipe by niallo: https://gist.github.com/2003430
# Full Puppet module: https://github.com/garthk/puppet-chrislea

class python_software_properties {
  $package = "python-software-properties"
  package { $package:
    ensure => installed,
  }
}

define chrislea() {
  include python_software_properties

  # source.list files with dots in their name are changed to underscore by
  # apt-add.
  $name_sources_list = regsubst($name, '\.', '_', 'G')

  exec { "chrislea-repo-added-${name}" :
    command => "/usr/bin/add-apt-repository ppa:chris-lea/${name}",
    creates => "/etc/apt/sources.list.d/chris-lea-${name_sources_list}-${::lsbdistcodename}.list",
    require => Package[$::python_software_properties::package],
  }

  exec { "chrislea-repo-ready-${name}" :
    command => "/usr/bin/apt-get update",
    require => Exec["chrislea-repo-added-${name}"],
    creates => "/var/lib/apt/lists/ppa.launchpad.net_chris-lea_${name}_ubuntu_dists_${::lsbdistcodename}_Release",
    timeout => 3600,
  }
}

class nodejs {
  chrislea { 'node.js': }
  package { ["nodejs", "nodejs-dev", "npm"]:
    ensure => installed,
    require => Chrislea['node.js'],
  }

  # other packages we need, e.g. g++ to compile node-expat
  package { ["g++", "libexpat1-dev"]:
    ensure => installed,
  }

}