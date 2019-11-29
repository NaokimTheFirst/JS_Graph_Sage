//Return string with time on format "HH:MM""
function prettyDate2() {
    var date = new Date();
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute:'2-digit'
    })+" ";
}

function CustomWarn(string){
    console.warn(prettyDate2()+" "+string);
}

//Hide or show key helper
function ShowKeys(button){
    let commandList = document.getElementById("commandTable");
    let show = (commandList.style.display == "" || commandList.style.display == "none");
    
    commandList.style.display = (show)? "inherit":"none";
    button.value =(show)?"Hide Key Helper": "Show Key Helper";
}

function KeyboardEventInit() {
    //Keyboard Event
    document.onkeyup = function (key) {
        switch (key.keyCode) {
            case 46:
                //Suppr
                if (key.altKey)
                {
                    RemoveSelection();
                } 
                else 
                {
                    if (currentObject != null) {
                        RemoveElementFromGraph(currentObject);
                        currentObject = null;
                    } else {
                        CustomWarn("Nothing to delete");
                    }
                }
                break;
            case 65:
                //A for Add
                var newNode = CreateNode();
                MyManager.execute(new AddNodeCommand(newNode));
                break;
            case 68:
                //D for SubDivide
                if (currentObject != null && currentObject.type == EdgeType) {
                    SubdivideEdge(currentObject.data);
                    currentObject = null;
                } else {
                    CustomWarn("Nothing to subidivide");
                }
                break;
            case 69:
                //E for Edges
                AddEdgesOnSelection();
                break;
            case 70:
                //F for Freeze
                FreezeGraph();
                break;
            case 76:
                //L for Loops
                AddLoopOnNode();
                break;
            case 81:
                //Q to select
                if (currentObject != null) {
                    MyManager.execute(new SelectElementCommand(currentObject));
                } else {
                    CustomWarn("Nothing to select");
                }
                break;
            case 82:
                //R to reset selection
                ResetSelection();
                break;
            case 83:
                //S to save
                DownloadJSON();
                break;
            case 84:
                //T for Test, to remove before build
                LaunchAllTest();
                break;
            case 86:
                //V for Divide nodes on selection
                SubdivideEdgeOnSelection();
                break;
            case 87:
                //W for log
            case 89:
                //Y to redo
                MyManager.redo();
                break;
            case 90:
                //Z to undo
                MyManager.undo();
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + key.keyCode);
                break;
        }
    }
}