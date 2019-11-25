var Command = function (execute, undo, value) {
    this.execute = execute;
    this.undo = undo;
    this.value = value;
}

var AddNodeCommand = function (value) {
    return new Command(AddNode, RemoveNode, value);
};

var SupprNodeCommand = function (value) {
    return new Command(RemoveNode, AddNode, value);
};

var SupprEdgeCommand = function (value) {
    return new Command(RemoveEdge, AddEdge, value);
};

var AddEdgeCommand = function (value) {
    return new Command(AddEdge, RemoveEdge, value);
};


var AddLoopCommand = function (value) {
    return new Command(AddLoop, RemoveLoop, value);
};

var SupprLoopCommand = function (value) {
    return new Command(RemoveLoop, AddLoop, value);
};

var SelectNodeCommand = function(value){
    return new Command(SelectNode, SelectNode, value);
};

var Manager = function () {
    var commandsStack = [];
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
                var command = commandsStack.pop();
                current = command.undo(command.value);
                log.add("Undo " + action(command) + ": " + command.value);
                revertedCommandStack.push(command);
            } else {
                console.warn("Nothing to revert");
            }
        },

        do: function (command) {
            command.execute(command.value);
            commandsStack.push(command);
        },

        redo: function () {
            if (revertedCommandStack.length > 0) {
                var command = revertedCommandStack.pop();
                this.do(command);
            } else {
                console.warn("Nothing to redo");
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