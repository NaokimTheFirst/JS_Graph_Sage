#Your path to the repository JS_Graph_Sage
path_To_Project_Repo = 'Mes Documents/Git'
def _update_JS_Repo(path) :
	global path_To_Project_Repo
	path_To_Project_Repo = str(path)
#Your path to the repository where you'll save the JSON version of the graphs (for example JS_Graph_Sage/obj)
path_To_JSON_Repo = 'Mes Documents/Git/JS_Graph_Sage/obj/'
def _update_JSON_Repo(path) :
	global path_To_JSON_Repo
	path_To_JSON_Repo = str(path)
#Default name of the JSON file
JSON_name = 'Graph_JSON'
def _update_JSON_name(name) :
	global JSON_name
	JSON_name = name

#Do not edit this
attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/CustomJsGraph.py')
attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/Update.py')
attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/Tests.py')