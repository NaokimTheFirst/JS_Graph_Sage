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

const cursorPosition = {
    x: 0,
    y: 0
};

window.onload = function () {
    document.body.onmousemove = handleMouseMove;

    LoadGraphData();
    InitGraph();
    KeyboardEventInit();

    ManageAllGraphicsElements();

    InitForce();

    //Start the automatic force layout
    force.start();
}

function handleMouseMove(event) {
    cursorPosition.x = event.pageX;
    cursorPosition.y = event.pageY;
}
// Loads the graph data
function LoadGraphData() {
    var mydiv = document.getElementById("mygraph")
    var graph_as_string = mydiv.innerHTML
    graphJSON = eval('(' + graph_as_string + ')');

    //Put index on nodes
    for (let index = 0; index < graphJSON.nodes.length; index++) {
        graphJSON.nodes[index].index = index;
    }

    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    // List of colors
    color = d3.scale.category10();
}

function InitGraph() {
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
            //Suppr
            case 46:
                if (currentObject != null) {
                    RemoveElement(currentObject);
                }
                break;
                //A for Add
            case 65:
                AddNode();
                break;
                //F for Freeze
            case 70:
                FreezeGraph();
                break;
                //T for Test, to remove before build
            case 84:
                console.log("Test");
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + d3.event.keyCode);
                break;
        }
    })
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
                    return force.nodes()[d.source].x;
                })
                .attr("cy", function (d) {
                    return force.nodes()[d.source].y - d.curve;
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

function RecordMousePos(target) {
    let pos = d3.mouse(target);
    mousePosition = {
        x: pos[0],
        y: pos[1]
    };
}

function ManageAllGraphicsElements() {

    d3.select("svg").remove();
    // SVG window
    svg = d3.select("body").append("svg")
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



    // Edges
    links = svg.selectAll(".link")
        .data(force.links())
        .enter().append("path")
        .attr("class", function (d) {
            return "link directed";
        })
        .attr("id", function (current) {
            //TODO : solve problem here with generated links
            //if the link is generated, current.source returns an object
            //even though there's no difference in force.links()
            if(typeof current.source === 'number') {
                return current.source + "_" + current.target;
            }
            else {
                return current.source.name + "_" + current.target.name;
            }
        })
        .attr("marker-end", function (d) {
            return "url(#directed)";
        })
        .on("mouseover", function () {
            currentObject = this;
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");
    console.log(force.links());

    // Loops
    loops = svg.selectAll(".loop")
        .data(graphJSON.loops)
        .enter().append("circle")
        .attr("class", "link")
        .attr("r", function (d) {
            return d.curve;
        })
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", graphJSON.edge_thickness + "px");


    ManageNodes();
    ManageVertexLabel();

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

function ManageVertexLabel() {
    // Vertex labels
    if (graphJSON.vertex_labels) {
        v_labels = svg.selectAll(".v_label")
            .data(graphJSON.nodes)
            
        v_labels.enter()
            .append("svg:text")
            .attr("class", "v_label")
            .attr("vertical-align", "middle")
            .attr("id", function (d) {
                return d.index;
            })
            .text(function (d) {
                return d.name;
            });

        v_labels.exit().remove();
    }
}

//Assure that all the current data correspond to a node
function ManageNodes(bool) {
    // Defines nodes elements
    nodes = svg.selectAll(".node")
        .data(graphJSON.nodes)

    //Define what happend a data is added
    nodes.enter().append("circle")
        .attr("class", "node")
        .attr("r", graphJSON.vertex_size)
        .attr("name", function (d) {
            return d.name;
        })
        .attr("id", function (d) {
            return d.index;
        })
        .style("fill", function (d) {
            return color(d.group);
        })
        .on("mouseover", function () {
            currentObject = this;
        })
        .on("mouseout", function () {
            currentObject = null;
        })
        .call(force.drag()
            .on('dragstart', function (d) {
                drag_in_progress = true;
                d.fixed = true;
            })
            .on('dragend', function () {
                drag_in_progress = false;
            }))
        .on("dblclick", function (d) {
                d.fixed = false;
        });

    //Defines what happend when a data is removed
    nodes.exit().remove();
}

function AddNode() {
    //Create new node
    var newNode = {
        group: "0",
        name: "no_name",
        index: graphJSON.nodes.length,
        x: cursorPosition.x,
        y: cursorPosition.y
    };

    //Add it to the data
    graphJSON.nodes.push(newNode);

    //Apply nodes rules to the data
    ManageNodes();
    ManageVertexLabel();

    //Restart the force layout with the new elements
    force.start();
}

function AddEdge(src, dest) {

    var nodeSrc = null;
    var nodeDest = null;

    var i = 0;
    while(i<force.nodes().length || nodeSrc===null && nodeDest===null) {
        if (force.nodes()[i].name == src){
            nodeSrc = force.nodes()[i];

        }
        if (force.nodes()[i].name == dest){
            nodeDest = force.nodes()[i];
        }
        i++;
    }

    if(nodeSrc===null) {
        console.log("Node "+src+" not found");
    }
    else if(nodeDest===null) {
        console.log("Node "+dest+" not found");
    }
    else {
        force.links().push({"strength" : 0,
                  "target" : nodeDest,
                  "color" : "#aaa",
                  "curve" : 0,
                  "source" : nodeSrc,
                  "name" : ""});

        ManageAllGraphicsElements();
        force.start();
    }
}