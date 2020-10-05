const projectiles = [];
function draw(){
  if(dat.s === undefined) return;
  background(0);
  push();
  translate(width/2-dat.s.x, height/2-dat.s.y);
  const rd = 100; // reference dist (idk)
  const rx = Math.round(dat.s.x/rd)*rd; // reference x
  const ry = Math.round(dat.s.y/rd)*rd;

  push();
  stroke(255, 100);
  strokeWeight(3);
  for(let i = -10; i < 10; i ++){
    line(rx + rd*i, ry-1000, rx + rd*i, ry+1000);
    line(rx-1000, ry + rd*i, rx+1000, ry + rd*i);
  }
  pop();

  fill(255);
  text(dat.s.t, dat.s.x, dat.s.y-30);
  text(~~dat.s.x + "," + ~~dat.s.y, dat.s.x, dat.s.y-50);
  ellipse(dat.s.x, dat.s.y, 40, 40);
  if(dat.p){
    for(let i = 0; i < dat.p.length; i ++){
      const p = dat.p[i];
      fill(255);
      text(p.t, p.x, p.y-30);
      text(`(${~~p.x}, ${~~p.y})`, p.x, p.y-50);
      ellipse(p.x, p.y, 40, 40);
    }
  }
  if(dat.q){
    for(let i = 0; i < dat.q.length; i ++){
      const q = dat.q[i];
      if(q === null) continue;
      projectiles[i] = q;
      projectiles[i].f = frameCount;
      projectiles[i].dx = (q.x2-q.x)/q.t;
      projectiles[i].dy = (q.y2-q.y)/q.t;
    }
  }
  push();
  strokeWeight(5);
  for(let i = 0; i < projectiles.length; i ++){
    if(!projectiles[i]) continue;
    const q = projectiles[i];
    stroke(255,0,0);
    noFill();
    ellipse(q.x + q.dx*(frameCount-q.f), q.y + q.dy*(frameCount-q.f), 10, 10);
    line(q.x + q.dx*(frameCount-q.f), q.y + q.dy*(frameCount-q.f), q.x + q.dx*(frameCount-q.f-1), q.y + q.dy*(frameCount-q.f-1));
    noStroke();
    text(q.t, q.x + q.dx*(frameCount-q.f), q.y + q.dy*(frameCount-q.f) - 15);
    if(--q.t <= 0){
      console.log(projectiles.map(q=>!!q), i, removeFrom(projectiles, i));
      continue;
    }
  }
  pop();
  pop();
  resetMatrix();
}
function removeFrom(array, position){
  const v = array[position];
  array[position] = undefined;
  for(let i = array.length-1; i >= 0; i --){
    if(array[i]){
      array.splice(i + 1);
      return v;
    }
  }
  array.splice(0);
}
