// helper class for the sake of doing array collisions more efficiently, also I don't know what to call these, CartesianArray ? idk
class Array3DChunk {
  constructor(i, j){
    this.x = i;
    this.y = j;
    this.a = [];
    this.size = 0; // used when skipping already moved (newly added) elements
  }
  add(e){
    this.a.push(e);
    this.size ++;
  }
}
class Array3D {
  constructor(chunkSize, widthChunks, heightChunks){
    this.A1D = []; // Array 1D (iterable stuff)
    this.A3D = []; // Array 2D with 1D's
    this.chunkSize = chunkSize;
    this.width = widthChunks*chunkSize;
    this.height = heightChunks*chunkSize;
    this.widthChunks = widthChunks;
    this.heightChunks = heightChunks;
    for(let i = 0; i < widthChunks; i ++){
      this.A3D.push([]);
      for(let j = 0; j < heightChunks; j ++){
        this.A3D[i].push(new Array3DChunk(i, j));
      }
    }
  }
  chunkOf(e){ return this.A3D[Math.floor(e.x / this.chunkSize)][Math.floor(e.y / this.chunkSize)]; }
  arrayOf(e){ return chunkOf(e).a; }
  array(){ return this.A1D; }
  array3D(){ return this.A3D; }
  add(e){
    if(e.x === undefined || e.y === undefined) throw "no";
    this.A1D.push(e);
    chunkOf(e).add(e);
  }
  updateAll(){
    for(let i = 0; i < widthChunks; i ++){
      for(let j = 0; j < heightChunks; j ++){
        const chunk = this.A3D[i][j];
        for(let k = chunk.size-1; k >= 0; k --){
          const e = chunk.a[k];
          e.x = e.x < 0 ? 0 : e.x > this.width ? this.width : e.x;
          e.y = e.y < 0 ? 0 : e.y > this.height ? this.height : e.y;
          if(e.x < i*this.chunkSize || e.x >= (i+1)*this.chunkSize || e.y < j*this.chunkSize || e.y >= (j+1)*this.chunkSize){
            this.arrayOf(chunk).push(e);
            chunk.splice(k, 1);
            continue;
          }
        }
        chunk.size = chunk.a.length;
      }
    }
  }
  remove(e){
    if(e.x === undefined || e.y === undefined) throw "no";
    for(let i = 0; i < this.A1D.length; i ++){
      if(this.A1D[i] === e){
        const list = this.arrayOf(e);
        for(let j = 0; j < list.length; j ++){
          if(list[j] === e){
            list.splice(j, 1);
            this.A1D.splice(i, 1);
            return e;
          }
        }
        throw "element appeared in a1d but not a3d???";
      }
    }
    return null;
  }
}
module.exports = Array3D;
