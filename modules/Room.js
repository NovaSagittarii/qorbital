const b2rk = (2*Math.PI)/255; // binary to radians constant
const b2rk16 = (2*Math.PI)/65535;
const r2bk = 255/(2*Math.PI);
const r2bk16 = 65535/(2*Math.PI);
const Player = require('./Player.js');
const Array3D = require('./Array3D.js');
const HostileEntity = require('./HostileEntity.js');
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
    this.projectiles = new Array3D(100, 40, 40, true);
    this.playersIndex = new Array3D(100, 40, 40, true);
    this.entities = new Array3D(100, 40, 40, true);
    this.players = {};
    this.playerIdCounter = 0;
    this.entityIdCounter = 0;
    this.projectileIdCounter = 0;
    this.resume();
    this.entities.add(new HostileEntity(this, 400, 400, HostileEntity.STATIC));
    for(let i = 0; i < 100; i ++) this.entities.add(new HostileEntity(this, 400, 400, HostileEntity.RANDOM));
  }
  connect(socket, name){
    this.players[socket.id] = new Player(this, socket, name);
    this.playersIndex.add(this.players[socket.id]);
  }
  disconnect(socketid){
    if(this.players[socketid] === undefined) return;
    this.playersIndex.remove(this.players[socketid]);
    delete this.players[socketid];
  }
  update(){
    this.playersIndex.updateAll(e => e.update());
    this.entities.updateAll(e => e.update(), e => {
      if(e.hp <= 0) this.entities.remove(e);
    });
    this.projectiles.updateAll((p, chunk) => {
      p.update();
      const players = this.playersIndex.contextFrom(chunk.x, chunk.y);
      for(let i = 0; i < players.length; i ++){
        const q = players[i];
        if(p.parent === q) continue;
        if(p.collidesWith(q)){
          // q.xv += p.xv/10;
          // q.yv += p.yv/10;
          q.hp -= 4;
          p.d = 0;
          break;
        }
      }
      const entities = this.entities.contextFrom(chunk.x, chunk.y);
      for(let i = 0; i < entities.length; i ++){
        const q = entities[i];
        if(p.parent === q) continue;
        // console.log(Math.hypot(p.x-q.x,q.y-q.x));
        if(p.collidesWith(q)){
          // q.xv += p.xv/10;
          // q.yv += p.yv/10;
          q.hp -= 4;
          p.d = 0;
          break;
        }
      }
    }, p => {
      if(p.d <= 0) this.projectiles.remove(p);
    });
  }
  broadcastData(){
    this.playersIndex.forEachChunk(chunk => {
      if(chunk.a.length === 0) return; // don't bother if there aren't any players in there
      const cdat = { // chunk data
        p: this.playersIndex.nearbyElementsOf(chunk, 10).map(p => p.export()),
        q: this.projectiles.nearbyElementsFrom(chunk.x, chunk.y, 10).map(e => e && e.export() ? e.export() : null),
        e: this.entities.nearbyElementsFrom(chunk.x, chunk.y, 10).map(e => e && e.export() || null)
      };
      const a = chunk.a;
      for(let i = a.length-1; i >= 0; i --){
        // non optimized data transmission !! (still)
        const p = a[i];
        cdat.s = p.export(true);
        p.socket.emit('update', JSON.stringify(cdat));
      }
    });
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
