var env = process.argv[2] || 'dev';

switch (env) {
	case 'prod':
		global.env = 'prod';
		console.log('Production version');
		break;
	case 'dev':
		global.env = 'dev';
		console.log('Development version');
		break;
	default:
		global.env = 'dev';
		console.log('Development version');
}

var Express = require('./src/server/express');
var SocketServer = require('./src/server/socket-server');
var Session = require('./src/server/session');
var SessionCollection = require('./src/server/session-collection');
var TournamentCollection = require('./src/server/tournament-collection');
var Tasks = require('./src/server/tasks');
var Config = require('./src/server/config');
var io = require('socket.io')(SocketServer.http);
var fs = require('fs');

Express.loadResources(__dirname);
Tasks.start();
SocketServer.listen();

setInterval(function() {
	SocketServer.updateWorld();
}, 1000 / 30);

setInterval(function() {
	SocketServer.updatePlayers();
}, 10);

TournamentCollection.start();

io.on('connection', function(socket) {
	socket.on('disconnect', function() {	
		SocketServer.disconnectClient(socket);
		TournamentCollection.disconnectSession(socket);
	});

	socket.on('ready', function(selection) {
		SocketServer.prepareClient(socket, selection);
	});

	socket.on('update', function(packet) {
		SocketServer.storeInput(socket, packet);
	});

	socket.on('choose', function () {
		fs.readdir(Config.charactersPath, function (err, files) {
			if (err) throw err;
			var packetData = {};
			files.forEach(function (file) {
				var characterData = JSON.parse(fs.readFileSync(
					Config.charactersPath + file, 'utf8'));
				packetData[file] = characterData;
			});
			socket.emit('choose-character', packetData);
		});
	});

	socket.on('tournament', function (selection) {
		var session = SessionCollection.createSession(socket, selection, Session.TOURNAMENT);
		TournamentCollection.joinTournament(session);
	});
});