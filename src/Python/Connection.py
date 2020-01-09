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


# Called when a client sends a message
def message_received(client, server, message):
	newG = ConstructGraphFromJSONString(message)
	global graph_client_dict
	targetGraph = graph_client_dict[client['id']]
	Update_Graph(targetGraph, newG)


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