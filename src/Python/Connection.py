graph_client_dict = {}
current_server = None

# Called for every client connecting
def new_client(client, server):
	print("New client connected and was given id %d" % client['id'])
	


# Called for every client disconnecting
def client_left(client, server):
	global graph_client_dict,current_server

	print("Client(%d) disconnected" % client['id'])
	graph_client_dict.pop(client['id'])

	if not graph_client_dict :
		server.server_close()
		print("server closed")
		current_server = None


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
	global current_server
	current_server = server
	server.run_forever()


from json import JSONEncoder
# Called when a client sends a message
def message_received(client, server, message):
	global graph_client_dict
	targetGraph = graph_client_dict[client['id']]
	JSONmessage = DataGraph(message)

	newGraph = ConstructGraphFromJSONObject(JSONmessage)
	response = handle_message(JSONmessage.parameter,newGraph)
	
	update_graph(targetGraph, newGraph)


	if response[1] != None :
		returnMessage = JSONEncoder().encode({"request":response[0], "result": response[1]})
		server.send_message(client,returnMessage)