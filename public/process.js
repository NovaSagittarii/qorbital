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
function setup() {
  const sendable = "wasd";
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('display');
  // backgroundImage = loadImage('/assets/bkgd.jpg');
  // noCursor();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  // textFont(font);
  strokeCap(PROJECT);
  /*socket = io.connect('http://47.147.17.164:3000');
  socket.on('update', update);
  socket.on('setConfig', updateConfig);
  socket.emit('requestConfig', name);*/
  // cx = width >> 1;
  // cy = cy_c = height >> 1;
  // cy_a = height * 2/3;
  noLoop();
}
function keyPressed(){
  keys[keyCode] = true;
  updateState();
}
function keyReleased(){
  keys[keyCode] = false;
  updateState();
}
function mouseMoved(){
  updateState();
}
function mouseDragged(){
  updateState();
}
function mousePressed(){
  // idk you might have to assume some game states or something? idk man
  // console.log(mouseButton);
  mouseButtons[mouseButton==="left"?0:mouseButton==="middle"?1:2] = true;
  updateState();
}
function mouseReleased(){
  mouseButtons[mouseButton==="left"?0:mouseButton==="middle"?1:2] = false;
  updateState();
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
  loop();
}
let dat = {};
function update(raw){
  dat = JSON.parse(raw);
  // console.log(dat);
}
