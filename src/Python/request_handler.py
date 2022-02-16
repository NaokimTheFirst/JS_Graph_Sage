__propertiesParameter = 'Properties'
__strongOrientationParameter = 'strongOrientation'
__randomOrientationParameter = 'randomOrientation'
__vertexColoringParameter = 'vertexColoring'
__edgeColoringParameter = 'edgeColoring'
__convertGraphParameter = 'convert'
__errorParameter = "errorWhileTreatingRequest"
__graph6Parameter = "Graph6"



def _get_graph_properties(graph):
	response = [__propertiesParameter,[]]

	if len(graph.vertices()) <= 1  :
		radius = len(graph.vertices())
	else :
		radius = convert_sage_types(graph.radius())
	
	if len(graph.vertices()) == 0  :
		diameter = 0
	else :
		diameter = convert_sage_types(graph.diameter())

	response[1].append(radius)
	response[1].append(diameter)
	response[1].append(graph.is_regular())
	response[1].append(graph.is_planar())
	response[1].append(graph.is_bipartite())

	return response, graph

def convert_sage_types(target) :
	if isinstance(target, sage.rings.integer.Integer) :
		target = int(target)
	elif isinstance(target, sage.rings.infinity.PlusInfinity) :
		target = "+Infinity"

	return target


def _strong_orientation_for_JS(graph):
	newGraph = None
	response = []

	try :
		if graph.is_directed() :
			newGraph = graph.to_undirected()
			newGraph = newGraph.strong_orientation()
			__update_graph_positions(newGraph, graph)
			response.append(__strongOrientationParameter)
			response.append(graph_to_JSON(newGraph))
			print("Generated strong orientation")
		else :
			newGraph = graph.strong_orientation()
			__update_graph_positions(newGraph, graph)
			response.append(__convertGraphParameter)
			response.append("tmpJS")
			show_CustomJS(__create_temporary_JS_graph(newGraph))
	except Exception as exception :
		print("ERROR : "+ str(exception))
		response.append(__errorParameter)
		response.append(str(exception))
		pass
	return response, newGraph


def _random_orientation_for_JS(graph):
	newGraph = None
	response = []

	try :
		if graph.is_directed() :
			newGraph = graph.to_undirected()
			newGraph = newGraph.random_orientation()
			__update_graph_positions(newGraph, graph)
			response.append(__randomOrientationParameter)
			response.append(graph_to_JSON(newGraph))
			print("Generated random orientation")
		else :
			newGraph = graph.random_orientation()
			__update_graph_positions(newGraph, graph)
			response.append(__convertGraphParameter)
			response.append("tmpJS")
			show_CustomJS(__create_temporary_JS_graph(newGraph))
	except Exception as exception :
		print("ERROR : "+ str(exception))
		response.append(__errorParameter)
		response.append(str(exception))
		pass

	return response, newGraph


def _generate_vertex_coloring_for_JS(graph):
	print("Generated vertex coloration")
	if not graph.is_directed():
		color = graph.coloring()
	else :
		newGraph = Graph()
		update_graph(newGraph, graph)
		color = newGraph.coloring()
	return [__vertexColoringParameter,color], graph


import sage.graphs.graph_coloring
def _generate_edge_coloring_for_JS(graph):
	print("Generated edge coloration")
	return [__edgeColoringParameter,graph_coloring.edge_coloring(graph)], graph


def _convert_graph_digraph_bidirectionnal_for_JS(graph):
	newGraph = None
	if graph.is_directed():
		newGraph = __convert_DtoG(graph)
	else :
		newGraph = __convert_GtoD(graph)
	show_CustomJS(__create_temporary_JS_graph(newGraph))

	return [__convertGraphParameter,"tmpJS"], graph

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

	path_to_last_tmp_graph = SAGE_TMP+'/tmpJSgraph'
	graph.save(path_to_last_tmp_graph)
	tmpJSgraphs.append(load(path_to_last_tmp_graph))
	print('New graph created in \"tmpJSgraphs[%d]\"' % (len(tmpJSgraphs)-1))
	return tmpJSgraphs[len(tmpJSgraphs)-1]

def _generate_graph6_formula(graph):
	response = [__graph6Parameter]
	if (graph.is_directed()):
		response.append(graph.dig6_string())
	else :
		response.append(graph.graph6_string())

	return response, graph;

JS_functions_dict = {__propertiesParameter : _get_graph_properties,
					 __strongOrientationParameter : _strong_orientation_for_JS,
					 __randomOrientationParameter : _random_orientation_for_JS,
					 __vertexColoringParameter : _generate_vertex_coloring_for_JS,
					 __edgeColoringParameter : _generate_edge_coloring_for_JS,
					 __convertGraphParameter : _convert_graph_digraph_bidirectionnal_for_JS,
					 __graph6Parameter : _generate_graph6_formula}



# def create_show_global_tmp_graph(graph):
# 	path_to_tmp_graph = SAGE_TMP+'/tmpJSgraph'
# 	graph.save(path_to_tmp_graph)
# 	global tmpJSgraph
# 	print(id(tmpJSgraph))
# 	tmpJSgraph = load(path_to_tmp_graph)
# 	print('New graph created in variable \"tmpJSgraph\"')
# 	show_CustomJS(tmpJSgraph)
# 	return tmpJSgraph