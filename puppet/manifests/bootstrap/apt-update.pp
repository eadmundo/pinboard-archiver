#
# apt-update bootstrap
#
# precise64 supplied by vagrant ships with US apt mirrors which are slow. Here
# we overwrite them with the UK ones, prior to running an apt-get update.
#

include apt

class { 'apt::sources::ubuntu':
  mirror => 'http://gb.archive.ubuntu.com/ubuntu/'
}
