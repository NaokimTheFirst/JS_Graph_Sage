//The graph properties
var graphJSON, force, customColorScale;
var width = function () {
    return document.documentElement.clientWidth * 0.7
};
var height = function () {
    return document.documentElement.clientHeight
};
var xshift = function () {
    return document.getElementById("graphFrame").childNodes[3].getBoundingClientRect().left;
};
var drag_in_progress = false;
var is_frozen = false;
var isDirected = false;
var g6;

//DOM Elements / D3JS Elements
var nodes, links, loops, v_labels, e_labels, l_labels, line, svg, brush, arrows;
var groupList = [];
var currentGroupIndex = 0;
var currentObject = null;
const MyManager = new CommandManager();


const cursorPosition = {
    x: 0,
    y: 0
};

const LoopType = "Loop";
const NodeType = "Node";
const EdgeType = "Edge";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

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
    // Hide the body to avoid showing html template before the data is fully loaded
    document.body.style.display = "none";

    InitWebSocketConnection();

    document.body.onmousemove = handleMouseMove;
    // List of colors
    customColorScale = d3.scaleOrdinal(d3.schemePaired);
    KeyboardEventInit();
    // dragElement(document.getElementById("Overlay"));
}

// Called in webSocket.onopen, reloads page opening a new connection or opens a new page
function PageOpenOrReload() {
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        console.info("The page is reloaded");
        graphJSON = JSON.parse(sessionStorage.getItem('graph'));
        RequestRenewGraph();
    } else {
        console.info("The page is opened");
        InitNewGraph();
        UpdateGraphProperties();
    }
}

window.onresize = function() {
    if (typeof graphJSON != "undefined") {
        OptimizeVertexSize();
        center_and_scale();
        UpdateLayout();
    }
}

function UpdateLayout() {
    if(force) force.stop();
    ManageAllGraphicsElements();
    force.restart();
}

function OptimizeVertexSize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w > 800 && h > 600) {
        graphJSON.vertex_size = 12;
        graphJSON.edge_thickness = 4;
    }
    else if (w > 500 && h > 400) {
        graphJSON.vertex_size = w/100;
        graphJSON.edge_thickness = 3;
    }
    else {
        graphJSON.vertex_size = 5;
        graphJSON.edge_thickness = 2;
    }
}

/*
window.onresize = function() {
    let resizeRate = [width()/oldWindowSize[0], height()/oldWindowSize[1]];

    oldWindowSize[0] = width();
    oldWindowSize[1] = height();

    svg = d3.select("svg")
        .attr("width", width())
        .attr("height", height());

    graph = graphJSON;
    for (let node of graphJSON.nodes){
        node.x *= resizeRate[0];
        node.y *= resizeRate[1];
        let nodePositions = new ValueRegisterer([node.px,node.py], [node.x, node.y], new Element(node, NodeType));
        node.px *= resizeRate[0];
        node.py *= resizeRate[1];
        SetNewPosition(nodePositions);
    }

}*/


function InitNewGraph(graph = null) {
    if (force) force.stop();
    LoadGraphData(graph);
    OptimizeVertexSize();
    InitGraph();
    InitInterface();
    ManageAllGraphicsElements();
    InitForce();
    // ManageNodeLabels();
    // ManageEdges();
    // ManageLoops();
    // ManageNodes();
    // ManageArrows();
    //Start the automatic force layout
    // force.restart();
}

function handleMouseMove(event) {
    cursorPosition.x = event.pageX - xshift();
    cursorPosition.y = event.pageY;
}

function GetGraphFromHTML() {
    var mydiv = document.getElementById("mygraphdata")
    var graph_as_string = mydiv.innerHTML
    let graph = StringToObject(graph_as_string);

    return graph;
}

// Loads the graph data
function LoadGraphData(newGraph) {
    graphJSON = (newGraph) ? newGraph : GetGraphFromHTML();
    sessionStorage.setItem('graph', JSON.stringify(graphJSON));

    //Init group
    FillGroupFromGraph(graphJSON);
    PopulateGroupList();
}

function FillGroupFromGraph(graph) {
    groupList = [];
    graph.nodes.forEach(element => {
        if (!groupList.includes(element.group)) {
            groupList.push(element.group);
        }
    });
}

function InitGraph() {
    isDirected = graphJSON.directed;

    graphJSON.loops.forEach(element => {
        element.source = graphJSON.nodes[element.source];
        element.target = graphJSON.nodes[element.source];
    });

    force = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(graphJSON.charge))
        .force("link", d3.forceLink()
            .distance(graphJSON.link_distance)
            .strength(graphJSON.link_strength))
        .force("x", d3.forceX(graphJSON.gravity).x(width()))
        .force("y", d3.forceY(graphJSON.gravity).y(height()));
        
        // .charge(graphJSON.charge)
        // .linkDistance(graphJSON.link_distance)
        // .linkStrength(graphJSON.link_strength)
        // .gravity(graphJSON.gravity)
        // .size([width(), height()])
        // .links(graphJSON.links)
        // .nodes(graphJSON.nodes);

    force.nodes(graphJSON.nodes);
    force.force("link").links(graphJSON.links);

    force.nodes().forEach((d, i) => { d.fx = graphJSON.pos[i][0]; d.fy = graphJSON.pos[i][1]; });

    // Adapts the graph layout to the javascript window's dimensions

    center_and_scale();

    // The function 'line' takes as input a sequence of tuples, and returns a
    // curve interpolating these points.
    line = d3.line()
        .curve(d3.curveCardinal.tension(.2))
        // .interpolate("cardinal")
        // .tension(.2)
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        });
}

function ResetSelection() {
    currentSelection = GetCurrentSelection(true);

    if (currentSelection != null) {
        // For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                SelectElement(new Element(element.data, element.type));
            });
        });

        let selectedNodes = svg.selectAll(".isSelected");

        for (let node of document.querySelectorAll('.isSelected')) {
            node.setAttribute('class', 'node');
        }

        RefreshNodes();
        RefreshEdge();
        RefreshLoops();
        SetDrag(selectedNodes);
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

    if (force.nodes().length != 0) {
        var minx = force.nodes()[0].fx;
        var maxx = force.nodes()[0].fx;
        var miny = force.nodes()[0].fy;
        var maxy = force.nodes()[0].fy;
    }

    force.nodes().forEach(function (d, i) {
        maxx = Math.max(maxx, d.fx);
        minx = Math.min(minx, d.fx);
        maxy = Math.max(maxy, d.fy);
        miny = Math.min(miny, d.fy);
    });

    var border = 60;
    var xspan = maxx - minx == 0 ? 1 : maxx - minx;
    var yspan = maxy - miny == 0 ? 1 : maxy - miny;

    var w = width();
    var h = height();
    var scale = Math.min((h - border) / yspan, (w - border) / xspan);
    var xshift = (w - scale * xspan) / 2;
    var yshift = (h - scale * yspan) / 2;

    force.nodes().forEach(function (d, i) {
        d.fx = scale * (d.fx - minx) + xshift;
        d.fy = scale * (d.fy - miny) + yshift;
    });
}

//Define all forces movements
function InitForce() {
    force.on("tick", function () {
        // Position of vertices
        nodes.attr("cx", function (d) {
            return d.fx;
        })
            .attr("cy", function (d) {
                return d.fy;
            })
        // Position of edges
        links.attr("d", function (d) {

            // Straight edges
            if (d.curve == 0) {
                return "M" + d.source.fx + "," + d.source.fy + " L" + d.target.fx + "," + d.target.fy;
            }
            // Curved edges
            else {
                var p = third_point_of_curved_edge(d.source, d.target, d.curve)
                return line([{
                    'x': d.source.fx,
                    'y': d.source.fy
                },
                    {
                        'x': p[0],
                        'y': p[1]
                    },
                    {
                        'x': d.target.fx,
                        'y': d.target.fy
                    }
                ])
            }
        });

        // Position of Loops
        if (graphJSON.loops.length != 0) {
            loops
                .attr("cx", function (d) {
                    return d.source.fx;
                })
                .attr("cy", function (d) {
                    return d.source.fy - d.curve;
                })
        }

        // Position of vertex labels
        v_labels
            .attr("x", function (d) {
                return d.fx + graphJSON.vertex_size;
            })
            .attr("y", function (d) {
                return d.fy;
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
                return d.source.fx;
            })
            .attr("y", function (d) {
                return d.source.fy - 2 * d.curve - 1;
            })
    });
}

function ManageAllGraphicsElements() {
    if (svg) {
        let oldSVG = document.getElementById("svg");
        oldSVG.parentElement.removeChild(oldSVG);
    }

    // SVG window
    svg = d3.select("#graphFrame").append("svg")
        .attr("id", "svg")
        .attr("width", width())
        .attr("height", height())
        .attr("pointer-events", "all") // Zoom+move management
        .append('svg:g')

    // Zooming
    svg.append('svg:rect')
        .attr('x', -10000)
        .attr('y', -10000)
        .attr('width', 2 * 10000)
        .attr('height', 2 * 10000)

    InitBrush();

    ManageNodeLabels();
    ManageEdges();
    ManageLoops();
    ManageNodes();
    ManageArrows();
}


function InitBrush() {
    brush = svg.append("g")
        .attr("class", "brush")
        .call(d3.brush()
        .extent( [ [0,0], [100000,100000] ] )
        .on("start", function () {
                ResetSelection();
            })
        .on("end", function () {
                var extent = d3.brushSelection(this) ||
                [[0,0],[0,0]];
                SelectElementsInsideExtent(extent);

                //Remove Selection rectangle
                d3.selectAll("rect.selection").style("display", "none");
            }));
}

function SelectElementsInsideExtent(extent) {
    nodes.each(function (d) {
        if (IsNodeInsideExtent(extent, d)) {
            SelectElement(new Element(d, NodeType));
        }
    })
    loops.each(function (d) {
        if (IsNodeInsideExtent(extent, d.source)) {
            SelectElement(new Element(d, LoopType));
        }
    })
    links.each(function (d) {
        if (IsEdgeInsideExtent(extent, d)) {
            SelectElement(new Element(d, EdgeType));
        }
    })
}

function ConstructRectangleFromExtent(extent) {
    topLeftCorner = new Point(extent[0][0], extent[0][1]);
    topRightCorner = new Point(extent[1][0], extent[0][1]);
    bottomLefttCorner = new Point(extent[0][0], extent[1][1]);
    bottomRightCorner = new Point(extent[1][0], extent[1][1]);

    topBorder = new Segment(topLeftCorner, topRightCorner);
    leftBorder = new Segment(topLeftCorner, bottomLefttCorner);
    rightBorder = new Segment(topRightCorner, bottomRightCorner);
    bottomBorder = new Segment(bottomRightCorner, bottomLefttCorner);

    rectangle = [topBorder, leftBorder, rightBorder, bottomBorder];

    return rectangle;
}

// Given three colinear points p, q, r, the function checks if 
// point q lies on line segment 'pr' 
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r). 
// The function returns following values 
// 0 --> p, q and r are colinear 
// 1 --> Clockwise 
// 2 --> Counterclockwise 
function orientation(p, q, r) {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
    // for details of below formula. 
    val = (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // colinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

function doSegmentIntersect(firstSegment, secondSegment) {
    return doIntersect(firstSegment.start, firstSegment.end, secondSegment.start, secondSegment.end);
}

// The main function that returns true if line segment 'p1q1' 
// and 'p2q2' intersect. 
function doIntersect(p1, q1, p2, q2) {
    // Find the four orientations needed for general and 
    // special cases 
    o1 = orientation(p1, q1, p2);
    o2 = orientation(p1, q1, q2);
    o3 = orientation(p2, q2, p1);
    o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

function IsEdgeInsideExtent(extent, edge) {
    if (IsNodeInsideExtent(extent, edge.source) || IsNodeInsideExtent(extent, edge.target)) {
        return true;
    } else {
        return DoesEdgeIntersectExtent(extent, edge);
    }
}

function DoesEdgeIntersectExtent(extent, edge) {
    rectangle = ConstructRectangleFromExtent(extent);
    edgeSegment = new Segment(edge.source, edge.target);
    doesIntersect = false;
    count = 0;

    while (doesIntersect == false && count < rectangle.length) {
        doesIntersect = doSegmentIntersect(rectangle[count], edgeSegment);
        count += 1;
    }

    return doesIntersect;
}

function IsNodeInsideExtent(extent, node) {
    return extent[0][0] <= node.x && node.x < extent[1][0] && extent[0][1] <= node.y && node.y < extent[1][1];
}

function ManageArrows() {
    // Arrows, for directed graphs
    arrows = svg.append("svg:defs").selectAll("marker");

    arrows = arrows
        .data(["directed"])
        .enter().append("svg:marker")
        .merge(arrows)
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
        .attr("d", "M0,-2L4,0L0,2")
        .style("fill", function () {
            return (isDirected) ? "" : "#ffffff00";
        });
}

function ManageLoops() {
    // Loops
    loops = svg.selectAll(".loop")
        .data(graphJSON.loops);

    loops.exit().remove();

    loops = loops
        .enter().append("circle")
        .merge(loops)
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
            SelectElement(new Element(currentData, LoopType));
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshLoops();
    ManageLoopLabels();
};

function RefreshLoops() {
    loops.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : d.color;
    });
}

function ManageLoopLabels() {
    l_labels = svg.selectAll(".l_label")
        .data(graphJSON.loops);

    l_labels.exit().remove();

    l_labels = l_labels
        .enter()
        .append("svg:text")
        .merge(l_labels)
        .attr("class", "l_label")
        .attr("text-anchor", "middle");

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
        .data(graphJSON.links);

    links.exit().remove();

    links = links
        .enter().append("path")
        .merge(links)
        .attr("class", "link directed")
        .attr("marker-end", "url(#directed)")
        .on("mouseover", function (currentData) {
            currentObject = new Element(currentData, EdgeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .on("dblclick", function (currentData) {
            SelectElement(new Element(currentData, EdgeType));
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");

    RefreshEdge();

    ManageEdgeLabels();
}

function RefreshEdge() {
    links.style("stroke", function (d) {
        return (d.isSelected == true) ? "red" : customColorScale(d.group);
    });
}

function ManageEdgeLabels() {
    e_labels = svg.selectAll(".e_label")
        .data(force.force("link").links());

    e_labels.exit().remove();

    e_labels = e_labels
        .enter()
        .append("svg:text")
        .merge(e_labels)
        .attr("class", "e_label")
        .attr("text-anchor", "middle");

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
        .data(graphJSON.nodes);

    v_labels.exit().remove();

    v_labels = v_labels
        .enter()
        .append("svg:text")
        .merge(v_labels)
        .attr("class", "v_label")
        .attr("vertical-align", "middle");

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
        .data(graphJSON.nodes);

    //Defines what happend when a data is removed
    nodes.exit().remove();

    nodes = nodes
        .enter().append("circle")
        .merge(nodes)
        .attr("class", "node")
        .attr("r", graphJSON.vertex_size)
        // .merge(nodes)
        .on("mouseover", function (currentData) {
            currentObject = new Element(currentData, NodeType)
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .on("dblclick", function (currentData) {
            SelectElement(new Element(currentData, NodeType));
        });
    
    SetDrag(nodes);

    RefreshNodes();
}

function SetDrag(nodes) {
    nodes
        .call(d3.drag()
            .on('start', function (event, d) {
                if (!event.active) force.alphaTarget(0.3).restart();
                drag_in_progress = true;
                d.previousPos = [d.x, d.y];
            })
            .on('drag', function (event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', function (event, d) {
                if (!event.active) force.alphaTarget(0);
                drag_in_progress = false;
                if (d.previousPos[0] != d.x && d.previousPos[1] != d.y) {
                    let finalPos = [d.x, d.y];
                    var positions = new ValueRegisterer(d.previousPos, finalPos, new Element(d, NodeType));
                    MyManager.Execute(new MoveNodeCommand(positions));
                }
            }));
}

// var mousePreviousPos;
// var mouseOldPos;
// var graphSelectedNodes = [];

// function MultiDrag(call) {
//     for (let node of graphJSON.nodes){
//         if (node.isSelected){
//             graphSelectedNodes.push(node);
//         }
//     }

//     switch(call) {
//         case 'start':
//             mousePreviousPos = [window.event.clientX, window.event.clientY];
//             mouseOldPos = [window.event.clientX, window.event.clientY];
//             break;
//         case 'drag':
//             let mousePosX = window.event.clientX;
//             let mousePosY = window.event.clientY;
//             graphSelectedNodes.forEach((node) => { node.fx += mousePosX - mousePreviousPos[0]; node.fy += mousePosY - mousePreviousPos[1];})
//             mousePreviousPos = [mousePosX, mousePosY];
//             break;
//         case 'end':
//             let tabNodes = [];
//             let positionsChanged = mouseOldPos[0] != mousePreviousPos[0] || mouseOldPos[1] != mousePreviousPos[1];
//             for (let node of graphSelectedNodes) {
//                 let previousPos = [node.fx - window.event.clientX + mouseOldPos[0], node.fy - window.event.clientY + mouseOldPos[1]];
//                 let finalPos = [node.fx, node.fy];
        
//                 if (positionsChanged) {
//                     var positions = new ValueRegisterer(previousPos, finalPos, new Element(node, NodeType));
//                     tabNodes.push(positions);
//                 }
//             }
//             MyManager.Execute(new MoveSelectedNodesCommand(tabNodes));
//             break;
//     }
// }

function manageSelection() {
    selectedNodes = svg.selectAll(".isSelected");
    graphSelectedNodes = [];
    let mousePreviousPos;
    let mouseOldPos;


    for (let node of graphJSON.nodes){
        if (node.isSelected){
            graphSelectedNodes.push(node);
        }
    }

    selectedNodes.call(d3.drag()
        .on('start', function (event, d) {
            if (!event.active) force.alphaTarget(0.3).restart();
            mousePreviousPos = [window.event.clientX, window.event.clientY];
            mouseOldPos = [window.event.clientX, window.event.clientY];
            drag_in_progress = true;
        })
        .on('drag', function (d) {
            let mousePosX = window.event.clientX;
            let mousePosY = window.event.clientY;
            graphSelectedNodes.forEach((node) => { node.fx += mousePosX - mousePreviousPos[0]; node.fy += mousePosY - mousePreviousPos[1];})
            mousePreviousPos = [mousePosX, mousePosY];
        })
        .on('end', function (event, d) {
            if (!event.active) force.alphaTarget(0);
            drag_in_progress = false;
            let tabNodes = [];
            let positionsChanged = mouseOldPos[0] != mousePreviousPos[0] || mouseOldPos[1] != mousePreviousPos[1];
            for (let node of graphSelectedNodes) {
                let previousPos = [node.fx - window.event.clientX + mouseOldPos[0], node.fy - window.event.clientY + mouseOldPos[1]];
                let finalPos = [node.fx, node.fy];

                if (positionsChanged) {
                    var positions = new ValueRegisterer(previousPos, finalPos, new Element(node, NodeType));
                    tabNodes.push(positions);
                }
            }

            MyManager.Execute(new MoveSelectedNodesCommand(tabNodes));
        }));

    RefreshNodes();
}

function SetNewPosition(registeredPos) {
    SetNodePosition(registeredPos.newValue, registeredPos.element);
}

function SetNewSelectedNodesPosition(tabNodes) {
    for (let node of tabNodes) {
        SetNodePosition(node.newValue, node.element);
    }
}

function SetNodePosition(Pos, nodeData) {
    let currrentNode = FindElementInGraph(nodeData);
    force.stop();
    currrentNode.fx = Pos[0];
    currrentNode.fy = Pos[1];
    force.restart();
}

function SetOldPosition(registeredPos) {
    SetNodePosition(registeredPos.oldValue, registeredPos.element);
    ;
}

function SetOldSelectedNodesPosition(tabNodes) {
    for (let node of tabNodes) {
        SetNodePosition(node.oldValue, node.element);
    }
}

function RefreshNodes() {
    nodes.attr("name", function (d) {
        return d.name;
    })
        .attr("fill", function (d) {
            return customColorScale(groupList.indexOf(d.group));
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
            let nodes = document.querySelectorAll('.node');
            for (let circle of nodes) {
                if (circle.getAttribute('name') == element.data.name) {
                    circle.setAttribute('class', 'node isSelected');
                }
            }
            manageSelection();
            break;
        case EdgeType:
            RefreshEdge();
            break;
        case LoopType:
            RefreshLoops();
            break;
    }
}

function GetCurrentSelection(allowEmpty = false) {
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
    if (!allowEmpty && nodes.length == 0 && edges.length == 0 && loops.length == 0) {
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
    force.restart();
    return true;
}

function CreateNode(pos = null) {
    var newX;
    var newY;
    if (pos != null) {
        newX = pos[0];
        newY = pos[1];
    } else {
        newX = cursorPosition.x;
        newY = cursorPosition.y;
    }

    var newNode = {
        group: "0",
        name: FindLowestIDAvailable(),
        fx: newX,
        fy: newY,
        index: graphJSON.nodes.length
    };
    return newNode;
}

function FindLowestIDAvailable() {
    let lowestID = Infinity;
    let i = 0;
    while (lowestID == Infinity) {
        if (graphJSON.nodes.find(node => node.name == i) != undefined) {
            i++;
        } else {
            lowestID = i;
        }
    }
    return lowestID.toString(10);
}

//Add loop on a node
function AddLoopOnNode(node, isFirst = true) {
    var newLoop = CreateLoop(node);
    MyManager.Execute(new AddLoopCommand(newLoop, isFirst));
}

//Add loop on all selected nodes
function AddLoopOnSelection() {
    if (GetCurrentSelection()) {
        selectedNodes = GetCurrentSelection().nodes;
        if (selectedNodes.length > 0) {
            let isFirst = true;
            for (let i = 0; i < selectedNodes.length; i++) {
                AddLoopOnNode(selectedNodes[i].data, isFirst);
                isFirst = false;
            }
            return true;
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }
    }
    return false;
}


//Set Group for all Selected Nodes
function SetGroupOfSelection() {
    if (GetCurrentSelection()) {
        selectedNodes = GetCurrentSelection().nodes;
        let isFirst = true;

        if (selectedNodes.length > 0) {
            for (let i = 0; i < selectedNodes.length; i++) {
                if (selectedNodes[i].data.group != groupList[currentGroupIndex]) {
                    let vr = new ValueRegisterer(selectedNodes[i].data.group, groupList[currentGroupIndex], selectedNodes[i]);
                    MyManager.Execute(new ChangeGroupCommand(vr, isFirst));
                    isFirst = false;
                }
            }
            return true;
        } else {
            CustomWarn("No nodes selected");
        }
        return false;
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
                    MyManager.Execute(new AddEdgeCommand(newLink, isFirst));
                    isFirst = false;
                }
            }
            return true;
        } else {
            CustomWarn("No nodes to add loop at on the selection");
        }


        return false;
    }
}

function AddEdge(newEdge) {
    graphJSON.links.push(newEdge);
    ManageEdges();
    PlaceBeforeNode("link");
    force.restart();
}

function CreateEdge(src, dest) {
    let selected = src.isSelected && dest.isSelected;
    var link = {
        "strength": 0,
        "target": dest,
        "color": "#aaa",
        "curve": 0,
        "source": src,
        "name": "",
        "isSelected": selected,
    }

    return link;
}

function AddLoop(newLoop) {
    graphJSON.loops.push(newLoop);
    ManageLoops();
    PlaceBeforeNode("loop");
    force.restart();
}

function PlaceBeforeNode(className) {

    elements = document.getElementsByClassName(className);
    let elem = elements[elements.length - 1];

    let firstNode = document.getElementsByClassName("node")[0];
    firstNode.parentNode.insertBefore(elem, firstNode);
}

function CreateLoop(src) {
    let selected = src.isSelected;
    var loop = {
        "strength": 0,
        "target": src,
        "color": "#aaa",
        "curve": 20,
        "source": src,
        "name": "",
        "isSelected": selected,
    }

    return loop;
}

function RemoveElementFromGraph(element, _isFirst = true) {
    switch (element.type) {
        case NodeType:
            let isFirst = _isFirst;
            GetEdgesByVertex(element.data).forEach(edge => {
                MyManager.Execute(new SupprEdgeCommand(edge, isFirst));
                isFirst = false;
            });

            GetLoopsByVertex(element.data).forEach(loop => {
                MyManager.Execute(new SupprLoopCommand(loop, false));
            });

            MyManager.Execute(new SupprNodeCommand(element.data, false));
            break;
        case EdgeType:
            if (graphJSON.links.indexOf(element.data) != -1) {
                MyManager.Execute(new SupprEdgeCommand(element.data, _isFirst));
            }
            break;
        case LoopType:
            if (graphJSON.loops.indexOf(element.data) != -1) {
                MyManager.Execute(new SupprLoopCommand(element.data, _isFirst));
                break;
            }


    }
}

function AddNewNode() {
    var newNode = CreateNode();
    MyManager.Execute(new AddNodeCommand(newNode));
    return true;
}

function RemoveSelection() {
    let currentSelection = GetCurrentSelection();
    let isFirst = true;

    if (currentSelection != null) {
        //For each list
        Object.keys(currentSelection).forEach(objectAttribute => {
            //For each element
            currentSelection[objectAttribute].forEach(element => {
                element.data.isSelected = false;
                RemoveElementFromGraph(element, isFirst)
                isFirst = false;
            });
        });


        ManageLoops();
        ManageEdges();
        ManageNodes();


        return true;
    } else {
        CustomWarn("Nothing to delete");
    }
    return false;
}

function RemoveEdge(edgeData) {
    let index = graphJSON.links.indexOf(edgeData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.links.splice(index, 1);
        ManageEdges();
        force.restart();
    }
}

function RemoveLoop(loopData) {
    let index = graphJSON.loops.indexOf(loopData);
    //Prevent multiple deletion on the same element causing bugs
    if (index != -1) {
        graphJSON.loops.splice(graphJSON.loops.indexOf(loopData), 1);
        ManageLoops();
        force.restart();


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
    force.restart();
}

function SubdivideEdge(edge, isFirst = true) {
    let pos = third_point_of_curved_edge(edge.source, edge.target, 0);
    let newNode = CreateNode(pos);

    MyManager.Execute(new AddNodeCommand(newNode, isFirst));
    MyManager.Execute(new AddEdgeCommand(CreateEdge(newNode, edge.source), false));
    MyManager.Execute(new AddEdgeCommand(CreateEdge(newNode, edge.target), false));
    MyManager.Execute(new SupprEdgeCommand(edge, false));
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
            return true;
        } else {
            CustomWarn("No edges to subdivide");
        }
        return false;
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
            return true;
        } else {
            CustomWarn("No edges to invert");
        }
        return false;
    }
}

function InvertEdge(edge, isFirst = true) {
    let vr = new ValueRegisterer([edge.data.source, edge.data.target], [edge.data.target, edge.data.source], edge);
    MyManager.Execute(new InvertDirectionCommand(vr, isFirst));
}

function PrettifyJSON() {
    var prettyJSON = JSON.parse(JSON.stringify(graphJSON));

    prettyJSON.links.forEach(link => {
        link.source = link.source.name;
        link.target = link.target.name;
    });

    prettyJSON.loops.forEach(loop => {
        loop.source = loop.target = loop.source.name;
    });

    //Return the Y to correspond with Sage Plan
    prettyJSON.nodes.forEach(node => {
        node.y = -node.y;
    });

    //Shrink graph to adapt to the scale of SageMath Show() method
    prettyJSON.nodes.forEach(function (node) {
        node.x = node.x / 100;
        node.y = node.y / 100;
    });

    return JSON.stringify(prettyJSON);
}

function SetGroupElement(valueRegisterer) {
    let element = FindElementInGraph(valueRegisterer.element);
    element.group = (element.group == valueRegisterer.newValue) ? valueRegisterer.oldValue : valueRegisterer.newValue;
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

    force.restart();
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

function SetNodesColoration(colorationList) {
    var id = 0;
    colorationList.forEach(coloration => {
        coloration.forEach(name => {
            node = graphJSON.nodes.find(function (node) {
                return node.name == name;
            });
            SetGroupElement(new ValueRegisterer(id, id, new Element(node, NodeType)));
        });
        id++;
    });

    FillGroupFromGraph(graphJSON);
    PopulateGroupList();
    ManageNodes();
}

function SetLinksColoration(colorationList, id = 0) {
    colorationList.forEach(coloration => {
        coloration.forEach(tuple => {
            link = graphJSON.links.find(function (link) {
                return link.source.name == tuple[0] && link.target.name == tuple[1];
            });
            SetGroupElement(new ValueRegisterer(id, id, new Element(link, EdgeType)));
        });
        id++;
    });
    ManageEdges();
}

var showSpanTree = false;
document.addEventListener('DOMContentLoaded', (e) => {
    document.getElementById("span_tree").addEventListener('change', function () {
        DeleteAllEdgeGroups();
        if (this.checked) {
            showSpanTree = true;
            DisplaySpanTree();
        } else {
            showSpanTree = false;
            ManageEdges();
        }
    });
});

function DeleteAllEdgeGroups() {
    links.each(function (d) {
        delete d.group;
    });
}

function checkIfExist() {
    window.open("https://hog.grinvin.org/DoSearchGraphFromGraph6String.action?graph6String=" + document.querySelector("#g6").textContent);
}

// function dragElement(elmnt) {
//     let mouseX = 0, mouseY = 0, offsetX, offsetY;
//     if (document.getElementById(elmnt.id + "header")) {
//         /* if present, the header is where you move the DIV from:*/
//         document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
//     } else {
//         /* otherwise, move the DIV from anywhere inside the DIV:*/
//         elmnt.onmousedown = dragMouseDown;
//     }

//     function dragMouseDown(e) {
//         e = e || window.event;
//         e.preventDefault();

//         offsetX = e.clientX - elmnt.style.left;
//         offsetY = e.clientY - elmnt.style.top;

//         mouseX = e.clientX;
//         mouseY = e.clientY;
//         document.onmouseup = closeDragElement;

//         document.onmousemove = elementDrag;
//     }

//     function elementDrag(e) {
//         e = e || window.event;
//         e.preventDefault();

//         mouseX = e.clientX;
//         mouseY = e.clientY;

//         elmnt.style.top = -offsetY + mouseY + "px";
//         elmnt.style.left = -offsetX + mouseX + "px";
//     }

//     function closeDragElement() {

//         document.onmouseup = null;
//         document.onmousemove = null;
//     }
// }

function lightMode() {
    document.querySelector("body").classList.remove("darkMode");
    document.querySelector("body").classList.add("lightMode");
    var all = document.getElementsByTagName("*");
    for (var i = 0, max = all.length; i < max; i++) {
        all[i].style.color = "black";
    }
    var allButton = document.getElementsByTagName("button");
    for (var j = 0, jmax = allButton.length; j < jmax; j++) {
        allButton[j].style.color = "white";
        allButton[j].style.backgroundColor = "lightblue";
    }
    window.localStorage.setItem('themeSelect', 'lightMode');
    getCookieTheme();
}

function darkMode() {
    document.querySelector("body").classList.remove("lightMode");
    document.querySelector("body").classList.add("darkMode");
    var all = document.getElementsByTagName("*");
    for (var i = 0, max = all.length; i < max; i++) {
        all[i].style.color = "white";
    }
    var allButton = document.getElementsByTagName("button");
    for (var j = 0, jmax = allButton.length; j < jmax; j++) {
        allButton[j].style.color = "grey";
        allButton[j].style.backgroundColor = "black";
    }
    window.localStorage.setItem('themeSelect', 'darkMode');
    document.querySelector('#g6').style.color = "black";
    getCookieTheme();
}

function getCookieTheme() {
    return window.localStorage.getItem('themeSelect')
}

function selectModeDependOfCookie() {

    if (getCookieTheme() === 'darkMode') {
        darkMode();

    } else if (getCookieTheme() === 'lightMode') {
        lightMode();
    } else {
    }
}

function montrerHamiltonian() {
    var element = document.getElementById("isHamiltonian");
    element.style.visibility = "visible";
}
