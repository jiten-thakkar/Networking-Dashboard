Networking Dashboard v01
========================

This add-on provides an insight of Mozilla Firefox's internals of networking.
It provides a UI showing current open connections with host names,how many of
them are active/idle, if they are using SPDY or not, if they are using SSL or
not, DNS cache entries, total data sent and received, data related to WebSocket
connections etc. For details, check out my [blog](https://netij.blogspot.com).

Unfortunately, this add-on won't work in your browser until [this](https://bugzilla.mozilla.org/show_bug.cgi?id=783205) bug lands.

This add-on contains:

* A program (lib/main.js).
* Data (data/)
* Binary (bin/)