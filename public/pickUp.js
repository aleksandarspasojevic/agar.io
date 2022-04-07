var ang=0;

class pickUp{
  constructor(pos, type, id){
    this.pos=pos;
    this.type=type;
    this.rad=50;
    this.id=id;
  }
  show(){
    imageMode(CENTER);
    push();
    translate(this.pos.x, this.pos.y);
    ang+=0.001;
    rotate(ang);
    image(particleImagesClone[this.type], 0,0);
    pop();

    //ellipse(this.pos.x, this.pos.y, 100,100);

  }
  activated(player){

    player.weapon.particleType=this.type;
    switch (this.type) {
      case 1:
        player.weapon.type='rectangular';
        player.weapon.numBullets=30;
      break;
      case 2:
        player.weapon.type='top';
        player.weapon.numBullets=25;
      break;
      default: player.weapon.type='triangular';
      player.weapon.numBullets=40;

    }

  }
}
