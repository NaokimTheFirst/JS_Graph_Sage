graph_client_dict = {}
current_server = None

# Called for every client connecting
def new_client(client, server):
	if client['id'] not in graph_client_dict :
		end_connection(client, server)
		print("Client %d could not connect. Use show_CustomJS(graph)" % client['id'])
	else :
		print("New client connected and was given id %d" % client['id'])
	


# Called for every client disconnecting
def client_left(client, server):
	global graph_client_dict,current_server

	if client['id'] in graph_client_dict :
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
	if client['id'] in graph_client_dict :
		targetGraph = graph_client_dict[client['id']]
		JSONmessage = DataGraph(message)

		newGraph = ConstructGraphFromJSONObject(JSONmessage)
		response, newGraph = handle_message(JSONmessage.parameter,newGraph)
		
		update_graph(targetGraph, newGraph)

		if(JSONmessage.message != ""):
			print(JSONmessage.message)

		if response[1] != None :
			returnMessage = JSONEncoder().encode({"request":response[0], "result": response[1]})
			server.send_message(client,returnMessage)
	else :
		end_connection(client, server)

def end_connection(client, server):
	returnMessage = JSONEncoder().encode({"request":'closeConnection', "result": ''})
	server.send_message(client,returnMessage)


def client_dictionnary_verification(G):
	global current_server, graph_client_dict

	if G in graph_client_dict.values() :
		idGraph = id(G)
		for key in graph_client_dict.keys() :
			if id(graph_client_dict[key]) == idGraph :
				client_to_remove = None
				for client in current_server.clients:
					if client['id'] == key :
						end_connection(client, current_server)