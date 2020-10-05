const b2rk = (2*Math.PI)/255; // binary to radians constant
const b2rk16 = (2*Math.PI)/65535;
const r2bk = 255/(2*Math.PI);
const r2bk16 = 65535/(2*Math.PI);
const Player = require('./Player.js');
const Array3D = require('./Array3D.js');
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
    this.projectiles = new Array3D(200, 10, 10);
    this.playersIndex = new Array3D(200, 10, 10);
    this.entities = new Array3D(200, 10, 10);
    this.players = {};
    this.playerIdCounter = 0;
    this.entityIdCounter = 0;
    this.projectileIdCounter = 0;
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
    for(let i = 0; i < this.playersIndex.A1D.length; i ++) this.playersIndex.A1D[i].update();
    for(let i = 0; i < this.entities.A1D.length; i ++) this.entities.A1D[i].update();
    for(let i = 0; i < this.projectiles.A1D.length; i ++){
      const p = this.projectiles.A1D[i];
      for(let j = 0; j < this.playersIndex.A1D.length; j ++){
        if(!p || p.parent === this.playersIndex.A1D[j] || p.d <= 0) continue;
        if(p.collidesWith(this.playersIndex.A1D[j])){
          this.playersIndex.A1D[j].xv += p.xv/10;
          this.playersIndex.A1D[j].yv += p.yv/10;
          // console.log(this.playersIndex[j].xv, this.playersIndex[j].yv, p.xv, p.yv);
          p.d = 0;
        }
      }
    }
  }
  broadcastData(){
    /*const gpdat = this.playersIndex.map(p => p.export());
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
    }*/
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
    this.projectiles.add(new LinearProjectile(parent, parent.x, parent.y, a, type));
  }
}
Object.defineProperty(Room, 'PVE', { value: 0, writable : false, enumerable : true, configurable : false});
Object.defineProperty(Room, 'setConfig', { value: function(conf){config = conf; Object.freeze(config); }, writable : false, enumerable : true, configurable : false});
module.exports = Room;
