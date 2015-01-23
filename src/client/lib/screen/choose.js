var App;
var Utilities;
var Point;
var Text;
var Background;
var obj;

var ChooseScreen = function () {
	App = require('../../app');
	Utilities = require('../canvas/utilities');
	Point = require('../../../common/point');
	Text = require('../canvas/text');
	Background = require('../canvas/background');	

	this.backgroundImage = new Background('./img/waiting_screen_background.png');
	this.infoText = new Text('Choose character', 30);
	this.infoText.color = '#cbcbcb';
	this.infoText.fontType = 'Arial';

	this.buttons = [];

	this.infoText.setLocation(function() {
		var x = Utilities.centerX(obj.infoText.getTextWidth());;
		var y = App.canvasObj.getHeight() * 0.15;
		return new Point(x, y);
	});

	obj = this;
};

ChooseScreen.prototype.drawButtons = function () {
	var buttons = obj.buttons;
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].drawButton();
	}
};

ChooseScreen.prototype.disposeButtons = function () {
	var buttons = obj.buttons;
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].dispose();
	}
};

ChooseScreen.prototype.setButtons = function (buttons) {
	this.buttons = buttons;
};

ChooseScreen.prototype.getButtons = function () {
	return this.buttons;
};

ChooseScreen.prototype.graphics = function() {
	obj.backgroundImage.draw();
	obj.infoText.draw();
	obj.drawButtons();
};

ChooseScreen.prototype.dispose = function() {
	obj.disposeButtons();
};

module.exports = ChooseScreen;