function Scene_GridBasedBattle()
{
    this.initialize.apply(this, arguments);
}

(function ()
{
    Scene_GridBasedBattle.prototype = Object.create(Scene_Map.prototype);
    Scene_GridBasedBattle.prototype.constructor = Scene_Map;

    Scene_GridBasedBattle.prototype.initialize = function ()
    {
        Scene_Map.prototype.initialize.call(this);
    };

    Scene_GridBasedBattle.prototype.create = function ()
    {
        Scene_Map.prototype.create.call(this);
    };

    Scene_GridBasedBattle.prototype.isReady = function ()
    {
        return Scene_Map.prototype.isReady.call(this);
    };

    Scene_GridBasedBattle.prototype.onMapLoaded = function ()
    {
        if (this._transfer)
        {
            $gamePlayer.performTransfer();
        }
        this.createDisplayObjects();
    };

    Scene_GridBasedBattle.prototype.start = function ()
    {
        this.startFadeIn(60, false);
        Scene_Map.prototype.start.call(this);
    };

    Scene_GridBasedBattle.prototype.stop = function ()
    {
        Scene_Base.prototype.stop.call(this);
        $gamePlayer.straighten();
        if (this.needsSlowFadeOut())
        {
            this.startFadeOut(this.slowFadeSpeed(), false);
        } else if (SceneManager.isNextScene(Scene_Map))
        {
            this.fadeOutForTransfer();
        }
    };

    Scene_GridBasedBattle.prototype.setupGridBasedBattle = function ()
    {
        this.setupGridMainMenu();
    };

    Scene_GridBasedBattle.prototype.setupGridMainMenu = function ()
    {
        var gridHeight = 3;
        var gridWidth = 3;
        this._gridMainMenuCommandWindow = new Window_GridMainMenuCommand(gridHeight, gridWidth);

        for (var y = 0; y < gridHeight; y++)
        {
            for (var x = 0; x < gridWidth; x++)
            {
                this._gridMainMenuCommandWindow.setHandler(`cell${x}_${y}`, this.commandCell.bind(this, x, y));
            }
        }
        
        this.addWindow(this._gridMainMenuCommandWindow);
        this._gridMainMenuCommandWindow.hide();
    };

    Scene_GridBasedBattle.prototype.commandCell = function (x, y)
    {
        this.commandEscape();
    };

    Scene_GridBasedBattle.prototype.commandEscape = function ()
    {
        this.endCommandSelection();
        SceneManager.goto(Scene_Map);
    };

    Scene_GridBasedBattle.prototype.endCommandSelection = function ()
    {
        this._gridMainMenuCommandWindow.close();
    };

    Scene_GridBasedBattle.prototype.update = function ()
    {
        this.updateDestination();
        this.updateMainMultiply();
        if (this.isSceneChangeOk())
        {
            this.updateScene();
        } else if (SceneManager.isNextScene(Scene_Battle))
        {
            this.updateEncounterEffect();
        }
        this.updateWaitCount();
        Scene_Base.prototype.update.call(this);
    };

    Scene_GridBasedBattle.prototype.updateMain = function ()
    {
        var active = this.isActive();
        $gameMap.update(active);
        $gamePlayer.update(active);
        $gameTimer.update(active);
        $gameScreen.update();
    };

    Scene_GridBasedBattle.prototype.createDisplayObjects = function ()
    {
        this.createSpriteset();
        this.createWindowLayer();
        this.createAllWindows();
        this.setupGridBasedBattle();
    };

    Scene_GridBasedBattle.prototype.updateDestination = function ()
    {
        //if (this.isMapTouchOk())
        //{
        //    this.processMapTouch();
        //} else
        //{
        //    $gameTemp.clearDestination();
        //    this._touchCount = 0;
        //}
    };

    Scene_GridBasedBattle.prototype.isActive = function ()
    {
        false;
    };

    Scene_GridBasedBattle.prototype.createSpriteset = function ()
    {
        this._spriteset = new Spriteset_GridBasedBattle();
        this.addChild(this._spriteset);
    };

    Scene_GridBasedBattle.prototype.terminate = function ()
    {
        Scene_Base.prototype.terminate.call(this);
        $gameParty.onBattleEnd();
        $gameTroop.onBattleEnd();
        AudioManager.stopMe();

        ImageManager.clearRequest();
    };

    function Window_GridMainMenuCommand()
    {
        this.initialize.apply(this, arguments);
    }

    Window_GridMainMenuCommand.prototype = Object.create(Window_Command.prototype);
    Window_GridMainMenuCommand.prototype.constructor = Window_GridMainMenuCommand;

    Window_GridMainMenuCommand.prototype.initialize = function (width, height)
    {
        var x = 0;
        var y = 0;
        this._gridWidth = width;
        this._gridHeight = height;
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_GridMainMenuCommand.prototype.windowWidth = function ()
    {
        return 480;
    };

    Window_GridMainMenuCommand.prototype.numVisibleRows = function ()
    {
        return 3;
    };

    Window_GridMainMenuCommand.prototype.maxCols = function ()
    {
        return this._gridWidth;
    };

    Window_GridMainMenuCommand.prototype.makeCommandList = function ()
    {
        this.addMainCommands();
    };

    Window_GridMainMenuCommand.prototype.addMainCommands = function ()
    {
        for (var y = 0; y < this._gridHeight; y++)
        {
            for (var x = 0; x < this._gridWidth; x++)
            {
                this.addCommand(`cell${x}_${y}`, `cell${x}_${y}`, true);
            }
        }
    };

    function Spriteset_GridBasedBattle()
    {
        this.initialize.apply(this, arguments);
    }

    Spriteset_GridBasedBattle.prototype = Object.create(Spriteset_Map.prototype);
    Spriteset_GridBasedBattle.prototype.constructor = Spriteset_GridBasedBattle;

    Spriteset_GridBasedBattle.prototype.initialize = function ()
    {
        Spriteset_Base.prototype.initialize.call(this);
    };

    Spriteset_GridBasedBattle.prototype.createLowerLayer = function ()
    {
        Spriteset_Map.prototype.createLowerLayer.call(this);
    };

    Spriteset_GridBasedBattle.prototype.createCharacters = function ()
    {
        this._characterSprites = [];
        $gameMap.events().forEach(function (event)
        {
            this._characterSprites.push(new Sprite_Character(event));
        }, this);
        $gameMap.vehicles().forEach(function (vehicle)
        {
            this._characterSprites.push(new Sprite_Character(vehicle));
        }, this);
        $gamePlayer.followers().reverseEach(function (follower)
        {
            this._characterSprites.push(new Sprite_Character(follower));
        }, this);

        //Character battle sprites
        var gamePlayer = new Sprite_GridBasedBattleActor($gameActors._data[1]);
        this._characterSprites.push(gamePlayer);

        //Grid selector
        var gridSelector = new Game_GridSelector();
        var gridSelectorSprite = new Sprite_Character(gridSelector);
        this._characterSprites.push(gridSelectorSprite);

        for (var i = 0; i < this._characterSprites.length; i++)
        {
            this._tilemap.addChild(this._characterSprites[i]);
        }
    };

    function Sprite_GridBasedBattleActor()
    {
        this.initialize.apply(this, arguments);
    }

    Sprite_GridBasedBattleActor.prototype = Object.create(Sprite_Actor.prototype);
    Sprite_GridBasedBattleActor.prototype.constructor = Sprite_GridBasedBattleActor;

    Sprite_GridBasedBattleActor.prototype.setActorHome = function (index)
    {
        var character = $gamePlayer;
        var x = character.screenX();
        var y = character.screenY();
        this.setHome(x, y);
    };

    function Game_GridSelector()
    {
        this.initialize.apply(this, arguments);
    }

    Game_GridSelector.prototype = Object.create(Game_Character.prototype);
    Game_GridSelector.prototype.constructor = Game_GridSelector;

    Game_GridSelector.prototype.characterName = function ()
    {
        return "Actor1";
    };

    Game_GridSelector.prototype.characterIndex = function ()
    {
        return 0;
    };

    function GridBattleManager()
    {
        throw new Error("This is a static class");
    }

    GridBattleManager.setSelectedCell = function (x, y)
    {
        this._selectedCell = { x: x, y: y };
    };

    GridBattleManager.getSelectedCell = function ()
    {
        return this._selectedCell;
    };
})();