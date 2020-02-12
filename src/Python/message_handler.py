propertiesParameter = 'Properties'
strongOrientationParameter = 'strongOrientation'
randomOrientationParameter = 'randomOrientation'
vertexColoringParameter = 'vertexColoring'
edgeColoringParameter = 'edgeColoring'
convertGraphParameter = 'convert'
errorParameter = "errorWhileTreatingRequest"



def handle_message(parameter,graph):
	response = None
	if parameter is not None:
		response = JS_functions_dict[parameter](graph)
	return response

def get_graph_properties(graph):
	response = [propertiesParameter,[]]

	if len(graph.vertices()) == 1 :
		radius = 1
	else :
		radius = convert_sage_types(graph.radius())
	
	diameter = convert_sage_types(graph.diameter())

	response[1].append(radius)
	response[1].append(diameter)
	response[1].append(graph.is_regular())
	response[1].append(graph.is_planar())
	response[1].append(graph.is_bipartite())

	return response

def convert_sage_types(target) :
	if isinstance(target, sage.rings.integer.Integer) :
		target = int(target)
	elif isinstance(target, sage.rings.infinity.PlusInfinity) :
		target = "+Infinity"

	return target


def strong_orientation(graph):
	newGraph = None
	response = []

	try :
		newGraph = graph.strong_orientation()
		if graph.is_directed() :
			response.append(strongOrientationParameter)
			response.append(graph_to_JSON(newGraph))
		else :
			response.append(convertGraphParameter)
			response.append("tmpJS")
			show_CustomJS(create_global_tmp_graph(newGraph))
	except Exception as exception :
		print("ERROR : "+ str(exception))
		response.append(errorParameter)
		response.append(str(exception))
		pass
	return response


def random_orientation(graph):
	newGraph = None
	response = []

	try :
		newGraph = graph.random_orientation()
		if graph.is_directed() :
			response.append(randomOrientationParameter)
			response.append(graph_to_JSON(newGraph))
		else :
			response.append(convertGraphParameter)
			response.append("tmpJS")
			show_CustomJS(create_global_tmp_graph(newGraph))
	except Exception as exception :
		print("ERROR : "+ str(exception))
		response.append(errorParameter)
		response.append(str(exception))
		pass

	return response


def generate_vertex_coloring(graph):
	return [vertexColoringParameter,graph.coloring()]


import sage.graphs.graph_coloring
def generate_edge_coloring(graph):
	return [edgeColoringParameter,graph_coloring.edge_coloring(graph)]


def convert_graph_digraph_bidirectionnal(graph):
	newGraph = None
	if graph.is_directed():
		newGraph = convert_DtoG(graph)
	else :
		newGraph = convert_GtoD(graph)
	show_CustomJS(create_global_tmp_graph(newGraph))

	return [convertGraphParameter,"tmpJS"]

def convert_GtoD(graph):
	newGraph = DiGraph()
	update_graph(newGraph, graph)
	return newGraph

def convert_DtoG(graph):
	newGraph = Graph()
	update_graph(newGraph, graph)
	return newGraph


def create_global_tmp_graph(graph):
	graph.save('tmpJS')
	global tmpJS
	tmpJS = load('tmpJS')
	print('New graph created in variable \"tmpJS\"')
	return tmpJS

JS_functions_dict = {propertiesParameter : get_graph_properties,
					strongOrientationParameter : strong_orientation,
					randomOrientationParameter : random_orientation,
					vertexColoringParameter : generate_vertex_coloring,
					edgeColoringParameter : generate_edge_coloring,
					convertGraphParameter : convert_graph_digraph_bidirectionnal}

