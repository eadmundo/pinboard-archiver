#
# Puppet bootstrap
#

import '../lib/*.pp'

include vagrant

# ruby/gem needs to be installed before the initial Puppet run on Vagrant,
# because Vagrant base boxes ship with a pre-installed ruby in /opt which is
# in the default path.
include ruby
