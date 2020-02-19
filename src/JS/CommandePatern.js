var Command = function (execute, undo, value, firstAction) {
    this.execute = execute;
    this.undo = undo;
    this.value = value;
    this.firstAction = firstAction;
}

var SupprNodeCommand = function (value, firstAction = true)  {
    return new Command(RemoveNode, AddNode, value, firstAction);
};

var SupprEdgeCommand = function (value, firstAction = true)  {
    return new Command(RemoveEdge, AddEdge, value, firstAction);
};

var SupprLoopCommand = function (value, firstAction = true)  {
    return new Command(RemoveLoop, AddLoop, value, firstAction);
};

var AddNodeCommand = function (value, firstAction = true)  {
    return new Command(AddNode, RemoveNode, value, firstAction);
};

var AddEdgeCommand = function (value, firstAction = true)  {
    return new Command(AddEdge, RemoveEdge, value, firstAction);
};

var AddLoopCommand = function (value, firstAction = true)  {
    return new Command(AddLoop, RemoveLoop, value, firstAction);
};

var ChangeGroupCommand = function(value, firstAction = true)  {
    return new Command(SetGroupElement, SetGroupElement, value, firstAction);
};

var ChangeNameCommand = function(value, firstAction = true)  {
    return new Command(SetElementName, SetElementName, value, firstAction);
};

var InvertDirectionCommand = function(value, firstAction = true)  {
    return new Command(SetLinkDirection, SetLinkDirection, value, firstAction);
};
var MoveNodeCommand = function(value, firstAction = true)  {
    return new Command(SetNewPosition, SetOldPosition, value, firstAction);
};

var commandsStack = [];
var Manager = function () {
    var revertedCommandStack = [];

    function action(command) {
        var name = command.execute.toString().substr(9, 3);
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    return {
        execute: function (command) {
            revertedCommandStack = [];
            this.do(command);
            log.add(action(command) + ": " + command.value);
        },

        undo: function () {
            if (commandsStack.length > 0) {
                while(commandsStack.length > 0 && commandsStack[commandsStack.length - 1].firstAction == false){
                    var command = commandsStack.pop();
                    current = command.undo(command.value);
                    log.add("Undo " + action(command) + ": " + command.value);
                    revertedCommandStack.push(command);
                }

                //Redo the first action of the user
                var command = commandsStack.pop();
                current = command.undo(command.value);
                log.add("Undo " + action(command) + ": " + command.value);
                revertedCommandStack.push(command);
                return true;

            } else {
                CustomWarn("Nothing to revert");
                return false;
            }
        },

        do: function (command) {
            command.execute(command.value);
            commandsStack.push(command);
        },

        redo: function () {
            if (revertedCommandStack.length > 0) {
                do
                {
                    var command = revertedCommandStack.pop();
                    this.do(command);
                } 
                while(revertedCommandStack.length > 0 && revertedCommandStack[revertedCommandStack.length - 1].firstAction == false)
                return true;
            } else {
                CustomWarn("Nothing to redo");
                return false;
            }
        },

        getCurrentValue: function () {
            return current;
        }
    }
}

// log helper
var log = (function () {
    var log = "";

    return {
        add: function (msg) {
            log += msg + "\n";
        },
        show: function () {
            alert(log);
            log = "";
        }
    }
})();