

var zoom=1;
var dimension=3000;
var startPos;
var data;
var enemies=[];
var enemiesInter=[];
var npcs = [];
var pickUps=[];
var playable=1;
var len=0;
var  particleImages=[10];
var particleImagesClone=[10];
var ui;


function preload(){
  for(let i=2;i<=5;i++){
    particleImages[i] = loadImage('assets/projectile'+i+'.png', img => particleImagesClone[i]= img.get());
  }

}

function setup(){
  //createCanvas(765, 735);
  createCanvas(1500, 735);
  for(let i=2;i<=5;i++){
    particleImagesClone[i].resize(100,100);
  }

  startPos= new p5.Vector(random(-dimension/2, dimension/2), random(-dimension/2, dimension/2));
  let col=color(random(255),random(255),random(255));
  var colSend={
    r: col.levels[0],
    g: col.levels[1],
    b: col.levels[2]
  }

  socket= io.connect('http://192.168.0.101:5000');
  socket.on('update', update);
  socket.on('heartBeat', drawPlayers);
  socket.on('destroy', destroyPlayer);

  player = new Player(startPos, 50, col, 0);
  player.useWeapon("triangular");

  data={
    pos: player.pos,
    rad: player.rad,
    col: colSend,
    rot: player.rot,
    fire: player.fire,
    weapon: player.weapon.type,
    particleType: player.weapon.particleType,
    kills: player.kills,
    numBullets: player.weapon.numBullets
  }
  socket.emit('initialization', data);
  setInterval(sendData, 33);
  //setInterval(frames, 150);

  ui= new UI(player);

  qtree = new QuadTree(new Rectangle(0,0,dimension,dimension), 8);
  npcQuadtree=new QuadTree(new Rectangle(0,0,dimension,dimension), 8);
  pickUpQuadtree=new QuadTree(new Rectangle(0,0,dimension,dimension), 8);
}


function draw(){
  if(playable){
    player.id=socket.id;
    background(40);

    push();
    translate(width/2, height/2);
    let newZoom=50/player.rad;
    zoom= lerp(zoom, newZoom, 0.05);
    scale(zoom);
    translate(-player.pos.x, -player.pos.y);


    let bulletPos;

    let rVec= new p5.Vector.fromAngle(-player.rot, maxRad/2);
    let pos=p5.Vector.add(rVec, player.pos);
    let range = new Rectangle(pos.x, pos.y, maxRad*1.5, maxRad*1.5);   //interaction zone
    let myArea = new Rectangle(player.pos.x, player.pos.y, player.rad+20,player.rad+20);   //interaction zone
    let bulletRange= new Rectangle(0,0,0,0);
    try{
      bulletPos=player.weapon.particles[1].pos;   //midele bullet
      bulletRange= new Rectangle(bulletPos.x, bulletPos.y, 300,300);
    }catch{}

    let npcsFound = npcQuadtree.query(myArea);

    for(let i=0;i<npcsFound.length;i++){
      if(player.eat(npcsFound[i])==1){
        player.grow(npcsFound[i]);
        destroyNpcToServer(npcsFound[i].id);
        npcs.splice(npcsFound[i].id, 1);
      }
    }

    let pickUpsFound = pickUpQuadtree.query(myArea);  //not using right now
    for(let i=0;i<pickUps.length;i++){
      if(player.eat(pickUps[i])==1){
        pickUps[i].activated(player);
        destroyPickUp(i);
        pickUps.splice(i, 1);
      }
    }

    let playersFound = qtree.query(range);
    for(let i=0;i<playersFound.length;i++){
      if(playersFound[i].id.substring()!=socket.id){
        if(player.eatPlayer(playersFound[i])){
          player.grow(playersFound[i]);
          destroyPlayerToServer(playersFound[i].id);
          enemies.splice(i,1);
        }
      }
    }

    let playersFound1 = qtree.query(bulletRange);
    player.interact(player, playersFound1);
    player.update();
    player.show(socket.id);


    for(let i=0;i<npcs.length;i++){
      npcs[i].show();
    }
    for(let i=0;i<pickUps.length;i++){
      pickUps[i].show();
    }

    for(let i=0;i<min(len, enemies.length);i++){
      if(enemies[i].id.substring()!=socket.id){
        enemiesInter[i].pos=p5.Vector.lerp(enemiesInter[i].pos, enemies[i].pos, 0.7);
        enemiesInter[i].interact(player, [player]);    // for now only me.. optimisation
        enemiesInter[i].show(enemiesInter[i].id);
      }
    }

    //developView(qtree,range, myArea, bulletRange, playersFound);
    pop();

    ui.update(player);
    ui.show();

  }
  else{
    background(0);
    textSize(64);
    fill(player.col);
    text("GAME OVER", 50,50);
  }

  delete range;
  delete playersFound;
}



function developView(qtree, range, myArea, bulletRange, playersFound){   //should be called at the end of the draw function
  show(qtree, range);
  stroke("pink");
  rect(range.x, range.y, range.w*2,range.h*2);
  rect(myArea.x, myArea.y, myArea.w*2,myArea.h*2);
  rect(bulletRange.x, bulletRange.y, bulletRange.w*2,bulletRange.h*2);

  for(let i=0;i<playersFound.length;i++){
    fill(255);
    ellipse(playersFound[i].pos.x, playersFound[i].pos.y, 10,10);
  }

}



function drawPlayers(data) {    //needs optimisation
  if(qtree){
    delete qtree;
  }
  qtree = new QuadTree(new Rectangle(0,0,dimension,dimension), 8);

  for(let i=0;i<min(enemies.length, data.length);i++){   //update existing enemies
    let pos= new p5.Vector(data[i].data.pos.x, data[i].data.pos.y);
    let col= color(data[i].data.col.r, data[i].data.col.g, data[i].data.col.b);
    enemies[i].pos=pos;
    enemies[i].rad=data[i].data.rad;
    enemies[i].col=col;
    enemies[i].rot=data[i].data.rot;
    enemies[i].id=data[i].id;
    enemies[i].fire=data[i].data.fire;
    if(enemies[i].weapon==null){
      enemies[i].useWeapon(data[i].data.weapon);
    }
    enemies[i].weapon.type=data[i].data.weapon;
    enemies[i].weapon.particleType=data[i].data.particleType;
    enemies[i].weapon.numBullets=data[i].data.numBullets;

    if(enemies[i].id.substring()!=socket.id ){
      let playerCopy=Object.assign({}, enemies[i]);
      qtree.insert(playerCopy);
      if(enemies[i].fire){
        enemies[i].weapon.shoot();
        //console.log(enemies[i].fire);
      }
    }
    else if(enemies[i].fire){
      player.fire=false;
    }
  }

  let cnt=0;
  while(enemies.length<data.length){   //add new enemies
    let pos= new p5.Vector(data[cnt].data.pos.x, data[cnt].data.pos.y);
    let col= color(data[cnt].data.col.r, data[cnt].data.col.g, data[cnt].data.col.b);
    enemies.push(new Player(pos, data[cnt].data.rad, col, data[cnt].data.rot, data[cnt].id));
    enemies[cnt].fire=data[cnt].data.fire;
    if(enemies[cnt].weapon==null){
      enemies[cnt].useWeapon(data[cnt].data.weapon);
    }
    enemies[cnt].weapon.type=data[cnt].data.weapon;
    enemies[cnt].weapon.particleType=data[cnt].data.particleType;
    enemies[cnt].weapon.numBullets=data[cnt].data.numBullets;

    if(enemies[cnt].id.substring()!=socket.id ){
      let playerCopy=Object.assign({}, enemies[cnt]);
      qtree.insert(playerCopy);
      if(enemies[cnt].fire){
        enemies[cnt].weapon.shoot();
        //console.log(enemies[i].fire);
      }
    }
    else if(enemies[cnt].fire){
      player.fire=false;
    }
    cnt++;
  }
  enemiesInter=enemies;
  //console.log(enemies.length);
  len=data.length;
}



function update(data) {    //update npcs and pickups
  if(npcs){
    delete npcs;
  }
  npcs=[];
  if(npcQuadtree){
    delete npcQuadtree;
  }
  npcQuadtree = new QuadTree(new Rectangle(0,0,dimension,dimension), 8);

  for(let i=0;i<data.npcs.length; i++){
    let pos= new p5.Vector(data.npcs[i].pos.x, data.npcs[i].pos.y);
    let col= color(data.npcs[i].col.r, data.npcs[i].col.g, data.npcs[i].col.b);
    npcs.push(new Player(pos, data.npcs[i].rad, col, 0, i));
    let npcCopy=Object.assign({}, npcs[i]);
    npcQuadtree.insert(npcCopy);
  }


  if(pickUps){
    delete pickUps;
  }
  pickUps=[];
  if(pickUpQuadtree){
    delete pickUpQuadtree;
  }
  pickUpQuadtree = new QuadTree(new Rectangle(0,0,dimension,dimension), 8);

  for(let i=0;i<data.pickUps.length; i++){
    let pos= new p5.Vector(data.pickUps[i].pos.x, data.pickUps[i].pos.y);
    pickUps.push(new pickUp(pos, data.pickUps[i].type,i));
    let pickUpCopy=Object.assign({}, pickUps[i]);
    pickUpQuadtree.insert(pickUpCopy);
  }
  //line below to random npcs generating from client side
  //npcs.push(new Player(new p5.Vector(random(-dimension,dimension), random(-dimension, dimension)), 10, color(255, 255, 255)));
  //console.log(npcs.length);
}


function destroyPlayer(data){
  if(socket.id.substring()==data.id){
      console.log('IM KILLED');
      playable=0;
  }
  destroyPlayerToServer(data.id);
}

function sendData() {
  data={
    pos: player.pos,
    rad: player.rad,
    rot: player.rot,
    fire: player.fire,
    weapon: player.weapon.type,
    particleType: player.weapon.particleType,
    kills: player.kills,
    numBullets: player.weapon.numBullets
  }
  socket.emit('data', data);
}


function destroyPlayerToServer(id){
  data={
    id: id
  }
  socket.emit('destroyPlayer', data);
}

function destroyPickUp(id){
  data={
    num: id
  }
  socket.emit('destroyPickUp', data);
}

function destroyNpcToServer(num){
  data={
    num: num
  }
  socket.emit('destroyNPC', data);
}

function keyPressed() {
  if (keyCode == 32) {   //TAB is32
    if(player.weapon.numBullets>0){
      console.log("BULETS LEFT: " + player.weapon.numBullets);
      player.weapon.shoot();
      player.fire=true;
      sendData();
      player.weapon.numBullets--;
    }

  }
}



function show(qtree, range) {
  noFill();
  strokeWeight(1);
  rectMode(CENTER);
  stroke(255, 41);
  if (range.intersects(qtree.boundary)) {
    stroke(255);
  }
  rect(qtree.boundary.x, qtree.boundary.y, qtree.boundary.w * 2, qtree.boundary.h * 2);

  stroke(255);
  strokeWeight(2);
  for (let p of qtree.points) {
    point(p.x, p.y);
  }

  if (qtree.divided) {
    show(qtree.northeast, range);
    show(qtree.northwest, range);
    show(qtree.southeast, range);
    show(qtree.southwest, range);
  }
}



function frames(){
  console.log(frameRate());
}
























/**
function setup() {
  // put setup code here
  createCanvas(500, 500);
  background(100);

  socket= io.connect('http://localhost:5000');
  socket.on('data', drawing);
}

function drawing(data){
  fill(255,0,0);
  noStroke();
  ellipse(data.x, data.y, 36,36);
}

function mouseDragged(){
  fill(255);
  noStroke();
  ellipse(mouseX, mouseY, 36,36);

  var data={
    x: mouseX,
    y: mouseY
  }

  socket.emit('data', data);
  console.log(data);

}

function draw() {
  // put drawing code here

}
**/
