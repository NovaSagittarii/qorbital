const Room = require('./modules/Room.js');

const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const reservedCharacters = new RegExp('^[\u0000-\u001F]*$', 'g');

app.use(express.static('./public'));

const server = http.createServer(app);
const io = require('socket.io')(server);
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
Room.setConfig(config);

const activeRooms = [new Room(Room.PVE)];

io.on('connection', function(socket){
  var address = socket.handshake.address;
  const room = activeRooms[~~(Math.random()*activeRooms.length)];
  console.log(' > new connection < ' + address + ' cID: ' + socket.id);
  socket.on('input', function(data){
    /*if(IPs[address] !== socket.id){
      io.sockets.connected[IPs[address]].disconnect();
      IPs[address] = socket.id;
      console.log(' < disconnected IP ' + address + ' cID: ' + socket.id);
      return;
    }*/
    if(room.players[socket.id]){
      if(room.players[socket.id].updateState(data)){
        /*console.log("DISCONNECTED!!!");
        socket.disconnect();*/
      }
    }
  });
  socket.on('requestConfig', function(name){
    console.log(`=> Room${room.id} => player [ ${name} ] joined! - cID: ${socket.id}`);
    room.connect(socket, (name || "unnamed").replace(reservedCharacters, "").substr(0, 16));
    socket.emit('setConfig', Object.assign({r: room.id, t: room.type}, config));
  });
  socket.on('disconnect', function(reason){
    console.log(` < disconnection! [ ${reason} ] cID: ${socket.id}`);
    room.disconnect(socket.id);
  });
});

server.listen(process.env.PORT || 3000, '0.0.0.0', function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  console.log(`Running at ${(1e3/Math.round(1e3 / config.targetFrameRate)).toFixed(2)}FPS`);
});
