var ws;

initCon()

function initCon() {
  // Connect to Web Socket
  ws = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  ws.onopen = function() {
    //console.log("onopen");
  };
  
  ws.onmessage = function(e) {
    let object = eval('(' + e.data + ')');
    SetRadius(object.result[0]);
    SetDiameter(object.result[1]);
  };
  
  ws.onclose = function() {
    //console.log("onclose");
  };

  ws.onerror = function(e) {
    //console.log("onerror");
    console.log(e)
  };
}

function SubmitMessage() {
  if(!graphJSON.parameter){
    graphJSON.parameter = null;
  }
  var prettyJSON = PrettyfyJSON();
  ws.send(JSON.stringify(prettyJSON))
}

function onCloseClick() {
  ws.close();
}

