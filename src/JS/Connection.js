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

    switch (object.request) {
      case propertiesRequestParameter:
        SetProperties(object.result[0],object.result[1],object.result[2],object.result[3],object.result[4]);
        break;
      case strongOrientationRequestParameter :
        //Reload Graph
        CustomWarn("New oriented graph receive");
        break;
      case randomOrientationRequestParameter :
          //Reload Graph
          CustomWarn("New oriented graph receive");
          break;
      case vertexColoringRequestParameter:
        CustomWarn("New vertex coloration receive");
        //change vertex color
        break;
      case edgeColoringRequestParameter:
        CustomWarn("New edges coloration  receive");
        //change edge color
        break;
      default :
        console.error("Unknown request parameter :"+ object.request);
        break;
    }
      
  };
  
  webSocket.onclose = function() {
  };

  webSocket.onerror = function(e) {
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
  var prettyJSON = PrettyfyJSON();
  webSocket.send(JSON.stringify(prettyJSON))
}

function onCloseClick() {
  webSocket.close();
}

