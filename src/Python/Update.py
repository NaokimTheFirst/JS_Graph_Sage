def Update_Graph(gold, gnew):
	__Update_Graph_Nodes(gold, gnew, 0)
	__Update_Graph_Edges(gold, gnew, 0)
	print("graph updated")


def __Update_Graph_Nodes(gold, gnew, test=1):

	gold.set_pos(gnew.get_pos())

	if gold.get_vertices()==gnew.get_vertices():
		if test==1:
			print ('Graphs have the same nodes')
		return None

	vert_old = gold.get_vertices().keys()
	vert_new = gnew.get_vertices().keys()

	for n in vert_old:
		if n not in vert_new:
			gold.delete_vertex(n)

	for n in vert_new:
		if n not in vert_old:
			gold.add_vertex(n)


def __Update_Graph_Edges(gold, gnew, test=1):

	if gold.edges() == gnew.edges():
		if test==1:
			print ('Graphs have the same edges')
		return None

	edges_old = gold.edges()
	edges_new = gnew.edges()

	for e in edges_old:
		if e not in edges_new:
			gold.delete_edge(e[0], e[1])

	for e in edges_new :
		if e not in edges_old :
			if e[0] == e[1] and not gold.allows_loops():
				gold.allow_loops(True)
			gold.add_edge(e[0], e[1])