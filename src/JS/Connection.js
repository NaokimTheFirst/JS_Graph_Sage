var webSocket;

const propertiesRequestParameter = "Properties";
const strongOrientationRequestParameter = "strongOrientation";
const randomOrientationRequestParameter = "randomOrientation";
const vertexColoringRequestParameter = "vertexColoring";
const edgeColoringRequestParameter = "edgeColoring";
const convertGraphParameter = "convert";
const closeConnectionParameter = "closeConnection"

function InitWebSocketConnection() {
  // Connect to Web Socket
  webSocket = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  webSocket.onopen = function() 
  {
    UpdateGraphProperties();
  };
  
  webSocket.onmessage = function(message) 
  {
    TreatResponse(StringToObject(message.data));
  };
  
  webSocket.onclose = function() {};

  webSocket.onerror = function(error) 
  {
    CustomWarn("Fail to connect with SageMath");
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
    case edgeColoringRequestParameter :
      SetLinksColoration(response.result)
      break;
    case strongOrientationRequestParameter :
      InitNewGraph(StringToObject(response.result));
      break;
    case randomOrientationRequestParameter :
      InitNewGraph(StringToObject(response.result));
      break;
    case convertGraphParameter :
      CustomWarn("Graph : "+ response.result +" open in new Window");
      break;
    case closeConnectionParameter :
      webSocket.close();
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

function RequestStrongOrientation()
{
  SubmitMessage(strongOrientationRequestParameter);
}

function RequestRandomOrientation(){
  SubmitMessage(randomOrientationRequestParameter);
}


function RequestConvertGraph(){
  SubmitMessage(convertGraphParameter);
}


function SubmitMessage(parameter) {
  graphJSON.parameter = parameter;
  var prettyJSON = PrettifyJSON();
  webSocket.send(JSON.stringify(prettyJSON));
}

function onCloseClick() {
  webSocket.close();
}

