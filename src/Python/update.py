def update_graph(gold, gnew):
	__update_graph_nodes(gold, gnew)
	__update_graph_edges(gold, gnew)


def __update_graph_nodes(gold, gnew, print_update = True):
	did_smth = None
	print_update = True

	if gold.get_vertices() != gnew.get_vertices():
		did_smth = "Updated nodes"
		vert_old = gold.get_vertices().keys()
		vert_new = gnew.get_vertices().keys()

		for n in vert_old:
			if n not in vert_new:
				gold.delete_vertex(n)
				print("Vertex " + str(n) + " deleted")

		for n in vert_new:
			if n not in vert_old:
				gold.add_vertex(n)
				print("Vertex " + str(n) + " added")

	if did_smth is not None and print_update :
		print(did_smth)
		print_update = False

	__update_graph_positions(gold, gnew, print_update)


def __update_graph_positions(gold, gnew, print_update = True):
	if gnew.get_pos() and gnew.get_pos() != gold.get_pos():
		gold.set_pos(gnew.get_pos())

def __update_graph_edges(gold, gnew, print_update = True):
	did_smth = None

	if not __compareGraphEdges(gold, gnew):
		did_smth = "Updated edges"
		edges_old = gold.edges()
		edges_new = gnew.edges()

		for currentEdge in edges_old:
			if currentEdge not in edges_new:
				gold.delete_edge(currentEdge[0], currentEdge[1])
				print("Edge (" + str(currentEdge[0]) + ", " + str(currentEdge[1]) + ") deleted")

		if gnew.allows_loops():
			gold.allow_loops(True)

		for currentEdge in edges_new :
			if currentEdge not in edges_old :
				gold.add_edge(currentEdge[0], currentEdge[1])
				print("Edge (" + str(currentEdge[0]) + ", " + str(currentEdge[1]) + ") added")

	if did_smth is not None and print_update:
		print(did_smth)



#to delete when edgelist comparison fixed in Sage

def __compareGraphEdges(firstGraph, secondGraph):
	if len(firstGraph.edges()) != len(secondGraph.edges()):
		return False

	for edge in firstGraph.edges():
		if edge not in secondGraph.edges():
			return False
	
	return True