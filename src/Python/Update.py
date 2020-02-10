def update_uraph(gold, gnew):
	__Update_Graph_Nodes(gold, gnew)
	__Update_Graph_Edges(gold, gnew)
	print("graph updated")


def __Update_Graph_Nodes(gold, gnew):
	if gold.get_vertices() != gnew.get_vertices():
		vert_old = gold.get_vertices().keys()
		vert_new = gnew.get_vertices().keys()

		for n in vert_old:
			if n not in vert_new:
				gold.delete_vertex(n)

		for n in vert_new:
			if n not in vert_old:
				gold.add_vertex(n)


	if gnew.get_pos() != gold.get_pos():
		gold.set_pos(gnew.get_pos())


def __Update_Graph_Edges(gold, gnew):
	if not __CompareGraphEdges(gold, gnew):
		edges_old = gold.edges()
		edges_new = gnew.edges()

		for currentEdge in edges_old:
			if currentEdge not in edges_new:
				gold.delete_edge(currentEdge[0], currentEdge[1])

		if gnew.allows_loops():
			gold.allow_loops(True)

		for currentEdge in edges_new :
			if currentEdge not in edges_old :
				gold.add_edge(currentEdge[0], currentEdge[1])

def __CompareGraphEdges(firstGraph, secondGraph):
	if len(firstGraph.edges()) != len(secondGraph.edges()):
		return False

	for edge in firstGraph.edges():
		if edge not in secondGraph.edges():
			return False
	
	return True
