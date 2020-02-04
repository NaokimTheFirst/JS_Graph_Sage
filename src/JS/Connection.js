var ws;

initCon()

function initCon() {
  // Connect to Web Socket
  ws = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  ws.onopen = function() {
    UpdateGraphProperties();
  };
  
  ws.onmessage = function(e) {
    let object = eval('(' + e.data + ')');
    SetProperties(object.result[0],object.result[1],object.result[2],object.result[3],object.result[4]);
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

