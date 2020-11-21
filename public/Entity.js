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
  constructor(id, type, name, hp, x, y, xv, yv, state){
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
    this.requestedAnimationState = 0;
    this.animationState = -1;
    this.animationStateLock = false;
    this.sprite.state.setEmptyAnimation(0);
    this.id = id;
    this.state = state || 0;
    this.type = type;
  }
  step(){
    this.x += this.xv;
    this.y += this.yv;
  }
  update(x, y, xv, yv, hp, s){
    this.container.position.set((this.x = x), (this.y = y));
    this.xv = xv;
    this.yv = yv;
    this.state = s;
    this.rect.width = Math.abs(1.5*this.xo*(this.hp = hp)/this.maxhp);
    if(this.xv < 0) this.sprite.scale.x = -1/3;
    if(this.xv > 0) this.sprite.scale.x = 1/3;
    this.updateAnimationState();
  }
  updateAnimationState(){
    const state = this.sprite.state;
    if(this.state & 1) this.requestedAnimationState = 2;
    else if(this.xv !== 0 || this.yv !== 0) this.requestedAnimationState = 1;
    else this.requestedAnimationState = 0;
    if(!this.animationStateLock && this.requestedAnimationState !== this.animationState){
      // console.log(this, this.requestedAnimationState);
      switch(this.requestedAnimationState){
        case 0: // idle
          state.setAnimation(0, data[this.type].action[0], true).mixDuration = 0.2;
          break;
        case 1: // move
          state.setAnimation(0, data[this.type].action[1], true).mixDuration = 0.2;
          break;
        case 2: // atk
          this.animationStateLock = true; // can use track1 + alpha for mixed movement+attack?
          /* TODO: note some have transition states */
          //const t = state.setAnimation(0, data[this.type].action[2], true);
          const t = state.setAnimation(1, data[this.type].action[2], true); t.alpha = 0.5;
          t.mixDuration = 0.2;
          t.listener = {
            complete: () => {
              if(!(this.state & 1)){
                state.clearTrack(1);
                this.animationStateLock = false;
                this.updateAnimationState();
              }
            }
          };
          break;
      }
      this.animationState = this.requestedAnimationState;
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
