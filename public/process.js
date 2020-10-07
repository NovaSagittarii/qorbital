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
  loop();
  // loop();
}
let dat = {};
function update(raw){
  dat = JSON.parse(raw);
  // console.log(dat);
}
let drawInterval;
function loop(){
  drawInterval = setInterval(draw, 1000/60);
}
function noLoop(){
  clearInterval(drawInterval);
}
