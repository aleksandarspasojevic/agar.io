var dimension=3000;
var players= [];
var numNPCs=200;
var numPickUps=20;

var express = require('express');
var app= express();
var server = app.listen(5000);
app.use(express.static('public'));

console.log("Server is running");

var socket = require('socket.io');
var io= socket(server);
io.sockets.on('connection', newConnection);

setInterval(heartBeat, 33);
setInterval(generateNPC, 500);
setInterval(generatePickUp, 5000);


var pickUps=[];
var npcs=[];
for(let i=0;i<numNPCs;i++){
  generateNPC();
}

for(let i=0;i<numPickUps;i++){
  generatePickUp();
}


function heartBeat() {

  if(players.length>0){
    io.sockets.emit('heartBeat', players);
  }
  let data={
    npcs:npcs,
    pickUps:pickUps
  }
  io.sockets.emit('update', data);
}

function generateNPC() {
  if(npcs.length<numNPCs){
    var npcData={
      pos: {x: Math.random()*2*dimension-dimension, y:Math.random()*2*dimension-dimension},
      rad: 20,
      col: {r: Math.random()*255, g: Math.random()*255, b: Math.random()*255}
    }
    npcs.push(npcData);
  }
  //console.log(npcs);
}


function generatePickUp(){
  if(pickUps.length<numPickUps){
    var pickUpData={
      pos: {x: Math.random()*2*dimension-dimension, y:Math.random()*2*dimension-dimension},
      type: Math.ceil(Math.random()*4+1)
    }
    pickUps.push(pickUpData);
  }
}

function newConnection(socket){
  socket.on('initialization', initial);
  socket.on('data', handleData);
  socket.on('destroyPlayer', destroyPlayer);
  socket.on('destroyNPC', destroyNPC);
  socket.on('destroyPickUp', destroyPickUp);

  function initial(initialData){
    console.log('New connection with id: '+socket.id);
    var data={
      id: socket.id,
      data: initialData
    }
    players.push(data);
  }

  function handleData(data){
    for(let i=0; i<players.length; i++){
      if(players[i].id.substring()==socket.id){
        players[i].data.pos=data.pos;
        players[i].data.rad=data.rad;
        players[i].data.rot=data.rot;
        players[i].data.fire=data.fire;
        players[i].data.weapon=data.weapon;
        players[i].data.kills=data.kills;
        players[i].data.particleType=data.particleType;
        players[i].data.numBullets=data.numBullets;
      }
    }
  }

  function destroyPlayer(data) {
    for(let i=0; i<players.length; i++){
      if(players[i].id.substring()==data.id){
        console.log('destroyed ' + data.id);
        let toSend={
          id: data.id
        }
        io.sockets.emit('destroy', toSend);
        players.splice(i,1);
      }
    }
  }

  function destroyNPC(data) {
    npcs.splice(data.num, 1);
  }
  function destroyPickUp(data) {
    pickUps.splice(data.num, 1);
  }

}
