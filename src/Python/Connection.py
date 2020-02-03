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


from json import JSONEncoder
# Called when a client sends a message
def message_received(client, server, message):
	global graph_client_dict
	targetGraph = graph_client_dict[client['id']]
	JSONObject = DataGraph(message)
	newG = ConstructGraphFromJSONObject(JSONObject)
	result = Check_Parameter(JSONObject.parameter,newG)
	if result != None :
		returnMessage = JSONEncoder().encode({"result": result})
		server.send_message(client,returnMessage)
	Update_Graph(g, newG)


def Check_Parameter(parameter,graph):
	result = []
	if parameter == "Radius" :
		result = Check_Radius_Diameter(graph)
	else :
		result = None

	return result

def Check_Radius_Diameter(graph):
	result = []
	radius = graph.radius()
	diameter = graph.diameter()
	if isinstance(radius, sage.rings.infinity.PlusInfinity):
		radius = "+Infinity"
	if isinstance(diameter, sage.rings.infinity.PlusInfinity):
		diameter = "+Infinity"

	result.append(radius)
	result.append(diameter)

	return result

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


import threading

def launch_connection():
	t = threading.Thread(target=connect)
	t.start()