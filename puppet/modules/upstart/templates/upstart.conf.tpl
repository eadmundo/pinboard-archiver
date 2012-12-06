<% if startup -%>
start on <%= startup %>
<% end -%>
stop on runlevel [016]

respawn

<% env.each do | key, value | -%>
env <%= key %>="<%= value %>"
<% end -%>

chdir <%= chdir %>
setuid <%= setuid %>
setgid <%= setgid %>

exec <%= cmd %>
