const b2rk = TWO_PI/255; // binary to radians constant
const b2rk16 = TWO_PI/65535;
const r2bk = 255/TWO_PI;
const r2bk16 = 65535/TWO_PI;
const Entity = require('./Entity.js');
class Player extends Entity {
  constructor(gameroom, socket, name, role){
    super(gameroom.spawnX, gameroom.spawnY, 0);
    this.socket = socket;
    this.role = role;
    this.room = gameroom;
    this.name = name;
    this.hp = this.maxhp = 100;
    this.hbr = 20; // diameter 40px when rendered on client
    this.pfr = this.pf = 8; // primary fire rate | primary weapon frames
    this.atk = 1;
    this.matk = 1;
    this.def = 1;
    this.res = 1;
    this.ms = 5;
    this.state = 0;
    this.f = 0;
    this.xv2 = this.yv2 = 0;
    this.id = gameroom.playerIdCounter++ % 128;
  }
  respawn(){
    this.hp = this.maxhp;
  }
  update(){
    this.decelerate(0.4);
    this.xv2 = this.xv + (this.state&4 ? -this.ms : 0) + (this.state&8 ? this.ms : 0);
    this.yv2 = this.yv + (this.state&1 ? -this.ms : 0) + (this.state&2 ? this.ms : 0);
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
  export(detailed){
    if(detailed)
      return {
        x: ~~this.x,
        y: ~~this.y,
        a: this.a,
        xv: this.xv,
        yv: this.yv,
        av: this.av,
        hp: this.hp,
        id: this.id,
        t: this.name
      };
    else
      return {
        x: ~~this.x,
        y: ~~this.y,
        a: this.a,
        xv: this.xv,
        yv: this.yv,
        av: this.av,
        hp: this.hp,
        id: this.id,
        t: this.name
      };
  }
}
module.exports = Player;