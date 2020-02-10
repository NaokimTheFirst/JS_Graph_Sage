
def handle_message(parameter,graph):
	result = None
	if parameter is not None:
		result = JS_functions_dict[parameter](graph)
	return result

def get_graph_properties(graph):
	result = []

	if len(graph.vertices()) == 1 :
		radius = 1
	else :
		radius = convert_sage_types(graph.radius())
	
	diameter = convert_sage_types(graph.diameter())

	result.append(radius)
	result.append(diameter)
	result.append(graph.is_regular())
	result.append(graph.is_planar())
	result.append(graph.is_bipartite())

	return result

def convert_sage_types(target) :
	if isinstance(target, sage.rings.integer.Integer) :
		target = int(target)
	elif isinstance(target, sage.rings.infinity.PlusInfinity) :
		target = "+Infinity"

	return target


def strong_orientation(graph):
	newGraph = None
	try :
		newGraph = list(graph.strong_orientations_iterator())[0]
		if graph.is_directed() :
			return graph_to_JSON(newGraph)
		else :
			show_CustomJS(create_global_tmp_graph(newGraph))

	except :
		pass


def random_orientation(graph):
	newGraph = DiGraph([(a, b, c) if randint(0, 1) else (b, a, c) for a, b, c in graph.edge_iterator()])

	if graph.is_directed() :
		return graph_to_JSON(newGraph)
	else :
		update_graph(newGraph, graph)
		show_CustomJS(create_global_tmp_graph(newGraph))


def generate_vertex_coloring(graph):
	return graph.coloring()


import sage.graphs.graph_coloring
def generate_edge_coloring(graph):
	return graph_coloring.edge_coloring(graph)


def convert_graph_digraph_bidirectionnal(graph):
	newGraph = None
	if graph.is_directed():
		newGraph = convert_DtoG(graph)
	else :
		newGraph = convert_GtoD(graph)
	show_CustomJS(create_global_tmp_graph(newGraph))

def convert_GtoD(graph):
	newGraph = Digraph()
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

JS_functions_dict = {'Properties' : get_graph_properties,
					 'strongOrientation' : strong_orientation,
					 'randomOrientation' : random_orientation,
					 'vertexColoring' : generate_vertex_coloring,
					 'edgeColoring' : generate_edge_coloring,
					 'convert' : convert_graph_digraph_bidirectionnal}