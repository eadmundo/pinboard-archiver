import 'lib/*.pp'
import 'nodes/*.pp'

class common {

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

}