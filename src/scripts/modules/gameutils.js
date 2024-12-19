"use strict";
/* bundles some utility operations*/
window.gm.getSaveVersion= function(){return([0,0,1,0]);};
// reimplement to setup the game
let _origInitGame = window.gm.initGame;
window.gm.initGame= function(forceReset,NGP=null) {
  _origInitGame(forceReset,NGP);
  window.gm.images = imagesBattlers(window.gm.images||{});
  window.gm.images = imagesMaps(window.gm.images);
  window.gm.images = imagesEquip(window.gm.images);
  window.gm.images = imagesIcons(window.gm.images);
  window.gm.images = imagesScenes(window.gm.images);
  window.gm.images = imagesItems(window.gm.images);
    var s = window.story.state;
    s._gm.timeRL= s._gm.timeVR = s._gm.time;
    s._gm.dayRL= s._gm.dayVR = s._gm.day;
    //TODO set debug to 0 for distribution !
    s._gm.debug = 1,   
    s._gm.dbgShowCombatRoll= true,
    s._gm.dbgShowQuestInfo= true;
    s._gm.dbgShowMoreInfo=true;
    if (!s.vars||forceReset) { // storage of variables that doesnt fit player
        s.vars = {
        inVR: false,
        spawnAt: 'ForestRespawnPodExit',
        playerPartyVR:[],
        playerPartyRL:[]
        }; 
    }
    if (!window.gm.achievements||forceReset) {  //outside of window.story !
      window.gm.achievements= {
        looseEnd: false //add your flags here
      }
      window.storage.loadAchivementsFromBrowser();
    }
    if (!s.City||forceReset) {
      s.City = {  //things you own
        Facilities: [window.gm.LibFacilities.Mansion()],
        Workspaces: [window.gm.LibWorkspace.Rest_Mansion(),
          window.gm.LibWorkspace.Maid_Mansion(),window.gm.LibWorkspace.Maid_Inn(),
          window.gm.LibWorkspace.Scavenger_Hills(),
          window.gm.LibWorkspace.Farmer_Farm(),window.gm.LibWorkspace.Smith_Mansion()],
        People: [],
        Slaves:[],
        Resources:{}
      };
      window.gm.addResource(s.City.Resources,'Iron',5);
      s.Known={};
      s.Known.Scout=null; //initial job-knowledge
      //initial Area-knowledge
      s.Map={},s.Map.Crashsite=window.gm.ExploreLib["AreaCrashsite"](); 
      s.Events=[];  //stack of events to run on next tick
      s.Schedule=new JobSchedule();
    }
    if (!s.Lydia||forceReset) {
      let ch = new Lydia()
      s.Lydia = ch;
    }
    if (!s.Trent||forceReset) {
      let ch = new Trent()
      s.Trent = ch;
    }
    if (!s.PlayerVR||forceReset) {  
      let ch = new Operator();
      ch.id="PlayerVR";
      ch.name="Zeph";
      ch.faction="Player";
      //body
      ch.Outfit.addItem(new BaseHumanoid());
      ch.Outfit.addItem(new SkinHuman());
      ch.Outfit.addItem(new FaceHuman());
      ch.Outfit.addItem(HandsHuman.factory('human'));
      ch.Outfit.addItem(AnusHuman.factory('human'));
      ch.Outfit.addItem(PenisHuman.factory('human'));
      s.PlayerVR=ch;
    }
    if (!s.PlayerRL||forceReset) {  
        s.PlayerRL=s.PlayerVR;  //Todo remove
    } 
    
    window.gm.initGameFlags(forceReset,NGP);
    window.gm.switchPlayer("PlayerRL");
    //take over flags for newgameplus
    if(NGP) { window.story.state.vars.crowBarLeft = NGP.crowBarLeft; }
    NGP=null; //release memory
}
window.gm.initGameFlags = function(forceReset,NGP=null) {
  let s= window.story.state;
  if (forceReset) {  
    s.PrcEvent=null; 
  }
  let PrcEvent={};
  //see comment in rebuildFromSave why this is done
  s.PrcEvent=window.gm.util.mergePlainObject(PrcEvent,s.PrcEvent);
  //todo cleanout obsolete data ( filtering those not defined in template) 
}

// update non-class-objects of previous savegame
let _origRebuildObjects = window.gm.rebuildObjects;
window.gm.rebuildObjects= function(){ 
  var s = window.story.state;
  _origRebuildObjects();
  window.gm.initGameFlags(false,null);
}
// lookup function for sidebar icon
window.gm.getSidebarPic = function(){ //todo display doll ??
  if(window.story.state.vars.inVR) {
    return("assets/icons/icon_swordspade.svg");
  }
  return('assets/icons/icon_cityskyline.svg');
}
// lookup function for scene background ( 640x300 )
window.gm.getScenePic = function(id){
  if(id==='Garden' || id ==='Park')   return('assets/bg/bg_park.png');
  if(id==='Bedroom' || id==='Your Bedroom')   return('assets/bg/bg_bedroom.png');
  if(id.slice(0,7)==='AM_Lv2_') return('assets/bg/bg_dungeon_2.png');
  return('assets/bg_park.png')//return('assets/bg/bg_VR_1.png');//todo placehodler
}

/////////////////////////////////////////////
window.gm.enterVR=function() {
  let s= window.story.state;
  if(s.vars.inVR) return;
  s.vars.playerPartyRL = s._gm.playerParty;
  s._gm.playerParty = s.vars.playerPartyVR;
  window.gm.switchPlayer("PlayerVR");
  s.vars.inVR =true;
  //time in VR is paused when in RL
  s._gm.timeRL = s._gm.time,s._gm.dayRL = s._gm.day;
  s._gm.time = s._gm.timeVR,s._gm.day = s._gm.dayVR;
  window.gm.addTime(0);
  window.gm.respawn({keepInventory:true});
}
window.gm.leaveVR=function() {
  //todo update effects in VR but stop RL effects
  let s= window.story.state;
  if(!s.vars.inVR) return;
  s.vars.playerPartyVR = s._gm.playerParty;
  s._gm.playerParty = s.vars.playerPartyRL;
  window.gm.switchPlayer("PlayerRL");
  s.vars.inVR =false;
  //while in VR time in RL is paused but advances 1h on leave??
  s._gm.timeVR = s._gm.time,s._gm.dayVR = s._gm.day;
  s._gm.time = s._gm.timeRL,s._gm.day = s._gm.dayRL;
  window.gm.addTime(60);
  //todo copy fetish-stats back to RLPlayer ?
}

//call this after onVictory/onFlee-scene to continue in dng or other location
//this function is also used to restore after loading save !
window.gm.postVictory=function() {
  let reloadDng = (window.gm.dng===null);
  if(window.story.state.dng.id!=="") {
    if(reloadDng) window.gm.dng = window.gm.dngs[window.story.state.dng.id]();
    var floor = window.gm.dng.getFloor(window.story.state.dng.floorId);
    var room = floor.getRoom(window.story.state.dng.roomId);
    if(reloadDng) window.gm.dng.enterDungeon();//first call enterdungeon to setup everything !
    window.gm.dng.teleport(room);
  } else {
    window.story.show(window.gm.player.location);//history disabled ! window.story.history[window.story.history.length - 1], true);   
  }
}
//call this after your onDefeat/onSubmit-scene to respawn at respawn-point; cleansup dng-variables
window.gm.postDefeat=function() { 
  window.story.state.dng.id="";
  window.gm.dng = null;
  window.gm.respawn();
}
//after passing out: heal player and remove inventory {keepInventory=false,location=''}
window.gm.respawn=function(conf={keepInventory:false}) {
  window.gm.player.Stats.increment("energy",9999);
  window.gm.player.Stats.increment("will",9999);
  window.gm.player.Stats.increment("health",9999);
  if(!conf.keepInventory) { //remove inentory and outfit that is not questitem, cursed or permanent
    for(let i =window.gm.player.Outfit.list.length-1;i>=0;i-=1) {
      let el = window.gm.player.Outfit.list[i];
      if(el.item && el.item.lossOnRespawn ) window.gm.player.Outfit.removeItem(el.id,true);
    }
    for(let i =window.gm.player.Wardrobe.list.length-1;i>=0;i-=1) {
      let el = window.gm.player.Wardrobe.list[0];
      if(el.item.lossOnRespawn ) window.gm.player.Wardrobe.removeItem(el.id,el.count);
    }
    for(let i =window.gm.player.Inv.list.length-1;i>=0;i-=1){
      let el = window.gm.player.Inv.list[i];
      if(el.item.lossOnRespawn ) window.gm.player.Inv.removeItem(el.id,el.count);
    }
  }
  /*if(window.gm.quests.getMilestoneState("qDiedAgain").id===2) {
    window.story.show('YouDiedOnce'); 
  } else if([100,200,300].includes(window.gm.quests.getMilestoneState("qBondageKink").id)){
      window.story.show('YouDiedWithCursedGear');
  } else {*/
    let robes = new window.storage.constructors['RobesZealot']();
    window.gm.makeCursedItem(robes,{minItems:2,convert:'HarnessRubber'});
    window.gm.player.Wardrobe.addItem(robes);
    window.gm.player.Outfit.addItem(robes);
    robes = new window.storage.constructors['Briefs']();
    window.gm.player.Wardrobe.addItem(robes);
    window.gm.player.Outfit.addItem(robes);
    let staff = new window.storage.constructors['StaffWodden']();
    window.gm.player.Inv.addItem(staff);
    window.gm.player.Outfit.addItem(staff);
    window.story.show(window.story.state.vars.spawnAt);
  //}
};
//sets current player location and advances time
//call this in passage header
window.gm.moveHere = function(time=15){
  if(window.gm.player.location!==window.passage.name) {
    window.gm.player.location=window.passage.name;
    var s=window.story.state.vars;
    switch(window.passage.name){ //when crossing a certain point, set spawnpoint
      case 'ForestBorder': 
        s.spawnAt = 'ForestRespawnPodExit'; 
        break;
      case 'VillageMarketPlace': 
        s.spawnAt = 'VillageRespawnPodExit'; 
        break;
      case 'AM_Lv2_Start':
        s.spawnAt ='AM_Lv2_Start';
        break;
      default:break;
    }
    window.gm.addTime(time); 
  }
};
/* used for the dungeons ..state.DngSY.dng. Creates links for adjoined tiles by adding the following code in passage: 
* <%=window.gm.printNav('go west','west')%> OR <%=window.gm.printNav()%> for all directions
* creates link for ('enter door', 'north'):  [[enter door| MN_Lv3_F2]]  - assuming you are in tile MN_Lv3_F3 in MN_Lv3 
* only creates the link if the passage with this name exist and the direction in the dngMap is specified 
*/
window.gm.printNav=function(label,dir){
  if(!label && !dir) {
    return('</br><p>'+window.gm.printNav('Go north','north')+'</br>'+
    window.gm.printNav('Go west','west')+' '+window.gm.printNav('Go east','east')+'</br>'+
    window.gm.printNav('Go south','south')+'</br></p>');
  }
  let here = window.passage.name.replace(window.story.state.DngSY.dng+'_','');
  let to,k,i=0;
  const X=['A','B','C','D','E','F','G','H','I','J','K','L','M','N'],Y=['0','1','2','3','4','5','6','7','8','9'];
  switch(dir) {
    case 'north':
      i=Y.findIndex((el)=>{return(el===here[1]);});
      if(i<0||i<=0) return('');
      to = here[0]+Y[i-1];
      break;
    case 'south':
      i=Y.findIndex((el)=>{return(el===here[1]);});
      if(i<0||i>=Y.length-1) return('');
      to = here[0]+Y[i+1];
      break;
    case 'east':
      i=X.findIndex((el)=>{return(el===here[0]);});
      if(i<0||i>=X.length-1) return('');
      to = X[i+1]+here[1];
      break;
    case 'west':
      i=X.findIndex((el)=>{return(el===here[0]);});
      if(i<0||i<=0) return('');
      to = X[i-1]+here[1];
      break;
    default: return('');
  }
  let grid=window.story.state.DngSY.dngMap.grid,found=false;
  for(i=grid.length-1;i>=0;i--){
    if(grid[i].room===here){
      for(k=grid[i].dirs.length-1;k>=0;k--){
        if(grid[i].dirs[k]===to) {found=true;break;}
      }
      if(found) break;
    }
  }
  if(!found) return(''); //no dir
  to=window.story.state.DngSY.dng+'_'+to;
  if(!window.story.passage(to)) return(''); //no passage
  return(window.gm.printPassageLink(label,to));
};
window.gm.rollExploreCity= function() {
  let s=window.story.state;
  let places=[];   
  let r = _.random(0,100);
  //todo:depending of your actual location you have a chance to find connected locations or end up in a known one
  if(window.gm.player.location=='Park')   places = ['Mall','Beach','Downtown'];
  if(window.gm.player.location=='Mall')   places = ['Park','Beach','Downtown']; 
  if(window.gm.player.location=='Beach')   places = ['Park','Mall']; 
  if(window.gm.player.location=='Downtown')   {
    places.push('Pawn shop'); 
  }
  if(places.length==0) places = [window.gm.player.location]; //fallback if unspeced location
  r = _.random(1, places.length)-1; //chances are equal
  window.gm.addTime(20);
  window.story.show(places[r]);
};
window.gm.giveCyrilFood= function(){
    if(window.gm.player.Inv.countItem('SimpleFood')>0) {
        var res=window.gm.player.Inv.use('SimpleFood', window.story.state.Cyril);
        window.gm.printOutput(res.msg);
    } else {
        window.gm.printOutput("you have no food to spare");
    }
};
/*
* prints a (svg-) map  
*/
window.gm.printMap=function(MapName,playerTile,reveal,visitedTiles) {
  var width=600,height=300;
  var draw = document.querySelector("#canvas svg");
  if(!draw) draw = SVG().addTo('#canvas').size(width, height);
  else draw = SVG(draw);//recover svg document instead appending new one
  draw.rect(width, height).attr({ fill: '#303030'});
  var node = SVG(window.gm.images[MapName]());
  if(playerTile!=='' && visitedTiles.indexOf(playerTile)<0) {
    visitedTiles.push(playerTile);
  }
  //node.find("#AM_Lv2_A1")[0].addClass('roomNotFound');
  var _n,el,list= node.find('[data-reveal]');
  for(el of list) {
    var x= parseInt(el.attr('data-reveal'),16);
    if((x&reveal)===0) el.addClass('roomNotFound');
  }
  for(el of visitedTiles) {
    if(el===playerTile) continue;
    _n= node.find('#'+el)[0];
    if(_n) {_n.removeClass('roomFound');_n.addClass('roomVisited');}
  }
  _n= node.find('#'+playerTile)[0];
  if(_n) {_n.removeClass('roomFound');_n.addClass('playerPosition');}
  node.addTo(draw);
}
/* 
* constructs map from template and dng-data
*/
window.gm.printMap2=function(dng,playerTile,reveal,visitedTiles) {
  var step=32, width=step*(dng.width||12),height=step*(dng.height||8);
  const X=['A','B','C','D','E','F','G','H','I','J','K','L','M','N'],Y=['0','1','2','3','4','5','6','7','8','9'];
  function nameToXY(name) {
    let i,pos={x:0,y:0};
    i=Y.findIndex((el)=>{return(el===name[1]);});
    pos.y=i*step;//if(i<0||i>=Y.length-1) return('');
    i=X.findIndex((el)=>{return(el===name[0]);});
    pos.x=i*step;//if(i<0||i>=Y.length-1) return('');
    return(pos);
  }  
  function addAnno(){
    const dx2= [6,6,-6,-6], dy2=[0,10,10,0]; //
    for(k=room.anno?room.anno.length-1:-1;k>=0;k--){//add up to 4 annotation-letters
      if(k>3) continue;
      
      lRoom.text(function(add) {add.tspan(room.anno[k])}).addClass('textLabel').ax(_rA.cx()+ox+dx2[k]).ay(_rA.cy()+oy+dy2[k]);
    }
  }
  var draw = document.querySelector("#canvas svg");
  if(!draw) draw = SVG().addTo('#canvas').size(width, height);
  else draw = SVG(draw);//recover svg document instead appending new one
  draw.rect(width, height).attr({ fill: '#303030'});
  var node = SVG(window.gm.images['template3']()); //get the source-svg
  node.size(width,height);
  var lRoom=node.find('#layer1')[0]; //fetch a layergroup by id to add to
  var lPath=node.find('#layer2')[0]; 
  var tmpl = node.find('#tmplRoom')[0];
  var ox= tmpl.cx(),oy=tmpl.cy(); //offset tmpl
  if(playerTile!=='' && visitedTiles.indexOf(playerTile)<0) {
    visitedTiles.push(playerTile);
  }
  let _rA,i,k,xy,room,dir;
  let xyB,dx,dy;
  for(i=dng.grid.length-1;i>=0;i--) {// foreach room create room
    room=dng.grid[i];
    xy=nameToXY(room.room);
    _rA=lRoom.use('tmplRoom').attr({id:room.room}).move(xy.x, xy.y);
    if(visitedTiles.indexOf(room.room)<0) {
      if(reveal.indexOf(room.room)<0){_rA.addClass('roomNotFound');}
      else {_rA.addClass('roomFound'); addAnno();}
    }else {
      if(room.room===playerTile) {_rA.removeClass('roomFound').addClass('playerPosition');} else _rA.addClass('roomVisited');
      addAnno();
      for(k=room.dirs.length-1;k>=0;k--) {//foreach direction create path to next room
        dir=room.dirs[k];
        xyB=nameToXY(dir); dx=xyB.x-xy.x,dy=xyB.y-xy.y;
        lPath.polyline([[_rA.cx()+ox,_rA.cy()+oy],[_rA.cx()+ox+dx/2,_rA.cy()+oy+dy/2]]).addClass('pathFound');//.insertBefore(_rA)
      }
    }
  }
  node.text(function(add) {add.tspan(dng.legend||'')}).addClass('textLabel').ax(0).ay(0);
  node.addTo(draw);
}
//display svg
window.gm.printSceneGraphic2=function(background,item) {
  var width=600,height=300;
  var draw = document.querySelector("#canvas svg");
  if(!draw) draw = SVG().addTo('#canvas').size(width, height);
  else draw = SVG(draw);//recover svg document instead appending new one
  var background = draw.rect(width, height).attr({ fill: '#303030'});
  draw.image(background);
  var node = SVG(item);
  if(node) node.addTo(draw);
}
//for debug: builds link-list to display svg
window.gm.listImages = function(){
  let list = Object.keys(window.gm.images);
  let g,entry = document.createElement('p');
  entry.textContent ="";
  for(let el of list) {
    if(el==='strToBuf'||el==='cache') continue;
    g = document.createElement('a');
    g.href='javascript:void(0)',g.textContent=el;
    const x = window.gm.images[el]();
    g.addEventListener("click",window.gm.printSceneGraphic2.bind(this,"",x));
    entry.appendChild(g);entry.appendChild(document.createTextNode(' '));//add \s or no automatic linebreak
  };
  $("div#choice")[0].appendChild(entry);      // <- requires this node in html
}
/*
* ReactTest = a box is moing repeatedly left-right-left and the user has to click on it to 
* stop it inside a hit area (success if center of moving box is inside one hit-area)
*
* call this setup-function once and use the returned start & click function for game input
* bar is the id of the moving element-node; example:
* <div style='height:1em; width: 100%;'><div id='bar' style="position:relative; width:5%; height:100%; background-color:green;"></div></div>
* 
* you might provide callbacks for start & stop, stop will get area-index on success or -1 on fail
* speed is ms for one movement of the box from left to right 
* area is a list of non-overlapping hit-areas like [{a:5,b:10, color:'orange'}]; 
*/
window.gm.startReactTest=function(bar, speed, stopCB, startCB,areas) {
  /**
   * starts the game
   */
  function start() { //todo instead left-right also up-down should be possible
    ///////////////svg test ////////////////////
    var draw = SVG().addTo('#canvas').size(300, 300);
    var rect = draw.rect(100, 100).attr({ fill: '#f06' })

    ///////////////////////////////////////////////////
    data.stop();
    data.value=0,data.run=true;
    data.bargraph.style.left = data.value+'%'; //dont start in between; speed would be slowed down to maintain transition time
    var width =window.getComputedStyle(data.bargraph).getPropertyValue('width');
    var total = window.getComputedStyle(data.bargraph.parentNode).getPropertyValue('width');
    //calculate barsize relative to total width (necessary if windowsize changed in between )
    data.barsize=100*parseFloat(width.split('px'))/parseFloat(total.split('px')); 
    data.bargraph.style.transition = "left "+data.speed+"ms linear"; //configure transition for animation
    if(data.startCB) data.startCB(); //called before transition-start!
    data.bargraph.ontransitionend(); //start transition
  }
  /**
   * this stops the game and returns the index of hit area; use click() instead !
   */
  function stop() {
    var computedStyle = window.getComputedStyle(data.bargraph);
    var left = computedStyle.getPropertyValue('left');
    data.bargraph.style.left=left;
    data.bargraph.style.transition = null; // disable transition AFTER fetching computed value !
    var total = window.getComputedStyle(data.bargraph.parentNode).getPropertyValue('width');
    left =parseFloat(left.split('px')),total=parseFloat(total.split('px'));
    left = 100*left/total+data.barsize/2;
    var res =-1; //detect if area was hit or not
    for(var i=data.areas.length-1; i>=0;i--) {
      if(data.areas[i].a<=left && left<=data.areas[i].b) res=i; 
    }
    data.run=false;
    return(res);
  }
  /**
   * this can be bound to eventhandler for user input detection to trigger stop and will call stop-CB
   */
  function click() {
    var run = data.run;
    var res = data.stop();
    if(run && data.stopCB) data.stopCB(res);
  }
  let data ={ //internal state of game
    bargraph : document.getElementById(bar),
    run:false, //game started?
    value: 0, //actual setpoint in%
    barsize: 5, //width of hitbox relative to total width in %
    areas:areas,  //list of areas to hit in %;
    speed:speed, //transition time in ms
    stopCB: stopCB, //callback after user trigger 
    startCB: startCB, //callback after start
    start: start, //ref to start-function
    stop: stop, //ref to stop-func
    click: click //ref to click-func
  }
  let gradient=''; 
  for(el of data.areas) { //todo need to sort from left to right
    gradient += '#80808000 0 '+el.a+'%, '+el.color+' '+el.a+'%,'+el.color+' '+el.b+'%,#80808000 '+el.b+'%,';
  }
  data.bargraph.parentNode.style.backgroundImage='linear-gradient(to right,'+gradient.slice(0,-1)+')';
  /**
   * instead of using timers rely on css-transition handling and events
   */
  data.bargraph.ontransitionend = () => {
    data.value = (data.value===0)?100-data.barsize:0;
    data.bargraph.style.left=data.value+'%'; //this should trigger css-transition
  };
  return(data);
}
/**
 * by pressing left/right alternatively you move a box along a bar until you reach its end or run out of time
 * the bar will slowly slide back to origin without proper input (you have to press quickly to finish); each time you pass an area, this movement increases 
 * 
 * @param {*} bar : the element to move
 * @param {*} speed : recovery rate in ms 
 * @param {*} stopCB 
 * @param {*} startCB 
 * @param {*} areas 
 */
window.gm.startReactTest2=function(bar, speed, stopCB, startCB,areas) {   //todo timeout starts after first click
  /**
   * starts the game
   */
  function start() { //todo instead left-right also up-down should be possible
    data.stop();
    data.run=true;
    data.bargraph.style.left = data.value+'%'; //dont start in between; speed would be slowed down to maintain transition time
    var width =window.getComputedStyle(data.bargraph).getPropertyValue('width');
    var total = window.getComputedStyle(data.bargraph.parentNode).getPropertyValue('width');
    //calculate barsize relative to total width (necessary if windowsize changed in between )
    data.barsize=100*parseFloat(width.split('px'))/parseFloat(total.split('px')); 
    //data.bargraph.style.transition = "left "+data.speed+"ms linear"; //configure transition for animation
    if(data.startCB) data.startCB(); //called before transition-start!
    //data.bargraph.ontransitionend(); //start transition
    data.value=20, data.speed2 =1;
    tick();
    data.intervalID = window.setInterval( tick,data.speed);
  }
  /**
   * this stops the game and returns the index of hit area; use click() instead !
   */
  function stop() {
    if(data.intervalID) window.clearInterval(data.intervalID);
    var computedStyle = window.getComputedStyle(data.bargraph);
    var left = computedStyle.getPropertyValue('left');
    data.bargraph.style.left=left;
    data.bargraph.style.transition = null; // disable transition AFTER fetching computed value !
    data.run=false;
  }
  function tick() {
      data.value= Math.max(0,data.value-data.speed2);
      data.bargraph.style.left=data.value+'%';
    }
  /**
   * this can be bound to eventhandler for user input detection to trigger stop and will call stop-CB
   */
  function click(evt) {
    if(!data.run) return;
    let prevKey = data.lastKey;
    if((prevKey !==evt.key && (evt.key==='a' || evt.key==='ArrowLeft' || evt.key==='d'|| evt.key==='ArrowRight'))) {
      data.lastKey=evt.key,data.value+=5;
      data.bargraph.style.left=data.value+'%';
    } 
    var left = data.value+data.barsize/2;
    var res =-1; //detect if area was hit or not
    for(var i=data.areas.length-1; i>=0;i--) {
      if(data.areas[i].a<=left && left<=data.areas[i].b) {
        res=i; data.speed2=(i+1)*2; } 
    }
    if(res===data.areas.length-1) {
      stop();
      if(data.stopCB) data.stopCB(res); 
    }
  }
  let data ={ //internal state of game
    bargraph : document.getElementById(bar),
    run:false, //game started?
    value: 0, //actual setpoint in%
    barsize: 5, //width of hitbox relative to total width in %
    areas:areas,  //list of areas to hit in %;
    speed:speed, //transition time in ms
    speed2 : 1,  //recovery speed in % of barwidth
    stopCB: stopCB, //callback after user trigger 
    startCB: startCB, //callback after start
    start: start, //ref to start-function
    stop: stop, //ref to stop-func
    click: click, //ref to click-func
    intervalID: null,
    lastKey: ''
  }
  let gradient=''; 
  for(el of data.areas) { //todo need to sort from left to right
    gradient += '#80808000 0 '+el.a+'%, '+el.color+' '+el.a+'%,'+el.color+' '+el.b+'%,#80808000 '+el.b+'%,';
  }
  data.bargraph.parentNode.style.backgroundImage='linear-gradient(to right,'+gradient.slice(0,-1)+')';
  /**
   * instead of using timers rely on css-transition handling and events
   */
  /*data.bargraph.ontransitionend = () => {
    data.value = (data.value===0)?100-data.barsize:0;
    data.bargraph.style.left=data.value+'%'; //this should trigger css-transition
  };*/
  return(data);
}
window.gm.startPong=function(){
  ///// fixed sample from https://svgjs.dev/ ////////
// define document width and height
var width = 450, height = 300
// create SVG document and set its size
var draw = SVG().addTo('#pong').size(width, height)
draw.viewbox(0,0,450,300)
// draw background
var background = draw.rect(width, height).fill('#dde3e1')
// draw line
var line = draw.line(width/2, 0, width/2, height)
line.stroke({ width: 5, color: '#fff', dasharray: '5,5' })
// define paddle width and height
var paddleWidth = 15, paddleHeight = 80
// create and position left paddle
var paddleLeft = draw.rect(paddleWidth, paddleHeight)
paddleLeft.x(0).cy(height/2).fill('#00ff99')
// create and position right paddle
var paddleRight = draw.rect(paddleWidth, paddleHeight)//paddleLeft.clone()
paddleRight.x(width-paddleWidth).fill('#ff0066')
// define ball size
var ballSize = 10
// create ball
var ball = draw.circle(ballSize)
ball.center(width/2, height/2).fill('#7f7f7f')
// define inital player score
var playerLeft =0, playerRight = 0
// create text for the score, set font properties
var scoreLeft = draw.text(playerLeft+'').font({
  size: 32,
  family: 'Menlo, sans-serif',
  anchor: 'end',
  fill: '#fff'
}).move(width/2-10, 10)
// cloning doesnt work!
var scoreRight = draw.text(playerRight+'').font({
  size: 32,
  family: 'Menlo, sans-serif',
  anchor: 'end',
  fill: '#fff'
}).move(width/2-10, 10)
  .font('anchor', 'start')
  .x(width/2+10)
// random velocity for the ball at start
var vx = 0, vy = 0
// AI difficulty
var difficulty = 2
// update is called on every animation step
function update(dt) {
  // move the ball by its velocity
  ball.dmove(vx*dt, vy*dt)
  // get position of ball
  var cx = ball.cx(), cy = ball.cy()
  // get position of ball and paddle
  var paddleLeftCy = paddleLeft.cy()
  // move the left paddle in the direction of the ball
  var dy = Math.min(difficulty, Math.abs(cy - paddleLeftCy))
  paddleLeftCy += cy > paddleLeftCy ? dy : -dy
  // constraint the move to the canvas area
  paddleLeft.cy(Math.max(paddleHeight/2, Math.min(height-paddleHeight/2, paddleLeftCy)))
  // check if we hit top/bottom borders
  if ((vy < 0 && cy <= 0) || (vy > 0 && cy >= height)) { vy = -vy }
  var paddleLeftY = paddleLeft.y() , paddleRightY = paddleRight.y()
  // check if we hit the paddle
  if((vx < 0 && cx <= paddleWidth && cy > paddleLeftY && cy < paddleLeftY + paddleHeight) ||
     (vx > 0 && cx >= width - paddleWidth && cy > paddleRightY && cy < paddleRightY + paddleHeight)) {
    // depending on where the ball hit we adjust y velocity
    // for more realistic control we would need a bit more math here
    // just keep it simple
    vy = (cy - ((vx < 0 ? paddleLeftY : paddleRightY) + paddleHeight/2)) * 7 // magic factor
    // make the ball faster on hit
    vx = -vx * 1.05
  } else
  // check if we hit left/right borders
  if ((vx < 0 && cx <= 0) || (vx > 0 && cx >= width)) {
    // when x-velocity is negative, it's a point for player 2, otherwise player 1
    if(vx < 0) { ++playerRight }
    else { ++playerLeft }
    reset()
    scoreLeft.text(playerLeft+'')
    scoreRight.text(playerRight+'')
  }  
  // move player paddle
  var playerPaddleY = paddleRight.y()
  if (playerPaddleY <= 0 && paddleDirection == -1) {
    paddleRight.cy(paddleHeight/2)
  } else if (playerPaddleY >= height-paddleHeight && paddleDirection == 1) {
    paddleRight.y(height-paddleHeight)
  } else {
    paddleRight.dy(paddleDirection*paddleSpeed)
  }  
  // update ball color based on position
  ball.fill(ballColor);//??.at(1/width*ball.x()))
}
var lastTime, animFrame
function callback(ms) {
  // we get passed a timestamp in milliseconds
  // we use it to determine how much time has passed since the last call
  if (lastTime) {
    update((ms-lastTime)/1000) // call update and pass delta time in seconds
  }
  lastTime = ms
  animFrame = requestAnimationFrame(callback)
}
callback()
var paddleDirection = 0 , paddleSpeed = 5
SVG.on(document, 'keydown', function(e) {
  paddleDirection = e.keyCode == 40 ? 1 : e.keyCode == 38 ? -1 : 0
  e.preventDefault()
})
SVG.on(document, 'keyup', function(e) {
  paddleDirection = 0
  e.preventDefault()
})
draw.on('click', function() {
  if(vx === 0 && vy === 0) {
    vx = Math.random() * 500 - 150
    vy = Math.random() * 500 - 150
  }
})
function reset() {
  // visualize boom
  boom()
  // reset speed values
  vx = 0,  vy = 0
  // position the ball back in the middle
  ball.animate(100).center(width/2, height/2)
  // reset the position of the paddles
  paddleLeft.animate(100).cy(height/2)
  paddleRight.animate(100).cy(height/2)
}
// ball color update
var ballColor = new SVG.Color('#ff0066')
//?? ballColor.morph('#00ff99')
// show visual explosion 
function boom() {
  // detect winning player
  var paddle = ball.cx() > width/2 ? paddleLeft : paddleRight
  // create the gradient
  var gradient = draw.gradient('radial', function(stop) {
    stop.stop(0, paddle.attr('fill'))
    stop.stop(1, paddle.attr('fill'))
  })
  // create circle to carry the gradient
  var blast = draw.circle(300)
  blast.center(ball.cx(), ball.cy()).fill(gradient)
  // animate to invisibility
  blast.animate(1000, '>').opacity(0).after(function() {
    blast.remove()
  })
}
}
//print list of actions for actual day and hour
window.gm.printSchedule = function(){
  var elmt='';
  var s= window.story.state;
  var now = window.gm.getTimeStruct();

  var jobs = Object.values(window.gm.jobs);
  for(var i=0;i<jobs.length;i++) {
    var id = jobs[i].id;
    if(jobs[i].isHidden()===true) {
      //NOP;
    } else if(jobs[i].isDisabled()===true) {
      elmt +=`<div>${jobs[i].disabledReason()}</div></br>`;
    } else if(jobs[i].DoW.includes(now.DoW)&& s._gm.time>=jobs[i].startTimeMin && s._gm.time<jobs[i].startTimeMax) {
      if(window.gm.player.energy().value>=jobs[i].reqEnergy) {
        elmt +=`<a0 id='${id}' onclick='(function($event){window.story.show("${id}");})(this);'>${jobs[i].name} </a>`;
        elmt +=`</br><div>${jobs[i].descr} It might require ${(jobs[i].reqTime)} minutes of your time and around ${jobs[i].reqEnergy} energy.</div></br>`;
      } else {
        elmt +=`<div>You are to tired to do ${jobs[i].name}.</div></br>`;
      }
    } else {
      var days = "";
      for(var k=0;k<jobs[i].DoW.length;k++) {days +=window.gm.DoWs[jobs[i].DoW[k]-1]+","; }
      elmt +=`<div>${jobs[i].name} is only available between ${(jobs[i].startTimeMin/100).toFixed(0)} and ${(jobs[i].startTimeMax/100).toFixed(0)} at ${days}. </div></br>`;
    }
  }
  return(elmt);
};
//prints a list of quest
window.gm.printQuestList= function() {
  let elmt='<hr><form><ul style=\"list-style-type: none; padding-inline-start: 0px;\" ><legend>In progress</legend>';
  let s= window.story.state;
  
  //elmt +="<li><label><input type=\"checkbox\" name=\"y\" value=\"x\" readonly disabled>always: keep the fridge filled</label></li>";
  for(let i=0; i<s.quests.activeQuests.length; i++) {
      let qId = s.quests.activeQuests[i].id;
      let flags = s.quests.activeQuests[i].flags;
      let msId = s.quests.activeQuestsMS[i].id;
      let quest = window.gm.questDef[qId];
      let mile = quest.getMileById(msId);
      if(!quest.HiddenCB() || window.story.state._gm.dbgShowQuestInfo) {
        elmt +="<li style=\"padding-bottom: 0.5em;\"><input type=\"checkbox\" name=\"y\" value=\"x\" readonly disabled><label>"+
          quest.name+(window.story.state._gm.dbgShowQuestInfo?(" "+msId+" 0x"+flags.toString(16)):(""))+" : "+ ((mile.HiddenCB()===true)?("???"):(mile.descr))+"</label></li>"; //checked="checked"
      }
  }
  elmt +="</ul></form></br>";
  elmt +='<hr><form><ul style=\"list-style-type: none\" ><legend>Completed</legend>';
  for(let i=0; i<s.quests.finishedQuests.length; i++) {
    let qId = s.quests.finishedQuests[i].id;
    let flags = s.quests.activeQuests[i].flags;
    let msId = s.quests.finishedQuestsMS[i].id;
    let quest = window.gm.questDef[qId];
    let mile = quest.getMileById(msId);
    if(!quest.HiddenCB() || window.story.state._gm.dbgShowQuestInfo) {
      elmt +="<li><input type=\"checkbox\" name=\"y\" value=\"x\" readonly disabled checked=\"checked\"><label>"+
        quest.name+(window.story.state._gm.dbgShowQuestInfo?(" "+msId+" 0x"+flags.toString(16)):(""))+" : "+ mile.descr+"</label></li>"; 
    }
}
  elmt +="</ul></form></br>";
  return(elmt);
};
//prints a description of the chars-body
window.gm.printBodyDescription= function(whom,onlyvisible=false) {
  let msg = "";
  let conv = window.gm.util.descFixer(whom);
  let wornIds =whom.Outfit.getAllIds(); //todo this returns wearables & bodyparts
  let base = [] , head = [], torso =[], arms =[],legs =[], groin=[], other=[],breast=[],ignore=[];
  
  //sort the order: place Breast & Nipple-Piercing together 
  let fbase = ['bBase','bSkin'] , fhead = ['bHeadHair','bFace','bEars','bEyes','bMouth','bTongue','Head','Mouth','Neck'], 
  ftorso =['bTorso','bTailBase','bWings','Breast','Stomach','Hips'], 
  farms =['bArms','bHands','Arms','Wrists','RHand','LHand'],flegs =['bLegs','bFeet','Feet','Thighs'], 
  fbreast =['bBreast','pNipples'],
  fgroin=['bVulva','bPenis','pClit','bPubicHair','bHips','bAnus','Vulva','Clit','Anus','Penis','Balls'], fignore = [],
  fcovered=[];
  if(onlyvisible) {// filter by visibility 
    let covered=[];
    for(el of wornIds) { //notice that an item is only pushed once even if has multiple slots
      let item=whom.Outfit.getItem(el);
      covered = covered.concat(item.slotCover);
    }
    for(el of covered) {
      if(!fcovered.includes(el)) fcovered.push(el);
    }
  }
  for(el of wornIds) { //notice that an item is only pushed once even if has multiple slots
    let item=whom.Outfit.getItem(el);
    if(item.slotUse.every(name => fcovered.includes(name))) ignore.push(item); //ignore those that are overed completely
    else if(item.slotUse.some(name => fignore.includes(name))) ignore.push(item);
    else if(item.slotUse.some(name => fbase.includes(name))) base.push(item);
    else if(item.slotUse.some(name => fhead.includes(name))) head.push(item);
    else if(item.slotUse.some(name => ftorso.includes(name))) torso.push(item);
    else if(item.slotUse.some(name => fbreast.includes(name))) breast.push(item);
    else if(item.slotUse.some(name => farms.includes(name))) arms.push(item);
    else if(item.slotUse.some(name => flegs.includes(name))) legs.push(item);
    else if(item.slotUse.some(name => fgroin.includes(name))) groin.push(item);
    else other.push(item);
  }
  
  //null is used to mark linebreaks
  let all = base.concat([null]).concat(head).concat([null]).concat(torso).concat([null]).concat(arms).concat([null]);
  all = all.concat(legs).concat([null]).concat(groin).concat([null]).concat(breast).concat([null]).concat(other);
  for(el of all){ msg+= (el!==null)?el.descLong(conv)+' ':'</br>';}
  let lewd = whom.Outfit.getLewdness();
  //msg +='</br>Total lewdness sluty:'+lewd.slut+' bondage:'+lewd.bondage+' sm:'+lewd.sm;
	return msg+"</br>";
};
// returns singular pronoun for the char depending on gender
window.gm.util.estimatePronoun= function(whom) {
    let isplayer = (whom.name===window.gm.player.name);
    let vulva = whom.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bVulva);
    let penis = whom.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bPenis);
    //todo what if whom is a gang of imps?
    if(isplayer) {
      return('i')
    } else if(vulva && penis) {
      return('shi');
    } else if(vulva) {
      return('she');
    } else if(penis) {
      return('he');
    }
    return('it');
};
//returns a function that accept a text and fixes the word-phrases: let fixer = window.gm.util.descFixer(this.actor);msg=fixer('[I] [like] this shit.');
window.gm.util.descFixer = function(whom) {
  let pron = window.gm.util.estimatePronoun(whom);
  return(function(pron) { 
    return function(text) {
      let repl = [],br = 0, aft,bef,found;
      //search brackets like $[dff]$ $[[sdff]]$ dont find [ ] or \[ \] ; 
      //using no regex because couldnt get it get working:(!\[|[^\[])([\[]{1})(!\]|!\[|[^\[\]])+[\]]{1}([^\]]|!\])
      for(let i=text.length-1, max=text.length-1;i>=0;i-=1){ //in backward direction !
        bef= (i>0)? text[i-1]:'';
        aft= (i<max)?text[i+1]:'';
        if(text[i]===']' && aft==='$') { //opening braket
          br+=1;
          if(br>1) {  //there was already opening but no closing bracket !
            //no bracket in bracket allowed; ignore previous bracket
            br =1;
          }
          found = {end:i};
        }
        if(text[i]==='[' && bef==='$') { //opening braket
          br-=1;
          if(br<0) {  //there was already closing but no opening bracket !
            //no bracket in bracket allowed; ignore previous bracket
            br =0;
          } else {
            found.start=i;
            found.text=text.slice(found.start+1,found.end); //text within brackets
            found.start -=1,found.end +=1;  // inlude $ $
            repl.push(found);
          }
        }
      }
      for(el of repl) {//replace bracket+bracketcontent,
        el.new = window.gm.util.lookupWord(el.text,pron);
        let bef = text.substring(0,el.start), aft = text.substr(el.end+1);
        text= bef+el.new+aft;
      }
      // $[I]$ $[have]$ some rough [hair] that needs a lot combing. He has some rough...
      // c. She buys those pants. 
      // That hat [I] [wear] is ugly. That hat she wears is ugly.  
      // A dense fur covers $[my]$ body. A dense fur covers your body.  
      return(text);
    }
  }(pron))
};
// add irregular words here
window.gm.util.wordlist = function buildWordList(list) {
  //defines for each word a list to match to pronoun to replace with
  //have = [I have, you have, he/she has, we have, you have, they have ]
  list['i'] = {def:'I',i:'I',you:'you',he:'he',she:'she',shi:'shi',it:'it'};
  list['you'] = list['i']; //if you use you instead I as it would be required ...
  list['me'] = {def:'me',i:'me',you:'you',he:'him',she:'her',shi:'hir',it:'it'};
  list['my'] = {def:'my',i:'my',you:'your',he:'his',she:'her',shi:'hir',it:'its'};
  list['have'] = {def:'have',he:'has',she:'has',shi:'has',it:'has'};
  list['am'] = {def:'is',i:'am',he:'is',she:'is',shi:'is',it:'is'};
  list['them'] = {def:'them',i:'me',he:'him',she:'her',shi:'hir',it:'it'}; //I snap at them -> He snaps at me.
  return(list);
}(window.gm.util.wordlist || {});

//looks up a word in the wordlist and retourns the version fitting pronoun
window.gm.util.lookupWord = function(word,pron) {
  let output = word;
  let x = word.toLowerCase();
  let repl =window.gm.util.wordlist[x];
  if(repl) {
    output = (repl[pron])?repl[pron]:repl.def;
    if(word[0]===word[0].toUpperCase()) { //check if first letter needs to be large; 'I' is always large
      output= output[0].toUpperCase()+output.substr(1);
    }
  } else {
    if(pron==='he' || pron==='she'|| pron==='shi' ) {  
      output+='s';//wear -> wears
    }
  }
  return(output);
}