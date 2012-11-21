import 'lib/*.pp'

line { 'line-venv-activate':
  ensure => present,
  line   => 'cd /vagrant',
  file   => '/home/vagrant/.bashrc',
}

include python
include nodejs
include less
include nunjucks
include fabric
include git
include jdk
include jpype
include elasticsearch
include rabbitmq
include curl
include nginx
include nginx::site::archive