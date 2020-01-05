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
    },

    weightRelatedElements : null,
    get weightRelated(){
        if(!this.weightRelatedElements){
            this.weightRelatedElements = document.getElementsByClassName("WeightRelated");
        }
        return this.weightRelatedElements;
    },

    directedRelatedElements : null,
    get directedRelated(){
        if(!this.directedRelatedElements){
            this.directedRelatedElements = document.getElementsByClassName("DirectedRelated");
        }
        return this.directedRelatedElements;
    },
}

//Return string with time on format "HH:MM""
function prettyDate2() {
    var date = new Date();
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute:'2-digit'
    })+" ";
}

function CustomWarn(string, display = true){
    console.warn(prettyDate2()+" "+string);
    if (display) window.alert(string);
}

function InitInterface(){
    InitKeyHelper()
    KeyboardEventInit();
}

function InitKeyHelper(){
    for (let index = 0; index < overlayElements.directedRelated.length; index++) {
        overlayElements.directedRelated[index].style.display = (isDirected)? "":"none";
    }
}
//Hide or show key helper
function ShowKeys(button){
    let show = (overlayElements.commandList.style.display == "" 
    || overlayElements.commandList.style.display == "none");
    
    overlayElements.commandList.style.display = (show)? "inherit":"none";
    button.value =(show)?"Hide Key Helper": "Show Key Helper";
}

function DisplayWeight(checkbox){
    displayWeight = checkbox.checked;
    RefreshLoopLabels();
    RefreshEdgeLabels();

    for (let index = 0; index < overlayElements.weightRelated.length; index++) {
        overlayElements.weightRelated[index].style.display = (displayWeight)? "":"none";
    }
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
        if(!TryAddNewGroup()){
            overlayElements.groupList.selectedIndex = currentGroupIndex;
        }
    }
    else
    {
        SetCurrentGroup();
    }
}

function SetCurrentGroup(){
    currentGroupIndex = overlayElements.groupList.selectedIndex;
    overlayElements.groupList.style.backgroundColor = color(currentGroupIndex); 
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

function TryAddNewGroup(){
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
                TryColorNode();
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
            case 73 :
                //I for invert
                TryInvertEdge();
                break;
            case 76 :
                //L for Loops
                AddLoopOnNode();
                break;
            case 78 : 
                //N for Rename
                TryRenameElement();
                break;
            case 81:
                //Q to select
                if (currentObject != null) {
                    SelectElement(currentObject);
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
                //W for Weight
                TrySetWeight();
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
}

function TryRenameElement(){
    if(currentObject)
    {
        newName = AskForNewName();
        result = CheckNewName(newName, currentObject.type);

        if(result)
        {
            let vr = new ValueRegisterer(currentObject.data.name, newName, currentObject);
            MyManager.execute(new ChangeNameCommand(vr));
        }
        else 
        {
            CustomWarn("This name is already taken");
        }
    }
    else
    {
        CustomWarn("Nothing to rename");
    }
}

function AskForNewName(){
    result = prompt("How do you want to rename it ?", "New Name");
    return result;
}

function CheckNewName(name, type){
    list = null;
    switch (type) {
        case NodeType:
            list = graphJSON.nodes;
            break;
        case EdgeType:
            list = graphJSON.links;
            break;
        case LoopType:
            list = graphJSON.loops;
            break;
    }

    return !list.some(function f(elem) {
        return elem.name == name;
    });
}

function TryInvertEdge() {
    if (isDirected && CheckCurrentObjectType(EdgeType)) {
        let vr = new ValueRegisterer([currentObject.data.source, currentObject.data.target], [currentObject.data.target, currentObject.data.source], currentObject);
        MyManager.execute(new InvertDirectionCommand(vr));
    }
    else {
        CustomWarn("Nothing to invert");
    }
}

function TryColorNode() {
    if (CheckCurrentObjectType(NodeType)) {
        if (currentObject.data.group != groupList[currentGroupIndex]) {
            MyManager.execute(new ChangeGroupCommand(new ValueRegisterer(currentObject.data.group, groupList[currentGroupIndex], currentObject)));
        }
        else {
            CustomWarn("The node is already in this group");
        }
    }
    else {
        CustomWarn("Nothing to color");
    }
}

function TrySetWeight() {
    if(displayWeight){
        if (CheckCurrentObjectType([EdgeType,LoopType])) {
            let newWeight = prompt("Enter the new weight",1);
    
            if (!isNaN(newWeight))
            {
                if (currentObject.data.weight != newWeight) 
                {
                    MyManager.execute(new ChangeWeightCommand(
                        new ValueRegisterer(currentObject.data.weight, 
                            newWeight, 
                            currentObject)
                        )
                    );
                }
            }
            else 
            {
                CustomWarn("The weight must be a number");
            }
        }
        else 
        {
            CustomWarn("Only edge and loop can be weighted");
        }
    }
}

function CheckCurrentObjectType(types)
{
    let result = (currentObject != null);
    if(result){
        result = types.includes(currentObject.type);
    }
    return result;
}