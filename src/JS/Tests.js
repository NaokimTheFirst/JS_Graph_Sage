class TestGroup {
    constructor(label, tests) {
        this.label = label;
        this.tests = tests;
    }
}

const TestList = [new TestGroup("Test AddNode()", [TestAddCorrectNumberOfNode, TestAddWantedNode, TestAddNodeDontModifyOthersElements]),
    new TestGroup("Test RemoveNode()", [TestRemoveCorrectNumberOfNode, TestRemoveWantedNode, TestRemoveNodeDontModifyOthersElements]),
    new TestGroup("Test AddLoop()", [TestAddCorrectNumberOfLoop, TestAddWantedLoop, TestAddLoopDontModifyOtherElements]),
    new TestGroup("Test RemoveLoop()", [TestRemoveCorrectNumberOfLoop, TestRemoveWantedLoop, TestRemoveLoopDontModifyOthersElements]),
    new TestGroup("Test AddEdge()", [TestAddCorrectNumberOfLink, TestAddWantedLink, TestAddLinkDontModifyOthersElements]),
    new TestGroup("Test RemoveEdge()", [TestRemoveCorrectNumberOfLink, TestRemoveWantedLink, TestRemoveLinkDontModifyOthersElements]),
    new TestGroup("Test Undo()", [TestUndoInvertEdgeDirection, TestUndoSetName, TestUndoChangeGroup, TestUndoAddNode, 
        TestUndoAddEdge, TestUndoAddLoop, TestUndoRemoveNode, TestUndoRemoveLink, TestUndoRemoveLoop, TestUndoMove,TestUndoSubdivide]),
    new TestGroup("Test MoveNode()", [TestMoveOnWantedPosition]),
    new TestGroup("Test SelectElement()", [TestSelectNode, TestSelectLink, TestSelectLoop, TestUnselectNode]),
    new TestGroup("Test Subdivide Edge()", [TestSubdivideEdgeElementCount,TestSubdivideEdgeCorrespondingElement,TestSubdivideEdgeOnSelectionCorrespondingElement]),
    new TestGroup("Test GetGraphFromHTML()", [TestInitialGraphIsntModifyByAddNode, TestInitialGraphIsntModifyByAddLink, TestInitialGraphIsntModifyByAddLoop, 
        TestInitialGraphIsntModifyByRemoveNode, TestInitialGraphIsntModifyByRemoveEdge, TestInitialGraphIsntModifyByRemoveLoop, TestInitialGraphIsntModifyByMovements, 
        TestInitialGraphIsntModifyBySelection]),
    new TestGroup("Test PretyfyJSON()", [TestFinalGraphCorrespondAfterAddNode, TestFinalGraphCorrespondAfterAddLink, TestFinalGraphCorrespondAfterAddLoop, 
        TestFinalGraphCorrespondAfterRemoveNode, TestFinalGraphCorrespondAfterRemoveEdge, TestFinalGraphCorrespondAfterRemoveLoop, TestFinalGraphCorrespondAfterMove, 
        TestFinalGraphCorrespondAfterSelection, TestFinalGraphInverseYCoordinates, TestFinalGraphSimplifyTargetSourceOfEdges, TestFinalGraphSimplifyTargetSourceOfLoops]),
    new TestGroup("Test ChangeGroup()",[TestChangeToCorrectGroup]),
    new TestGroup("Test SetName()",[TestNodeNameIsChange,TestEdgeNameIsChange,TestLoopNameIsChange,TestChangeToExistingName]),
    new TestGroup("Test InvertDirection()",[TestDirectionIsInverted]),
];

function testOutput(expr, message) {
    (expr) ? console.log('%c' + message, 'color: green'): console.error(message);
}

function LaunchAllTest() {
    console.log("%c" + prettyDate2() + "Starting All Tests", 'font-weight: bold');

    let passTest = 0,
        failedTest = 0;

    TestList.forEach(testGroup => {
        console.log(prettyDate2() + testGroup.label);
        testGroup.tests.forEach(test => {
            BeforeAllTest();
            (test()) ? passTest++ : failedTest++;
        });
    });

    console.log("%c" + prettyDate2() + "Test passed : " + passTest + "/" + (passTest + failedTest), 'font-weight: bold');
}

function BeforeAllTest(){
    while(graphJSON.nodes.length < 3){
        let newNode = CreateNode();
        MyManager.execute(new AddNodeCommand(newNode));
    }
    while(graphJSON.links.length < 3){
        let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
        MyManager.execute(new AddEdgeCommand(newElement));
    }
    while(graphJSON.loops.length < 3){
        let newLoop = CreateLoop(graphJSON.nodes[0]);
        MyManager.execute(new AddLoopCommand(newLoop));
    }
}

function TestUndoInvertEdgeDirection()
{
    //Setup
    let newValue = [graphJSON.links[0].target,graphJSON.links[0].source];
    let oldValue = [graphJSON.links[0].source,graphJSON.links[0].target];
    let vr = new ValueRegisterer(oldValue, newValue, new Element(graphJSON.links[0],EdgeType));

    MyManager.execute(new InvertDirectionCommand(vr));

    MyManager.undo();

    let expr =  graphJSON.links[0].source == oldValue[0] && graphJSON.links[0].target == oldValue[1];

    testOutput(expr, "The edge direction has been revert correctly");

    return expr;
}

function TestDirectionIsInverted(){
    //Setup
    let newValue = [graphJSON.links[0].target,graphJSON.links[0].source];
    let vr = new ValueRegisterer([graphJSON.links[0].source,graphJSON.links[0].target], newValue, new Element(graphJSON.links[0],EdgeType));

    MyManager.execute(new InvertDirectionCommand(vr));

    let expr =  graphJSON.links[0].source == newValue[0] && graphJSON.links[0].target == newValue[1];
    testOutput(expr, "The edge direction has been correctly inverted");

    return expr;
}

function TestUndoSetName()
{
    //Setup
    let oldName = graphJSON.nodes[0].name;
    let newName = "test1";
    let vr = new ValueRegisterer(graphJSON.nodes[0].name, newName, new Element(graphJSON.nodes[0],NodeType));
    MyManager.execute(new ChangeNameCommand(vr));

    MyManager.undo();

    expr = graphJSON.nodes[0].name == oldName;

    testOutput(expr, "The node name has been revert correctly");

    return expr;
}


function TestChangeToExistingName()
{
   //Setup
   let newName = "test2";
   let vr = new ValueRegisterer(graphJSON.links[0].name, newName, new Element(graphJSON.links[0],EdgeType));
   MyManager.execute(new ChangeNameCommand(vr));

   let expr = !CheckNewName(newName, EdgeType);

   testOutput(expr, "The name hasn't change");

   return expr;
}

function TestNodeNameIsChange(){
    //Setup
    let newName = "test3";
    let vr = new ValueRegisterer(graphJSON.nodes[0].name, newName, new Element(graphJSON.nodes[0],NodeType));

    MyManager.execute(new ChangeNameCommand(vr));

    let expr =  graphJSON.nodes[0].name == newName;

    testOutput(expr, "The node name has been correctly change");

    return expr;
}

function TestEdgeNameIsChange(){
    //Setup
    let newName = "test4";
    let vr = new ValueRegisterer(graphJSON.links[0].name, newName, new Element(graphJSON.links[0],EdgeType));

    MyManager.execute(new ChangeNameCommand(vr));

    let expr =  graphJSON.links[0].name == newName;

    testOutput(expr, "The edge name has been correctly change");

    return expr;
}

function TestLoopNameIsChange(){
    //Setup
    let newName = "test5";
    let vr = new ValueRegisterer(graphJSON.loops[0].name, newName, new Element(graphJSON.loops[0],LoopType));

    MyManager.execute(new ChangeNameCommand(vr));

    let expr =  graphJSON.loops[0].name == newName;

    testOutput(expr, "The loop name has been correctly change");

    return expr;
}


function TestUndoChangeGroup() {
    //Setup
    let newGroupName = "test6";
    groupList.push(newGroupName);
    CreateGroupElement(newGroupName);
    SetCurrentGroup();
    let oldGroup = graphJSON.nodes[0].group;

    MyManager.execute(new ChangeGroupCommand(new ValueRegisterer(
        graphJSON.nodes[0].group, 
        newGroupName, 
        new Element(graphJSON.nodes[0],NodeType))));
    MyManager.undo();

    let expr =  graphJSON.nodes[0].group == oldGroup;

    testOutput(expr, "Group changement has been revert correctly");

    return expr;
}

function TestChangeToCorrectGroup(){
    let currentGroup = groupList[currentGroupIndex];

    MyManager.execute(
        new ChangeGroupCommand(
            new ValueRegisterer(
                graphJSON.nodes[0].group, 
                currentGroup, 
                new Element(graphJSON.nodes[0],NodeType)
            )
        )
    );

    let expr =  graphJSON.nodes[0].group == currentGroup;

    testOutput(expr,"Node change to the correct group");

    return expr;
}

function TestAddCorrectNumberOfNode() {
    //Setup
    let nodeCount = graphJSON.nodes.length;
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));

    let expr = nodeCount + 1 == graphJSON.nodes.length;
    testOutput(expr, "Un seul noeud ajouté");

    return expr;
}

function TestAddWantedNode() {
    //Setup
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));

    let expr = graphJSON.nodes.includes(newNode);
    testOutput(expr, "Le noeud ajouté correspond");

    return expr;
}

function TestAddNodeDontModifyOthersElements() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    MyManager.execute(new AddNodeCommand(CreateNode()));

    let expr = graphJSONCopy.links.length == graphJSON.links.length && graphJSONCopy.loops.length == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestRemoveCorrectNumberOfNode() {
    //Setup
    let nodeCount = graphJSON.nodes.length;
    let node = new Element(graphJSON.nodes[0], NodeType);
    RemoveElementFromGraph(node);;

    let expr = nodeCount - 1 == graphJSON.nodes.length;
    testOutput(expr, "Un seul noeud supprimé");

    return expr;
}

function TestRemoveWantedNode() {
    //Setup
    let node = new Element(graphJSON.nodes[0], NodeType);
    RemoveElementFromGraph(node);;

    let expr = graphJSON.nodes.includes(node.data) == false;
    testOutput(expr, "Le noeud supprimé correspond");

    return expr;
}

function TestRemoveNodeDontModifyOthersElements() {
    //Setup
    let linksCount = graphJSON.links.length, loopsCount = graphJSON.loops.length;
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));
    let node = new Element(newNode, NodeType);

    RemoveElementFromGraph(node);;

    let expr = linksCount == graphJSON.links.length && loopsCount == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestAddCorrectNumberOfLoop() {
    //Setup
    let loopCount = graphJSON.loops.length;
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = loopCount + 1 == graphJSON.loops.length;
    testOutput(expr, "Une seule loop ajouté");

    return expr;
}


function TestAddWantedLoop() {
    //Setup
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = graphJSON.loops.includes(newLoop);
    testOutput(expr, "La loop ajoutée correspond");

    return expr;
}

function TestAddLoopDontModifyOtherElements() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = graphJSONCopy.links.length == graphJSON.links.length && graphJSONCopy.nodes.length == graphJSON.nodes.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestAddCorrectNumberOfLink() {
    //Setup
    let elementCount = graphJSON.links.length;
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = elementCount + 1 == graphJSON.links.length;
    testOutput(expr, "Une seul lien ajouté");

    return expr;
}


function TestAddWantedLink() {
    //Setup
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = graphJSON.links.includes(newElement);
    testOutput(expr, "La lien ajoutée correspond");

    return expr;
}

function TestAddLinkDontModifyOthersElements() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = graphJSONCopy.loops.length == graphJSON.loops.length && graphJSONCopy.nodes.length == graphJSON.nodes.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestInitialGraphIsntModifyByAddNode() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    MyManager.execute(new AddNodeCommand(CreateNode()));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'un noeud");

    return expr;
}

function TestInitialGraphIsntModifyByAddLink() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'un lien");

    return expr;
}

function TestInitialGraphIsntModifyByAddLoop() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'une boucle");

    return expr;
}

function TestInitialGraphIsntModifyByRemoveNode() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let node = new Element(graphJSON.nodes[0], NodeType);
    RemoveElementFromGraph(node);;
    let newGraph = GetGraphFromHTML();


    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'un noeud");

    return expr;
}

function TestInitialGraphIsntModifyByRemoveEdge() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let elem = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(elem);
    let newGraph = GetGraphFromHTML();


    let expr = oldGraph.links.length == newGraph.links.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'un lien");

    return expr;
}

function TestInitialGraphIsntModifyByRemoveLoop() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let elem = new Element(graphJSON.loops[0], LoopType);
    
    RemoveElementFromGraph(elem);
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.loops.length == newGraph.loops.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'une boucle");

    return expr;
}


function TestInitialGraphIsntModifyByMovements() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let pos = new ValueRegisterer(
        [graphJSON.nodes[0].px, graphJSON.nodes[0].py], 
        [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], 
        new Element(graphJSON.nodes[0],NodeType))
    MyManager.execute(new MoveNodeCommand(pos));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes[0].x == newGraph.nodes[0].x && oldGraph.nodes[0].y == newGraph.nodes[0].y
    testOutput(expr, "Le graph initial n'est pas modifié après un déplacement");

    return expr;
}

function TestInitialGraphIsntModifyBySelection() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    SelectElement(new Element(graphJSON.nodes[0]), NodeType);
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes[0].isSelected == newGraph.nodes[0].isSelected;
    testOutput(expr, "Le graph initial n'est pas modifié après une sélection");

    return expr;
}

function TestRemoveCorrectNumberOfLink() {
    //Setup
    let elementCount = graphJSON.links.length;
    let elem = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(elem);

    let expr = elementCount - 1 == graphJSON.links.length;
    testOutput(expr, "Un seul lien supprimé");

    return expr;
}

function TestRemoveWantedLink() {
    //Setup
    let elem = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(elem);

    let expr = graphJSON.links.includes(elem.data) == false;
    testOutput(expr, "Le lien supprimé correspond");

    return expr;
}

function TestRemoveLinkDontModifyOthersElements() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let elem = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(elem);

    let expr = graphJSONCopy.nodes.length == graphJSON.nodes.length && graphJSONCopy.loops.length == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestRemoveCorrectNumberOfLoop() {
    //Setup
    let elementCount = graphJSON.loops.length;

    let elem = new Element(graphJSON.loops[0], LoopType);
    RemoveElementFromGraph(elem);

    let expr = elementCount - 1 == graphJSON.loops.length;
    testOutput(expr, "Un seule boucle supprimée");

    return expr;
}

function TestRemoveWantedLoop() {
    //Setup
    let elem = new Element(graphJSON.loops[0], LoopType);
    RemoveElementFromGraph(elem);

    let expr = graphJSON.loops.includes(elem.data) == false;
    testOutput(expr, "La boucle supprimée correspond");

    return expr;
}

function TestRemoveLoopDontModifyOthersElements() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let elem = new Element(graphJSON.loops[0], LoopType);
    RemoveElementFromGraph(elem);

    let expr = graphJSONCopy.nodes.length == graphJSON.nodes.length && graphJSONCopy.links.length == graphJSON.links.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}



function TestUndoAddNode() {
    //Setup
    let newElement = CreateNode();
    MyManager.execute(new AddNodeCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.nodes.includes(newElement) == false;
    testOutput(expr, "L'ajout du noeud est bien annulé");

    return expr;
}

function TestUndoAddEdge() {
    //Setup
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.links.includes(newElement) == false;
    testOutput(expr, "L'ajout du lien est bien annulé");

    return expr;
}

function TestUndoAddLoop() {
    //Setup
    let newElement = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.links.includes(newElement) == false;
    testOutput(expr, "L'ajout de la boucle est bien annulé");

    return expr;
}


function TestUndoRemoveNode() {
    //Setup
    let element = new Element(graphJSON.nodes[0], NodeType);
    RemoveElementFromGraph(element);
    MyManager.undo()

    let expr = graphJSON.nodes.includes(element.data) == true;
    testOutput(expr, "La suppression du noeud est bien annulée");

    return expr;
}

function TestUndoRemoveLink() {
    //Setup
    let element = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(element);
    MyManager.undo()

    let expr = graphJSON.links.includes(element.data) == true;
    testOutput(expr, "La suppression du lien est bien annulée");

    return expr;
}

function TestUndoRemoveLoop() {
    //Setup
    let element = graphJSON.loops[0];
    RemoveElementFromGraph(new Element(element, LoopType));
    MyManager.undo()

    let expr = graphJSON.loops.includes(element) == true;
    testOutput(expr, "La suppression de la boucle est bien annulée");

    return expr;
}

function TestUndoMove() {
    //Setup
    let pos = new ValueRegisterer(
        [graphJSON.nodes[0].px, graphJSON.nodes[0].py], 
        [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], 
        new Element(graphJSON.nodes[0],NodeType))
    MyManager.execute(new MoveNodeCommand(pos));
    MyManager.undo()

    let expr = graphJSON.nodes[0].px == pos.oldValue[0];
    testOutput(expr, "Le déplacement est bien annulé");

    return expr;
}


function TestUndoSubdivide() {
    //Setup
    let edge = graphJSON.links[0]
    SubdivideEdge(edge);
    MyManager.undo()

    let expr = graphJSON.links.includes(edge);
    testOutput(expr, "La division est bien annulé");

    return expr;
}

function TestMoveOnWantedPosition() {
    //Setup
    let pos = new ValueRegisterer(
        [graphJSON.nodes[0].px, graphJSON.nodes[0].py], 
        [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], 
        new Element(graphJSON.nodes[0],NodeType))
    MyManager.execute(new MoveNodeCommand(pos));

    let expr = graphJSON.nodes[0].px == pos.newValue[0] && graphJSON.nodes[0].py == pos.newValue[1];
    testOutput(expr, "Le déplacement est bien effectué");

    return expr;
}


function TestSelectNode() {
    //Setup
    SelectElement(new Element(graphJSON.nodes[0]), NodeType);

    let expr = GetCurrentSelection().nodes[0].data == graphJSON.nodes[0];
    testOutput(expr, "La sélection du noeud est bien effectué");

    return expr;
}


function TestSelectLink() {
    //Setup
    SelectElement(new Element(graphJSON.links[0]), EdgeType);

    let expr = GetCurrentSelection().edges[0].data == graphJSON.links[0];
    testOutput(expr, "La sélection du lien est bien effectué");

    return expr;
}


function TestSelectLoop() {
    //Setup
    SelectElement(new Element(graphJSON.loops[0]), LoopType);

    let expr = GetCurrentSelection().loops[0].data == graphJSON.loops[0];
    testOutput(expr, "La sélection de la boucle est bien effectué");

    return expr;
}

function TestUnselectNode() {
    //Setup
    let element = new Element(graphJSON.nodes[2], NodeType);
    let nodesCount = GetCurrentSelection().nodes.length;
    SelectElement(element);
    SelectElement(element);

    let expr = GetCurrentSelection().nodes.length == nodesCount;
    testOutput(expr, "La déselection de l'élement est bien effectué");

    return expr;
}


function TestFinalGraphCorrespondAfterAddNode() {
    //Setup
    let oldGraph = PrettifyJSON();
    MyManager.execute(new AddNodeCommand(CreateNode()));
    let newGraph = PrettifyJSON();

    let expr = oldGraph.nodes.length + 1 == newGraph.nodes.length;
    testOutput(expr, "Le graph final correspond après ajout d'un noeud");

    return expr;
}

function TestFinalGraphCorrespondAfterAddLink() {
    //Setup
    let oldGraph = PrettifyJSON();
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    let newGraph = PrettifyJSON();

    let expr = oldGraph.links.length + 1 == newGraph.links.length;
    testOutput(expr, "Le graph final correspond après ajout d'un lien");

    return expr;
}

function TestFinalGraphCorrespondAfterAddLoop() {
    //Setup
    let oldGraph = PrettifyJSON();
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let newGraph = PrettifyJSON();

    let expr = oldGraph.loops.length + 1 == newGraph.loops.length;
    testOutput(expr, "Le graph final correspond après ajout d'une boucle");

    return expr;
}

function TestFinalGraphCorrespondAfterRemoveNode() {
    //Setup
    let oldGraph = PrettifyJSON();
    let node = new Element(graphJSON.nodes[0], NodeType);
    RemoveElementFromGraph(node);;
    let newGraph = PrettifyJSON();


    let expr = oldGraph.nodes.length - 1 == newGraph.nodes.length;
    testOutput(expr, "Le graph final correspond après suppresion d'un noeud");

    return expr;
}

function TestFinalGraphCorrespondAfterRemoveEdge() {
    //Setup
    let oldGraph = PrettifyJSON();
    let elem = new Element(graphJSON.links[0], EdgeType);
    RemoveElementFromGraph(elem);
    let newGraph = PrettifyJSON();


    let expr = oldGraph.links.length - 1 == newGraph.links.length;
    testOutput(expr, "Le graph final correspond après suppresion d'un lien");

    return expr;
}

function TestFinalGraphCorrespondAfterRemoveLoop() {
    //Setup
    let oldGraph = PrettifyJSON();
    let elem = new Element(graphJSON.loops[0], LoopType);
    RemoveElementFromGraph(elem);
    let newGraph = PrettifyJSON();

    let expr = oldGraph.loops.length - 1 == newGraph.loops.length;
    testOutput(expr, "Le graph final correspond après suppresion d'une boucle");

    return expr;
}


function TestFinalGraphCorrespondAfterMove() {
    //Setup
    let oldGraph = PrettifyJSON();
    let pos = new ValueRegisterer(
        [graphJSON.nodes[0].px, graphJSON.nodes[0].py], 
        [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], 
        new Element(graphJSON.nodes[0],NodeType))
    MyManager.execute(new MoveNodeCommand(pos));
    let newGraph = PrettifyJSON();

    let expr = oldGraph.nodes[0].px != newGraph.nodes[0].px && oldGraph.nodes[0].py != newGraph.nodes[0].py && newGraph.nodes[0].px == pos.newValue[0];
    testOutput(expr, "Le graph final correspond après un déplacement");

    return expr;
}

function TestFinalGraphCorrespondAfterSelection() {
    //Setup
    let oldGraph = PrettifyJSON();
    SelectElement(new Element(graphJSON.nodes[0]), NodeType);
    let newGraph = PrettifyJSON();

    let expr = oldGraph.nodes[0].isSelected != newGraph.nodes[0].isSelected;
    testOutput(expr, "Le graph final correspond après une sélection");

    return expr;
}


function TestFinalGraphInverseYCoordinates() {
    //Setup
    let graph = PrettifyJSON();

    let expr = true;
    for (let index = 0; index < graph.nodes.length; index++) {
        expr = expr && graph.nodes[index].y == -graphJSON.nodes[index].y;

    }

    testOutput(expr, "Le graph final inverse les positions sur l'axe y");

    return expr;
}

function TestFinalGraphSimplifyTargetSourceOfEdges() {
    //Setup
    let graph = PrettifyJSON();

    let expr = true;
    for (let index = 0; index < graph.links.length; index++) {
        expr = expr && graph.links[index].source == graphJSON.links[index].source.name;
        expr = expr && graph.links[index].target == graphJSON.links[index].target.name;
    }

    testOutput(expr, "Le graph final simplifie les données source/cible des liens");

    return expr;
}

function TestFinalGraphSimplifyTargetSourceOfLoops() {
    //Setup
    let graph = PrettifyJSON();

    let expr = true;
    for (let index = 0; index < graph.loops.length; index++) {
        expr = expr && graph.loops[index].source == graphJSON.loops[index].source.name;
        expr = expr && graph.loops[index].target == graphJSON.loops[index].target.name;
    }

    testOutput(expr, "Le graph final simplifie les données source/cible des boucles");

    return expr;
}


function TestSubdivideEdgeElementCount() {
    //Setup
    let edgesCount = graphJSON.links.length, nodesCount = graphJSON.nodes.length;
    SubdivideEdge(graphJSON.links[0]);

    let expr = graphJSON.links.length == edgesCount + 1 && graphJSON.nodes.length == nodesCount + 1;

    testOutput(expr, "La division créee le bon nombre d'élément");

    return expr;
}

function TestSubdivideEdgeCorrespondingElement() {
    //Setup
    let edge = graphJSON.links[0];
    SubdivideEdge(edge);

    let expr = graphJSON.links.includes(edge) == false;
    testOutput(expr, "La division supprime le bon élément");

    return expr;
}

function TestSubdivideEdgeOnSelectionCorrespondingElement() {
    //Setup
    SelectElement(new Element(graphJSON.links[0], EdgeType));
    SubdivideEdgeOnSelection();
    
    let expr = true;
    GetCurrentSelection().edges.forEach(e => {
        let expr = graphJSON.links.includes(e) == false && expr;
    });
    testOutput(expr, "La division des éléments de la sélection supprime les bon éléments");

    return expr;
}