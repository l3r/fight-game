var App;
var Utilities;
var Point;
var Text;
var Background;
var StageScreen;
var SpriteSheet = require('../canvas/spritesheet');
var Config = require('../config');
var fs = require('fs');
var socket = io();
var obj;

function TournamentWaitingScreen() {
	App = require('../../app');
	Utilities = require('../canvas/utilities');
	Point = require('../../../common/point');
	Text = require('../canvas/text');
	Background = require('../canvas/background');
	StageScreen = require('./stage');

	this.images = [];
	this.Ids;
	this.canvas = App.canvasObj.canvas;
	this.backgroundImage = new Background('./img/background.png');
	this.waitingText = new Text('Waiting for players, 0/8 ready', 30);
	this.waitingText.color = Config.fontColor;
	this.waitingText.fontType = 'FSpirit';

	this.waitingText2 = new Text('Game will start in: ', 30);
	this.waitingText2.color = Config.fontColor;
	this.waitingText2.fontType = 'FSpirit';

	this.timeLeftText = new Text('', 30);
	this.timeLeftText.color = Config.fontColor;
	this.timeLeftText.fontType = 'FSpirit';

	this.loadingText = new Text('Loading', 30);
	this.loadingText.color = Config.fontColor;
	this.loadingText.fontType = 'FSpirit';

	this.versusText = new Text('VS', 80);
	this.versusText.color = Config.fontColor;
	this.versusText.fontType = 'FSpirit';

	obj = this;

	this.animateInterval = null;
	this.animating = false;
	this.opponentFound = false;

	this.loadingValue = 0;
	this.dots = 0;

	this.tournamentBegan = false;

	this.waitingText.setLocation(function() {
		var x = Utilities.centerX(obj.waitingText.getTextWidth());
		var y = App.canvasObj.getHeight() * 0.1;
		return new Point(x, y);
	});

	this.waitingText2.setLocation(function() {
		var x = Utilities.centerX(obj.waitingText2.getTextWidth()) - 10;
		var y = App.canvasObj.getHeight() * 0.2;
		return new Point(x, y);
	});

	this.timeLeftText.setLocation(function() {
		var x = Utilities.centerX(obj.waitingText2.getTextWidth()) 
			+ obj.waitingText2.getTextWidth();
		var y = App.canvasObj.getHeight() * 0.2;
		return new Point(x, y);
	});

	var centerX = Utilities.centerX(this.loadingText.getTextWidth());
	this.loadingText.setLocation(function() {
		var x = centerX;
		var y = App.canvasObj.getHeight() * 0.2;
		return new Point(x, y);
	});
};

TournamentWaitingScreen.prototype.loadImages = function (data) {
	for (var i = 0; i < data.chars.length; i++) {
		var spriteImage = new Image();
		spriteImage.src = data.chars[i];
		var spriteSheet = new SpriteSheet({
			image: spriteImage,
			data: {
				spriteDimensions: {
					width: 4160,
					height: 164,
					frameWidth: 212,
					frameHeight: 164
				},
				animations: {
					animation: {
						name: 'introAnimation',
						startFrame: 0,
						frames: 1,
						speed: 0,
						order: 'asc',
						row: 0
					}
				},
				defaultAnimation: 'animation'
			},
			useScale: true,
			scaleWidth: 100,
			scaleHeight: 100
		});
		this.images.push(spriteSheet);
	}
};

TournamentWaitingScreen.prototype.update = function (data) {
	if (data.started) {
		if (!this.tournamentBegan) {
			this.tournamentBegan = true;
			this.loadImages(data);
		}
	} else {
		this.waitingText.setText('Waiting for players, ' + data.pairs + '/8 ready');
		this.timeLeftText.setText(data.timer);
	}
	this.Ids = data.ids;
};

TournamentWaitingScreen.prototype.animateLoading = function() {
	var self = this;
	this.animateLoadingInterval = setInterval(function () {
		var dots = [];
		self.loadingValue += 0.07;
		if (self.loadingValue > 1) {
			self.loadingValue = 0;
			self.dots++;
			if (self.dots > 3) {
				self.dots = 0;
			}
		}
		for (var i = 0; i < self.dots; i++) {
			dots.push('.');
		}
		self.loadingText.setText('Loading' + dots.join(''));
	}, 1000 / 30);
};

TournamentWaitingScreen.prototype.load = function () {
	this.opponentFound = true;
	this.animating = false;
	this.waitingText.setText('Opponent found');
	clearInterval(this.animateInterval);
	this.animateLoading();
};

TournamentWaitingScreen.prototype.graphics = function() {
	obj.backgroundImage.draw();
	if (!obj.tournamentBegan) {
		obj.waitingText.draw();
		obj.waitingText2.draw();
		obj.timeLeftText.draw();
	} else {
		var extraY = 0;
		for (var i = 0; i < obj.Ids.length; i++) {
			if(obj.Ids[i].session == 1){
				var image = obj.images[obj.Ids[i].selection - 1];
				image.draw(250, 50*(i+2) + extraY);
			}
			if(obj.Ids[i+1] != null && obj.Ids[i+1].session == 2){
				var image = obj.images[obj.Ids[i+1].selection - 1];
				image.draw(550, 50*(i+2) + extraY);
				i++
			}
			else extraY += 50;
		}
		obj.versusText.setLocation(function() {
			var x = Utilities.centerX(obj.versusText.getTextWidth());
			var y = obj.Ids.length/2 * 50 + 150 + extraY/2;
			return new Point(x, y);
		});
		obj.versusText.draw();
	}
	if (obj.opponentFound) {
		obj.loadingText.draw();
	}
};

TournamentWaitingScreen.prototype.dispose = function() {
	App.canvasObj.canvas.restore();
	this.animating = false;
	clearInterval(this.animateInterval);
	clearInterval(this.animateLoadingInterval);
};

module.exports = TournamentWaitingScreen;