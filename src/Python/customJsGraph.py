from glob import glob
import sys


from sage.misc.temporary_file import tmp_filename
from sage.plot.colors import rainbow
import os, sys

#Setup the html page for d3js and for hosting the graph


def gen_html_code(JSONgraph):

    try :
      js_code_file = open(pathRepo+"/JS_Graph_Sage/src/HTML/base_html.html", 'r') #Open the html page which will host the graph
    except :
      print("Repository "+pathRepo+" not found, update it with _update_JS_Repo(path)")
      sys.exit(1)
    js_code = js_code_file.read().replace("// GRAPH_DATA_HEREEEEEEEEEEE", JSONgraph)
    js_code_file.close()

    # Add d3.js script depending on whether d3js package is installed.
    #d3js_filepath = os.path.join(SAGE_SHARE, 'd3js', 'd3.min.js')
    #if os.path.exists(d3js_filepath):
    #    with open(d3js_filepath, 'r') as d3js_code_file:
    #        d3js_script = '<script>' + d3js_code_file.read() + '</script>'
    #else:
        
    d3js_script = '<script src="https://d3js.org/d3.v4.js"></script>'
    js_code = js_code.replace('// D3JS_SCRIPT_HEREEEEEEEEEEE', d3js_script)

    # Writes the temporary .html file
    try :
      filename = pathRepo + '/JS_Graph_Sage/obj/result.html'
    except :
      print("Repository " + pathRepo + " not found, update it with _update_JS_Repo(path)")
      sys.exit(1)
    f = open(filename, 'w')
    f.write(js_code)
    f.close()

    return filename


def graph_to_JSON(G,
              vertex_partition=[],
              vertex_colors=None,
              edge_partition=[],
              layout=None,
              charge=-120,
              link_distance=100,
              link_strength=2,
              gravity=.04,
              vertex_size=12,
              edge_thickness=4):

    directed = G.is_directed()
    multiple_edges = G.has_multiple_edges()

    # Associated an integer to each vertex
    v_to_id = {v: i for i, v in enumerate(G)}

    # Vertex colors
    if vertex_colors is not None:
        vertex_partition = list(vertex_colors.values())
    len_vertex_partition = len(vertex_partition)
    color = {i: len_vertex_partition for i in range(G.order())}
    for i, l in enumerate(vertex_partition):
        for v in l:
            color[v_to_id[v]] = i

    # Vertex list
    # Data for vertex v must be at position v_to_id[v] in list nodes
    nodes = [{"name": str(v), "group": str(color[v_to_id[v]])} for v in G]
    global original_nodes 
    original_nodes = {}
    for v in G:
      original_nodes[str(v)] = v

    # Edge colors.
    edge_color_default = "#aaa"
    color_list = rainbow(len(edge_partition))
    edge_color = {}
    for i, l in enumerate(edge_partition):
        for e in l:
            u, v, label = e if len(e) == 3 else e+(None,)
            edge_color[u, v, label] = color_list[i]
            if not directed:
                edge_color[v, u, label] = color_list[i]

    # Edge list
    edges = []
    seen = {}  # How many times has this edge been seen ?

    for u, v, l in G.edge_iterator():

        # Edge color
        color = edge_color.get((u, v, l), edge_color_default)

        # Computes the curve of the edge
        curve = 0

        # Loop ?
        if u == v:
            seen[u, v] = seen.get((u, v), 0) + 1
            curve = seen[u, v] * 10 + 10

        # For directed graphs, one also has to take into accounts
        # edges in the opposite direction
        elif directed:
            if G.has_edge(v, u):
                seen[u, v] = seen.get((u, v), 0) + 1
                curve = seen[u, v] * 15
            else:
                if multiple_edges and len(G.edge_label(u, v)) != 1:
                    # Multiple edges. The first one has curve 15, then
                    # -15, then 30, then -30, ...
                    seen[u, v] = seen.get((u, v), 0) + 1
                    curve = (1 if seen[u, v] % 2 else -1) * (seen[u, v] // 2) * 15

        elif not directed and multiple_edges:
            # Same formula as above for multiple edges
            if len(G.edge_label(u, v)) != 1:
                seen[u, v] = seen.get((u, v), 0) + 1
                curve = (1 if seen[u, v] % 2 else -1) * (seen[u, v] // 2) * 15

        # Adding the edge to the list
        # The source (resp. target) is the index of u (resp. v) in list nodes
        edges.append({"source": v_to_id[u],
                      "target": v_to_id[v],
                      "strength": 0,
                      "color": color,
                      "curve": curve,
                      "name": str(l)})

    loops = [e for e in edges if e["source"] == e["target"]]
    edges = [e for e in edges if e["source"] != e["target"]]

    # Defines the vertices' layout if possible
    if layout is not None: 
      Gpos = G.graphplot(layout=layout)._pos
    elif G.get_pos():
      Gpos = G.get_pos()
    else :
      Gpos = G.graphplot(layout='spring')._pos
    pos = []

    if Gpos is not None:
        charge = 0
        link_strength = 0
        gravity = 0
        
        nodesNumber = len(G.get_vertices())
        if nodesNumber > len(Gpos):
          Gpos[G.vertices()[nodesNumber-1]] = (0, 0)
          
        for v in G:
            x, y = Gpos[v]
            pos.append([float(x), float(-y)])
            
    # Encodes the data as a JSON string
    from json import JSONEncoder
    string = JSONEncoder().encode({"nodes": nodes,
                                   "links": edges,
                                   "loops": loops,
                                   "pos": pos,
                                   "directed": G.is_directed(),
                                   "charge": int(charge),
                                   "link_distance": int(link_distance),
                                   "link_strength": int(link_strength),
                                   "gravity": float(gravity),
                                   "vertex_size": int(vertex_size),
                                   "edge_thickness": int(edge_thickness)})
    return string



import re, webbrowser, time
def show_CustomJS(G, layout=None):
  global current_server, graph_client_dict

  if not current_server:
    graph_client_dict[1] = G
    launch_connection()
    WaitServer()
  else :
    client_dictionnary_verification(G)
    graph_client_dict[current_server.id_counter + 1] = G

  JSONgraph = graph_to_JSON(G, layout=layout)
  webbrowser.open('file://'+os.path.realpath(gen_html_code(JSONgraph)))


def WaitServer():
  global current_server

  while current_server is None :
    time.sleep(0.5)
  

class DataGraph(object):
  def __init__(self, data):
    self.__dict__ = json.loads(data)

import json
from sage.graphs import graph
def ConstructGraphFromJSONObject(JSONObject):
  G = None

  if JSONObject.directed :
    G = DiGraph()
  else :
    G = Graph()

  #Add nodes
  for node in JSONObject.nodes:
    if not node.get("name") in original_nodes:
      original_nodes[node.get("name")] = int(node.get("name"))
    G.add_vertex(original_nodes[node.get("name")])

  #Add edgesS
  for l in JSONObject.links:
    G.add_edge(original_nodes[l.get("source")],original_nodes[l.get("target")])

  #Add loops
  if len(JSONObject.loops)>0:
    G.allow_loops(True)
  for l in JSONObject.loops:
    G.add_edge(original_nodes[l.get("source")],original_nodes[l.get("target")])

  #Fill the dictionary of node coordinates
  if (JSONObject.parameter == "freezePositions"):
    posdict = {}
    for n in JSONObject.nodes:
        posdict[original_nodes[n.get("name")]] = (n.get("x"),n.get("y"))

    G.set_pos(posdict)
    print("Nodes' coordinates set")

  return G





# def ConstructGraphFromJSON(pathRepo=path_To_JSON_Repo,
#                            nameJSON=JSON_name):
#   string = GetBackJSON(nameJSON=nameJSON)

#   return ConstructGraphFromJSONString(string)

 	

# def GetBackJSON(pathRepo=path_To_JSON_Repo,
#                 nameJSON=JSON_name):

#   filename = pathRepo+nameJSON

#   try :
#     f = open(filename, 'r')
#   except :
#     print ('File '+pathRepo+nameJSON+' does not exist')
#     print ('default : path = \'Mes Documents/Git/JS_Graph_Sage/obj/\' -> _update_JSON_Repo(path) to update')
#     print ('          name JSON = \'Graph_JSON\' -> _update_JSON_name(name) to update')
#     sys.exit(1)

#   if f.mode == 'r':
#     lines = f.readlines()

#   return lines[0]

