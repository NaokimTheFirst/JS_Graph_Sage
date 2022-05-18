__propertiesParameter = 'Properties'
__strongOrientationParameter = 'strongOrientation'
__randomOrientationParameter = 'randomOrientation'
__vertexColoringParameter = 'vertexColoring'
__edgeColoringParameter = 'edgeColoring'
__convertGraphParameter = 'convert'
__errorParameter = "errorWhileTreatingRequest"
__renewGraphParameter = 'renewGraph'
__showSpanTreeParameter = "showSpanTree"
__girthParameter = "girth"
__vertexConnectivityParameter = "vertexConnectivity"
__chromaticNumberParameter = "chromaticNumber"
__chromaticIndexParamater = "chromaticIndex"
__edgeConnectivityParamater = "edgeConnectivity"
__saveGraphParameter = 'save'
__switchLockParameter = "switchLock"
__freezeGraphParameter = "freezePositions"
__hamiltonianParameter = "hamiltonian"

__mergeVerticesParameter = "mergeVertices"

from json import JSONEncoder


def _get_graph_properties(graph):
    response = [__propertiesParameter, []]

    if len(graph.vertices()) <= 1:
        radius = len(graph.vertices())
    else:
        radius = convert_sage_types(graph.radius())

    if len(graph.vertices()) == 0:
        diameter = 0
    else:
        diameter = convert_sage_types(graph.diameter())

    isTree = _the_graph_is_a_tree(graph)
    empty = _the_graph_is_a_forest(graph)

    if isTree or empty:
        result = "+Infinite"
    else:
        result = graph.girth()


    response[1].append(radius)
    response[1].append(diameter)
    response[1].append(graph.is_regular())
    response[1].append(graph.is_planar())
    response[1].append(graph.is_bipartite())
    response[1].append(len(graph.vertices()))
    ds = graph.degree_sequence()
    if not ds:
        ds = ['None']
    response[1].append(ds[0])  # get max degree of the graph
    response[1].append(ds[len(ds) - 1])  # get minimum degree of the graph
    response[1].append(graph.size())
    response[1].append(graph.is_eulerian())
    response[1].append(_generate_graph6_formula(graph))
    response[1].append(result)
    response[1].append(graph.is_hamiltonian())
    response[1].append(graph.edge_connectivity())
    response[1].append(graph.vertex_connectivity())
    return response, graph


def _span_tree_as_string_array(graph):
    spanTree = graph.min_spanning_tree()
    return [__showSpanTreeParameter, coloration_as_string_array(spanTree)], graph

def coloration_as_string_array(coloration):
    stringColoration = []
    for tuple in coloration:
        tupleOfStrings = ()
        for v in tuple:
            tupleOfStrings += (str(v),)
        stringColoration.append(tupleOfStrings)
    return stringColoration


def convert_sage_types(target):
    if isinstance(target, sage.rings.integer.Integer):
        target = int(target)
    elif isinstance(target, sage.rings.infinity.PlusInfinity):
        target = "+Infinity"

    return target


def _strong_orientation_for_JS(graph):
    newGraph = None
    response = []

    try:
        if graph.is_directed():
            newGraph = graph.to_undirected()
            newGraph = newGraph.strong_orientation()
            __update_graph_positions(newGraph, graph)
            response.append(__strongOrientationParameter)
            response.append(graph_to_JSON(newGraph))
            print("Generated strong orientation")
        else:
            newGraph = graph.strong_orientation()
            __update_graph_positions(newGraph, graph)
            response.append(__convertGraphParameter)
            response.append("tmpJS")
            show_CustomJS(__create_temporary_JS_graph(newGraph))
    except Exception as exception:
        print("ERROR : " + str(exception))
        response.append(__errorParameter)
        response.append(str(exception))
        pass
    return response, newGraph


def _random_orientation_for_JS(graph):
    newGraph = None
    response = []

    try:
        if graph.is_directed():
            newGraph = graph.to_undirected()
            newGraph = newGraph.random_orientation()
            __update_graph_positions(newGraph, graph)
            response.append(__randomOrientationParameter)
            response.append(graph_to_JSON(newGraph))
            print("Generated random orientation")
        else:
            newGraph = graph.random_orientation()
            __update_graph_positions(newGraph, graph)
            response.append(__convertGraphParameter)
            response.append("tmpJS")
            show_CustomJS(__create_temporary_JS_graph(newGraph))
    except Exception as exception:
        print("ERROR : " + str(exception))
        response.append(__errorParameter)
        response.append(str(exception))
        pass

    return response, newGraph


import sage.graphs.graph_coloring


def _generate_vertex_coloring_for_JS(graph):
    print("Generated vertex coloration")
    if not graph.is_directed():
        color = graph_coloring.vertex_coloring(graph)
    else:
        newGraph = Graph()
        update_graph(newGraph, graph)
        color = graph_coloring.vertex_coloring(newGraph)
    coloration = []
    for col in color:
        colorationClass = []
        for c in col:
            colorationClass.append(str(c))
        coloration.append(colorationClass)

    return [__vertexColoringParameter, coloration], graph


def _generate_edge_coloring_for_JS(graph):
    print("Generated edge coloration")
    edgeColoring = graph_coloring.edge_coloring(graph)
    coloration = []
    for colorationClass in edgeColoring:
        coloration.append(coloration_as_string_array(colorationClass))
    return [__edgeColoringParameter, coloration], graph


def _convert_graph_digraph_bidirectionnal_for_JS(graph):
    newGraph = None
    if graph.is_directed():
        newGraph = __convert_DtoG(graph)
    else:
        newGraph = __convert_GtoD(graph)
    show_CustomJS(__create_temporary_JS_graph(newGraph))

    return [__convertGraphParameter, "tmpJS"], graph


def __convert_GtoD(graph):
    newGraph = DiGraph()
    update_graph(newGraph, graph)
    return newGraph


def __convert_DtoG(graph):
    newGraph = Graph()
    update_graph(newGraph, graph)
    return newGraph


tmpJSgraphs = []


def __create_temporary_JS_graph(graph):
    global tmpJSgraphs

    path_to_last_tmp_graph = SAGE_TMP + '/tmpJSgraph'
    graph.save(path_to_last_tmp_graph)
    tmpJSgraphs.append(load(path_to_last_tmp_graph))
    print('New graph created in \"tmpJSgraphs[%d]\"' % (len(tmpJSgraphs) - 1))
    return tmpJSgraphs[len(tmpJSgraphs) - 1]


def _get_new_graph_in_JSON_for_JS(graph):
    return [__renewGraphParameter, graph_to_JSON(graph, layout=None)], graph


def _generate_graph6_formula(graph):
    if (graph.has_loops()):
        response = "None"
        print("G6 can be applied on simple graph only")
    else:
        if (graph.is_directed()):
            response = (graph.dig6_string())
        else:
            response = (graph.graph6_string())
    return response


def _get_girth(graph):

    isTree = _the_graph_is_a_tree(graph)
    empty=_the_graph_is_a_forest(graph)

    if isTree or empty:
        result="+Infinite"
    else:
        result=graph.girth()



    return [__girthParameter, result], graph



def _the_graph_is_a_tree(graph):
    return graph.is_tree()
def _the_graph_is_a_forest(graph):
    return graph.is_forest()

def _get_Vertex_Connectivity(graph):
    result = graph.vertex_connectivity()
    return [__vertexConnectivityParameter, int(result)], graph


def _get_Chromatic_Number(graph):
    result = graph.chromatic_number()
    return [__chromaticNumberParameter, result], graph


def _get_Chromatic_Index(graph):
    result = graph.chromatic_index()
    return [__chromaticIndexParamater, result], graph

def _get_IsHamiltonian(graph):
    result = graph.is_hamiltonian()
    return [__hamiltonianParameter, result], graph
def _get_Edge_Connectivity(graph):
    result = graph.edge_connectivity()
    return [__edgeConnectivityParamater, result], graph


def _save_graph(newGraph, oldGraph):
    response = ["save", "Graph saved"]
    print("Graph saved");
    update_graph(oldGraph, newGraph)
    return response


def _switch_lock(client):
    response = [__switchLockParameter]
    client['lock'] = not client['lock']
    s = "Save auto "

    if client['lock']:
        s += "enabled"
    else:
        s += "disabled"

    print(s)
    response.append(s)

    return response


def _freezePositions(graph):
    return [__freezeGraphParameter, "Nodes' positions set"], graph


def _mergeVertices(graph, verticesToMerge) :
    verticesToMerge2=casteTypeVertex(graph, verticesToMerge)
    graph.merge_vertices(verticesToMerge2)  
    return [__mergeVerticesParameter, graph_to_JSON(graph, layout=None)], graph

def casteTypeVertex(graph, verticesToMerge) :
    vertecies = graph.vertices()
    verteciesToReturn = [];
    for i in verticesToMerge :
        for j in vertecies :
            if (i == str(j)):
                verteciesToReturn.append(j)
    return verteciesToReturn
    


JS_functions_dict = {__propertiesParameter: _get_graph_properties,
                     __strongOrientationParameter: _strong_orientation_for_JS,
                     __randomOrientationParameter: _random_orientation_for_JS,
                     __vertexColoringParameter: _generate_vertex_coloring_for_JS,
                     __edgeColoringParameter: _generate_edge_coloring_for_JS,
                     __convertGraphParameter: _convert_graph_digraph_bidirectionnal_for_JS,
                     __renewGraphParameter: _get_new_graph_in_JSON_for_JS,
                     __showSpanTreeParameter: _span_tree_as_string_array,
                     __vertexConnectivityParameter: _get_Vertex_Connectivity,
                     __chromaticNumberParameter: _get_Chromatic_Number,
                     __chromaticIndexParamater: _get_Chromatic_Index,
                     __edgeConnectivityParamater: _get_Edge_Connectivity,
                     __saveGraphParameter: _save_graph,
                     __switchLockParameter: _switch_lock,
                     __freezeGraphParameter: _freezePositions,
                     __mergeVerticesParameter: _mergeVertices}

# def create_show_global_tmp_graph(graph):
# 	path_to_tmp_graph = SAGE_TMP+'/tmpJSgraph'
# 	graph.save(path_to_tmp_graph)
# 	global tmpJSgraph
# 	print(id(tmpJSgraph))
# 	tmpJSgraph = load(path_to_tmp_graph)
# 	print('New graph created in variable \"tmpJSgraph\"')
# 	show_CustomJS(tmpJSgraph)
# 	return tmpJSgraph
