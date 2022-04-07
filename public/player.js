var maxRad=100;
var playerSpeed=7;

class Player{
  constructor(pos, rad, col, rot, id){
    this.pos = pos;
    this.rad=rad;
    this.col=col;
    this.rot=rot;
    this.id=id;
    this.weapon=null;
    this.kills=0;
    this.fire=false;
  }


  show(name){
    if(name){
      strokeWeight(Math.log(this.rad)*2);
      stroke(this.col.levels[0], this.col.levels[1], this.col.levels[2], 255);
      //stroke(200);
      //fill(this.col.levels[0], this.col.levels[1], this.col.levels[2], 200);
      fill(this.col.levels[0], this.col.levels[1], this.col.levels[2], 200);
      ellipse(this.pos.x, this.pos.y, this.rad*2, this.rad*2);

      if(this.weapon){
        this.weapon.show(this);
      }

      fill(255);
      textSize(8*this.rad/50);
      noStroke();
      text(name, this.pos.x-this.rad, this.pos.y);
    }
    else{
      noStroke();
      fill(this.col);
      ellipse(this.pos.x, this.pos.y, this.rad*2, this.rad*2);
    }

  }

  useWeapon(weapon){
    this.weapon=new Weapon(this, weapon);
  }


  eat(enemy){
    return ((new p5.Vector.sub(enemy.pos, this.pos)).mag()<enemy.rad+this.rad);
  }

  eatPlayer(player){   // function realised cause theres a problem with enemy vector data passing to Vector.sub
    return ((new p5.Vector.sub(player.pos, this.pos)).mag()<player.rad+this.rad) && this.rad>player.rad;
  }

  grow(enemy){
    this.rad= sqrt((Math.pow(this.rad, 2)*Math.PI + (Math.pow(enemy.rad/2, 2)*Math.PI))/Math.PI); //newtwork error included
  }


  update(){
    let target = new p5.Vector(mouseX, mouseY);
    let steering = p5.Vector.sub(target, new p5.Vector(width/2, height/2));
    let xVec= new p5.Vector(1,0);
    this.rot= steering.angleBetween(xVec);
    steering.div(20);

    if(this.rad>maxRad){
      this.rad=maxRad;
    }

    if(steering.mag()>playerSpeed){
      steering.setMag(playerSpeed);
    }


    let nextPos= new p5.Vector.add(this.pos, steering.mult(60/frameRate()));

    if(nextPos.x<dimension && nextPos.y<dimension && nextPos.x>-dimension && nextPos.y>-dimension){
      this.pos=nextPos;
    }
  }

  interact(me, players){


    if(this.weapon){
      this.weapon.update(me, this, players);
    }
  }


}
