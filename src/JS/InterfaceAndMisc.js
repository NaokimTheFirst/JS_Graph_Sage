//Structure that allow to search DOM element only once
var overlayElements = {
    groupListElement : null,
    get groupList() {
        if(!this.groupListElement)
        {
            this.groupListElement = document.getElementById("groupList");
        }
        return this.groupListElement;
    },

    commandListElement : null,
    get commandList(){
        if(!this.commandListElement)
        {
            this.commandListElement = document.getElementById("commandTable");
        }
        return this.commandListElement;
    },

    promptResultElement : null,
    get promptResult(){
        if(!this.promptResultElement){
            this.promptResultElement = document.getElementById("PromptResult");
        }
        return this.promptResultElement;
    }
}

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
    let show = (overlayElements.commandList.style.display == "" 
    || overlayElements.commandList.style.display == "none");
    
    overlayElements.commandList.style.display = (show)? "inherit":"none";
    button.value =(show)?"Hide Key Helper": "Show Key Helper";
}

function PopulateGroupList(){
    for(var i = 0; i < groupList.length; i++) {
        CreateGroupElement(groupList[i]);
    }

    overlayElements.groupList.selectedIndex = 0;
}

function ChangeSelectedGroup(){
    if(overlayElements.groupList.selectedIndex == overlayElements.groupList.childElementCount - 1)
    {
        if(!CheckNewGroupName()){
            overlayElements.groupList.selectedIndex = currentGroup;
        }
    }
    else
    {
        SetCurrentGroup();
    }
}

function SetCurrentGroup(){
    currentGroup = overlayElements.groupList.selectedIndex;
    overlayElements.groupList.style.backgroundColor = color(currentGroup); 
}

function CreateGroupElement(name){
    var newElem = document.createElement("option");
    newElem.textContent = name;
    newElem.value = name;
    
    let list = overlayElements.groupList;
    let lastIndex = list.childElementCount - 1;
    newElem.style.backgroundColor = color(lastIndex);
    list.insertBefore(newElem,list.childNodes[lastIndex]);

    overlayElements.groupList.selectedIndex = lastIndex;
    SetCurrentGroup();
}

function CheckNewGroupName(){
    var newName = prompt("Please enter the group name:", "New Group");
    if (newName == null || newName == "") {
        window.alert("Invalid name, no new group created.");
        return false;
    } else if (groupList.includes(newName)) {
        window.alert("This group already exist.");
        return false;
    }
    else {
      groupList.push(newName);
      CreateGroupElement(newName);
      return true;
    }
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
            case 67 :
                //C for color
                if(CheckCurrentObjectType(NodeType))
                {
                    ChangeNodeGroup(currentObject.data);
                }
                else {
                    CustomWarn("Nothing to color");
                }
                break;
            case 68:
                //D for SubDivide
                if (CheckCurrentObjectType(EdgeType)) {
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
                break;
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

    function CheckCurrentObjectType(type)
    {
        return currentObject && currentObject.type == type;
    }
}