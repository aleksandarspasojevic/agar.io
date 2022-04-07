var particleSpan=600;

class Weapon extends Player{
  constructor(ob, type){
    super(ob.pos, ob.rad, ob.col, ob.rot);
    this.type=type;
    this.particles=[];
    this.rays=3;
    this.particleType=3;
    this.numBullets=30;
    this.len=0;
  }

  update(me, ob, others){
    this.rad=ob.rad;
    this.col=ob.col;
    this.rot=ob.rot;

    let rVec= new p5.Vector.fromAngle(-this.rot, this.rad);
    this.pos= p5.Vector.add(ob.pos, rVec);
    //ellipse(this.pos.x, this.pos.y, 50,50);

    for(let i=0;i<this.particles.length;i++){

      for(let j=0;j<others.length;j++){
        try{
          if(this.particles[i].intersects(others[j])){
            this.hit(others[j], this.particles[i].pos);

            if(others[j].id.substring()==me.id){
              this.hitMe(me);
            }
            this.particles.splice(i,1);
          }
        }
        catch{}

      }


      try{
        if(this.particles[i].lifetime()>particleSpan){
          this.particles.splice(i,1);
        }
        this.particles[i].update();
      }
      catch{}
    }

  }

  show(ob){
    push();
    translate(ob.pos.x, ob.pos.y);
    rotate(-ob.rot);

    switch (this.type) {
      case "triangular":
        triangle(ob.rad, ob.rad*0.3, ob.rad*1.5, 0, ob.rad, -ob.rad*0.3);   //triangle gun
        this.len=ob.rad*0.5;
        break;
      case "rectangular":
        rect(ob.rad, -ob.rad*0.3, ob.rad*0.4,ob.rad*2*0.3);  //rect gun
        this.len=ob.rad*0.4;
        break;
      case "top":
        rect(ob.rad, -ob.rad*0.3, ob.rad*2,ob.rad*2*0.3);  //rect gun
        this.len=ob.rad*2;
      break;
      default:

    }
    pop();

    for(let i=0;i<this.particles.length;i++){
        this.particles[i].show(this.particleType, this);
    }

  }

  shoot(){
    switch (this.rays) {
      case 1:
        this.particles.push(new Particle(this, particleSpan, this.rot));
      break;
      case 2:
        this.particles.push(new Particle(this, particleSpan, this.rot+PI/48));
        this.particles.push(new Particle(this, particleSpan, this.rot-PI/48));
      break;
      case 3:
        this.particles.push(new Particle(this, particleSpan, this.rot+PI/24));
        this.particles.push(new Particle(this, particleSpan, this.rot));
        this.particles.push(new Particle(this, particleSpan, this.rot-PI/24));
      break;
      default:

    }

    //console.log(this.particles.length);
  }

  hit(player, pos){
    console.log(player);
    //ellipse(player.pos.x, player.pos.y, 300,300);
    stroke(player.col);
    fill(255,255,255,100);
    //particleImages[1].resize(  Math.log(ob.rad)*bulletSize,  Math.log(ob.rad)*bulletSize);
    //image(particleImages[1], pos.x, pos.y);
    ellipse(pos.x, pos.y, player.rad,player.rad);
  }


  hitMe(me){      //me as a player
    me.rad-=3;
    if(me.rad<=3){
      destroyPlayer(me);
    }
  }

}
