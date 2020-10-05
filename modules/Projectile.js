const Entity = require('./Entity.js');
class Projectile extends Entity {
  constructor(parent){
    super();
    this.parent = parent;
    this.broadcast = true;
  }
}
module.exports = Projectile;
