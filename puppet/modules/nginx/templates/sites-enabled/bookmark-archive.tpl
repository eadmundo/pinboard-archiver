server {
    listen 80 default_server;
    server_name localhost;

    location / {
        root /vagrant/archive;
        index  index.html;
    }
}