const Entity = require('./Entity.js');
class HostileEntity extends Entity {
  constructor(room, x, y, ai){
    super(x, y, 0, 50);
    this.maxhp = this.hp = 400;
    this.room = room;
    this.id = (room.entityIdCounter = ++room.entityIdCounter%1024);
    this.t = 0;
    this.ai = ai;
  }
  update(){
    this.updatePosition();
    switch(this.ai){
      case HostileEntity.RANDOM:
        if(--this.t <= 0){
          this.t = ~~(100*Math.random() + 50);
          const a = ~~(8*Math.random())*Math.PI/4;
          this.xv = 2*Math.cos(a);
          this.yv = 2*Math.sin(a);
        }
        break;
    }
  }
  export(){
    return {
      x: ~~this.x,
      y: ~~this.y,
      // a: this.a,
      xv: this.xv,
      yv: this.yv,
      // av: this.av,
      hp: this.hp,
      id: this.id
    };
  }
}
Object.defineProperty(HostileEntity, 'STATIC', { value: 0, writable : false, enumerable : true, configurable : false});
Object.defineProperty(HostileEntity, 'RANDOM', { value: 1, writable : false, enumerable : true, configurable : false});
module.exports = HostileEntity;
