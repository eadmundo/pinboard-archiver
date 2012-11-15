class nunjucks {
  exec { 'nunjucks-install':
    command => '/usr/bin/npm install nunjucks --global',
    creates => '/usr/bin/nunjucks-precompile',
    require => Package[npm],
  }
}
