var App;
var Point;

function Player(location) {
  App = require('../../app');
  Point = require('../canvas/point');

	this.location = location;
	obj = this;
};

Player.prototype.draw = function() {
	App.canvasObj.canvas.fillStyle = '#32FF32';
	App.canvasObj.canvas.fillRect(this.location.x,this.location.y,30,30);
};

module.exports = Player;