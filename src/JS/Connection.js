var ws;

initCon()

function initCon() {
  // Connect to Web Socket
  ws = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  ws.onopen = function() {
    output("onopen");
  };
  
  ws.onmessage = function(e) {
    let object = eval('(' + e.data + ')');
    SetRadius(object.result[0]);
    SetDiameter(object.result[1]);
  };
  
  ws.onclose = function() {
    output("onclose");
  };
  ws.onerror = function(e) {
    output("onerror");
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

function output(str) {
  console.log(str)
}

