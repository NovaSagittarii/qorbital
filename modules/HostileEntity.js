const Entity = require('./Entity.js');
class HostileEntity extends Entity {
  constructor(x, y){
    super(x, y, 0, 25);
    this.maxhp = this.hp = 100;
  }
  export(){
    return {
      x: ~~this.x,
      y: ~~this.y,
      a: this.a,
      d: this.hp
    };
  }
}
module.exports = HostileEntity;
