var Command = function (execute, undo, value, firstAction) {
    this.execute = execute;
    this.undo = undo;
    this.value = value;
    this.firstAction = firstAction;
}

var SupprNodeCommand = function (value, firstAction = true) {
    return new Command(RemoveNode, AddNode, value, firstAction);
};

var SupprEdgeCommand = function (value, firstAction = true) {
    return new Command(RemoveEdge, AddEdge, value, firstAction);
};

var SupprLoopCommand = function (value, firstAction = true) {
    return new Command(RemoveLoop, AddLoop, value, firstAction);
};

var AddNodeCommand = function (value, firstAction = true) {
    return new Command(AddNode, RemoveNode, value, firstAction);
};

var AddEdgeCommand = function (value, firstAction = true) {
    return new Command(AddEdge, RemoveEdge, value, firstAction);
};

var AddLoopCommand = function (value, firstAction = true) {
    return new Command(AddLoop, RemoveLoop, value, firstAction);
};

var ChangeGroupCommand = function (value, firstAction = true) {
    return new Command(SetGroupElement, SetGroupElement, value, firstAction);
};

var ChangeNameCommand = function (value, firstAction = true) {
    return new Command(SetElementName, SetElementName, value, firstAction);
};

var InvertDirectionCommand = function (value, firstAction = true) {
    return new Command(SetLinkDirection, SetLinkDirection, value, firstAction);
};
var MoveNodeCommand = function (value, firstAction = true) {
    return new Command(SetNewPosition, SetOldPosition, value, firstAction);
};
var MoveSelectedNodesCommand = function (tabNodes, firstAction = true) {
    return new Command(SetNewSelectedNodesPosition, SetOldSelectedNodesPosition ,tabNodes, firstAction);
}

class CommandManager {
    constructor() {
        this.commandStack = [];
        this.revertedCommandStack = [];
    }

    Execute(command) {
        this.revertedCommandStack = [];
        this.Do(command);
    }

    Undo() {
        if (this.commandStack.length > 0) {
            while (this.commandStack.length > 0 && this.commandStack[this.commandStack.length - 1].firstAction == false) {
                var command = this.commandStack.pop();
                command.undo(command.value);
                this.revertedCommandStack.push(command);
            }

            //Redo the first action of the user
            var command = this.commandStack.pop();
            command.undo(command.value);
            this.revertedCommandStack.push(command);
            return true;

        } else {
            CustomWarn("Nothing to revert");
            return false;
        }
    }

    Do(command) {
        command.execute(command.value);
        this.commandStack.push(command);
    }

    Redo() {
        if (this.revertedCommandStack.length > 0) {
            do {
                var command = this.revertedCommandStack.pop();
                MyManager.Do(command);
            }
            while (this.revertedCommandStack.length > 0 && this.revertedCommandStack[this.revertedCommandStack.length - 1].firstAction == false)
            return true;
        } else {
            CustomWarn("Nothing to redo");
            return false;
        }
    }
}