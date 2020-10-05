
const Array3D = require('../modules/Array3D.js');
const Entity = require('../modules/Entity.js');

const a3d = new Array3D(10, 4, 4, true);

const P = new Entity(5, 5);
const Q = new Entity(15, 5);

a3d.add(P);
a3d.add(Q);
console.log(a3d.A3D.map(i => i.map(j => j.a.map(k => `${k.x},${k.y}`))));

P.x += 10;

a3d.updateAll();
console.log(a3d.A3D.map(i => i.map(j => j.a.map(k => `${k.x},${k.y}`))));

a3d.remove(P);

// console.log(a3d.A3D, P, Q);
