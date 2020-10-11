// helper class for the sake of doing array collisions more efficiently, also I don't know what to call these, CartesianArray ? idk

class Array3DChunk {
  constructor(i, j){
    this.x = i;
    this.y = j;
    this.a = [];
    this.context = []; // the 8 chunks that surround the Array3DChunk, as well as itself
    this.size = 0; // used when skipping already moved (newly added) elements
  }
  add(e){
    this.a.push(e);
    this.size ++;
  }
  getContextElements(){
    const c = this.context;
    const o = []; // output
    for(let i = 0; i < c.length; i ++){
      const a = c[i].a;
      for(let j = 0; j < a.length; j ++){
        o.push(a[j]);
      }
    }
    return o;
  }
}
class Array3D {
  constructor(chunkSize, widthChunks, heightChunks, circular){
    if(widthChunks % 1) throw "non integer widthChunks";
    if(heightChunks % 1) throw "non integer heightChunks";
    this.A1D = []; // Array 1D (iterable stuff)
    this.A3D = []; // Array 2D with 1D's
    this.chunkSize = chunkSize;
    this.width = widthChunks*chunkSize;
    this.height = heightChunks*chunkSize;
    this.widthChunks = widthChunks;
    this.heightChunks = heightChunks;
    this.circular = !!circular; // does the array3d loop back on itself?
    for(let i = 0; i < widthChunks; i ++){
      this.A3D.push([]);
      for(let j = 0; j < heightChunks; j ++){
        this.A3D[i].push(new Array3DChunk(i, j));
      }
    }
    for(let i = 0; i < widthChunks; i ++){
      for(let j = 0; j < heightChunks; j ++){
        const c = this.A3D[i][j];
        for(let k = -1; k <= 1; k ++){
          for(let l = -1; l <= 1; l ++){
            if(this.circular) this.A3D[(i+k+widthChunks)%widthChunks][(j+l+heightChunks)%heightChunks].context.push(c);
            else if(i+k >= 0 && j+l >= 0 && i+k < widthChunks && j+l < heightChunks) this.A3D[i+k][j+l].context.push(c);
          }
        }
      }
    }
  }
  chunkFrom(x, y){ return this.A3D[x][y]; }
  chunkOf(e){ return this.A3D[Math.floor(e.x / this.chunkSize)][Math.floor(e.y / this.chunkSize)]; }
  arrayFrom(x, y){ return this.chunkFrom(x, y).a; }
  arrayOf(e){ return this.chunkOf(e).a; }
  withinBounds(e){ return this.x >= 0 && this.y >= 0 && this.x < this.width && this.y < this.height; }
  array(){ return this.A1D; }
  array3D(){ return this.A3D; }
  add(e){
    if(e.x === undefined || e.y === undefined) throw "no";
    e.x = Math.max(Math.min(e.x, this.width), 0);
    e.y = Math.max(Math.min(e.y, this.height), 0);
    this.A1D.push(e);
    this.chunkOf(e).add(e);
    /* this.A3D[0][0].add(e);
    this.update(e, this.A3D[0][0]); */
  }
  /* surrounds(e, size){
    if(e.x === undefined || e.y === undefined) throw "no";

  } */
  contextFrom(x, y){ return this.A3D[x][y].getContextElements(); }
  contextOf(e){ return this.chunkOf(e).getContextElements(); }
  nearbyElementsFrom(x, y, s){ return this.nearbyElementsOf(this.A3D[x][y], s); }
  nearbyElementsOf(e, s){
    if(s < 1 || (s|0) !== s) throw "Non whole number size";
    const output = [], i = e.x, j = e.y, widthChunks = this.widthChunks, heightChunks = this.heightChunks;
    for(let k = -s; k <= s; k ++){
      for(let l = -s; l <= s; l ++){
        if(this.circular) output.push(...this.A3D[(i+k+widthChunks)%widthChunks][(j+l+heightChunks)%heightChunks].a);
        else if(i+k >= 0 && j+l >= 0 && i+k < widthChunks && j+l < heightChunks) output.push(...this.A3D[i+k][j+l].a);
      }
    }
    return output;
  }
  forEachChunk(process){
    for(let i = 0; i < this.widthChunks; i ++)
      for(let j = 0; j < this.heightChunks; j ++)
        process(this.A3D[i][j]);
  }
  update(e, chunk, k){
    chunk = chunk || this.chunkOf(e);
    k = k || chunk.a.indexOf(e);
    if(this.circular){
      e.x = (e.x + this.width) % this.width;
      e.y = (e.y + this.height) % this.height;
    }else{
      e.x = e.x < 0 ? 0 : e.x > this.width ? this.width : e.x;
      e.y = e.y < 0 ? 0 : e.y > this.height ? this.height : e.y;
    }
    if(e.x < chunk.x*this.chunkSize || e.x >= (chunk.x+1)*this.chunkSize || e.y < chunk.y*this.chunkSize || e.y >= (chunk.y+1)*this.chunkSize){
      if(this.circular || this.withinBounds(e)) this.arrayOf(e).push(e);
      chunk.a.splice(k, 1);
      // console.log('\n'+this.A3D.map(i => i.map(j => j.a.length).join('')).join('\n'));
    }
    chunk.size = chunk.a.length;
  }
  updateAll(process, postUpdateProcess){
    for(let i = 0; i < this.widthChunks; i ++){
      for(let j = 0; j < this.heightChunks; j ++){
        const chunk = this.A3D[i][j];
        // console.log(chunk.a, i*this.chunkSize, (i+1)*this.chunkSize, j*this.chunkSize, (j+1)*this.chunkSize);
        for(let k = chunk.size-1; k >= 0; k --){
          const e = chunk.a[k];
          if(process) process(e, chunk); // process function is really useful for doing a3d[e] to a3d[e] interactions
          this.update(e, chunk, k);
          if(postUpdateProcess) postUpdateProcess(e, chunk); // deletion part
        }
        chunk.size = chunk.a.length;
      }
    }
  }
  remove(e){
    if(e.x === undefined || e.y === undefined) throw "no";
    // console.log(e.export(), this.width, this.height);
    for(let i = this.A1D.length-1; i >= 0; i --){
      if(this.A1D[i] === e){
        const chunk = this.chunkOf(e);
        const a = chunk.a;
        for(let j = a.length-1; j >= 0; j --){
          if(a[j] === e){
            -- chunk.size;
            a.splice(j, 1);
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
