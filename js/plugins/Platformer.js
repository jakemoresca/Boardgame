Scene_Map.prototype.isReady = function ()
{
    if (!this._mapLoaded && DataManager.isMapLoaded())
    {
        this.onMapLoaded();
        this._mapLoaded = true;
        this._isPlatformer = $dataMap.note.includes("[Platformer]");
    }
    return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
};

var _gamePlayerUpdate = Game_Player.prototype.update;

Game_Player.prototype.update = function (sceneActive)
{
    _gamePlayerUpdate.call(this, sceneActive);

    var lastScrolledX = this.scrolledX();
    var lastScrolledY = this.scrolledY();
    var wasMoving = this.isMoving();
    this.updateDashing();
    if (sceneActive)
    {
        this.moveByInput();
    }
    Game_Character.prototype.update.call(this);
    this.updateScroll(lastScrolledX, lastScrolledY);
    this.updateVehicle();
    if (!this.isMoving())
    {
        this.updateNonmoving(wasMoving);
    }
    this._followers.update();
};

//ToDo: AirConsole movement script
//Game_Player.prototype.getInputDirection = function ()
//{
//    return Input.dir4;
//};

//Game_Player.prototype.moveByInput = function ()
//{
//    if (!this.isMoving() && this.canMove())
//    {
//        var direction = this.getInputDirection();
//        if (direction > 0)
//        {
//            $gameTemp.clearDestination();
//        } else if ($gameTemp.isDestinationValid())
//        {
//            var x = $gameTemp.destinationX();
//            var y = $gameTemp.destinationY();
//            direction = this.findDirectionTo(x, y);
//        }
//        if (direction > 0)
//        {
//            this.executeMove(direction);
//        }
//    }
//};
