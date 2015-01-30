var BaseConfig = require('../common/base-config');

var Config = {};

Config.port = 3000;
Config.playerMoveSpeed = BaseConfig.playerMoveSpeed;
Config.playerAcceleration = BaseConfig.playerAcceleration;
Config.playerJumpSpeed = BaseConfig.playerJumpSpeed;
Config.playerSize = BaseConfig.playerSize;
Config.keyBindings = BaseConfig.keyBindings;
Config.screenWidth = 900;
Config.playerDefenceMultiplier = 0.2;
Config.playerEnergyIncrement = 0.1;

Config.firstSpawnLocation = {
	x: 0,
	z: 0
};
Config.secondSpawnLocation = {
	x: 500,
	z: 0
};
Config.charactersPath = 'src/server/characters_data/';

module.exports = Config