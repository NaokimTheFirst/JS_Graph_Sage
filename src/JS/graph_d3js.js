//The graph properties
var graphJSON;
var force;
var color;
var width;
var height;
var drag_in_progress = false;
var is_frozen = false;

//DOM Elements / D3JS Elements
var nodes, links, loops, v_labels, e_labels, l_labels, line, svg;
var IDCounter = 0;
var currentObject = null;
const MyManager = new Manager();

const cursorPosition = {
    x: 0,
    y: 0
};

const LoopType = "loop";
const NodeType = "Node";
const EdgeType = "link directed";

class PositionRegisterer {
    constructor(oldPos, newPos, node)  {
        this.oldPos = oldPos;
        this.newPos = newPos;
        this.node = node;
    }
}


class Element {
    constructor(data, type) {
        this.data = data;
        this.type = type;
    }
}

class GraphSelection {
    constructor(nodes, edges, loops) {
        this.nodes = nodes;
        this.edges = edges;
        this.loops = loops;
    }
}

window.onload = function () {
    document.body.onmousemove = handleMouseMove;

    LoadGraphData();
    InitGraph();
    KeyboardEventInit();

    ManageAllGraphicsElements();

    InitForce();

    //Start the automatic force layout
    force.start();

    //Freeze the graph after 2 sec
    WaitGraphLoadToFreeze(1000);

}

function handleMouseMove(event) {
    cursorPosition.x = event.pageX;
    cursorPosition.y = event.pageY;
}
// Loads the graph data
function LoadGraphData() {
    var mydiv = document.getElementById("mygraphdata")
    var graph_as_string = mydiv.innerHTML
    graphJSON = eval('(' + graph_as_string + ')');


    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    // List of colors
    color = d3.scale.category10();
}

function InitGraph() {
    //Find the highest  ID in the graph
    graphJSON.nodes.forEach(element => {
        if(element.name > IDCounter){
            IDCounter = element.name;
        }
    });

    graphJSON.loops.forEach(element => {
        element.source = graphJSON.nodes[element.source];
        element.target = graphJSON.nodes[element.source];
    });

    force = d3.layout.force()
        .charge(graphJSON.charge)
        .linkDistance(graphJSON.link_distance)
        .linkStrength(graphJSON.link_strength)
        .gravity(graphJSON.gravity)
        .size([width, height])
        .links(graphJSON.links)
        .nodes(graphJSON.nodes);

    // Adapts the graph layout to the javascript window's dimensions
    if (graphJSON.pos.length != 0) {
        center_and_scale();
    }
}

function KeyboardEventInit() {
    //Keyboard Event
    d3.select("body").on("keydown", function () {
        switch (d3.event.keyCode) {
            case 46:
                //Suppr
                if (currentObject != null) {
                    RemoveElementFromGraph(currentObject);
                }
                break;
            case 65:
                //A for Add
                var newNode = CreateNode();
                MyManager.execute(new AddNodeCommand(newNode));
                break;
            case 69:
                //E for Edges
                AddEdgesOnSelection();
                break;
            case 70:
                //F for Freeze
                FreezeGraph();
                break;
            case 76:
                //L for Loops
                AddLoopOnNode();
                break;
            case 82:
                //R to reset selection
                ResetSelection();
                break;
            case 83:
                //S to save
                DownloadJSON();
                break;
            case 84:
                //T for Test, to remove before build
                console.log("Test");
                break;
            case 89:
                //Y to redo
                MyManager.redo();
                break;
            case 90:
                //Z to undo
                MyManager.undo();
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + d3.event.keyCode);
                break;
        }
    })
}

function ResetSelection() {
    currentSelection = GetCurrentSelection();

    if(currentSelection != null)
    {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                MyManager.execute(new SelectElementCommand(new Element(element.data,element.type)));
            });
        });
    
        RefreshNodes();
        RefreshEdge();
        RefreshLoops();
    }
}

var currentScale = 1;

function redraw_on_zoom() {
    if (!drag_in_progress) {
        currentScale = d3.event.scale ;

        svg.attr("transform",
            "translate(" + d3.event.translate + ") scale(" + currentScale + ")");
    }
}


// Returns the coordinates of a point located at distance d from the
// barycenter of two points pa, pb.
function third_point_of_curved_edge(pa, pb, d) {
    var ox = pa.x,
        oy = pa.y,
        dx = pb.x,
        dy = pb.y;
    var cx = (dx + ox) / 2,
        cy = (dy + oy) / 2;
    var ny = -(dx - ox),
        nx = dy - oy;
    var nn = Math.sqrt(nx * nx + ny * ny)
    return [cx + d * nx / nn, cy + d * ny / nn]
}

// Applies an homothety to the points of the graph respecting the
// aspect ratio, so that the graph takes the whole javascript
// window and is centered
function center_and_scale() {
    var minx = graphJSON.pos[0][0];
    var maxx = graphJSON.pos[0][0];
    var miny = graphJSON.pos[0][1];
    var maxy = graphJSON.pos[0][1];

    //Determine Min/Max
    graphJSON.nodes.forEach(function (d, i) {
        maxx = Math.max(maxx, graphJSON.pos[i][0]);
        minx = Math.min(minx, graphJSON.pos[i][0]);
        maxy = Math.max(maxy, graphJSON.pos[i][1]);
        miny = Math.min(miny, graphJSON.pos[i][1]);
    });

    var border = 60
    var xspan = maxx - minx;
    var yspan = maxy - miny;

    var scale = Math.min((height - border) / yspan, (width - border) / xspan);
    var xshift = (width - scale * xspan) / 2
    var yshift = (height - scale * yspan) / 2

    force.nodes().forEach(function (d, i) {
        d.x = scale * (graphJSON.pos[i][0] - minx) + xshift;
        d.y = scale * (graphJSON.pos[i][1] - miny) + yshift;
    });
}

//Define all forces movements
function InitForce() {
    force.on("tick", function () {

        // Position of vertices
        nodes.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });

        // Position of edges
        links.attr("d", function (d) {

            // Straight edges
            if (d.curve == 0) {
                return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
            }
            // Curved edges
            else {
                var p = third_point_of_curved_edge(d.source, d.target, d.curve)
                return line([{
                        'x': d.source.x,
                        'y': d.source.y
                    },
                    {
                        'x': p[0],
                        'y': p[1]
                    },
                    {
                        'x': d.target.x,
                        'y': d.target.y
                    }
                ])
            }
        });

        // Position of Loops
        if (graphJSON.loops.length != 0) {
            loops
                .attr("cx", function (d) {
                    return d.source.x;
                })
                .attr("cy", function (d) {
                    return d.source.y - d.curve;
                })
        }

        // Position of vertex labels
        if (graphJSON.vertex_labels) {
            v_labels
                .attr("x", function (d) {
                    return d.x + graphJSON.vertex_size;
                })
                .attr("y", function (d) {
                    return d.y;
                })
        }
        // Position of the edge labels
        if (graphJSON.edge_labels) {
            e_labels
                .attr("x", function (d) {
                    return third_point_of_curved_edge(d.source, d.target, d.curve + 3)[0];
                })
                .attr("y", function (d) {
                    return third_point_of_curved_edge(d.source, d.target, d.curve + 3)[1];
                })
            l_labels
                .attr("x", function (d, i) {
                    return force.nodes()[d.source].x;
                })
                .attr("y", function (d, i) {
                    return force.nodes()[d.source].y - 2 * d.curve - 1;
                })
        }
    });
}

function ManageAllGraphicsElements() {
    // SVG window
    svg = d3.select("#graphFrame").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("pointer-events", "all") // Zoom+move management
        .append('svg:g')
        .call(d3.behavior.zoom().on("zoom", redraw_on_zoom)).on("dblclick.zoom", null)
        .append('svg:g');

    // Zooming
    svg.append('svg:rect')
        .attr('x', -10000)
        .attr('y', -10000)
        .attr('width', 2 * 10000)
        .attr('height', 2 * 10000);


    ManageLoops();
    ManageNodes();
    ManageVertexLabel();
    ManageEdges();

    // Edge labels
    if (graphJSON.edge_labels) {
        e_labels = svg.selectAll(".e_label")
            .data(force.links())
            .enter()
            .append("svg:text")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.name;
            })

        l_labels = svg.selectAll(".l_label")
            .data(graphJSON.loops)
            .enter()
            .append("svg:text")
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                return graphJSON.loops[i].name;
            })
    }

    // Arrows, for directed graphs
    if (graphJSON.directed) {
        svg.append("svg:defs").selectAll("marker")
            .data(["directed"])
            .enter().append("svg:marker")
            .attr("id", String)
            // viewbox is a rectangle with bottom-left corder (0,-2), width 4 and height 4
            .attr("viewBox", "0 -2 4 4")
            // This formula took some time ... :-P
            .attr("refX", Math.ceil(2 * Math.sqrt(graphJSON.vertex_size)))
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("preserveAspectRatio", false)
            .attr("orient", "auto")
            .append("svg:path")
            // triangles with endpoints (0,-2), (4,0), (0,2)
            .attr("d", "M0,-2L4,0L0,2");
    }

    // The function 'line' takes as input a sequence of tuples, and returns a
    // curve interpolating these points.
    line = d3.svg.line()
        .interpolate("cardinal")
        .tension(.2)
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })

}

//Enable or disable the forces
function FreezeGraph() {
    is_frozen = !is_frozen;

    graphJSON.nodes.forEach(function (d) {
        d.fixed = is_frozen;
    });
}




function ManageLoops() {
    // Loops
    loops = svg.selectAll(".loop")
        .data(graphJSON.loops);

    loops.enter().append("circle")
        .attr("class", "loop")
        .attr("r", function (d) {
            return d.curve;
        })
        .on("mouseover", function (currentData) {
            currentObject = new Element(currentData, LoopType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px")
        .on("dblclick", function (currentData) {
            MyManager.execute(new SelectElementCommand(new Element(currentData,LoopType)));
        });

    RefreshLoops();

    loops.exit().remove();
};

function RefreshLoops() {
    loops.style("stroke", function (d) {
        return (d.selectionGroup != null) ? "red" : d.color;
    });
}


function ManageEdges() {
    // Edges
    links = svg.selectAll(".link")
        .data(force.links());

    links.enter().append("path")
        .attr("class", "link directed")
        .attr("marker-end", "url(#directed)")
        .on("mouseover", function (currentData) {
            currentObject = new Element(currentData, EdgeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px")
        .on("dblclick", function (d) {
            MyManager.execute(new SelectElementCommand(new Element(d,EdgeType)));
        });

    RefreshEdge();

    links.exit().remove();
}


function RefreshEdge() {
    links.style("stroke", function (d) {
        return (d.selectionGroup != null) ? "red" : d.color;
    });
}

function ManageVertexLabel() {
    // Vertex labels
    if (graphJSON.vertex_labels) {
        v_labels = svg.selectAll(".v_label")
            .data(graphJSON.nodes)

        v_labels.enter()
            .append("svg:text")
            .attr("class", "v_label")
            .attr("vertical-align", "middle")
        v_labels.text(function (d) {
            return d.name;
        });

        v_labels.exit().remove();
    }
}

//Assure that all the current data correspond to a node
function ManageNodes() {
    // Defines nodes elements
    nodes = svg.selectAll(".node")
        .data(graphJSON.nodes)

    //Define what happend a data is added
    nodes.enter().append("circle")
        .attr("class", "node")
        .attr("r", graphJSON.vertex_size)
        .on("mouseover", function (currentData) {
            currentObject = new Element(currentData, NodeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .call(force.drag()
            .on('dragstart', function (d) {
                drag_in_progress = true;
                d.originPos= [d.x,d.y];
            })
            .on('dragend', function (d) {
                drag_in_progress = false;
                d.finalPos=[d.x,d.y];

                var positions = new PositionRegisterer(d.originPos,d.finalPos,d);
                MyManager.execute(new MoveNodeCommand(positions));
            }))
        .on("dblclick", function (currentData) {
            MyManager.execute(new SelectElementCommand(new Element(currentData, NodeType)));
        });

    RefreshNodes();

    //Defines what happend when a data is removed
    nodes.exit().remove();
}




function SetNewPosition(registeredPos) {
    var currrentNode = graphJSON.nodes.filter(function name(current) {
        return current.name == registeredPos.node.name;
    })[0];
    force.stop();
    currrentNode.px = registeredPos.newPos[0];
    currrentNode.py = registeredPos.newPos[1];
    force.start();
}

function SetOldPosition(registeredPos) {
    var currrentNode = graphJSON.nodes.filter(function name(current) {
        return current.name == registeredPos.node.name;
    })[0];
    
    force.stop();
    currrentNode.px = registeredPos.oldPos[0];
    currrentNode.py = registeredPos.oldPos[1];
    force.start();
}

function RefreshNodes() {
    nodes.attr("name", function (d) {
        return d.name;
    })
    .style("fill", function (d) {
        return (d.selectionGroup != null) ? "red" : color(d.group);
    });
}

function SelectElement(elementData){
    elementData.data.selectionGroup = (elementData.data.selectionGroup == null) ? -1 : null;
    switch (elementData.type) {
        case NodeType:
            RefreshNodes();
            break;
        case EdgeType:
            RefreshEdge();
            break;
        case LoopType:
            RefreshLoops();
            break;
    }
}



function GetCurrentSelection() {
    var currentSelection = new GraphSelection([],[],[]);
    
    let nodes = graphJSON.nodes.filter(function (currentNode) {
        return currentNode.selectionGroup == -1;
    });
    nodes.forEach(element => {
        currentSelection.nodes.push(new Element(element,NodeType))
    });


    let edges = graphJSON.links.filter(function (currentLink) {
        return currentLink.selectionGroup == -1;
    });
    edges.forEach(element => {
        currentSelection.edges.push(new Element(element,EdgeType))
    });

    let loops = graphJSON.loops.filter(function (currentLoop) {
        return currentLoop.selectionGroup == -1;
    });
    loops.forEach(element => {
        currentSelection.loops.push(new Element(element,LoopType))
    });

    //Null check
    if (nodes.length == 0 && edges.length == 0 && loops.length == 0)
    {
        console.warn("Nothing Selected");
        return null;
    }
    else 
    {
        return currentSelection;
    }
}


function AddNode(newNode) {
    //Add it to the data
    graphJSON.nodes.push(newNode);

    //Apply nodes rules to the data
    ManageNodes();
    ManageVertexLabel();

    //Restart the force layout with the new elements
    force.start();
}

function CreateNode() {
    var newX = cursorPosition.x ;
    var newY = cursorPosition.y ;
    
    IDCounter ++
    var newNode = {
        group: "0",
        name: IDCounter.toString(),
        x: newX,
        y: newY,
        fixed:is_frozen
    };

    return newNode;
}


//Add loop on the node hovered
function AddLoopOnNode() {
    if(currentObject != null && currentObject.type == NodeType){
        var newLoop = CreateLoop(currentObject.data);
        MyManager.execute(new AddLoopCommand(newLoop));
    }
    else {
        console.warn("The element hovered is not a node");
    }
}


//Add loop on all selected nodes
function AddLoopOnSelection() {
    selectedNodes = GetCurrentSelection().nodes;

    if(selectedNode.length > 0){
        for (let i = 0; i < selectedNodes.length; i++) {
            var newLoop = CreateLoop(selectedNodes[i].data);
            MyManager.execute(new AddLoopCommand(newLoop));
        }
    }
    else {
        console.warn("No nodes to add loop at on the selection");
    }
}

//Add edges between all selected nodes
function AddEdgesOnSelection() {
    selectedNodes = GetCurrentSelection().nodes;

    if(selectedNode.length > 0){
        let j;
        for (let i = 0; i < selectedNodes.length; i++) {
            j = i + 1;
            for (; j < selectedNodes.length; j++) {
                var newLink = CreateEdge(selectedNodes[i].data, selectedNodes[j].data);
                MyManager.execute(new AddEdgeCommand(newLink));
            }
        }
    }
    else {
        console.warn("No nodes to add edges at on the selection");
    }
}

function AddEdge(newEdge) {
    graphJSON.links.push(newEdge);
    ManageEdges();
    force.start();
}


function CreateEdge(src, dest) {
    var link = {
        "strength": 0,
        "target": dest,
        "color": "#aaa",
        "curve": 0,
        "source": src,
        "name": "",
    }

    return link;
}


function AddLoop(newLoop){
    graphJSON.loops.push(newLoop);
    ManageLoops();
    force.start();
}

function CreateLoop(src) {
    var loop = {
        "strength": 0,
        "target": src,
        "color": "#aaa",
        "curve": 20,
        "source": src,
        "name": "",
    }

    return loop;
}

function RemoveElementFromGraph() {
    switch (currentObject.type) {
        case NodeType:
            MyManager.execute(new SupprNodeCommand(currentObject.data));
            break;
        case EdgeType:
            MyManager.execute(new SupprEdgeCommand(currentObject.data));
            break;
        case LoopType:
            MyManager.execute(new SupprLoopCommand(currentObject.data));
            break;
    }

    currentObject = null;
}

function RemoveEdge(edgeData) {
    graphJSON.links.splice(graphJSON.links.indexOf(edgeData), 1);
    ManageEdges();
    force.start();
}


function RemoveLoop(loopData) {
    graphJSON.loops.splice(graphJSON.loops.indexOf(loopData), 1);
    ManageLoops();
    force.start();
}


//Find Edges bound to a Vertex
function GetEdgesByVertex(currentNode) {
    return graphJSON.links.filter(
        function (current) {
            return current.source == currentNode ||
                current.target == currentNode
        });
}

//Find Loops bound to a Vertex
function GetLoopsByVertex(currentNode) {
    return graphJSON.loops.filter(
        function (current) {
            return current.source == currentNode;
        });
}

//Remove a node, his name and the links bound to it
function RemoveNode(nodeData) {
    graphJSON.nodes.splice(graphJSON.nodes.indexOf(nodeData), 1);


    GetEdgesByVertex(nodeData).forEach(element => {
        MyManager.execute(new SupprEdgeCommand(element));
    });
    
    GetLoopsByVertex(nodeData).forEach(element => {
        MyManager.execute(new SupprLoopCommand(element));
    });
    

    ManageNodes();
    ManageVertexLabel();

    force.start();
}

function WaitGraphLoadToFreeze(waitingTime) {
    setTimeout(function () {
        FreezeGraph();
    }, waitingTime);
}

function PrettyfyJSON(){
    var prettyJSON = JSON.parse(JSON.stringify(graphJSON));
    prettyJSON.links.forEach(element => {
        element.source = element.source.name;
        element.target = element.target.name;
    });
    prettyJSON.loops.forEach(element => {
        element.source = element.source.name;
        element.target = element.target.name;
    });

    //Return the Y to correspond with Sage Plan
    prettyJSON.nodes.forEach(element => {
        element.y = -element.y;
    });

    return prettyJSON;
}

//Save the JSON to a txt
function DownloadJSON() {
    var prettyJSON = PrettyfyJSON();

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(prettyJSON)));
    element.setAttribute('download', 'Graph_JSON');
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }