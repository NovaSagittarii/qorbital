const Entity = require('./Entity.js');
const Projectile = require('./Projectile.js');
const FMath = Entity.FMathInstance;

class LinearProjectile extends Projectile {
  constructor(parent, x, y, a, type){
    super(parent);
    this.x = x;
    this.y = y;
    this.a = a;
    this.v = 120;
    this.xv = FMath.cos(this.a)*this.v + parent.xv2;
    this.yv = FMath.sin(this.a)*this.v + parent.yv2;
    this.ud = Math.pow(Math.hypot(this.xv, this.yv), 2); // u val denominator
    this.type = type;
    this.d = 8;
    this.id = (parent.room.projectileIdCounter = ++parent.room.projectileIdCounter%1024);
  }
  update(){
    this.x += this.xv;
    this.y += this.yv;
    -- this.d;
  }
  collidesWith(that){
    /*
    // http://paulbourke.net/geometry/pointlineplane/
    function inte(x1, y1, x2, y2, x3, y3){
      const u = ((x3-x1)*(x2-x1) + (y3-y1)*(y2-y1)) / Math.pow(Math.hypot(x1-x2, y1-y2), 2);
      return [x1 + u*(x2-x1), y1 + u*(y2-y1)];
    }
    */
    const u = ((that.x-this.x)*(this.xv) + (that.y-this.y)*(this.yv)) / this.ud;
    // return Math.pow(this.x + u*(this.xv) - that.x, 2) + Math.pow(this.y + u*(this.yv) - that.y, 2) < Math.pow(that.hbr, 2);
    const x2 = this.x+this.xv;
    const y2 = this.y+this.yv;
    const xl = Math.min(this.x, x2);
    const xh = Math.max(this.x, x2);
    const yl = Math.min(this.y, y2);
    const yh = Math.max(this.y, y2);
    return Math.pow(Math.max(xl, Math.min(xh, this.x + u*(this.xv))) - that.x, 2) + Math.pow(Math.max(yl, Math.min(yh, this.y + u*(this.yv))) - that.y, 2) < Math.pow(that.hbr, 2);
  }
  export(){
    this.broadcast = false;
    return {
      x: this.x,
      y: this.y,
      x2: this.x + this.xv*this.d,
      y2: this.y + this.yv*this.d,
      t: this.d,
      id: this.id
    };
  }
}
Object.defineProperty(LinearProjectile, 'S', { value: 0, writable : false, enumerable : true, configurable : false});
module.exports = LinearProjectile;
