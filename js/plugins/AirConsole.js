var airconsole = new AirConsole();

// Listen for messages from other devices

var inputKeyMap =
{
    'left': 4,//37,     // left arrow
    'up': 8,//38,       // up arrow
    'right': 6,// 39,    // right arrow
    'down': 2,//40,     // down arrow
    45: 'escape',   // insert
    90: 'ok'       // Z
};

airconsole.onConnect = function (device_id)
{
    checkPlayers();
};

airconsole.onDisconnect = function (device_id)
{
    var player = airconsole.convertDeviceIdToPlayerNumber(device_id);
    if (player != undefined)
    {
        // Player that was in game left the game.
        // Setting active players to length 0.
        airconsole.setActivePlayers(0);
    }
    checkPlayers();
};

airconsole.onActivePlayersChange = function (player_number)
{

};

function checkPlayers()
{
    //var active_players = airconsole.getActivePlayerDeviceIds();
    var connected_controllers = airconsole.getControllerDeviceIds();
    // Only update if the game didn't have active players.
    if (connected_controllers.length > 0)
    {
        airconsole.setActivePlayers(connected_controllers.length);
    }

    //airconsole.setActivePlayers(connected_controllers.length);
}

airconsole.onMessage = function (from, data)
{
    var isStart = data.hasOwnProperty("start");
    var isDirection = data.hasOwnProperty("data") && data.data.hasOwnProperty("direction");
    var inputKey = isStart ? data.start : data.end;
    var currentKey = isStart? inputKeyMap[data.start] : inputKeyMap[data.end];

    if (currentKey)
    {
        Input._currentState[inputKey] = isStart;
    }
    else if (isDirection)
    {
        var direction = data.data.direction;

        if (SceneManager._scene._mapLoaded)
        {
            var playerNumber = airconsole.convertDeviceIdToPlayerNumber(from);
            Input.setMultiplayerInput(playerNumber, direction);
        }
        else
        {
            Input._currentState["up"] = direction.up;
            Input._currentState["down"] = direction.down;
            Input._currentState["left"] = direction.left;
            Input._currentState["right"] = direction.right;
        }
    }
    else
    {
        var isMenuCommand = data.hasOwnProperty("data");

        if (!isMenuCommand)
            return;

        inputKey = data.data.start;

        if (!SceneManager._scene)
            return;

        for (var i = 0; i < SceneManager._scene._windowLayer.children.length; i++)
        {
            var windowLayer = SceneManager._scene._windowLayer.children[i];

            if (windowLayer.isHandled && windowLayer.isHandled(inputKey))
                windowLayer.callHandler(inputKey);
        }
    }
};

var _scene_Base_addWindow = Scene_Base.prototype.addWindow;

Scene_Base.prototype.addWindow = function (window)
{
    //var changeView = 
    //airconsole.broadcast()

    //var changeView = { show_view_id: "view-1" };
    _scene_Base_addWindow.call(this, window);
};

/*
 * Use the following to change controller view
 * 
 * To broadcast to all:
 * airconsole.broadcast({ show_view_id: "view-1" });
 * 
 * To specific controller:
 * airconsole.message(deviceId, { show_view_id: "view-1" });
 *
 * 
 */

var _input_Initialize = Input.initialize;
Input.initialize = function ()
{
    Input._multplayerState = {};   

    _input_Initialize.call(this);
};

Input.setMultiplayerInput = function (playerId, direction)
{
    Input._multplayerState[playerId] = 
    {
        direction: direction
    };
    //Input._multplayerState[playerId]["down"] = direction.down;
    //Input._multplayerState[playerId]["left"] = direction.left;
    //Input._multplayerState[playerId]["right"] = direction.right;
};

Input.getMultiplayerInput = function (playerId)
{
    return Input._multplayerState && Input._multplayerState[playerId] && Input._multplayerState[playerId].direction;
};

//Character movement
var _game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function ()
{
    var controllerDevices = airconsole.getControllerDeviceIds();

    if (controllerDevices.length === 0)
        _game_Player_moveByInput.call(this);

    if (!this.isMoving() && this.canMove())
    {
        var direction = getInputDirection(0);
        if (direction > 0)
        {
            $gameTemp.clearDestination();
        } else if ($gameTemp.isDestinationValid())
        {
            var x = $gameTemp.destinationX();
            var y = $gameTemp.destinationY();
            direction = this.findDirectionTo(x, y);
        }
        if (direction > 0)
        {
            this.executeMove(direction);
        }
    }
};

var _game_event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function ()
{
    var note = $dataMap.events[this._eventId].note;
    var isPlayerControlled = note.includes("[player:2]");

    if (isPlayerControlled)
    {
        var player_number = parseInt(note.substring(8, note.indexOf("]"))) - 1;
        var direction = getInputDirection(player_number);
        this.moveStraight(direction);
    }

    _game_event_updateSelfMovement.call(this);
};

function getInputDirection(player_number)
{
    var direction = Input.getMultiplayerInput(player_number);

    if (!direction)
        return 0;

    if (direction.up)
        return inputKeyMap.up;
    else if (direction.down)
        return inputKeyMap.down;
    else if (direction.left)
        return inputKeyMap.left;
    else if (direction.right)
        return inputKeyMap.right;
}