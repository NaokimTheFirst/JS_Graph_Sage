var currentObject = null;

function RemoveElement() {
    let elemClass = currentObject.getAttribute("class");
    switch (elemClass) {
        case "node":
            RemoveNode(currentObject);
            break;
        case "link directed":
            currentObject.parentNode.removeChild(currentObject);
            break;
    }
    currentObject = null;
}

//Remove a node, his name and the links bound to it
function RemoveNode(currentNode) {
    //Remove the node
    nodeID = currentNode.getAttribute("id");
    //Remove the element with this ID
    graphJSON.nodes.splice(nodeID,1);

    ManageNodes();
    ManageVertexLabel();

    force.start();

    //Remove links bound to the node
    var rule = new RegExp("^" + nodeID + "_");
    var rule2 = new RegExp("_" + nodeID + "$");
    var links = document.getElementsByClassName("link directed");
    for (let index = links.length - 1; index >= 0; index--) {
        if (links[index].id.match(rule) || links[index].id.match(rule2)) {
            links[index].parentNode.removeChild(links[index]);
        }
    }
}