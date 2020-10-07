const Application = PIXI.Application, Container = PIXI.Container, loader = PIXI.loader, resources = PIXI.loader.resources, TextureCache = PIXI.utils.TextureCache, Sprite = PIXI.Sprite;

const app = new Application({
  width: 1080,
  height: 720,
  antialiasing: true,
  transparent: false,
  resolution: 1
});

function loadSprite(path){
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
  p: []
};
(async function(){
  try {
    const alias = {
      "enemy_1002_nsabr": "e",
      "build_char_286_cast3": "p"
    };
    await Promise.all(["enemy_1002_nsabr", "build_char_286_cast3"].map(async path => SD[alias[path]] = await loadSprite(path)));
    console.log(SD);
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
  if(dat === undefined || dat.s === undefined) return;
  if(E.s === undefined) app.stage.addChild((E.s = new Entity(0, 0, 0, 0, 0, "p", dat.s.t)).container);
  app.stage.transform.position.set(app.renderer.width/2-dat.s.x, app.renderer.height/2-dat.s.y);
  E.s.update(dat.s.x, dat.s.y, dat.s.xv, dat.s.yv, dat.s.hp);
  for(let i = dat.p.length-1; i >= 0; i --){
    const p = dat.p[i];
    if(E.p[i] === undefined) app.stage.addChild((E.p[i] = new Entity(0, 0, 0, 0, 0, "p", p.t)).container);
    E.p[i].update(p.x, p.y, p.xv, p.yv, p.hp);
  }
}
