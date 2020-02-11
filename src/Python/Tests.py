def _Test_ConstuctGraphFromJson():
	g=ConstructGraphFromJSON(nameJSON='Graph_JSON_test')

	string = GetBackJSON(nameJSON='Graph_JSON_test')
	JSONObject = DataGraph(string)

	passedtests=0
	failedtests=0

	#Compare graph created from JSON and JSON itself
	__Pass_Test('nodes', __TestConstructNodes(g, JSONObject), True)
	__Pass_Test('edges (non-loops)', __TestConstructEdges(g, JSONObject), True)
	__Pass_Test('loops', __TestConstructLoops(g, JSONObject), True)

	#Modify graph in Sage
	g.delete_edge(g.edges()[0])
	g.delete_edge(g.loop_edges()[0])
	i=0
	while str(i) in g.get_vertices().keys():
		i+=1

	j=i+1
	while str(j) in g.get_vertices().keys():
		j+=1
	i=str(i)
	j=str(j)
	g.add_vertex(str(i))
	g.add_vertex(str(j))
	g.add_edge(i,j)
	g.allow_loops(True)
	g.add_edge(i,i)
	g.add_edge(j,j)
	po=g.get_pos()
	po[g.vertices()[0]]=(po[g.vertices()[0]][0]+1,0)
	g.set_pos(po, 2)

	#Compare modified graph and JSON
	__Pass_Test('nodes (Failed)', __TestConstructNodes(g, JSONObject), False)
	__Pass_Test('edges (non-loops) (Failed)', __TestConstructEdges(g, JSONObject), False)
	__Pass_Test('loops (Failed)', __TestConstructLoops(g, JSONObject), False)


def __TestConstructNodes(g, JSON):
	
	test=True
	
	for n in JSON.nodes :
		if n['name'] not in g.get_vertices().keys():
			test=False
			#print ('Node in JSON not in graph')
		elif g.get_pos()[n['name']]!=(n['x'], n['y']):
			test=False
			#print ('A node does not have the same position in JSON and graph')

	if 	len(g.get_vertices())!=len(JSON.nodes):
		test=False
		#print ('Not the same amount of nodes in JSON and graph')

	return test


def __TestConstructEdges(g, JSON):

	test=True

	for l in JSON.links :
		if (l['source'], l['target'], None) not in g.edges():
			test=False
			#print('Edge in JSON not in graph')

	if len(g.edges())-len(g.loop_edges())!=len(JSON.links):
		test=False
		#print('Not the same amount of edges in JSON and graph')
	
	return test


def __TestConstructLoops(g, JSON):

	test=True

	for l in JSON.loops :
		if (l['source'], l['target'], None) not in g.edges():
			test=False
			#print('Loop in JSON not in graph')

	if len(g.loop_edges())!=len(JSON.loops):
		test=False
		#print('Not the same amount of loops in JSON and graph')
	
	return test


def __Pass_Test(subject, value, expected):
	print ('    Test on '+subject+' : ')
	if value==expected :
		print ('\033[32m     SUCCESS\033[37m')
	else :
		print ('\033[31m     FAILURE\033[37m')


#--------------------------------------
#|            Not done                |
#--------------------------------------

def _Compare_Graphs(g1, g2) :

	same=True

	valedges=Compare_Graphs_Edges(g1,g2,0)
	if valedges!=0:
		same=False
		print(valedges)




def __Compare_Graphs_Edges(g1, g2, test=1) :
	
	e1=len(g1.edges())
	e2=len(g2.edges())
	output=''
	outval=-1

	if g1.edges()==g2.edges():
		output='The graphs have the same edges'
		outval=0
	elif e1>e2 :
		output='First graph has '+str(e1-e2)+' more edge(s)'
		outval=1
	elif e1<e2 :
		output='Second graph has '+str(e2-e1)+' more edge(s)'
		outval=2
	else :
		output='The graphs have the same amount of diferent edges'
		outval=3

	if test==1 :
		print(output)
	elif test==0 :
		return outval


