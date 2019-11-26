# JS_Graph_Sage
 
New version of the Javascript visualization of Sage with D3.js
Student project


# IMPORTANT

To make this project work, you need to find the "init_CustomJS.py" script, and change the
variables according to your paths.
Then the only script you'll have to attach in Sage is this one.



Project's logbook :
https://docs.google.com/document/d/1wu1qKDCjxPgVY6a5Im5XkJSdYcvF8YcselkqUSTHnds/edit?usp=sharing

Project's Trello :
https://trello.com/b/7y723RZk/sagemathgraph

Sources :
https://github.com/d3/d3/wiki (D3.js documentation)
http://bl.ocks.org/tgk/6068367 (example we used to add nodes)
https://developer.mozilla.org/en-US/docs/Web/SVG/Element (documentation of SVG elements)
https://travishorn.com/updating-dynamic-data-in-d3-15ce4a9fa856 (data updating in D3.js)
https://www.d3-graph-gallery.com/interactivity.html (interactivity with displaying)


--------------


Methods explanation : 

METHODS USED IN window.onload :
	
	LoadGraphData()
		Loads the data from the graph and puts index on nodes

	InitGraph()
		Transfers all the data from the JSON to a D3.js graph object (force)
		Adapts the graph layout to the javascript window's dimensions

	KeyboardEventInit()
		Launched at each key press, triggers an action depending on the key

	ManageAllGraphicsElements()
		Creates the D3 version of the window, nodes, edges, zooming

	InitForce()
		Determines a position for each element and adds a force layout to have a dynamic positionning of the nodes and edges



METHODS USED IN KeyboardEventInit() :

	RemoveElement(currentObject)
		Deletes the mouseovered element. If it's a node, deletes the connected edges

	AddNode()
		Creates a node at the position of the cursor

	FreezeGraph()
		Stops the forces simulation to easily manipulate the graph.
		If the graph is already frozen, unfreezes it.



OTHER :

	AddEdge(src, dest)
		Creates an edge between the src and the dest, wich are the names of two nodes of the graph