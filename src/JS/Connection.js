var webSocket;

const propertiesRequestParameter = "Properties";
const strongOrientationRequestParameter = "strongOrientation";
const randomOrientationRequestParameter = "randomOrientation";
const vertexColoringRequestParameter = "vertexColoring";
const edgeColoringRequestParameter = "edgeColoring";

function initCon() {
  // Connect to Web Socket
  webSocket = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  webSocket.onopen = function() {
    UpdateGraphProperties();
  };
  
  webSocket.onmessage = function(e) {
    let object = eval('(' + e.data + ')');
    SetProperties(object.result[0],object.result[1],object.result[2],object.result[3],object.result[4]);
  };
  
  webSocket.onclose = function() {
    //console.log("onclose");
  };

  webSocket.onerror = function(e) {
    //console.log("onerror");
    console.log(e)
  };
}

function RequestVertexColoring(){
  SubmitMessage(vertexColoringRequestParameter);
}

function RequestEdgeColoring(){
  SubmitMessage(edgeColoringRequestParameter);
}

function RequestStrongOrientation(){
  SubmitMessage(strongOrientationRequestParameter);
}

function RequestRandomOrientation(){
  SubmitMessage(randomOrientationRequestParameter);
}

function SubmitMessage(parameter) {
  graphJSON.parameter = parameter;
  var prettyJSON = PrettifyJSON();
  webSocket.send(JSON.stringify(prettyJSON))
}

function onCloseClick() {
  webSocket.close();
}

