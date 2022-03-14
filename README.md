# JS_Graph_Sage
 
New version of the Javascript visualization of Sage with D3.js

This project was started by the students of Licence Pro at IUT of Montpellier 2 years ago and taken by our group (students on DUT informatique) to improve and debut.

# User Guide
### Step 1
Download the source code from GitHub and make sure you have SageMath installed.

### Step 2
Unzip the source code and type `attach("path_to_file_init_CustomJS.py")` in your Sage terminal.
For example if you place the project in a folder where your `.sage/` directory is located, you should tap `attach("JS_Graph_Sage/src/Python/init_CustomJS.py")`.


### Step 3
Now you can launch the interface by creating a graph in terminal (for example: `g = graphs.CompleteGraph(20)`) and typing `show_CustomJS(g)`.


### Importing changes from terminal
If the modifications you want to add cannot be made in the interface, you can run the necessary commands in Sage terminal and click `Redraw Graph` button on top of the page to import changes. Or you can simply reload the page.