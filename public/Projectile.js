class Projectile {
  constructor(x, y, type){
    if(!SD[type]) throw "Invalid Projectile type";
    this.x = x;
    this.y = y;
    this.type = type;
    this.sprite = new PIXI.Sprite(SD[type].texture);
    this.sprite.anchor.set(0.5);
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
