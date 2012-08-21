const { Factory } = require('api-utils/xpcom');
const { Unknown } = require('api-utils/xpcom');
const {Cc,Ci,Cm,Cu,components} = require("chrome");
 
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/AddonManager.jsm");

Cm.QueryInterface(Ci.nsIComponentRegistrar);

var self = require("self");
var timers = require("timers");

function getData(worker) {
        var httpConnlog = Cc['@mozilla.org/network/http-connectionlog;1'].
		      getService(Components.interfaces.nsIHttpConnectionLog); 
  
	var websocketConnLog = Cc['@mozilla.org/network/websocket-connectionlog;1'].
			getService(Components.interfaces.nsIWebSocketConnectionLog);

	var socketConnLog = Cc['@mozilla.org/network/socketlog;1'].
			getService(Components.interfaces.nsISocketLog);

	var dnsdata = Cc['@mozilla.org/netwerk/dns-cache-entries;1'].
			getService(Components.interfaces.nsIDNSCacheEntries);

	websocketConnLog.startLogging = true;
	get();

	function get() {
	  var data = httpConnlog.getConnections();
	  var data1 = websocketConnLog.getConnections();
	  var data2 = socketConnLog.getConnections();
	  var data3 = dnsdata.getDNSCacheEntries();
	  var totaldata = {};
	  totaldata.http = data;
	  totaldata.websocket = data1;
	  totaldata.socket = data2;
	  totaldata.dns = data3;
	  worker.port.emit('networking-dashboard',totaldata);  
	  var t=timers.setTimeout(get,5000);
	}
    }
    
var pagemod = require("page-mod").PageMod({
    include: ['about:networking-dashboard'],
    contentScriptFile: [self.data.url("jquery-1.8.0.min.js"), self.data.url("about_networking_dashboard.js"),
                        self.data.url("jquery.flot.min.js")],
    onAttach: function(worker) {
              getData(worker);
    }
});

let netDash = Unknown.extend({
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
  classDescription: "about:networking-dashboard",
  classID: Components.ID("{b862ff39-b88f-4cf1-b82b-61b48f028f6a}"),
  contractID: "@mozilla.org/network/protocol/about;1?what=networking-dashboard",
  
  newChannel: function(uri) {
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var html = 'data:text/html,<!DOCTYPE html><html><head><meta charset="UTF-8" />'
               +'<LINK href="'+self.data.url("stylesheet.css")+'" rel="stylesheet" type="text/css">'
               +'</head><body>'
               +'<ul id="tabul">'
               +'</ul><div id="tabcontent" class="ui-content"></div>';
    html += "</body></html>";
    var channel = ioService.newChannel(html, null, null);
    var securityManager = Cc["@mozilla.org/scriptsecuritymanager;1"].getService(Ci.nsIScriptSecurityManager);
    var principal = securityManager.getSystemPrincipal(uri);
    channel.originalURI = uri;
    channel.owner = principal;
    return channel;
  },
 
  getURIFlags: function(uri) {
    return Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT;
  }
});

let namedFactory = Factory.new({
  contract: '@mozilla.org/network/protocol/about;1?what=networking-dashboard',
  component: netDash
});

