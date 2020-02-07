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
    TreatResponse(object);
  };
  
  webSocket.onclose = function() {
    //console.log("onclose");
  };

  webSocket.onerror = function(e) {
    //console.log("onerror");
    console.log(e)
  };
}

function TreatResponse(response){
  switch (response.request) {
    case propertiesRequestParameter:
      SetProperties(response.result[0],response.result[1],response.result[2],response.result[3],response.result[4]);
      break;
    case vertexColoringRequestParameter :
      SetNodesColoration(response.result);
      break;
    default:
      CustomWarn("Undefined response behavior for parameter :" + response.request);
      break;
  }
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

