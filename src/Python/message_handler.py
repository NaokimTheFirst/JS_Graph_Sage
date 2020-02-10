
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
	result = None
	try :
		result = list(graph.strong_orientations_iterator())[0]
		return graph_to_JSON(result)
	except :
		pass
	return result


def random_orientation(graph):
	graph = DiGraph([(a, b, c) if randint(0, 1) else (b, a, c) for a, b, c in graph.edge_iterator()])
	return graph_to_JSON(graph)


def generate_vertex_coloring(graph):
	return graph.coloring()


import sage.graphs.graph_coloring
def generate_edge_coloring(graph):
	return graph_coloring.edge_coloring(graph)



JS_functions_dict = {'Properties' : get_graph_properties,
					 'strongOrientation' : strong_orientation,
					 'randomOrientation' : random_orientation,
					 'vertexColoring' : generate_vertex_coloring,
					 'edgeColoring' : generate_edge_coloring}