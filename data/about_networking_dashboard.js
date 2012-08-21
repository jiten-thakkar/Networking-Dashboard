var allData = {};
var tabs = ["Http", "WebSocket", "Sockets", "DNS", "Timeline"];
var timeLineData = {sent:[], received:[]};

function createheader(list) {
  var header = '<thaed><tr>';
  $.each(list,function(index,value){
     header+='<th class="ui-header">'+value+'</th>'
  });
  header+='</tr></thead>';
  return header;
}

function getCurrTab() {
  var currtab = $(".ctab");
  return currtab.prop("id");
}

$("#tabcontent").bind("t0", function updateHttpcontent() {
  var rows='';
  var headers = ["Hostname","Port","SPDY","SSL","Active","Idle"];
  $(".ui-grid").detach();
  $("#tabcontent").append('<div class="ui-grid">'
                         +'<table class="ui-table" border="1" width="100%">'
			 +createheader(headers)
			 +'<tbody>'
			 +getRows()
			 +'</tbody>'
			 +'</table></div>');
  
  $("#tabul li").removeClass("ctab");
  $("#t"+0).addClass("ctab");

  function getRows() {
    var rows = '';
    var data = [allData.http.host,allData.http.port,allData.http.spdy,
                allData.http.ssl,allData.http.active,allData.http.idle];
   
    $.each(allData.http.host,function(i){
      rows+='<tr>';
      $.each(headers,function(j) {
        if(j<4) //special case for Active and idle connections because data is the size of 'rtt' property
          rows+='<td class="ui-row">'+data[j][i]+'</td>';
        else {
          rows+='<td class="ui-row">'+data[j][i].rtt.length+'</td>';
        }
      });
      rows+='</tr>';
   });
   return rows;    
  }
});

$("#tabcontent").bind("t1", function updateWebSocketcontent() {
  var rows = '';
  var headers = ["Hostname","SSL","Msgs Sent","Msgs Received","Data sent", "Data received"];
  $(".ui-grid").detach();
  $("#tabcontent").append('<div class="ui-grid">'
                         +'<table class="ui-table" border="1" width="100%">'
			 +createheader(headers)
			 +'<tbody>'
			 +getRows()
			 +'</tbody>'
			 +'</table></div>');
  $("#tabul li").removeClass("ctab");
  $("#t"+1).addClass("ctab");
  
  function getRows() {
    var rows = '';
    var data = [allData.websocket.hostport,allData.websocket.encrypted,allData.websocket.msgsent,
                allData.websocket.msgreceived,allData.websocket.sentsize,allData.websocket.receivedsize];
    $.each(allData.websocket.hostport,function(i) {
      rows+='<tr>';
      $.each(headers,function(j) {
	    rows+='<td class="ui-row">'+data[j][i]+'</td>';
      });
      rows+='</tr>';
    });
    return rows;
  }
});

$("#tabcontent").bind("t2", function updateSocketcontent() {
  var rows = '';
  var headers = ["Host","Port","Tcp","Active", "Idle"];
  
  $(".ui-grid").detach();
  $("#tabcontent").append('<div class="ui-grid">'
                         +'<table class="ui-table" border="1" width="100%">'
			 +createheader(headers)
			 +'<tbody>'
			 +getRows()
			 +'</tbody>'
			 +'</table></div>');
  
  $("#tabul li").removeClass("ctab");
  $("#t"+2).addClass("ctab");

  function getRows() {
    var rows = '';
    var data = [allData.socket.host,allData.socket.port,allData.socket.tcp,
                allData.socket.active,allData.socket.idle];
    $.each(allData.socket.host,function(i) {
      rows+='<tr>';
      $.each(headers,function(j) {
	  rows+='<td class="ui-row">'+data[j][i]+'</td>';
      });
      rows+='</tr>';
    });
    return rows;
  }
});

$("#tabcontent").bind("t3", function updateDNScontent() {
  var rows='';
  var headers = ["Hostname","Family","Addresses","Expires(Seconds)"];
  $(".ui-grid").detach();
  $("#tabcontent").append('<div class="ui-grid">'
                         +'<table class="ui-table" border="1" width="100%">'
                         +createheader(headers)
                         +'<tbody>'
                         +getRows()
                         +'</tbody>'
                         +'</table></div>');

  $("#tabul li").removeClass("ctab");
  $("#t"+3).addClass("ctab");
      
  function getRows() {
    var rows = '';
    var data = [allData.dns.hostname, allData.dns.family, allData.dns.hostaddr, allData.dns.expiration];
      $.each(allData.dns.hostname,function(i) {
	rows+='<tr>';
	$.each(headers,function(j) {
	  if(j!=2) //special case for hostaddr because there might be multiple addresses
            rows+='<td class="ui-row">'+data[j][i]+'</td>';
	  else {
	    rows+='<td><div><table><body><head></head>';
	    if(data[j][i] != null) {                      //because there might be null entries
	      $.each(data[j][i], function(k) {
		rows+='<tr><td>'+data[j][i][k]+'</td></tr>';
	      });
	    }
	    rows+='</body></div></table></td>';
	  }
	});
	rows+='</tr>';
      });
    return rows;
   }
});

$("#tabcontent").bind("t4", function updateTimelinecontent() {
  $(".ui-grid").detach();
  $("#tabcontent").append('<div id="timeline" class="ui-grid" style="width:100%;height:300px;"></div>');
  var sent = [];
  var received = [];
  var gridWidth = 5;
  var columns = 13;
  if(timeLineData.sent.length < columns) {
    var i = columns-timeLineData.sent.length;
    while(i--) {
      var x = columns-i-timeLineData.sent.length-1;
      sent.push([gridWidth*(columns-i-timeLineData.sent.length-1), null]);
      received.push([gridWidth*(columns-i-timeLineData.sent.length-1), null]);
    }
    $.each(timeLineData.sent, function(i) {
      var x = columns-timeLineData.sent.length+i;
      sent.push([gridWidth*(columns-timeLineData.sent.length+i), timeLineData.sent[i]/1000]);
      received.push([gridWidth*(columns-timeLineData.sent.length+i), timeLineData.received[i]/1000]);
    });
  } else {
    var i = 0;
    while(i++ < columns) {
      var x = columns-i-1;
      sent.push([gridWidth*(columns-i), timeLineData.sent[timeLineData.sent.length-i-1]/1000]);
      received.push([gridWidth*(columns-i), timeLineData.received[timeLineData.sent.length-i-1]/1000]);
    }
  }
  
  $.plot("#timeline", [{data:sent, label: "Sent(Kb)"}, {data:received, label: "Received(Kb)"}], {
     yaxis: { min: 0 }
  });
});

function updateContent() {
  var ctab = getCurrTab();
  $("#tabcontent").trigger(ctab);
}

$(function() {
    createtabs(tabs);
    
    function createtabs(tabnames) {
      $.each(tabnames,function(index,value) {
        addtab(index, value);
      });
    }
    
    function addtab(i, name) {
      $("#tabul").append('<li id="t'+i+'" class="ntabs">'+name+'&nbsp;&nbsp;</li>'); 
      $("#tabul li").removeClass("ctab");
      $("#t"+i).addClass("ctab");
      $("#t"+i).bind("click", function() {
        $("#tabul li").removeClass("ctab");
        $("#t"+i).addClass("ctab");
        $("#tabcontent").trigger('t'+i);
      });
    }
    //Goback to first tab
    $("#tabul li").removeClass("ctab");
    $("#t"+0).addClass("ctab");
    updateContent();
});

self.port.on("networking-dashboard", function(data) {
  allData = data;
  timeLineData.sent.push(data.socket.sent);
  timeLineData.received.push(data.socket.received);
  updateContent();
});