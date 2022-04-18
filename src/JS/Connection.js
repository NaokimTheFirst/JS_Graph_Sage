var webSocket;

const propertiesRequestParameter = "Properties";
const strongOrientationRequestParameter = "strongOrientation";
const randomOrientationRequestParameter = "randomOrientation";
const vertexColoringRequestParameter = "vertexColoring";
const edgeColoringRequestParameter = "edgeColoring";
const convertGraphParameter = "convert";
const closeConnectionParameter = "closeConnection";
const renewGraphParameter = "renewGraph";
const getG6RequestParameter = "Graph6";
const showSpanTreeParameter = "showSpanTree";
const girthParameter = "girth";

function InitWebSocketConnection() {
    // Connect to Web Socket
    webSocket = new WebSocket("ws://localhost:9001/");
    // Set event handlers.
    webSocket.onopen = function () {
        PageOpenOrReload();
        // Display the body hidden in window.onload
        document.body.style.display = "inline";
    };

    webSocket.onmessage = function (message) {
        TreatResponse(StringToObject(message.data));
    };

    webSocket.onclose = function () {
        // Launch new connection if it was closed due to page reload, otherwise close the tab
        if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
            InitWebSocketConnection();
        } else {
            window.close();
        }
    };

    webSocket.onerror = function (error) {
        CustomWarn("Fail to connect with SageMath");
    };
}

function TreatResponse(response) {
    switch (response.request) {
        case propertiesRequestParameter:
            SetProperties(response.result[0],
                response.result[1],
                response.result[2],
                response.result[3],
                response.result[4],
                response.result[5],
                response.result[6],
                response.result[7],
                response.result[8],
                response.result[9],
                response.result[10],
                response.result[11],
            );
            break;
        case showSpanTreeParameter :
            console.info(response.result);
            if (showSpanTree && Object.keys(response.result).length != 0)
                SetLinksColoration(new Array(response.result), 1);
            break;
        case vertexColoringRequestParameter :
            SetNodesColoration(response.result);
            DisplayColoringInText("vertexColoring", response.result);
            break;
        case edgeColoringRequestParameter :
            DeleteAllEdgeGroups();
            SetLinksColoration(response.result);
            DisplayColoringInText("edgeColoring", response.result);
            break;
        case strongOrientationRequestParameter :
            InitNewGraph(StringToObject(response.result));
            break;
        case randomOrientationRequestParameter :
            InitNewGraph(StringToObject(response.result));
            break;
        case convertGraphParameter :
            CustomWarn("Graph : " + response.result + " open in new Window");
            break;
        case getG6RequestParameter :
            UpdateG6Form(response.result);
            break;
        case closeConnectionParameter :
            webSocket.close();
            break;
        case renewGraphParameter :
            InitNewGraph(StringToObject(response.result));
            UpdateGraphProperties();
            break;
        case girthParameter :
            afficherResultGirth(response.result);
            break;
        default:
            CustomWarn("Undefined response behavior for parameter :" + response.request);
            break;

    }
}

function montrerGirth(){
    SubmitMessage(girthParameter);
}

function RequestVertexColoring() {
    SubmitMessage(vertexColoringRequestParameter);
}

function RequestEdgeColoring() {
    SubmitMessage(edgeColoringRequestParameter);
}

function RequestStrongOrientation() {
    SubmitMessage(strongOrientationRequestParameter);
}

function RequestRandomOrientation() {
    SubmitMessage(randomOrientationRequestParameter);
}

function RequestConvertGraph() {
    SubmitMessage(convertGraphParameter);
}

function RequestRenewGraph() {
    SubmitMessage(renewGraphParameter);
}

function RequestG6() {
    SubmitMessage(getG6RequestParameter);
}

function DisplaySpanTree() {
    SubmitMessage(showSpanTreeParameter);
}

function SubmitMessage(parameter,message = "") {
  graphJSON.parameter = parameter;
  graphJSON.message = message;
  var prettyJSON = PrettifyJSON();
  webSocket.send(prettyJSON);
  graphJSON.parameter = getG6RequestParameter;
  var prettyJSON = PrettifyJSON();
  webSocket.send(prettyJSON);
}

function onCloseClick() {
    webSocket.close();
}





