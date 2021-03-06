'use strict';

var InputProcessor = require('../../../src/client/lib/input-processor.js');
var InputCollection = require('../../../src/client/lib/input-collection.js');

var Config = require('../../../src/client/lib/config.js');
var Player = require('../../../src/client/lib/player.js');
var Point = require('../../../src/common/point.js');
var EnergyBar = require('../../../src/client/lib/canvas/energy-bar.js');
var Rectangle = require('../../../src/client/lib/canvas/rectangle.js');
var Camera = require('../../../src/client/lib/canvas/camera.js');
var App = require('../../../src/client/app.js');
var SoundCollection = require('../../../src/client/lib/sound-collection.js');

describe('InputProcessor', function () {

	var inputProcessor;
	var paramsMock;
	var playerParamsMock = {
		location: 250,
		spriteSheet: null,
		lifeBar: null,
		energyBar: {getCurrentValue: function () {
			return 1000;
		}},
		energyCosts: {
			kick: 0,
			punch: 0,
			kickCombo: 0,
			punchCombo: 0,
			jump: 0
		},
		speed: {
			'kick': 0,
			'punch': 0,
			'kickCombo': 0,
			'punchCombo': 0,
			'jump': 0
		}
	};
	var opponentParamsMock = {
		location: 500,
		spriteSheet: null,
		lifeBar: null,
		energyBar: {getCurrentValue: function () {
			return 1000;
		}},
		energyCosts: {
			kick: 0,
			punch: 0,
			kickCombo: 0,
			punchCombo: 0,
			jump: 0
		}
	};
	var blankInput = {
		id: 0,
		key: 0,
		jumpKey: false,
		punchKey: false,
		kickKey: false,
		punchCombo: false,
		kickCombo: false
	};

	var player = new Player(playerParamsMock);
	var worldRect = new Rectangle(0, 0, 3000, 1000);
	var camera = new Camera({
		yView: 0,
		xView: 0,
		canvasWidth: 900,
		canvasHeight: 550,
		axis: 'horizontal',
		worldRect: worldRect
	});

	camera.follow(player, 900 / 2, 550 / 2, 0);

	beforeEach(function () {
		paramsMock = {
			player: new Player(playerParamsMock),
			opponent: new Player(opponentParamsMock),
			canvasObj: {
				getWidth: function () {
					return 2000;
				},
				getHeigth: function () {
					return 2000;
				}
			},
			world: worldRect,
			camera: camera
		};
		inputProcessor = new InputProcessor(paramsMock);
		InputCollection.pressed = {};
		InputCollection.pressTimes = {};
		InputCollection.quickTaps = {};
		InputCollection.keysPressed = {};
		App.physics = {
			hit: function () {},
			jump: function () {},
			shakeCamera: function () {}
		}
		SoundCollection.sounds = {
			common: {
				miss: [],
				jump: [],
				land: [],
				victory: []
			},
			player: {
				punch: [],
				comboPunch: [],
				kick: [],
				comboKick: [],
				jump: [],
				hit: [],
				death: []
			},
			opponent: {
				punch: [],
				comboPunch: [],
				kick: [],
				comboKick: [],
				jump: [],
				hit: [],
				death: []
			}
		};
	});

	it('should create blank input', function () {
		var input = inputProcessor.createBlankInput();
		expect(input.key).toBe(blankInput.key);
		expect(input.kickKey).toBe(blankInput.kickKey);
		expect(input.punchKey).toBe(blankInput.punchKey);
		expect(input.kickCombo).toBe(blankInput.kickCombo);
		expect(input.punchCombo).toBe(blankInput.punchCombo);
		expect(input.jumpKey).toBe(blankInput.jumpKey);
	});

	it('should assign \'true\' to \'input.jumpKey\'', function () {
		InputCollection.onKeydown({keyCode: Config.keyBindings.JUMP});

		inputProcessor.processActionInputs(blankInput);
		expect(blankInput.jumpKey).toBe(true);
	});

	it('should assign \'true\' to \'input.kickKey\'', function () {
		InputCollection.onKeydown({keyCode: Config.keyBindings.KICK});

		inputProcessor.processHitInputs(blankInput);
		expect(blankInput.kickKey).toBe(true);
	});

	it('should assign \'true\' to \'input.punchCombo\'', function () {
		InputCollection.onKeydown({keyCode: Config.keyBindings.PUNCH});
		InputCollection.onKeyup({keyCode: Config.keyBindings.PUNCH});
		InputCollection.onKeydown({keyCode: Config.keyBindings.PUNCH});
		InputCollection.onKeyup({keyCode: Config.keyBindings.PUNCH});

		inputProcessor.processComboInputs(blankInput);
		expect(blankInput.punchCombo).toBe(true);
	});

	it('should return given input', function () {
		InputCollection.onKeydown({keyCode: Config.keyBindings.LEFT});
		InputCollection.onKeydown({keyCode: Config.keyBindings.JUMP});
		InputCollection.onKeydown({keyCode: Config.keyBindings.PUNCH});

		var input = inputProcessor.processInputs();
		var inputMock = {
			id: 0,
			key: Config.actions.LEFT,
			jumpKey: true,
			punchKey: true,
			kickKey: false,
			punchCombo: false,
			kickCombo: false
		}

		expect(input.key).toBe(inputMock.key);
		expect(input.punchKey).toBe(inputMock.punchKey);
		expect(input.kickKey).toBe(inputMock.kickKey);
		expect(input.punchCombo).toBe(inputMock.punchCombo);
		expect(input.kickCombo).toBe(inputMock.kickCombo);
		expect(input.jumpKey).toBe(inputMock.jumpKey);
	});
});