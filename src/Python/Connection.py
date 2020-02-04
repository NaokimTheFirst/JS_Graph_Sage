
# Called for every client connecting
def new_client(client, server):
	print("New client connected and was given id %d" % client['id'])
	global _last_client
	_last_client = client['id']


# Called for every client disconnecting
def client_left(client, server):
	print("Client(%d) disconnected" % client['id'])
	global graph_client_dict
	graph_client_dict.pop(client['id'])
	if not graph_client_dict :
		server.server_close()
		print("server closed")
		global server_open
		server_open = False


import threading

def launch_connection():
	t = threading.Thread(target=connect)
	t.start()


def connect():
	PORT=9001
	server = None
	server = WebsocketServer(PORT)
	server.set_fn_new_client(new_client)
	server.set_fn_client_left(client_left)
	server.set_fn_message_received(message_received)
	global server_open
	server_open = True
	server.run_forever()


from json import JSONEncoder
# Called when a client sends a message
def message_received(client, server, message):
	global graph_client_dict
	targetGraph = graph_client_dict[client['id']]
	JSONmessage = DataGraph(message)

	newG = ConstructGraphFromJSONObject(JSONmessage)
	result = Check_Parameter(JSONmessage.parameter,newG)
	Update_Graph(targetGraph, newG)

	if result != None :
		returnMessage = JSONEncoder().encode({"request":JSONmessage.parameter, "result": result})
		server.send_message(client,returnMessage)



def Check_Parameter(parameter,graph):
	result = None
	if parameter is not None:
		result = JS_functions_dict[parameter](graph)
	return result


def Check_Properties(graph):
	result = []

	radius = None
	if len(graph.vertices()) is not 1 :
		radius = graph.radius()
	if len(graph.vertices())==1 :
		radius = 1
	if isinstance(radius, sage.rings.infinity.PlusInfinity) :
		radius = "+Infinity"

	diameter = graph.diameter()
	if isinstance(diameter, sage.rings.infinity.PlusInfinity) :
		diameter = "+Infinity"

	result.append(radius)
	result.append(diameter)
	result.append(graph.is_regular())
	result.append(graph.is_planar())
	result.append(graph.is_bipartite())

	return result


def Strong_Orientation(graph):
	result = None
	try :
		result = list(graph.strong_orientations_iterator())[0]
		return graph_to_JSON(result)
	except :
		pass
	return result


def Random_Orientation(graph):
	graph = DiGraph([(a, b, c) if randint(0, 1) else (b, a, c) for a, b, c in graph.edge_iterator()])
	return graph_to_JSON(graph)


def Generate_Vertex_Coloring(graph):
	return graph.coloring()


import sage.graphs.graph_coloring
def Generate_Edge_Coloring(graph):
	return graph_coloring.edge_coloring(graph)


JS_functions_dict = {'Properties': Check_Properties,
					 'strongOrientation': Strong_Orientation,
					 'randomOrientation': Random_Orientation,
					 'vertexColoring': Generate_Vertex_Coloring,
					 'edgeColoring':Generate_Edge_Coloring}