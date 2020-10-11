const FMath = new (require('../util/FMath.js'))();

class Entity {
  constructor(x, y, a, r){
    this.x = x || 0;
    this.y = y || 0;
    this.a = a || 0;
    this.hbr = r || 10;
    this.xv = this.yv = this.av = 0;
  }
  updatePosition(){
    this.x += this.xv;
    this.y += this.yv;
    this.a += this.av;
  }
  collision(that){
    return Math.pow(this.x-that.x, 2) + Math.pow(this.y-that.y, 2) < Math.pow(this.hbr+that.hbr, 2);
  }
  decelerate(dv, a){
    if(a === undefined) a = FMath.atan2(this.yv, this.xv);
    if(this.xv != 0) this.xv = this.xv > 0 ? Math.max(0, this.xv-FMath.cos(a)*dv) : Math.min(0, this.xv-FMath.cos(a)*dv);
    if(this.yv != 0) this.yv = this.yv > 0 ? Math.max(0, this.yv-FMath.sin(a)*dv) : Math.min(0, this.yv-FMath.sin(a)*dv);
  }
}
Object.defineProperty(Entity, 'FMathInstance', { value: FMath, writable : false, enumerable : true, configurable : false});
module.exports = Entity;
