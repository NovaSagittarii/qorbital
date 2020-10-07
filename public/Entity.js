const data = {
  p: {
    maxhp: 100,
    name: "unnamed player"
  },
  e: {
    maxhp: 100,
    name: "test"
  }
};
class Entity {
  constructor(x, y, xv, yv, hp, type, name){
    if(!SD[type] || !data[type]) throw "no";
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
    this.text = new PIXI.Text(name || data[type].name, {fontSize: 24, fill: 0xffffff});
    this.text.position.set(-this.text.width/2, -this.text.height);
    this.rect = new PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.rect.width = this.xo*2;
    this.rect.height = this.xo/20;
    this.rect.tint = 0xf03e3e;
    this.rect.position.set(-this.xo, 0);
    this.container.addChild(this.sprite);
    this.container.addChild(this.text);
    this.container.addChild(this.rect);
    this.requestedAnimation = "";
  }
  step(){
    this.x += this.xv;
    this.y += this.yv;
  }
  update(x, y, xv, yv, hp){
    this.container.position.set((this.x = x), (this.y = y));
    this.xv = xv;
    this.yv = yv;
    this.rect.width = 2*this.xo*(this.hp = hp)/this.maxhp;
    if(this.xv < 0) this.sprite.scale.x = -1/3;
    if(this.xv > 0) this.sprite.scale.x = 1/3;
    if(this.xv !== 0 || this.yv !== 0) this.requestedAnimation = "Move";
    else this.requestedAnimation = "Relax";
    if(!this.sprite.state.tracks[0] || (this.sprite.state.tracks[0].animation.name !== this.requestedAnimation)){
      this.sprite.state.setAnimation(0, this.requestedAnimation, true);
      // console.log(this.requestedAnimation);
    }
  }
  destroy(){
    delete this.text;
    delete this.rect;
    this.sprite.destroy({children: true, texture: true, baseTexture: true});
    delete this.sprite;
  }
}
