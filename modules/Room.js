const b2rk = (2*Math.PI)/255; // binary to radians constant
const b2rk16 = (2*Math.PI)/65535;
const r2bk = 255/(2*Math.PI);
const r2bk16 = 65535/(2*Math.PI);
const Player = require('./Player.js');
const LinearProjectile = require('./LinearProjectile.js');

let config = {
  targetFrameRate: 30,
  broadcastInterval: 30
};
class Room {
  constructor(type, capacity){
    this.spawnX = this.spawnY = 200;
    this.height = this.width = 400;
    this.capacity = Math.min(capacity || 4, 16);
    this.projectiles = [];
    this.playersIndex = [];
    this.entities = [];
    this.players = {};
    this.playerIdCounter = 0;
    this.resume();
  }
  connect(socket, name){
    this.players[socket.id] = new Player(this, socket, name);
    this.playersIndex.push(this.players[socket.id]);
  }
  disconnect(socketid){
    this.playersIndex.splice(this.playersIndex.indexOf(this.players[socketid]), 1);
    delete this.players[socketid];
  }
  update(){
    for(let i = 0; i < this.playersIndex.length; i ++) this.playersIndex[i].update();
    for(let i = 0; i < this.entities.length; i ++) this.entities[i].update();
    for(let i = 0; i < this.projectiles.length; i ++){
      const p = this.projectiles[i];
      for(let j = 0; j < this.playersIndex.length; j ++){
        if(!p || p.parent === this.playersIndex[j] || p.d <= 0) continue;
        if(p.collidesWith(this.playersIndex[j])){
          this.playersIndex[j].xv += p.xv/10;
          this.playersIndex[j].yv += p.yv/10;
          // console.log(this.playersIndex[j].xv, this.playersIndex[j].yv, p.xv, p.yv);
          p.d = 0;
        }
      }
    }
  }
  broadcastData(){
    const gpdat = this.playersIndex.map(p => p.export());
    const gdat = {
      q: this.projectiles.map(e => e && e.broadcast ? e.export() : null),
      e: this.entities.map(e => e && e.export() ? e.export() : null)
    };
    for(let i = 0; i < this.playersIndex.length; i ++){
      // non optimized data transmission !!
      const p = this.playersIndex[i];
      gdat.p = gpdat.filter(q => q.id !== p.id);
      gdat.s = p.export(true);
      p.socket.emit('update', JSON.stringify(gdat));
    }
    for(let i = this.projectiles.length; i >= 0; i --){
      const q = this.projectiles[i];
      if(!q) continue;
      if(q.update()) remove(this.projectiles, i);
    }
  }
  resume(){
    this.updateInterval = setInterval(this.update.bind(this), Math.round(1e3 / config.targetFrameRate));
    this.broadcastInterval = setInterval(this.broadcastData.bind(this), config.broadcastInterval);
  }
  pause(){
    clearInterval(this.updateInterval);
    clearInterval(this.broadcastInterval);
  }
  spawnProjectile(parent, type, a){
    add(this.projectiles, new LinearProjectile(parent, parent.x, parent.y, a, type));
  }
}
Object.defineProperty(Room, 'PVE', { value: 0, writable : false, enumerable : true, configurable : false});
Object.defineProperty(Room, 'setConfig', { value: function(conf){config = conf; Object.freeze(config); }, writable : false, enumerable : true, configurable : false});
module.exports = Room;

function add(array, element){
  for(let i = 0; i < array.length; i ++){
    if(array[i] === undefined){
      array[i] = element;
      break;
    }
  }
  array.push(element);
  // console.log("add", array);
  // console.log(array.map(a => a ? 1 : a));
}
function remove(array, position){
  const v = array[position];
  array[position] = undefined;
  // console.log(`remove ${position}`, array);
  for(let i = array.length-1; i >= 0; i --){
    if(array[i] !== undefined){
      array.splice(i + 1);
      // console.log(array.map(a => a ? 1 : a));
      return v;
    }
  }
  array.splice(0);
  // console.log(array.map(a => a ? 1 : a));
}
