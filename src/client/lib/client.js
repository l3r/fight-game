var App = require('../app');
var Config = require('./config');
var Player = require('./player');
var Point = require('../../common/point');
var SpriteSheet = require('./canvas/spritesheet');
var LifeBar = require('./canvas/life-bar');
var EnergyBar = require('./canvas/energy-bar');
var InputCollection = require('./input-collection');
var InputProcessor = require('./input-processor');
var WorldPhysics = require('./world-physics');
var CountDownScreen = require('./screen/count-down');
var socket = io();

var Client = module.exports = {};

Client.inputs = [];
Client.serverData = [];
Client.inputCounter = 0;
Client.updateWorldInterval = null;
Client.isRunning = false;
Client.prediction = true;
Client.reconciliation = true;
Client.interpolation = true;
Client.opponentInputs = [];
Client.inputProcessor = null;

Client.storeInput = function(input) {
	Client.inputs.push(input);
};

Client.storeServerData = function(data) {
	Client.serverData.push(data);
};

Client.interpolate = function() {
	var physics = App.physics;
	var bufferSize = Client.opponentInputs.length;
	var opponent = App.opponent;
	if (bufferSize < 10) {
		var input = Client.opponentInputs[0];
		if (input !== undefined) {
			physics.applyCoordinates(opponent, input.x, input.y, input.z);
			opponent.getSpriteSheet().setActiveAnimation(input.currentAnimation);
			Client.opponentInputs.shift();
		}
	} else {
		var lastInput = Client.opponentInputs[bufferSize - 1];
		physics.applyCoordinates(opponent, lastInput.x, lastInput.y, lastInput.z);
		opponent.getSpriteSheet().setActiveAnimation(lastInput.currentAnimation);
		Client.opponentInputs = [];
	}
};

Client.reconciliate = function(state) {
	var physics = App.physics;
	var j = 0;
	while (j < Client.inputs.length) {
		var input = Client.inputs[j];
		if (input.id <= state.player.input.id) {
			Client.inputs.splice(j, 1);
		} else {
			physics.applyInput(App.player, input);
			j++;
		}
	}
};

Client.processServerData = function() {
	var physics = App.physics;
    for (var i = 0; i < Client.serverData.length; i++) {
    	var state = Client.serverData[i];
    	var x = state.player.x;
    	var y = state.player.y;
    	var ppunched = state.player.punched;
    	var pVictor = state.player.victor;
    	var pDefeated = state.player.defeated;
    	var ox = state.opponent.x;
    	var oy = state.opponent.y;
    	var opunched = state.opponent.punched;
    	var oVictor = state.opponent.victor;
    	var oDefeated= state.opponent.defeated;
    	var oz = state.opponent.z;
    	var lives = state.player.lives;
    	var olives = state.opponent.lives;
    	var playerLifeBar = App.player.getLifeBar();
    	var opponentLifeBar = App.opponent.getLifeBar();
    	var playerEnergyBar = App.player.getEnergyBar();
    	var opponentEnergyBar = App.opponent.getEnergyBar();

    	physics.applyCoordinates(App.player, x, y, null);
    	
    	if (ppunched) {
    		playerLifeBar.store(state.player.lives);
    	}
    	if (opunched) {
    		opponentLifeBar.store(state.opponent.lives);
    	}
    	
    	playerEnergyBar.store(state.player.energy);
    	opponentEnergyBar.store(state.opponent.energy);

    	App.player.setPunched(ppunched);
    	App.player.Victory(pVictor);
    	App.player.Defeat(pDefeated);
    	App.opponent.setPunched(opunched);
    	App.opponent.Victory(oVictor);
    	App.opponent.Defeat(oDefeated);

    	if (Client.interpolation) {
    		Client.appendOpponentInputs(state.opponent.sequence);
    	} else {
    		physics.applyCoordinates(App.opponent, ox, oy, oz);
    	}    	

    	if (Client.prediction && Client.reconciliation) {
    		Client.reconciliate(state);
    	}
    }
    Client.serverData = [];
};

Client.appendOpponentInputs = function(inputs) {
	for (var i = 0; i < inputs.length; i++) {
		Client.opponentInputs.push(inputs[i]);
	}
};

Client.processLocalInputs = function () {
	var physics = App.physics;
	var player = App.player;
	var packet = Client.inputProcessor.processInputs();

	if (Client.prediction) {
		physics.applyInput(player, packet);
		if (Client.reconciliation) {
			Client.storeInput(packet);
		}
	}
	physics.updatePlayerAnimation(packet);
	return packet;
};

Client.sendServerUpdate = function (packet) {
	var player = App.player;
	var animationName = player.getSpriteSheet().getCurrentAnimation();
	packet.animationName = animationName;
	socket.emit('update', packet);
};

Client.initializeGame = function (data) {
	var playerSpriteData = data.player.data;
	var opponentSpriteData = data.opponent.data;
	var playerSpriteImage = new Image();
	playerSpriteImage.src = './img/' + playerSpriteData.spriteSheetImage;

	var opponentSpriteImage = new Image();
	opponentSpriteImage.src = './img/' + opponentSpriteData.spriteSheetImage;

	var buildSprite = function(image, spriteSheetData) {
		return new SpriteSheet({
			image: image,
			data: spriteSheetData,
			frames: 1,
		});
	};

	var playerSprite = buildSprite(playerSpriteImage, playerSpriteData);
	var opponentSprite = buildSprite(opponentSpriteImage, opponentSpriteData);

	App.player = new Player({
		location: new Point(data.player.x, data.player.y),
		spriteSheet: playerSprite,
		energyCosts: data.player.energyCosts,
		lifeBar: new LifeBar({
			location: function () {
				return new Point(Config.progressBarPadding, Config.progressBarPadding);
			},
			width: function () {
				return App.canvasObj.getWidth() * Config.lifeBarWidthRatio;
			},
			height: function () {
				return Config.lifeBarHeight;
			},
			currentValue: 1000,
			maxValue: 1000
		}),
		energyBar: new EnergyBar({
			location: function() {
				return new Point(Config.progressBarPadding,
				Config.progressBarPadding * 2 + Config.lifeBarHeight);
			},
			width: function () {
				return App.canvasObj.getWidth() * Config.energyBarWidthRatio;
			},
			height: function () {
				return Config.energyBarHeight;
			},
			currentValue: 0,
			maxValue: 1000
		})
	});

	App.opponent = new Player({
		location: new Point(data.opponent.x, data.opponent.y),
		spriteSheet: opponentSprite,
		energyCosts: data.opponent.energyCosts,
		lifeBar: new LifeBar({
			location: function () {
			return new Point(
				Math.round(App.canvasObj.getWidth() * 
				(1 - Config.lifeBarWidthRatio) - Config.progressBarPadding),
				Config.progressBarPadding);
			},
			width: function () {
				return App.canvasObj.getWidth() * Config.lifeBarWidthRatio;
			},
			height: function () {
				return Config.lifeBarHeight;
			},
			currentValue: 1000,
			maxValue: 1000
		}),
		energyBar: new EnergyBar({
			location: function() {
			return new Point(
				Math.round(App.canvasObj.getWidth() * 
				(1 - Config.energyBarWidthRatio) - Config.progressBarPadding),
				Config.progressBarPadding * 2 + Config.lifeBarHeight);
			},
			width: function () {
				return App.canvasObj.getWidth() * Config.energyBarWidthRatio;
			},
			height: function () {
			return Config.energyBarHeight;
			},
			currentValue: 0,
			maxValue: 1000
		})
	});

	App.physics = new WorldPhysics({
		player: App.player,
		opponent: App.opponent
	});

	Client.inputProcessor = new InputProcessor({
		player: App.player,
		opponent: App.opponent
	});

	App.screen.dispose();
	App.screen = new CountDownScreen();
	App.canvasObj.setGraphics(App.screen.graphics);
};

Client.update = function() {
	var physics = App.physics;
	Client.processServerData();
	var packet = Client.processLocalInputs();
	Client.sendServerUpdate(packet);
	if (Client.interpolation) {
		Client.interpolate();
	}
	App.player.update();
	App.opponent.update();
	physics.flipPlayerSpritesheets();
	physics.updatePlayersDepth();
};

Client.stop = function() {
	Client.isRunning = false;
	Client.inputs = [];
	Client.serverData = [];
	Client.opponentInputs = [];
	clearInterval(Client.updateWorldInterval);
};

Client.start = function() {
	Client.isRunning = true;
	Client.updateWorldInterval = setInterval(function() {
		Client.update();
	}, 1000 / 30);
};