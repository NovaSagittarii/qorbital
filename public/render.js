const Application = PIXI.Application, Container = PIXI.Container, loader = PIXI.loader, resources = PIXI.loader.resources, TextureCache = PIXI.utils.TextureCache, Sprite = PIXI.Sprite;

const app = new Application({
  width: 1080,
  height: 720,
  antialiasing: true,
  transparent: false,
  resolution: 1
});

function loadSpineSprite(path){
  return new Promise((resolution, rej) => {
    try {
      const TD = new TextDecoder("utf-8");
      const loader = new PIXI.loaders.Loader("/assets/");
      loader.add(path+".skel", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
      loader.add(path+".png");
      loader.add(path+".atlas");
      loader.load((l, res) => {
        let rawSD;
        console.log(res);
        /*if(false) //TD.decode(res[path+".skel"].data).slice(2, 10) === "skeleton")
          rawSD = JSON.parse(TD.decode(res[path+".skel"].data));
        else*/ {
          const SB = new SkeletonBinary();
          SB.data = new Uint8Array(res[path+".skel"].data);
          SB.initJson();
          rawSD = SB.json;
        }
        const rawAD = res[path+".atlas"].data;
        const SAL = new PIXI.spine.core.AtlasAttachmentLoader(new PIXI.spine.core.TextureAtlas(rawAD, (line, callback) => callback(PIXI.BaseTexture.fromImage(line))));
        resolution(new PIXI.spine.core.SkeletonJson(SAL).readSkeletonData(rawSD));
      });
    } catch (err) {
      rej(err);
    }
  });
}

const SD = {};
const E = {
  E: [], // entities
  EO: {},
  P: [], // players
  PO: {},
  Q: [], // projectiles
  QO: {},
};
(async function(){
  try {
    const aliasSD = {
      "enemy_1002_nsabr": "e1",
      "enemy_1003_ncbow": "b1",
      "build_char_286_cast3": "p"
    };
    await Promise.all(Object.keys(aliasSD).map(async path => SD[aliasSD[path]] = await loadSpineSprite(path)));
    console.log(SD);
    const aliasE = {
      "trail_08.png": "t8"
    };
    const SpriteTextures = await new Promise(res => {
      const l = new PIXI.loaders.Loader("/assets/");
      Object.keys(aliasE).forEach(k => l.add(aliasE[k], k));
      l.load((l,r) => res(r));
    });
    console.log(SpriteTextures);
    Object.keys(SpriteTextures).forEach(k => SD[k] = SpriteTextures[k]);
    document.getElementById("start").removeAttribute("disabled");
    // app.stage.transform.scale.set(0.5, 0.5);
  } catch (e) { console.trace(e); }
})();
// app.stage.setTransform(100, 100);
/*
const spine = new PIXI.spine.Spine(SD);
spine.position.set(200,200);
spine.state.setAnimation(0, 'Move', true);
spine.scale.set(0.25, 0.25);
app.stage.addChild(spine);
*/

function draw(){
  if(DATA.S === undefined) return;
  app.stage.transform.position.set(app.renderer.width/2-DATA.S.x, app.renderer.height/2-DATA.S.y);
  for(let i = E.E.length-1; i >= 0; i --){
    const e = E.E[i];
    if(!e){E.E.splice(i, 1); continue;}
    const d = DATA.E[e.id];
    if(!d || d.f < f){
      e.destroy(app.stage);
      E.E.splice(i, 1);
      delete E.E[e.id];
      delete E.EO[e.id];
      continue;
    } else e.update(d.x, d.y, d.xv, d.yv, d.hp);
  }
  for(let i = E.P.length-1; i >= 0; i --){
    const e = E.P[i];
    if(!e){E.P.splice(i, 1); continue;}
    const d = DATA.P[e.id];
    if(!d || d.f < f){
      E.P.splice(i, 1)[0].destroy(app.stage);
      delete E.P[e.id];
      delete E.PO[e.id];
      continue;
    } else e.update(d.x, d.y, d.xv, d.yv, d.hp);
  }
  for(let i = E.Q.length-1; i >= 0; i --){
    const e = E.Q[i];
    if(!e){E.Q.splice(i, 1); continue;}
    const d = DATA.Q[e.id];
    if(!d || d.f < f){
      E.Q.splice(i, 1)[0].destroy(app.stage);
      delete E.Q[e.id];
      delete E.QO[e.id];
      continue;
    } else e.update(d.x, d.y, d.x2, d.y2);
  }
}
