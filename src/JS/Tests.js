class TestGroup {
    constructor(label, tests) {
        this.label = label;
        this.tests = tests;
    }
}

const TestList = [new TestGroup("Test AddNode()", [TestAddNode, TestAddNode2, TestAddNode3]),
    new TestGroup("Test RemoveNode()", [TestRemoveNode, TestRemoveNode2, TestRemoveNode3]),
    new TestGroup("Test AddLoop()", [TestAddLoop, TestAddLoop2, TestAddLoop3]),
    new TestGroup("Test RemoveLoop()", [TestRemoveLoop, TestRemoveLoop2, TestRemoveLoop3]),
    new TestGroup("Test AddEdge()", [TestAddLink, TestAddLink2, TestAddLink3]),
    new TestGroup("Test RemoveEdge()", [TestRemoveLink, TestRemoveLink2, TestRemoveLink3]),
    new TestGroup("Test Undo()", [TestUndo, TestUndo2, TestUndo3, TestUndo4, TestUndo5, TestUndo6, TestUndo7, TestUndo8]),
    new TestGroup("Test MoveNode()", [TestMove]),
    new TestGroup("Test SelectElement()", [TestSelect, TestSelect2, TestSelect3, TestSelect4]),
    new TestGroup("Test GetGraphFromHTML()", [TestInitialGraph, TestInitialGraph2, TestInitialGraph3, TestInitialGraph4, TestInitialGraph5, TestInitialGraph6, TestInitialGraph7, TestInitialGraph8]),
    new TestGroup("Test PretyfyJSON()", [TestFinalGraph, TestFinalGraph2, TestFinalGraph3, TestFinalGraph4, TestFinalGraph5, TestFinalGraph6, TestFinalGraph7, TestFinalGraph8, TestFinalGraph9, TestFinalGraph10, TestFinalGraph11]),
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
            (test()) ? passTest++ : failedTest++;
        });
    });

    console.log("%c" + prettyDate2() + "Test passed : " + passTest + "/" + (passTest + failedTest), 'font-weight: bold');
}

function TestAddNode() {
    //Setup
    let nodeCount = graphJSON.nodes.length;
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));

    let expr = nodeCount + 1 == graphJSON.nodes.length;
    testOutput(expr, "Un seul noeud ajouté");

    return expr;
}

function TestAddNode2() {
    //Setup
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));

    let expr = graphJSON.nodes.includes(newNode);
    testOutput(expr, "Le noeud ajouté correspond");

    return expr;
}

function TestAddNode3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    MyManager.execute(new AddNodeCommand(CreateNode()));

    let expr = graphJSONCopy.links.length == graphJSON.links.length && graphJSONCopy.loops.length == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestRemoveNode() {
    //Setup
    let nodeCount = graphJSON.nodes.length;
    let node = new Element(graphJSON.nodes[0], NodeType);
    MyManager.execute(new SupprElementCommand(node));

    let expr = nodeCount - 1 == graphJSON.nodes.length;
    testOutput(expr, "Un seul noeud supprimé");

    return expr;
}

function TestRemoveNode2() {
    //Setup
    let node = new Element(graphJSON.nodes[0], NodeType);
    MyManager.execute(new SupprElementCommand(node));

    let expr = graphJSON.nodes.includes(node.data) == false;
    testOutput(expr, "Le noeud supprimé correspond");

    return expr;
}

function TestRemoveNode3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newNode = CreateNode();
    MyManager.execute(new AddNodeCommand(newNode));
    let node = new Element(newNode, NodeType);
    MyManager.execute(new SupprElementCommand(node));

    let expr = graphJSONCopy.links.length == graphJSON.links.length && graphJSONCopy.loops.length == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestAddLoop() {
    //Setup
    let loopCount = graphJSON.loops.length;
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = loopCount + 1 == graphJSON.loops.length;
    testOutput(expr, "Une seule loop ajouté");

    return expr;
}


function TestAddLoop2() {
    //Setup
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = graphJSON.loops.includes(newLoop);
    testOutput(expr, "La loop ajoutée correspond");

    return expr;
}

function TestAddLoop3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));

    let expr = graphJSONCopy.links.length == graphJSON.links.length && graphJSONCopy.nodes.length == graphJSON.nodes.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestAddLink() {
    //Setup
    let elementCount = graphJSON.links.length;
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = elementCount + 1 == graphJSON.links.length;
    testOutput(expr, "Une seul lien ajouté");

    return expr;
}


function TestAddLink2() {
    //Setup
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = graphJSON.links.includes(newElement);
    testOutput(expr, "La lien ajoutée correspond");

    return expr;
}

function TestAddLink3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));

    let expr = graphJSONCopy.loops.length == graphJSON.loops.length && graphJSONCopy.nodes.length == graphJSON.nodes.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestInitialGraph() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    MyManager.execute(new AddNodeCommand(CreateNode()));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'un noeud");

    return expr;
}

function TestInitialGraph2() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'un lien");

    return expr;
}

function TestInitialGraph3() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après ajout d'une boucle");

    return expr;
}

function TestInitialGraph4() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let node = new Element(graphJSON.nodes[0], NodeType);
    MyManager.execute(new SupprElementCommand(node));
    let newGraph = GetGraphFromHTML();


    let expr = oldGraph.nodes.length == newGraph.nodes.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'un noeud");

    return expr;
}

function TestInitialGraph5() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let elem = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(elem));
    let newGraph = GetGraphFromHTML();


    let expr = oldGraph.links.length == newGraph.links.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'un lien");

    return expr;
}

function TestInitialGraph6() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let elem = new Element(graphJSON.loops[0], LoopType);
    MyManager.execute(new SupprElementCommand(elem));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.loops.length == newGraph.loops.length;
    testOutput(expr, "Le graph initial n'est pas modifié après suppresion d'une boucle");

    return expr;
}


function TestInitialGraph7() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    let pos = new PositionRegisterer([graphJSON.nodes[0].px, graphJSON.nodes[0].py], [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], graphJSON.nodes[0])
    MyManager.execute(new MoveNodeCommand(pos));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes[0].x == newGraph.nodes[0].x && oldGraph.nodes[0].y == newGraph.nodes[0].y
    testOutput(expr, "Le graph initial n'est pas modifié après un déplacement");

    return expr;
}

function TestInitialGraph8() {
    //Setup
    let oldGraph = GetGraphFromHTML();
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.nodes[0]), NodeType));
    let newGraph = GetGraphFromHTML();

    let expr = oldGraph.nodes[0].selectionGroup == newGraph.nodes[0].selectionGroup;
    testOutput(expr, "Le graph initial n'est pas modifié après une sélection");

    return expr;
}

function TestRemoveLink() {
    //Setup
    let elementCount = graphJSON.links.length;
    let elem = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = elementCount - 1 == graphJSON.links.length;
    testOutput(expr, "Un seul lien supprimé");

    return expr;
}

function TestRemoveLink2() {
    //Setup
    let elem = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = graphJSON.links.includes(elem.data) == false;
    testOutput(expr, "Le lien supprimé correspond");

    return expr;
}

function TestRemoveLink3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let elem = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = graphJSONCopy.nodes.length == graphJSON.nodes.length && graphJSONCopy.loops.length == graphJSON.loops.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestRemoveLoop() {
    //Setup
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let elementCount = graphJSON.loops.length;

    let elem = new Element(graphJSON.loops[0], LoopType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = elementCount - 1 == graphJSON.loops.length;
    testOutput(expr, "Un seule boucle supprimée");

    return expr;
}

function TestRemoveLoop2() {
    //Setup
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let elem = new Element(graphJSON.loops[0], LoopType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = graphJSON.loops.includes(elem.data) == false;
    testOutput(expr, "La boucle supprimée correspond");

    return expr;
}

function TestRemoveLoop3() {
    //Setup
    let graphJSONCopy = JSON.parse(JSON.stringify(graphJSON));
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let elem = new Element(graphJSON.loops[0], LoopType);
    MyManager.execute(new SupprElementCommand(elem));

    let expr = graphJSONCopy.nodes.length == graphJSON.nodes.length && graphJSONCopy.links.length == graphJSON.links.length;
    testOutput(expr, "Les autres élements du graph ne sont pas modifiés");

    return expr;
}

function TestUndo() {
    //Setup
    let newElement = CreateNode();
    MyManager.execute(new AddNodeCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.nodes.includes(newElement) == false;
    testOutput(expr, "L'ajout du noeud est bien annulé");

    return expr;
}

function TestUndo2() {
    //Setup
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.links.includes(newElement) == false;
    testOutput(expr, "L'ajout du lien est bien annulé");

    return expr;
}

function TestUndo3() {
    //Setup
    let newElement = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newElement));
    MyManager.undo()

    let expr = graphJSON.links.includes(newElement) == false;
    testOutput(expr, "L'ajout de la boucle est bien annulé");

    return expr;
}


function TestUndo4() {
    //Setup
    let element = new Element(graphJSON.nodes[0], NodeType);
    MyManager.execute(new SupprElementCommand(element));
    MyManager.undo()

    let expr = graphJSON.nodes.includes(element.data) == true;
    testOutput(expr, "La suppression du noeud est bien annulée");

    return expr;
}

function TestUndo5() {
    //Setup
    let element = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(element));
    MyManager.undo()

    let expr = graphJSON.links.includes(element.data) == true;
    testOutput(expr, "La suppression du lien est bien annulée");

    return expr;
}

function TestUndo6() {
    //Setup
    let element = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(element));
    MyManager.execute(new SupprElementCommand(new Element(element, LoopType)));
    MyManager.undo()

    let expr = graphJSON.loops.includes(element) == true;
    testOutput(expr, "La suppression de la boucle est bien annulée");

    return expr;
}

function TestUndo7() {
    //Setup
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.nodes[0]), NodeType));
    MyManager.undo()

    let expr = graphJSON.nodes[0].selectionGroup == null;
    testOutput(expr, "La sélection est bien annulée");

    return expr;
}

function TestUndo8() {
    //Setup
    let pos = new PositionRegisterer([graphJSON.nodes[0].px, graphJSON.nodes[0].py], [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], graphJSON.nodes[0])
    MyManager.execute(new MoveNodeCommand(pos));
    MyManager.undo()

    let expr = graphJSON.nodes[0].px == pos.oldPos[0];
    testOutput(expr, "Le déplacement est bien annulé");

    return expr;
}

function TestMove() {
    //Setup
    let pos = new PositionRegisterer([graphJSON.nodes[0].px, graphJSON.nodes[0].py], [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], graphJSON.nodes[0])
    MyManager.execute(new MoveNodeCommand(pos));

    let expr = graphJSON.nodes[0].px == pos.newPos[0] && graphJSON.nodes[0].py == pos.newPos[1];
    testOutput(expr, "Le déplacement est bien effectué");

    return expr;
}


function TestSelect() {
    //Setup
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.nodes[0]), NodeType));

    let expr = GetCurrentSelection().nodes[0].data == graphJSON.nodes[0];
    testOutput(expr, "La sélection du noeud est bien effectué");

    return expr;
}


function TestSelect2() {
    //Setup
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.links[0]), EdgeType));

    let expr = GetCurrentSelection().edges[0].data == graphJSON.links[0];
    testOutput(expr, "La sélection du lien est bien effectué");

    return expr;
}


function TestSelect3() {
    //Setup
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.loops[0]), LoopType));

    let expr = GetCurrentSelection().loops[0].data == graphJSON.loops[0];
    testOutput(expr, "La sélection de la boucle est bien effectué");

    return expr;
}

function TestSelect4() {
    //Setup
    let element = new Element(graphJSON.nodes[2], NodeType);
    let nodesCount = GetCurrentSelection().nodes.length;
    MyManager.execute(new SelectElementCommand(element));
    MyManager.execute(new SelectElementCommand(element));

    let expr = GetCurrentSelection().nodes.length == nodesCount;
    testOutput(expr, "La déselection de l'élement est bien effectué");

    return expr;
}


function TestFinalGraph() {
    //Setup
    let oldGraph = PrettyfyJSON();
    MyManager.execute(new AddNodeCommand(CreateNode()));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.nodes.length + 1 == newGraph.nodes.length;
    testOutput(expr, "Le graph final correspond après ajout d'un noeud");

    return expr;
}

function TestFinalGraph2() {
    //Setup
    let oldGraph = PrettyfyJSON();
    let newElement = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(newElement));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.links.length + 1 == newGraph.links.length;
    testOutput(expr, "Le graph final correspond après ajout d'un lien");

    return expr;
}

function TestFinalGraph3() {
    //Setup
    let oldGraph = PrettyfyJSON();
    let newLoop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(newLoop));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.loops.length + 1 == newGraph.loops.length;
    testOutput(expr, "Le graph final correspond après ajout d'une boucle");

    return expr;
}

function TestFinalGraph4() {
    //Setup
    let oldGraph = PrettyfyJSON();
    let node = new Element(graphJSON.nodes[0], NodeType);
    MyManager.execute(new SupprElementCommand(node));
    let newGraph = PrettyfyJSON();


    let expr = oldGraph.nodes.length - 1 == newGraph.nodes.length;
    testOutput(expr, "Le graph final correspond après suppresion d'un noeud");

    return expr;
}

function TestFinalGraph5() {
    //Setup
    let edge = CreateEdge(graphJSON.nodes[0], graphJSON.nodes[1]);
    MyManager.execute(new AddEdgeCommand(edge));
    let oldGraph = PrettyfyJSON();
    let elem = new Element(graphJSON.links[0], EdgeType);
    MyManager.execute(new SupprElementCommand(elem));
    let newGraph = PrettyfyJSON();


    let expr = oldGraph.links.length - 1 == newGraph.links.length;
    testOutput(expr, "Le graph final correspond après suppresion d'un lien");

    return expr;
}

function TestFinalGraph6() {
    //Setup
    let loop = CreateLoop(graphJSON.nodes[0]);
    MyManager.execute(new AddLoopCommand(loop));
    let oldGraph = PrettyfyJSON();
    let elem = new Element(graphJSON.loops[0], LoopType);
    MyManager.execute(new SupprElementCommand(elem));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.loops.length - 1 == newGraph.loops.length;
    testOutput(expr, "Le graph final correspond après suppresion d'une boucle");

    return expr;
}


function TestFinalGraph7() {
    //Setup
    let oldGraph = PrettyfyJSON();
    let pos = new PositionRegisterer([graphJSON.nodes[0].px, graphJSON.nodes[0].py], [graphJSON.nodes[0].px + 1, graphJSON.nodes[0].py + 1], graphJSON.nodes[0])
    MyManager.execute(new MoveNodeCommand(pos));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.nodes[0].px != newGraph.nodes[0].px && oldGraph.nodes[0].py != newGraph.nodes[0].py && newGraph.nodes[0].px == pos.newPos[0];
    testOutput(expr, "Le graph final correspond après un déplacement");

    return expr;
}

function TestFinalGraph8() {
    //Setup
    let oldGraph = PrettyfyJSON();
    MyManager.execute(new SelectElementCommand(new Element(graphJSON.nodes[0]), NodeType));
    let newGraph = PrettyfyJSON();

    let expr = oldGraph.nodes[0].selectionGroup != newGraph.nodes[0].selectionGroup;
    testOutput(expr, "Le graph final correspond après une sélection");

    return expr;
}


function TestFinalGraph9() {
    //Setup
    let graph = PrettyfyJSON();

    let expr = true;
    for (let index = 0; index < graph.nodes.length; index++) {
        expr = expr && graph.nodes[index].y == -graphJSON.nodes[index].y;

    }

    testOutput(expr, "Le graph final inverse les positions sur l'axe y");

    return expr;
}

function TestFinalGraph10() {
    //Setup
    let graph = PrettyfyJSON();

    let expr = true;
    for (let index = 0; index < graph.links.length; index++) {
        expr = expr && graph.links[index].source == -graphJSON.links[index].source.name;
        expr = expr && graph.links[index].target == -graphJSON.links[index].target.name;
    }

    testOutput(expr, "Le graph final simplifie les données source/cible des liens");

    return expr;
}

function TestFinalGraph11() {
    //Setup
    let graph = PrettyfyJSON();

    let expr = true;
    for (let index = 0; index < graph.loops.length; index++) {
        expr = expr && graph.loops[index].source == -graphJSON.loops[index].source.name;
        expr = expr && graph.loops[index].target == -graphJSON.loops[index].target.name;
    }

    testOutput(expr, "Le graph final simplifie les données source/cible des boucles");

    return expr;
}