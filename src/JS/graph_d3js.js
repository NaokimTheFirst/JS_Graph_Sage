//The graph properties
var graphJSON;
var force;
var color;
var width;
var height;
var drag_in_progress = false;
var is_frozen = false;
var isDirected = false;

//DOM Elements / D3JS Elements
var nodes, links, loops, v_labels, e_labels, l_labels, line, svg;
var IDCounter = 0;
var groupList = [];
var currentGroupIndex = 0;
var currentObject = null;
const MyManager = new Manager();


const cursorPosition = {
    x: 0,
    y: 0
};

const LoopType = "loop";
const NodeType = "Node";
const EdgeType = "link directed";

class ValueRegisterer {
    constructor(oldValue, newValue, element) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.element = element;
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
    InitInterface();

    ManageAllGraphicsElements();

    InitForce();

    //Start the automatic force layout
    force.start();

    //Freeze the graph after 2 sec
    WaitGraphLoadToFreeze(1500);

}

function handleMouseMove(event) {
    cursorPosition.x = event.pageX;
    cursorPosition.y = event.pageY;
}

//
function GetGraphFromHTML() {
    var mydiv = document.getElementById("mygraphdata")
    var graph_as_string = mydiv.innerHTML
    let graph = eval('(' + graph_as_string + ')');

    return graph;
}

// Loads the graph data
function LoadGraphData() {
    graphJSON = GetGraphFromHTML();

    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;

    // List of colors
    color = d3.scale.category10();

    //Init group
    FillGroupFromGraph(graphJSON);
    PopulateGroupList();


}

function FillGroupFromGraph(graph) {
    graph.nodes.forEach(element => {
        if (!groupList.includes(element.group)) {
            groupList.push(element.group);
        }
    });
}

function InitGraph() {
    isDirected = graphJSON.directed;

    //Find the highest  ID in the graph
    graphJSON.nodes.forEach(element => {
        if (element.name > IDCounter) {
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

function ResetSelection() {
    currentSelection = GetCurrentSelection();

    if (currentSelection != null) {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                SelectElement(new Element(element.data, element.type));
            });
        });

        RefreshNodes();
        RefreshEdge();
        RefreshLoops();
    }
}

function redraw_on_zoom() {
    if (!drag_in_progress) {
        svg.attr("transform",
            "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
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
        v_labels
            .attr("x", function (d) {
                return d.x + graphJSON.vertex_size;
            })
            .attr("y", function (d) {
                return d.y;
            })
        // Position of the edge labels
        e_labels
            .attr("x", function (d) {
                return third_point_of_curved_edge(d.source, d.target, d.curve + 3)[0];
            })
            .attr("y", function (d) {
                return third_point_of_curved_edge(d.source, d.target, d.curve + 3)[1];
            })
        l_labels
            .attr("x", function (d) {
                return d.source.x;
            })
            .attr("y", function (d) {
                return d.source.y - 2 * d.curve - 1;
            })
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
    ManageNodeLabels();
    ManageEdges();

    // Arrows, for directed graphs
    if (isDirected) {
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
        .on("dblclick", function (currentData) {
            SelectElement(new Element(currentData,LoopType));
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshLoops();
    ManageLoopLabels();

    loops.exit().remove();
};

function RefreshLoops() {
    loops.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : d.color;
    });
}

function ManageLoopLabels() {
    l_labels = svg.selectAll(".l_label")
        .data(graphJSON.loops);

    l_labels.enter()
        .append("svg:text")
        .attr("class", "l_label")
        .attr("text-anchor", "middle");

    l_labels.exit().remove();

    RefreshLoopLabels();
}

function RefreshLoopLabels() {
    l_labels.text(function (d) {
        let text = "";
        if (d.name != "None" && d.name != "") {
            text = d.name;
        }
        return text;
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
        .on("dblclick", function (currentData) {
            SelectElement(new Element(currentData,EdgeType));
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshEdge();

    links.exit().remove();

    ManageEdgeLabels();
}

function RefreshEdge() {
    links.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : d.color;
    });
}

function ManageEdgeLabels() {
    e_labels = svg.selectAll(".e_label")
        .data(force.links());

    e_labels.enter()
        .append("svg:text")
        .attr("class", "e_label")
        .attr("text-anchor", "middle");

    e_labels.exit().remove();

    RefreshEdgeLabels();
}


function RefreshEdgeLabels() {
    e_labels.text(function (d) {
        let text = "";
        let hasName = d.name != "None" && d.name != "";

        if (hasName) {
            text += d.name;
        }
        return text;
    });
}

function ManageNodeLabels() {
    // Vertex labels
    v_labels = svg.selectAll(".v_label")
        .data(graphJSON.nodes)

    v_labels.enter()
        .append("svg:text")
        .attr("class", "v_label")
        .attr("vertical-align", "middle")

    v_labels.exit().remove();

    RefreshNodeLabels();
}

function RefreshNodeLabels() {
    v_labels.text(function (d) {
        let text = "";
        if (d.name != "") {
            text += d.name;
        }
        return text;
    });
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
        .on("dblclick", function (currentData) {
            SelectElement(new Element(currentData,NodeType));
        })
        .call(force.drag()
            .on('dragstart', function (d) {
                drag_in_progress = true;
                d.previousPos = [d.x, d.y];
            })
            .on('dragend', function (d) {
                drag_in_progress = false;
                
                if(d.previousPos[0] != d.x && d.previousPos[1] != d.y)
                {
                    let finalPos = [d.x, d.y];
                    var positions = new ValueRegisterer(d.previousPos, finalPos, new Element(d, NodeType));
                    MyManager.execute(new MoveNodeCommand(positions));
                }

            }));

    RefreshNodes();

    //Defines what happend when a data is removed
    nodes.exit().remove();
}

function SetNewPosition(registeredPos) {
    SetNodePosition(registeredPos.newValue, registeredPos.element);
}

function SetNodePosition(Pos, nodeData) {
    let currrentNode = FindElementInGraph(nodeData);
    force.stop();
    currrentNode.px = Pos[0];
    currrentNode.py = Pos[1];
    force.start();
}

function SetOldPosition(registeredPos) {
    SetNodePosition(registeredPos.oldValue, registeredPos.element);;
}

function RefreshNodes() {
    nodes.attr("name", function (d) {
            return d.name;
        })
        .attr("fill", function (d) {
            return color(groupList.indexOf(d.group));
        });

    RefreshNodeOutline();
}

function RefreshNodeOutline() {
    nodes.style("stroke", function (d) {
            return (d.isSelected == true) ? "red" : "white";
        })
        .style("stroke-width", function (d) {
            return (d.isSelected == true) ? "3" : "2";
        })
}

function SelectElement(element) {
    element.data.isSelected = (element.data.isSelected == true) ? false : true;
    switch (element.type) {
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
    var currentSelection = new GraphSelection([], [], []);

    let nodes = graphJSON.nodes.filter(function (currentNode) {
        return currentNode.isSelected == true;
    });
    nodes.forEach(element => {
        currentSelection.nodes.push(new Element(element, NodeType))
    });


    let edges = graphJSON.links.filter(function (currentLink) {
        return currentLink.isSelected == true;
    });
    edges.forEach(element => {
        currentSelection.edges.push(new Element(element, EdgeType))
    });

    let loops = graphJSON.loops.filter(function (currentLoop) {
        return currentLoop.isSelected == true;
    });
    loops.forEach(element => {
        currentSelection.loops.push(new Element(element, LoopType))
    });

    //Null check
    if (nodes.length == 0 && edges.length == 0 && loops.length == 0) {
        CustomWarn("Nothing Selected");
        return null;
    } else {
        return currentSelection;
    }
}

function AddNode(newNode) {
    //Add it to the data
    graphJSON.nodes.push(newNode);

    //Apply nodes rules to the data
    ManageNodes();
    ManageNodeLabels();

    //Restart the force layout with the new elements
    force.start();
}

function CreateNode(pos = null) {
    var newX = cursorPosition.x;
    var newY = cursorPosition.y;
    if (pos != null) {
        newX = pos[0];
        newY = pos[1];
    } else {
        newX = cursorPosition.x;
        newY = cursorPosition.y;
    }

    IDCounter++
    var newNode = {
        group: "0",
        name: IDCounter.toString(),
        x: newX,
        y: newY,
        fixed: is_frozen
    };

    return newNode;
}

//Add loop on a node
function AddLoopOnNode(node) {
    var newLoop = CreateLoop(node);
    MyManager.execute(new AddLoopCommand(newLoop));
}

//Add loop on all selected nodes
function AddLoopOnSelection() {
    if (GetCurrentSelection()) {
        selectedNodes = GetCurrentSelection().nodes;

        if (selectedNodes.length > 0) {
            for (let i = 0; i < selectedNodes.length; i++) {
                AddLoopOnNode(selectedNodes[i].data);
            }
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }
    }
}


//Set Group for all Selected Nodes
function SetGroupOfSelection() {
    if (GetCurrentSelection()) {
        selectedNodes = GetCurrentSelection().nodes;
        let isFirst = true;

        if (selectedNodes.length > 0) {
            for (let i = 0; i < selectedNodes.length; i++) {
                if(selectedNodes[i].data.group != groupList[currentGroupIndex])
                {
                    let vr = new ValueRegisterer(selectedNodes[i].data.group, groupList[currentGroupIndex], selectedNodes[i]);
                    MyManager.execute(new ChangeGroupCommand(vr, isFirst));
                    isFirst = false;
                }
            }
        } else {
            CustomWarn("No nodes selected");
        }
    }
}

//Add edges between all selected nodes
function AddEdgesOnSelection() {
    if (GetCurrentSelection()) {
        selectedNodes = GetCurrentSelection().nodes;

        let isFirst = true;
        if (selectedNodes.length > 0) {
            let j;
            for (let i = 0; i < selectedNodes.length; i++) {
                j = i + 1;
                for (; j < selectedNodes.length; j++) {
                    var newLink = CreateEdge(selectedNodes[i].data, selectedNodes[j].data);
                    MyManager.execute(new AddEdgeCommand(newLink, isFirst));
                    isFirst = false;
                }
            }
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }
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

function AddLoop(newLoop) {
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

function RemoveElementFromGraph(element, _isFirst = true) {
    switch (element.type) {
        case NodeType:
            let isFirst = _isFirst;
            GetEdgesByVertex(element.data).forEach(edge => {
                MyManager.execute(new SupprEdgeCommand(edge, isFirst));
                isFirst = false;
            });

            GetLoopsByVertex(element.data).forEach(loop => {
                MyManager.execute(new SupprLoopCommand(loop, false));
            });

            MyManager.execute(new SupprNodeCommand(element.data, false));
            break;
        case EdgeType:
            MyManager.execute(new SupprEdgeCommand(element.data, _isFirst));
            break;
        case LoopType:
            MyManager.execute(new SupprLoopCommand(element.data, _isFirst));
            break;
    }
}

function RemoveSelection() {
    let currentSelection = GetCurrentSelection();
    let isFirst = true;

    if (currentSelection != null) {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                RemoveElementFromGraph(element, isFirst)
                isFirst = false;
            });
        });

        ManageLoops();
        ManageEdges();
        ManageNodes();
    }
    else {
        CustomWarn("Nothing to delete");
    }
}

function RemoveEdge(edgeData) {
    let index = graphJSON.links.indexOf(edgeData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.links.splice(index, 1);
        ManageEdges();
        force.start();
    }
}

function RemoveLoop(loopData) {
    let index = graphJSON.loops.indexOf(loopData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.loops.splice(graphJSON.loops.indexOf(loopData), 1);
        ManageLoops();
        force.start();
    }
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
    ManageNodes();
    ManageNodeLabels();
    force.start();
}

function SubdivideEdge(edge, isFirst = true) {
    let pos = third_point_of_curved_edge(edge.source, edge.target, 0);
    let newNode = CreateNode(pos);

    MyManager.execute(new AddNodeCommand(newNode, isFirst));
    MyManager.execute(new AddEdgeCommand(CreateEdge(newNode, edge.source), false));
    MyManager.execute(new AddEdgeCommand(CreateEdge(newNode, edge.target), false));
    MyManager.execute(new SupprEdgeCommand(edge, false));
}

function SubdivideEdgeOnSelection() {
    if (GetCurrentSelection()) {
        edges = GetCurrentSelection().edges;
        if (edges.length > 0) {
            let isFirst = true;
            edges.forEach(edge => {
                SubdivideEdge(edge.data, isFirst);
                isFirst = false;
            });
        } else {
            CustomWarn("No edges to subdivide");
        }
    }
}

function InvertEdgesOnSelection() {
    if (GetCurrentSelection()) {
        edges = GetCurrentSelection().edges;
        if (edges.length > 0) {
            let isFirst = true;
            edges.forEach(edge => {
                InvertEdge(edge, isFirst);
                isFirst = false;
            });
        } else {
            CustomWarn("No edges to invert");
        }
    }
}

function InvertEdge(edge, isFirst = true){
    let vr = new ValueRegisterer([edge.data.source, edge.data.target], [edge.data.target, edge.data.source], edge);
    MyManager.execute(new InvertDirectionCommand(vr, isFirst));
}


function WaitGraphLoadToFreeze(waitingTime) {
    setTimeout(function () {
        FreezeGraph();
    }, waitingTime);
}

function PrettyfyJSON() {
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

//Change the group of a node
function SetGroupNode(valueRegisterer) {
    let node = FindElementInGraph(valueRegisterer.element);
    node.group = (node.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
    RefreshNodes();
}

//Change the name of an element
function SetElementName(valueRegisterer) {
    let element = FindElementInGraph(valueRegisterer.element);
    element.name = (element.name == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;

    switch (valueRegisterer.element.type) {
        case EdgeType:
            RefreshEdgeLabels();
            break;
        case LoopType:
            RefreshLoopLabels();
            break;
        case NodeType:
            RefreshNodeLabels();
            break;
    }
}

//Change the direction of a directedLink
function SetLinkDirection(valueRegisterer) {
    let link = FindElementInGraph(valueRegisterer.element);
    let targetedValue = (link.source == valueRegisterer.newValue[0]) ? valueRegisterer.oldValue : valueRegisterer.newValue;

    link.source = targetedValue[0];
    link.target = targetedValue[1];

    force.start();
}

function FindElementInGraph(element) {
    let list;
    switch (element.type) {
        case NodeType:
            list = graphJSON.nodes;
            break;
        case EdgeType:
            list = graphJSON.links;
            break;
        case LoopType:
            list = graphJSON.loops;
            break;
    }
    return list[list.indexOf(element.data)];
}