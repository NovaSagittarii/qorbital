const FastTrig = require('../util/FastTrig.js');

const keys = [];
const mouseButtons = [];
const kb = {
  U: 87,
  D: 83,
  L: 65,
  R: 68,
  A: 16
};
const TWO_PI = Math.PI*2;
const b2rk = TWO_PI/255; // binary to radians constant
const b2rk16 = TWO_PI/65535;
const r2bk = 255/TWO_PI;
const r2bk16 = 65535/TWO_PI;
let socket;

let mouseX, mouseY, width, height;
function updateMouseCoordinates(mouseEvent){
  mouseX = mouseEvent.x;
  mouseY = mouseEvent.y;
  updateState();
}
function keyPressed(keyboardEvent){
  keys[keyboardEvent.keyCode] = true;
  updateState();
}
function keyReleased(keyboardEvent){
  keys[keyboardEvent.keyCode] = false;
  updateState();
}
// mouseDragged() and mouseMoved() go under 'mousemove' and simply call updateMouseCoordinates()
function mousePressed(mouseEvent){
  mouseButtons[mouseEvent.button] = true;
  updateMouseCoordinates(mouseEvent);
}
function mouseReleased(mouseEvent){
  mouseButtons[mouseEvent.button] = false;
  updateMouseCoordinates(mouseEvent);
}
function updateWindowDimensions(){
  width = window.innerWidth;
  height = window.innerHeight;
}
function updateState(){
  if(socket){
    const ab = new ArrayBuffer(3);
    const p16 = new Uint16Array(ab, 0, 1);
    p16[0] = ~~(Math.atan2(mouseY-height/2, mouseX-width/2)*r2bk16);
    const p8 = new Uint8Array(ab, 2, 1);
    p8[0] = keys[kb.U] << 0 | keys[kb.D] << 1 | keys[kb.L] << 2 | keys[kb.R] << 3 | keys[kb.A] << 4 | mouseButtons[0] << 5 | mouseButtons[1] << 6 | mouseButtons[2] << 7;
    socket.emit('input', ab);
  }
}

function joinGame(name) {
  socket = io({transports: ['websocket']});
  socket.on('update', update);
  // socket.on('updateS', updateStatic);
  // socket.on('name', nameAcknowledgement);
  // socket.on('nameList', setNameList);
  // socket.on('updateNameList', updateNameList);
  // socket.on('setConfig', updateConfig);
  socket.emit('requestConfig', name);
  updateWindowDimensions();

  document.getElementById("display").appendChild(app.view);
  window.addEventListener('mousedown', mousePressed);
  window.addEventListener('mouseup', mouseReleased);
  window.addEventListener('mousemove', updateMouseCoordinates);
  window.addEventListener('keydown', keyPressed);
  window.addEventListener('keyup', keyReleased);
  window.addEventListener('resize', updateWindowDimensions);
  // loop();
}
const DATA = {
  E: {}, // entity / enemies
  P: {}, // proj
  Q: {}, // players
  S: {}, // self
};
let f = 0; // "frames" of updates
function update(raw){
  f ++;
  raw = JSON.parse(raw);
  // i think some reduction can be done here... *probably?*
  for(let i = raw.e.length-1; i >= 0; i --){
    const e = raw.e[i];
    e.f = f;
    DATA.E[e.id] = e;
    if(!E.EO[e.id]){
      E.EO[e.id] = true; //                         id,   type, name, hp, x, y, xv, yv
      app.stage.addChild((E.E[E.E.length] = new Entity(e.id, "p")).container);
    }
  }
  for(let i = raw.p.length-1; i >= 0; i --){
    const p = raw.p[i];
    p.f = f;
    if(p.id === raw.s.id) DATA.S = p;
    DATA.P[p.id] = p;
    if(!E.PO[p.id]){
      E.PO[p.id] = true; //                            id,   type, name, hp, x, y, xv, yv
      app.stage.addChild((E.P[E.P.length] = new Entity(p.id, "e1")).container);
    }
  }
  for(let i = raw.q.length-1; i >= 0; i --){
    const q = raw.q[i];
    q.f = f;
    DATA.Q[q.id] = q;
    if(!E.QO[q.id]){
      E.QO[q.id] = true; //                                id,   type, x, y, xv, yv
      app.stage.addChild((E.Q[E.Q.length] = new Projectile(q.id, "t8")).sprite);
    }
  }
  draw();
}
let drawInterval;
function loop(){
  drawInterval = setInterval(draw, 1000/60);
}
function noLoop(){
  clearInterval(drawInterval);
}
