
var bulletSpeed=20;
var bulletSize=10;

class Particle{
  constructor(weapon, span, ang){
    this.pos=weapon.pos;
    this.rot=weapon.rot;
    this.span=span;
    this.weapon=weapon;
    this.time=millis();
    this.ang=ang;
    let rVec= new p5.Vector.fromAngle(-this.rot, weapon.len);
    this.pos=new p5.Vector.add(rVec, this.pos);
    this.r=0;
  }

  show(type, ob){
    noStroke();
    //fill(255, 255, 255, 255*(1-this.lifetime()/this.span));
    imageMode(CENTER);
    particleImages[type].resize(  Math.log(ob.rad)*bulletSize,  Math.log(ob.rad)*bulletSize);

    push();
    translate(this.pos.x, this.pos.y);
    this.r+=0.1;
    rotate(this.r);
    image(particleImages[type], 0, 0);
    pop();
    //ellipse(this.pos.x, this.pos.y, Math.log(ob.rad)*bulletSize,Math.log(ob.rad)*bulletSize);
  }

  update(){
    let rVec= new p5.Vector.fromAngle(-this.ang, bulletSpeed);
    this.pos.add(rVec);
  }

  lifetime(){
    return millis()-this.time;
  }

  intersects(player){
    return p5.Vector.sub(this.pos,player.pos).mag()<bulletSize+player.rad;
  }


}
