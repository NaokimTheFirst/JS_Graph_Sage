import inspect, os

#Your path to the repository JS_Graph_Sage
def getPathRepo() :
	filename = inspect.getframeinfo(inspect.currentframe()).filename #get the name of this file
	path = filename
	
	for i in range (4) :
		path = os.path.dirname(os.path.abspath(path))	 #get the path from this file
		
	return str(path)

def attachFiles(path) :
	directory = path+'/JS_Graph_Sage/src/Python/'
	print(directory)
	try:
		print('Loading files...')
		for i in os.listdir(directory):
			if i != 'init_CustomJS.py':
				attach(directory + i)
				print(i + ' loaded')
		#attach(path + 'JS_Graph_Sage/src/Python/customJsGraph.py')
		#attach(path + '/update.py')
		#attach(path + '/tests.py')
		#attach(path + '/websocket_server.py')
		#attach(path + '/connection.py')
		#attach(path + '/request_handler.py')
		#print('Files succesfully loaded')
	except:
		print('Files not found')
		
pathRepo = getPathRepo()

attachFiles(pathRepo)

# #Your path to the repository where you'll save the JSON version of the graphs (for example JS_Graph_Sage/obj)
# path_To_JSON_Repo = 'Mes Documents/Git/JS_Graph_Sage/obj/'
# def _update_JSON_Repo(path) :
# 	global path_To_JSON_Repo
# 	path_To_JSON_Repo = str(path)
# #Default name of the JSON file
# JSON_name = 'Graph_JSON'
# def _update_JSON_name(name) :
# 	global JSON_name
# 	JSON_name = name

# _update_JSON_Repo(path_To_Project_Repo+'/JS_Graph_Sage/obj/')


