const FastTrig = require('../util/FastTrig.js');

class Projectile {
  constructor(id, type, x, y){
    if(!SD[type]) throw "Invalid Projectile type";
    this.x = x || 0;
    this.y = y || 0;
    this.type = type || "t8";
    this.sprite = new PIXI.Sprite(SD[type].texture);
    this.sprite.anchor.set(0.5);
    this.id = id;
  }
  update(x, y, x2, y2){
    this.sprite.position.set((this.x = x), (this.y = y));
    this.sprite.rotation = Math.atan2(y2-y, x2-x);
  }
  destroy(stage){
    stage.removeChild(this.sprite);
    this.sprite.destroy({children: true});
    delete this.sprite;
  }
}
