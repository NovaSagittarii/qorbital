const Entity = require('./Entity.js');
class HostileEntity extends Entity {
  constructor(room, x, y){
    super(x, y, 0, 50);
    this.maxhp = this.hp = 1000;
    this.room = room;
    this.id = (room.entityIdCounter = ++room.entityIdCounter%1024);
  }
  update(){
    this.updatePosition();
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
module.exports = HostileEntity;
