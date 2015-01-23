var App = require('../app');
var InputCollection = require('./input-collection');
var InputProcessor = require('./input-processor');
var Client = require('./client');
var EventCollection = require('./event-collection');
var Point = require('../../common/point');
var Player = require('./player');
var StartScreen = require('./screen/start');
var CountDownScreen = require('./screen/count-down');
var ChooseScreen = require('./screen/choose');
var SpriteSheet = require('./canvas/spritesheet');
var WorldPhysics = require('./world-physics');
var LifeBar = require('./canvas/life-bar');
var EnergyBar = require('./canvas/energy-bar');
var Config = require('./config');
var CharacterChooser = require('./character-chooser');
var Button = require('./canvas/button');
var socket = io();

var GlobalEvents = {};

$(window).keydown(function (event) {
	InputCollection.onKeydown(event);
});

$(window).keyup(function (event) {
	InputCollection.onKeyup(event);
});

$(window).click(function(event) {
  var location = new Point(event.pageX, event.pageY);
  for (var key in EventCollection.clickList) {
    if (EventCollection.clickList[key].pointIntersects(location)) {
      EventCollection.clickList[key].executeClick();
    }
  }
});

$(window).mousemove(function(event) {
  var location = new Point(event.pageX, event.pageY);
  for (var key in EventCollection.mouseOverList) {
    if (EventCollection.mouseOverList[key].pointIntersects(location)) {
      EventCollection.mouseOverList[key].executeMouseOver();
    } else {
      EventCollection.mouseOverList[key].executeMouseLeave();
    }
  }
});

socket.on('playing', function(data) {

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
          Math.round(App.canvasObj.getWidth() * (1 - Config.lifeBarWidthRatio) - Config.progressBarPadding),
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
          Math.round(App.canvasObj.getWidth() * (1 - Config.energyBarWidthRatio) - Config.progressBarPadding),
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

  Client.physics = new WorldPhysics({
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
});

socket.on('choose-character', function (data) {
  var buttons = [];

  var startX = App.canvasObj.getWidth() * 0.15;
  var startY = App.canvasObj.getHeight() * 0.2;
  var width = 228;
  var height = 160;
  var shiftX = 0;
  var shiftY = 0;
  var buttonsInRow = 3;
  var currentButton = 1;

  for (var character in data) {
    var x = startX + shiftX;
    var y = startY + shiftY;

    var spriteImage = new Image();
    console.log(data[character].spriteSheetIntroImage);
    spriteImage.src = './img/' + data[character].spriteSheetIntroImage;
    var button = new Button({
      useSpriteSheet: true,
      spriteSheet: new SpriteSheet({
        image: spriteImage,
        data: data[character],
        useScale: true,
        scaleWidth: width,
        scaleHeight: height
      }),
      location: new Point(x, y)
    });

    buttons.push(button);

    shiftX += width;
    currentButton++;
    if (currentButton > buttonsInRow) {
      currentButton = 1;
      shiftX = 0;
      shiftY += height;
    }
  }
  App.screen.dispose();
  var screen = new ChooseScreen();
  screen.setButtons(buttons);
  App.screen = screen;
  App.canvasObj.setGraphics(screen.graphics);
  CharacterChooser.start(screen);
});

socket.on('unactive', function() {
  App.gameStarted = false;
  Client.stop();
  App.screen.dispose();
  App.screen = new StartScreen();
  App.canvasObj.setGraphics(App.screen.graphics);
});

socket.on('update', function(data) {
  Client.storeServerData(data);
});

$(window).load(function () {
	App.canvasObj.setGraphics(App.screen.graphics);
	App.canvasObj.draw();
});

module.exports = GlobalEvents;