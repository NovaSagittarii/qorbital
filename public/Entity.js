const data = {
  p: {
    maxhp: 400,
    name: "test",
    action: ["Relax", "Move", "Interact"]
  },
  e1: {
    maxhp: 100,
    name: "test",
    action: ["Idle", "Run_Loop", "Attack"]
  }
};
class Entity {
  constructor(id, type, name, hp, x, y, xv, yv){
    if(!SD[type] || !data[type]) throw "Invalid Entity type " + type;
    this.x = x || 0;
    this.y = y || 0;
    this.xv = xv || 0;
    this.yv = yv || 0;
    this.hp = hp || 0;
    this.maxhp = data[type].maxhp;
    this.container = new PIXI.Container();
    this.sprite = new PIXI.spine.Spine(SD[type]);
    this.sprite.scale.set(1/3);
    this.xo = this.sprite.width/2;
    this.yo = this.sprite.height/2;
    this.sprite.position.y += this.yo;
    this.text = new PIXI.Text(name || data[type].name, {fontSize: 24, fill: 0xffffff});
    this.text.position.set(-this.text.width/2, this.yo-this.text.height);
    this.rect = new PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.rect.width = this.xo*1.5;
    this.rect.height = 4;
    this.rect.tint = 0xf03e3e;
    this.rect.position.set(-this.xo*0.75, this.yo);
    this.container.addChild(this.sprite);
    this.container.addChild(this.text);
    this.container.addChild(this.rect);
    this.requestedAnimation = 0;
    this.id = id;
    this.type = type;
  }
  step(){
    this.x += this.xv;
    this.y += this.yv;
  }
  update(x, y, xv, yv, hp){
    this.container.position.set((this.x = x), (this.y = y));
    this.xv = xv;
    this.yv = yv;
    this.rect.width = Math.abs(1.5*this.xo*(this.hp = hp)/this.maxhp);
    if(this.xv < 0) this.sprite.scale.x = -1/3;
    if(this.xv > 0) this.sprite.scale.x = 1/3;
    this.requestedAnimation = data[this.type].action[(this.xv !== 0 || this.vy !== 0) ? 1 : 0];
    if(!this.sprite.state.tracks[0] || (this.sprite.state.tracks[0].animation.name !== this.requestedAnimation)){
      this.sprite.state.setAnimation(0, this.requestedAnimation, true);
      // console.log(this.requestedAnimation);
    }
  }
  destroy(stage){
    delete this.text;
    delete this.rect;
    stage.removeChild(this.container);
    this.container.destroy({children: true});
    delete this.sprite;
  }
}
