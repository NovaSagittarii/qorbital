const data = {
  p: {
    maxhp: 100,
    name: "unnamed player",
    action: ["Relax", "Move", "Interact"]
  },
  e: {
    maxhp: 1000,
    name: "test",
    action: ["Idle", "Run_Loop", "Attack"]
  }
};
class Entity {
  constructor(x, y, xv, yv, hp, type, name){
    if(!SD[type] || !data[type]) throw "Invalid Entity type";
    this.x = x;
    this.y = y;
    this.xv = xv;
    this.yv = yv;
    this.hp = hp;
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
    this.rect.width = 1.5*this.xo*(this.hp = hp)/this.maxhp;
    if(this.xv < 0) this.sprite.scale.x = -1/3;
    if(this.xv > 0) this.sprite.scale.x = 1/3;
    if(this.xv !== 0 || this.yv !== 0) this.requestedAnimation = data[this.type].action[1];
    else this.requestedAnimation = data[this.type].action[0];
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
