const b2rk = (2*Math.PI)/255; // binary to radians constant
const b2rk16 = (2*Math.PI)/65535;
const r2bk = 255/(2*Math.PI);
const r2bk16 = 65535/(2*Math.PI);
const Entity = require('./Entity.js');
const COS45 = Math.sqrt(2)/2;
class Player extends Entity {
  constructor(gameroom, socket, name, role){
    super(gameroom.spawnX, gameroom.spawnY, 0, 50);
    this.socket = socket;
    this.role = role;
    this.room = gameroom;
    this.name = name;
    this.hp = this.maxhp = 100;
    this.hbr = 50; // diameter approx 100px when rendered on client
    this.pfr = this.pf = 8; // primary fire rate | primary weapon frames
    this.atk = 1;
    this.matk = 1;
    this.def = 1;
    this.res = 1;
    this.ms = 5;
    this.state = 0;
    this.f = 0;
    this.xv2 = this.yv2 = 0;
    this.id = (gameroom.playerIdCounter = ++gameroom.playerIdCounter%128);
  }
  respawn(){
    this.hp = this.maxhp;
  }
  update(){
    this.decelerate(0.4);
    const ms = ((this.state&4 || this.state&8) && (this.state&1 || this.state&2)) ? COS45*this.ms : this.ms;
    this.xv2 = this.xv + (this.state&4 ? -ms : 0) + (this.state&8 ? ms : 0);
    this.yv2 = this.yv + (this.state&1 ? -ms : 0) + (this.state&2 ? ms : 0);
    this.x += this.xv2;
    this.y += this.yv2;
    if(this.state&32){
      if(--this.pf <= 0){
        this.fireProjectile(this.a);
        this.pf = this.pfr;
      }
      // console.log("fire from", this.id);
    }
    // this.a += this.av;
  }
  updateState(b){
    this.a = b.readUInt16LE(0)*b2rk16;
    this.state = b[2];
    // console.log(b, this.a, this.f);
  }
  fireProjectile(angle){
    this.room.spawnProjectile(this, this.f, angle);
  }
  export(personal){
    if(personal)
      return {
        id: this.id
      };
    else
      return {
        x: ~~this.x,
        y: ~~this.y,
        // a: this.a,
        xv: this.xv2,
        yv: this.yv2,
        // av: this.av,
        hp: this.hp,
        id: this.id,
        t: this.name
      };
  }
}
module.exports = Player;
