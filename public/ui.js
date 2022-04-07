
 class UI{
   constructor(player){
     this.player=player;
     this.pos=new p5.Vector(width-180,0);
   }

   update(player){
     this.player=player;

   }

   show(){   //not well organised
     fill(255,255,255,100);
     stroke(100);
     strokeWeight(5);
     rect(this.pos.x,this.pos.y,this.pos.x+100,this.pos.y+height/8);
     noStroke();
     fill(230);
     textSize(64);
     text(player.weapon.numBullets, this.pos.x+90, this.pos.y+height/16+20);

     imageMode(CENTER);
     image(particleImagesClone[player.weapon.particleType], this.pos.x+50, this.pos.y+48);
   }

 }
