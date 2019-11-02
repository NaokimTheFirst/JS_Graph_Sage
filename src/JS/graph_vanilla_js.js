var currentObject = null;

function RemoveElement() {
    let elemClass = currentObject.getAttribute("class");
    switch (elemClass) {
        case "node":
            RemoveNode(currentObject);
            break;
        case "link directed":
            RemoveEdge(currentObject);
            break;
    }
    currentObject = null;
}

function RemoveEdge(currentLink){
    //Remove the link
    RemoveEdgeByIndex(currentLink.getAttribute("id"));
}

function RemoveEdgeByIndex(linkIndex){
  //Remove the element with this ID
  graphJSON.links.splice(linkIndex,1);

  //Apply change on graph
  ManageEdges();
  force.start();

  //Reset ID on remaining Edges
  UpdateIndexesOnLinks();
}

//Find Edges bound to a Vertex
function GetEdgesByVertexID(nodeID){
    return graphJSON.links.filter(
        function(current){return current.source.index == nodeID 
            || current.target.index == nodeID});
}

//Remove a node, his name and the links bound to it
function RemoveNode(currentNode) {
    nodeID = currentNode.getAttribute("id");

    GetEdgesByVertexID(nodeID).forEach(element => {
        RemoveEdgeByIndex(element.index)
    });

    //Remove the element with this ID
    graphJSON.nodes.splice(nodeID,1);
    

    ManageNodes();
    ManageVertexLabel();

    force.start();
}