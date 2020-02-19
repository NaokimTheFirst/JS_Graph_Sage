//Structure that allow to search DOM element only once
var overlayElements = {
    _groupListElement : null,
    get groupList() {
        if(!this._groupListElement)
        {
            this._groupListElement = document.getElementById("groupList");
        }
        return this._groupListElement;
    },

    _keyPanelContent : null,
    get keyPanelContent(){
        if(!this._keyPanelContent)
        {
            this._keyPanelContent = document.getElementById("KeyPanelContent");
        }
        return this._keyPanelContent;
    },

    _propertyPanelContent : null,
    get propertyPanelContent(){
        if(!this._propertyPanelContent)
        {
            this._propertyPanelContent = document.getElementById("PropertyPanelContent");
        }
        return this._propertyPanelContent;
    },

    _toolPanelContent : null,
    get toolPanelContent(){
        if(!this._toolPanelContent)
        {
            this._toolPanelContent = document.getElementById("ToolPanelContent");
        }
        return this._toolPanelContent;
    },

    _algorithmPanelContent : null,
    get algorithmPanelContent(){
        if(!this._algorithmPanelContent)
        {
            this._algorithmPanelContent = document.getElementById("AlgorithmPanelContent");
        }
        return this._algorithmPanelContent;
    },

    _promptResultElement : null,
    get promptResult(){
        if(!this._promptResultElement){
            this._promptResultElement = document.getElementById("PromptResult");
        }
        return this._promptResultElement;
    },

    _directedRelatedElements : null,
    get directedRelated(){
        if(!this._directedRelatedElements){
            this._directedRelatedElements = document.getElementsByClassName("DirectedRelated");
        }
        return this._directedRelatedElements;
    },

    _scrollTextElement : null,
    get scrollText(){
        if(!this._scrollTextElement){
            this._scrollTextElement = document.getElementsByClassName("scroll")[0];
        }
        return this._scrollTextElement;
    },

    _radiusLabelElement : null,
    get radiusLabel(){
        if(!this._radiusLabelElement){
            this._radiusLabelElement = document.getElementById("radiusLabel");
        }
        return this._radiusLabelElement;
    },

    _diameterLabelElement : null,
    get diameterLabel(){
        if(!this._diameterLabelElement){
            this._diameterLabelElement = document.getElementById("diameterLabel");
        }
        return this._diameterLabelElement;
    },

    _regularLabelElement : null,
    get regularLabel(){
        if(!this._regularLabelElement){
            this._regularLabelElement = document.getElementById("regularLabel");
        }
        return this._regularLabelElement;
    },

    _planarLabelElement : null,
    get planarLabel(){
        if(!this._planarLabelElement){
            this._planarLabelElement = document.getElementById("planarLabel");
        }
        return this._planarLabelElement;
    },

    _bipartiteLabelElement : null,
    get bipartiteLabel(){
        if(!this._bipartiteLabelElement){
            this._bipartiteLabelElement = document.getElementById("bipartiteLabel");
        }
        return this._bipartiteLabelElement;
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
    if (display) {
        let newLine = prettyDate2()+" : "+string;
        let logs = overlayElements.scrollText.innerHTML.split(/<br(?: \/)?>/);
        let lastLog = logs[logs.length - 2];
        if (lastLog != newLine){
            overlayElements.scrollText.innerHTML += newLine + "<br>"
        }

        updateScroll();
    }
}

function SetProperties(radius,diameter,regular,planar,bipartite){
    overlayElements.radiusLabel.innerHTML = radius;
    overlayElements.diameterLabel.innerHTML = diameter;
    overlayElements.regularLabel.innerHTML = regular;
    overlayElements.planarLabel.innerHTML = planar;
    overlayElements.bipartiteLabel.innerHTML = bipartite;
}

function InitInterface(){
    UpdateDirectedRelatedElements();
}

function DisplayElement(element, show){
    element.style.display = (show)? "":"none";
}

function UpdateDirectedRelatedElements(){
    for (let index = 0; index < overlayElements.directedRelated.length; index++) {
        DisplayElement(overlayElements.directedRelated[index],isDirected);
    }
}


function EmptyGroupList(){
    for (let index = overlayElements.groupList.childElementCount - 2; index >= 0 ; index--) {
        overlayElements.groupList.removeChild(overlayElements.groupList.childNodes[index]);
    }   
}

function PopulateGroupList(){
    EmptyGroupList();
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
    overlayElements.groupList.style.backgroundColor = customColorScale(currentGroupIndex); 
}

function CreateGroupElement(name){
    var newElem = document.createElement("option");
    newElem.textContent = name;
    newElem.value = name;
    
    let list = overlayElements.groupList;
    let lastIndex = list.childElementCount - 1;
    newElem.style.backgroundColor = customColorScale(lastIndex);
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
        var result = null;
        switch (key.keyCode) {
            case 46:
                result = [RemoveSelection(), "Delete selected Elements"];
                break;
            case 65:
                //A for Add
                result = [AddNewNode(), "Add new node"];
                break;
            case 67 :
                //C for color
                SetGroupOfSelection();
                break;
            case 68:
                //V for Divide nodes on selection
                result = [SubdivideEdgeOnSelection(), "Subdivide selected edges"];
                break;
            case 69:
                //E for Edges
                result = [AddEdgesOnSelection(), "Add edge between selected nodes"];
                break;
            case 70:
                //F for Freeze
                FreezeGraph();
                break;
            case 73 :
                //I for invert
                result = [TryInvertEdge(), "Invert selected edges orientation"];
                break;
            case 76 :
                //L for Loops
                result = [AddLoopOnSelection(), "Add loop on selected nodes"];
                break;
            case 78 : 
                //N for Rename
                result = [TryRenameElement(), "Relabel hovered element"];
                break;
            case 82:
                //R to reset selection
                ResetSelection();
                break;
            case 83:
                //S to save
                SubmitMessage();
                break;
            case 84:
                //T for Test, to remove before build
                LaunchAllTest();
                break;
            case 89:
                //Y to redo
                result = [MyManager.Redo(), "Redo previous reverted action"];
                break;
            case 90:
                //Z to undo
                result = [MyManager.Undo(), "Undo previous action"];
                break;
            default:
                //Affiche le code de la touche pressée
                console.log("Keycode : " + key.keyCode);
                break;
        }
        if(result){
            CheckUserAction(result);
        }
    }
}

function CheckUserAction(result){
    if(result[0] == true)
    {
        UpdateGraphProperties(result[1]);
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
            MyManager.Execute(new ChangeNameCommand(vr));
            return true;
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
    return false;
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
    if (isDirected) {
        return InvertEdgesOnSelection();
    }
    else {
        CustomWarn("The graph is not directed");
    }
    return false;
}


function CheckCurrentObjectType(types)
{
    let result = (currentObject != null);
    if(result){
        result = types.includes(currentObject.type);
    }
    return result;
}

function updateScroll(){
    overlayElements.scrollText.parentNode.style.display = "inherit";
    overlayElements.scrollText.scrollTop = overlayElements.scrollText.scrollHeight;
}

function StringToObject(string)
{
    return eval('(' + string + ')');
}