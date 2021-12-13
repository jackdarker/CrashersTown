"use strict";
/* bundles some operations related to combat */
window.gm = window.gm || {};
window.gm.combat = window.gm.combat || {};


class Encounter {
  constructor() {
    this.EnemyFirst=false;
    this.EnemyFunc = null;  //a ctor of Mob
    this.Location = ''  //your actual location-name
    this.scenePic = ''  //bg-image to use
    //the following function should get reassigned;they should return a message what will happen next and provide a link to passage to follow f.e. return to window.gm.player.location
    this.onStart = (function(){return('A '+window.story.state.combat.enemyParty[0].name+' appears !'+ window.gm.printPassageLink('Engage','EncounterStartTurn'));});
    //...endCombat is called after this and if you need to check on effects, you have to do this here !
    this.onDefeat = (function(){return('</br></br>You are defeated.</br>'+ window.gm.printLink('Next','window.gm.postDefeat()'));});
    this.onSubmit = (function(){return('</br></br>You submit to the foe.</br>'+ window.gm.printLink('Next','window.gm.postDefeat()'));});
    this.onFlee = (function(){return('</br></br>You retreat hastily.</br>'+ window.gm.printLink('Next','window.gm.postVictory()'));});

    //...dont forget to fetchLoot on victory
    this.onVictory = (function(){return('</br></br>You defeated the foe.</br> '+this.fetchLoot()+'</br>'+ window.gm.printLink('Next','window.gm.postVictory()'));});

    //if you override onMoveSelect (like the others), you can jump out of battle, show some scene and return to battle
    //- do not modify window.gm.player.location
    //- disable save
    //- jump back to EncounterStartTurn
    //- the function is called before every move and will jump back there; you need to make sure that the scene doesnt trigger again 
    //- if for some reason you want to leave battle, call window.gm.Encounter.endCombat() to cleanup
    this.onMoveSelect = null;
  }

  //setup encounter; this calls the Encounter-passage !
initCombat() {
  let s=window.story.state;
  s.combat.enemyParty = this.EnemyFunc();
  s.combat.playerParty = [];
  for(let el of s._gm.playerParty) {
    s.combat.playerParty.push(s[el]);
  }
  s.combat.turnStack = [];
  s.combat.actor = s.combat.target = s.combat.action = null;
  s.combat.location = this.location;
  s.combat.scenePic = this.scenePic;
  s.combat.playerFleeing = false;
  s.combat.playerSubmitting = false;
  s.combat.inCombat=true;
  s.combat.enemyFirst= this.EnemyFirst;
  s.combat.turnCount=0;
  this.next=this.battleInit;
  this.msg='';
  window.story.show("EncounterStartTurn");
}

/**
 *spawns additional enemys or friends
 *called by effCallHelp at begin of turn
 * @param {*} item
 * @param {*} party
 * @return {*} 
 * @memberof Encounter
 */
spawnChar(item,party){
  let s=window.story.state;
  let mob = window.gm.Mobs[item]();
  mob.faction = party,mob.despawn=true;
  let list = s.combat.enemyParty.concat(s.combat.playerParty);
  let uid=1;//need to build unique id
  for(el of list) {
    if(mob.__proto__.isPrototypeOf(el)) {
      //expecting Mole#2

      uid = Math.max(uid,parseInt(el.name.split('#')[1],10)+1);
    };
  }
  mob.name = mob.name+"#"+uid.toString(); //need unique name !!
  if(party === 'Player') {
    mob.calcCombatMove=null; //hack to disable AI  todo
    s.combat.playerParty.push(mob);
  } else {
    s.combat.enemyParty.push(mob);
  }
  return(mob.name);
}
hideCombatOption() {
  document.querySelector("#choice").remove();
}
//renders background & combatants to #canvas
renderCombatScene() {
  let _pos =[[0.25,0.60,1],[0.75,0.60,1],[0.50,0.40,1]];//sprite position & scale in % x,y,z
  let width=600,height=300;
  let draw = document.querySelector("#canvas svg");
  if(!draw) draw = SVG().addTo('#canvas').size(width, height);
  else draw = SVG(draw);//recover svg document instead appending new one
  //todo images flash when redrawing page; blitting bakbuffer doesnt help: var draw2 = SVG(); -> draw2.addTo(draw);
  draw.rect(width, height).attr({ fill: '#303030'});
  draw.image(window.story.state.combat.scenePic);
  let el,subnodes,i,list = window.story.state.combat.enemyParty;
  for(i=list.length-1;i>=0;i--) {
    if(!list[i].isKnockedOut()) { //todo show deathsprite
      var pos = _pos.pop();
      var _pic = window.gm.images[list[i].pic]();
      var node = SVG(_pic);
      //sprites should be scattered evenly and scaled down to fit into scene (with respect of offset in scene)
      var scaleW2,scaleH2,scaleW = node.width()/(width*(1-Math.abs(0.5-pos[0])*2)), scaleH=node.height()/(height*(1-Math.abs(0.5-pos[1])*2));
      if(scaleW>0.9 || scaleH>0.9 ) {
        if(scaleW>scaleH) node.width(node.width()/(1.2*scaleW));
        else node.height(node.height()/(1.2*scaleH));
      }
      node.center(pos[0]*width,pos[1]*height);//reposit. AFTER scaling !
      //hide parts of sprite
      subnodes= node.find('[data-male]');
      for(el of subnodes) {
        if(list[i].getPenis()===null) el.hide();
      }
      subnodes= node.find('[data-arousal]');
      for(el of subnodes) {
        var y = el.attr('data-arousal').split(',');
        var x1= parseInt(y[0],10),x2= parseInt(y[1],10);
        if(list[i].arousal().value<x1 ||list[i].arousal().value>x2 ) el.hide();
      }
      node.addTo(draw);
    }
    if(_pos.length<=0) break;
  }
  
  return;
}
//creates a list of active effects for combat display
printCombatEffects(char) {
  let list=[];
  if(char.isKnockedOut()) { //if char is dead print this instead other effects; effects also get not updated when dead??
    list.push('knocked out');
  } else {
    let effects = char.Effects.getAllIds();
    for(let i=0; i<effects.length; i++) {
      let effect = char.Effects.get(effects[i]);
      if(effect.onCombatEnd!==null && effect.onCombatEnd!==undefined) {
        list.push(effect.shortDesc);
      }
    }
  }
  return(list.reduce((sum, current) => sum + current +', ', ''));
}
statsline(whom,mark) {
  let msg='',bargraph=window.gm.util.bargraph;
  if(mark) msg = "<td style=\"border-style:dotted;border-color:darkorchid;border-width:0.3em;\">";
  else msg = "<td>";
  msg+=whom.name+" Lv"+whom.level+"</td><td>"+bargraph(whom.health().value,whom.health().max,"lightcoral")+"</td><td>"+bargraph(whom.Stats.get("arousal").value,whom.Stats.get("arousalMax").value,"lightpink")+"</td><td>"+bargraph(whom.energy().value,whom.energy().max,"lightyellow")+"</td><td>"+bargraph(whom.Stats.get("will").value,whom.Stats.get("willMax").value,"lightblue")+"</td>";
  return(msg);
}
//prints a table with all player/enemy data
printStats() {
  let s=window.story.state;
  let players = (s.combat.playerParty);
  let enemys = (s.combat.enemyParty);
  /*
              Health  Arousal          Health  Arousal 
      player1 10/20   10/20      Ork1  10/10   10/10
              Stunned
      player2 50/100  10/20      Ork2  20/20   10/100
  */
 let elmt = '<table id=\"combatstats\"><tbody>';
  elmt += "<tr><th>Player</th><th>Health</th><th>Arousal</th><th>Energy</th><th>Will</th><th>   </th><th>Enemys</th><th>Health</th><th>Arousal</th><th>Energy</th><th>Will</th></tr>";
  for(let i=0;(i<players.length || i<enemys.length);i++) {
    elmt += "<tr>";
    if(i<players.length) {
      elmt += this.statsline(players[i],s.combat.actor && s.combat.actor.name==players[i].name);
    } else {
      elmt += "<td></td><td></td><td></td><td></td><td></td>";
    }
    if(i<enemys.length) {
      elmt += "<td></td>"+this.statsline(enemys[i],s.combat.actor==enemys[i]);
    } else {
      elmt += "<td></td><td></td><td></td><td></td><td></td><td></td>";
    }
    elmt += "</tr><tr>";
    if(i<players.length) { //effects as additional row
      elmt += "<td></td><td colspan='3' style=\"font-size:smaller\">"+window.gm.Encounter.printCombatEffects(players[i])+"</td>";
    } else {
      elmt += "<td></td><td></td><td></td><td></td><td></td>";
    }
    if(i<enemys.length) {
      elmt += "<td></td><td></td><td colspan='3' style=\"font-size:smaller\">"+window.gm.Encounter.printCombatEffects(enemys[i])+"</td>";
    } else {
      elmt += "<td></td><td></td><td></td><td></td><td></td><td></td>";
    }
    elmt += "</tr>";
  }
  elmt +='</tbody></table>'
  return(elmt);
}
//creates buttons for skills of current actor
printSkillList() {
  var s = window.story.state;
  var canAct = s.combat.actor._canAct();
  if(canAct.OK===true) {
    var skillIds = s.combat.actor.Skills.getAllIds();
    //todo how to sort the list in a useful manner?
    for(var i=0; i<skillIds.length;i++) {
      var entry = document.createElement('button');
      var res;
      //entry.href='javascript:void(0)';
      entry.addEventListener("click",(function(me,target){ 
        return(window.gm.Encounter._postSkillSelect.bind(me,target));}(this,skillIds[i])));
      entry.textContent=s.combat.actor.Skills.getItem(skillIds[i]).name;
      res = s.combat.actor.Skills.getItem(skillIds[i]).isEnabled();
      entry.disabled=!res.OK; entry.title=res.msg;  //Todo use pointevent+toasty?
      $("div#choice")[0].appendChild(entry);      // <- requires this node in html
    }
  } else {  //cannot do a thing
    var entry = document.createElement('p');
    entry.textContent=canAct.msg;
    $("div#choice")[0].appendChild(entry);
  }
  var entry = document.createElement('button');
  //entry.href='javascript:void(0)';
  entry.addEventListener('click',(function(me){return(window.gm.Encounter._postSkillAbort.bind(me));}(this)));
  entry.textContent="Do nothing";
  $("div#choice")[0].appendChild(entry);
}
_postSkillAbort(){
  window.story.state.combat.action=null;
  window.gm.Encounter.next=window.gm.Encounter.checkDefeat;
  window.story.show('EncounterStartTurn');
}
_postSkillSelect(id){
  window.story.state.combat.action=id;
  if(id==='UseItem') {
    window.gm.Encounter.next=window.gm.Encounter.selectItem;
  } else {
    window.gm.Encounter.next=window.gm.Encounter.selectTarget;
  }
  window.story.show('EncounterStartTurn');
}
printTargetList() {
  var s = window.story.state;
  var skill = s.combat.actor.Skills.getItem(s.combat.action);
  var all = s.combat.playerParty.concat(s.combat.enemyParty);
  var targets = [];
  for( el of all) {
    targets.push([el]); //need [[],[]]
  }
  var info = document.createElement('p');
  info.textContent = skill.desc;
  $("div#choice")[0].appendChild(info);
  targets = skill.targetFilter(targets);
  for(var i=0; i<targets.length;i++) {
    var entry = document.createElement('a');
    entry.href='javascript:void(0)';
    entry.addEventListener("click",(function(me,target){ 
      return(window.gm.Encounter._postTargetSelect.bind(me,target));}(this,targets[i])));
    //if single-target, use name from mob, for multitarget we expect a name attribute to the list
    entry.textContent=(targets[i].length>1)?targets[i].name:targets[i][0].name;
    //entry.disabled=this.buttons[y*5+x].disabled;
    $("div#choice")[0].appendChild(entry);      // <- requires this node in html
  }
  var entry = document.createElement('a');
  entry.href='javascript:void(0)';
  entry.addEventListener('click',(function(me){return(window.gm.Encounter._postTargetAbort.bind(me));}(this)));
  entry.textContent="back";
  $("div#choice")[0].appendChild(entry);
}
_postTargetAbort(){
  window.story.state.combat.action=null;
  window.gm.Encounter.next=window.gm.Encounter.selectMove;
  window.story.show('EncounterStartTurn');
}
_postTargetSelect(target){
  this.hideCombatOption();
  window.story.state.combat.target = target;//(target.length)? target : [target] ;
  window.gm.Encounter.next=window.gm.Encounter.execMove;
  window.story.show('EncounterStartTurn');
}
printItemList() {
  let s = window.story.state;
  let inv = s.combat.actor.Inv;
  let maxSlots = inv.count(); 
  for(var i=0;i<maxSlots;i++){
    let id=inv.getItemId(i);
    let _count =inv.countItem(id);
    //if(useOn===null) useOn=s.combat.actor;
    let useable = inv.usable(id);
    if(_count>0 && useable.OK) {
      let entry = document.createElement('a');
      entry.href='javascript:void(0)';
      let foo = (function(id,carrier){ 
        this._postItemSelect(id);
      }).bind(this,id);
      entry.addEventListener("click",foo);
      entry.textContent=id;
      $("div#choice")[0].appendChild(entry);      // <- requires this node in html
    }
  }
  let entry = document.createElement('a');
  entry.href='javascript:void(0)';
  entry.addEventListener('click',(function(me){return(window.gm.Encounter._postTargetAbort.bind(me));}(this)));
  entry.textContent="back";
  $("div#choice")[0].appendChild(entry);
}
_postItemSelect(id){
  let s = window.story.state;
  this.hideCombatOption();
  s.combat.actor.Skills.getItem(s.combat.action).item=id;
  window.gm.Encounter.next=window.gm.Encounter.selectTarget;
  window.story.show('EncounterStartTurn');
}
//if switching to Status panel and back this will redraw screen and call this.next; to avoid this set next only in clickhandler 
printNextLink(nextState,label="Next") {
  let entry = document.createElement('a');
  entry.href='javascript:void(0)';
  entry.addEventListener('click',(function(me,nextState)
  {return(function() {
    window.gm.Encounter.next=nextState;
    window.story.show('EncounterStartTurn');
  });
  }(this,nextState)));
  entry.textContent=label;
  $("div#choice2")[0].appendChild(entry);
}
//executes a combat-cmd for player/enemy
execCombatCmd(move) { 
  var s = window.story.state;
  var result = move(s.combat.actor,s.combat.target);
  /*s.combat.enemyTurn =!s.combat.enemyTurn;  //toggle whos turn
  if(!(s.combat.enemyTurn ^ s.combat.enemyFirst)) s.combat.newTurn = false;
  */
  return(result);
}
endCombat(){
  var s = window.story.state;
  s.combat.inCombat=false;
//remove combateffects
  var list = s.combat.enemyParty.concat(s.combat.playerParty);
  for(var k=0; k<list.length;k++){
    var effects = list[k].Effects.getAllIds();
    for(var i=0; i<effects.length; i++) {
      var effect = list[k].Effects.get(effects[i]);
      if(effect.onCombatEnd!==null && effect.onCombatEnd!==undefined) {
        effect.onCombatEnd();
      }
    }
  }
}
/**
 * call this onVictory to grab loot & XP from Mobs
 */
fetchLoot(){ //if you are victorious: grant XP & transfer Loot to player 
  let s=window.story.state;
  let msg='';
  let XP=0, maxLevel = 0, _rnd=_.random(0,100);
  for (el of s.combat.playerParty) {
    maxLevel = Math.max(maxLevel,el.level);
  }
  for(el of s.combat.enemyParty) {
    for(var i = el.loot.length-1;i>=0;i--) {
      if(_rnd<=el.loot[i].chance) {
        msg+= el.loot[i].amount+'x '+el.loot[i].id+' ';
        window.gm.player.changeInventory(window.gm.ItemsLib[el.loot[i].id](),el.loot[i].amount);
      }
    }
    //XP reduced/increased if your level is bigger/smaller then foes by 25% per level
    XP+=Math.floor(el.baseXPReward* Math.min(3,Math.max(0,1+(el.level-maxLevel)*0.25)));
  }
  msg = '</br>You got some loot: '+window.gm.util.formatNumber(XP,0) +'XP '+msg+'</br>';
  for (el of s.combat.playerParty) {
    el.addXP(XP);  //all get the same?
  }
  return(msg);
}
isAllDefeated(party) {
  for(var i=0;i<party.length;i++) {
    if(!party[i].isKnockedOut()) return(false);
  }
  return(true);
}
calcTurnOrder(){
  var s = window.story.state;
  //todo sort by agility
  //todo turnorder can be intermixed?
  if( s.combat.enemyFirst) {
    s.combat.turnStack = s.combat.enemyParty.concat(s.combat.playerParty);
  } else {
    s.combat.turnStack = s.combat.playerParty.concat(s.combat.enemyParty);
  }
}
/////////////////////  State Machine /////////////////////
//
battleInit() {
  let result = {OK:false, msg:''}, s = window.story.state;
  result.OK=true,result.msg = this.onStart();
  let list = s.combat.enemyParty.concat(s.combat.playerParty);
  //update combateffects
  for(let k=list.length-1; k>=0;k--){
    if(list[k].isKnockedOut()) {
      if(list[k].despawn===true) list.splice(k,1); //remove spawned chars - you will not get loot for them !
      continue;
    }
    let effects = list[k].Effects.getAllIds();
    for(let i=0; i<effects.length; i++) {
      let effect = list[k].Effects.get(effects[i]);
      if(effect.onCombatStart!==null && effect.onCombatStart!==undefined) {  //typeof effect === CombatEffect doesnt work? so we check presense of attribut
        this.msg+=effect.onCombatStart().msg;
      }
    }
    let skills = list[k].Skills.getAllIds();
    for(let i=0; i<skills.length; i++) {
      let skill = list[k].Skills.getItem(skills[i]);
      if(skill.onCombatStart!==null && skill.onCombatStart!==undefined) {
        skill.onCombatStart();
      }
    }
  }
  this.next=this.preTurn;
  return(result);
}
preTurn() {
  let result = {OK:false, msg:''};
  let s = window.story.state;
  s.combat.turnCount+=1;
  let list = s.combat.enemyParty.concat(s.combat.playerParty);
  //update combateffects
  for(let k=list.length-1; k>=0;k--){
    if(list[k].isKnockedOut()) {
      if(list[k].despawn===true) list.splice(k,1); //remove spawned chars - you will not get loot for them !
      continue;
    }
    let effects = list[k].Effects.getAllIds();
    for(let i=0; i<effects.length; i++) {
      let effect = list[k].Effects.get(effects[i]);
      if(effect.onTurnStart!==null && effect.onTurnStart!==undefined) {  //typeof effect === CombatEffect doesnt work? so we check presense of attribut
        this.msg+=effect.onTurnStart().msg;
      }
    }
    let skills = list[k].Skills.getAllIds();
    for(let i=0; i<skills.length; i++) {
      let skill = list[k].Skills.getItem(skills[i]);
      if(skill.onTurnStart!==null && skill.onTurnStart!==undefined) {
        skill.onTurnStart();
      }
    }
  }
  //calculate turnorder
  this.calcTurnOrder();
  this.next=this.checkDefeat;
  return(result);
}
checkDefeat() { //check if party is defeated
  let result = {OK:false, msg:''}; 
  //this.msg = '';
  var s = window.story.state;
  if(s.combat.playerFleeing===true) { 
    this.next=this.postBattle;
    return(result); 
  } else if(s.combat.playerSubmitting===true) {
    this.next=this.postBattle;
    return(result);  
  } else if(this.isAllDefeated(s.combat.enemyParty)) {
    this.next=this.postBattle;
    return(result);
  } else if(this.isAllDefeated(s.combat.playerParty)) {
    this.next=this.postBattle;
    return(result);
  }
  this.next=this.selectChar;
  return(result);
}
//select the next char to move
selectChar() { 
  var s = window.story.state;
  var result = {OK:false, msg:''};
  if(s.combat.turnStack.length>0) {
    //switch to next char
    s.combat.actor= s.combat.turnStack.shift();
    //actual move = 0
    s.combat.action = null;
    this.next=this.selectMove;
  } else {
  //next turn after all done
  this.next=this.preTurn;
  }
  return(result);
}
targetFilterAlive(targets){    //chars that are not dead
  var possibleTarget = [];
  for(var target of targets){
      var valid = true;
      if(target.isKnockedOut()) valid=false; //todo ..isDead()??
      if(valid) possibleTarget.push(target); 
  }
  return possibleTarget;
}
selectMove() {
  let s = window.story.state;
  let result = {OK:false, msg:''};
  if(this.onMoveSelect != null) {
    result = this.onMoveSelect();
    if(result.OK) return(result);
  }
  if(s.combat.actor.isKnockedOut())  { //skip char if already dead
    this.next=this.selectChar;
    return(result);
  }
  let stateDesc = s.combat.actor._stateDesc();
  let canAct = s.combat.actor._canAct();
  if(canAct.OK===false) { //skip char if not dead but incapaciated and show msg
    //result.OK = true, 
    result.msg = stateDesc.msg+"</br>"+canAct.msg;
    this.next=this.checkDefeat;
    return(result);
  } else {
    if(s.combat.actor.isAIenabled && s.combat.actor.calcCombatMove) { //selected by AI
      result = s.combat.actor.calcCombatMove(this.targetFilterAlive(window.story.state.combat.playerParty),
        this.targetFilterAlive(window.story.state.combat.enemyParty));
      window.story.state.combat.action=result.action;
      window.story.state.combat.target=result.target;
      this.next=this.execMove; 
      //this.msg=result.msg,
      result.OK=false;
    } else {
      this.printSkillList();
      result.OK=true, result.msg=stateDesc.msg+"</br>Choose action for "+s.combat.actor.name+"!</br>";
    }
  }
  return(result);
}
selectItem() {  //select Item from Inventory
  var s = window.story.state;
  var result = {OK:false, msg:''};
  this.printItemList();
  result.OK=true,result.msg = "Choose item";
  return(result);
}
selectTarget() {  //select target for choosen action
  var s = window.story.state;
  var result = {OK:false, msg:''};
  this.printTargetList();
  result.OK=true,result.msg = "Choose target";
  return(result);
}
execMove(){
  var result = {OK:false, msg:''};
  var s = window.story.state;
  //apply move; AI might not find a possible action
  if(s.combat.action!==null && s.combat.action!=='') {
    result.msg=s.combat.actor.Skills.getItem(s.combat.action).cast(s.combat.target).msg;
  }
  this.next=this.checkDefeat;
  return(result);
}
postBattle() {
  this.next = null;  //terminate SM
  var s=window.story.state;
  var result = {OK:false, msg:''};
  //check if battle end reason...
  if(s.combat.playerFleeing===true) { 
    result.OK=true,result.msg = this.onFlee();
  } else if(s.combat.playerSubmitting===true) {  
    result.OK=true,result.msg = this.onSubmit();
  } else if(this.isAllDefeated(s.combat.enemyParty)) {
    result.OK=true,result.msg = this.onVictory();
  } else if(this.isAllDefeated(s.combat.playerParty)) {
    result.OK=true,result.msg = this.onDefeat();
  }
  this.endCombat();
  return(result);
}
/**
 * this runs the statemachine and is triggered by user input
 */
battle() {
  var result = {OK:false, msg:''};
  this.msg = '';
  while(this.next!==null && !result.OK) {
    //if result =true user input required- break loop and wait for click event (msg has to contain printNextLink-call !)
    result =this.next();
    this.msg+=result.msg;
    window.gm.printOutput(this.msg);
    window.gm.Encounter.renderCombatScene();
    renderToSelector("#panel", "statspanel");
    //if(result.OK) {   result.msg = this.msg+result.msg;    return(result);  }
  }
  return;
};

}
/*
 * returns true if in combat
*/
window.gm.combat.inCombat = function() {
  return(window.story.state.combat.inCombat);
}
/**
 * bonusmultiplicator for target depending on level difference
 * @param {*} attacker 
 * @param {*} target 
 */
window.gm.combat.lvlDiffBonus = function(attacker,target){return(1+(target.level-attacker.level)*0.15);}; //+2lvl = + 30%
//calculates if target can evade the attack 
/*requires minimum Poise
Evasion depends on Agility & Endurance:
- mallus for heavy armor & weapon
- mallus for Effects like Prone, Frozen
- bonus for Skills: Flying, Dancer
Stunned/Bound Chars can not evade */
// on evasion returns false and a message
window.gm.combat.calcEvasion=function(attacker,target, attack) {
  var result = {OK:true,msg:''}
  var rnd = _.random(0,100);

  if(target.Effects.findItemSlot(effStunned.name)>=0) { //todo chance to miss 
    result.OK = true; 
    result.msg = target.name+' is stunned and cannot evade. '
    attack.crit = true; //when stunned always critical hit
    return(result);
  }
  var lvlDiffBonus = window.gm.combat.lvlDiffBonus(attacker,target);
  var chance = 0+lvlDiffBonus*(target.Stats.get("agility").value + target.Stats.get("perception").value);  
  chance-=attack.mod.hitChance/100*(attacker.Stats.get("agility").value + attacker.Stats.get("perception").value);
  window.gm.pushLog(`evasion roll: ${chance} vs ${rnd} `,window.story.state._gm.dbgShowCombatRoll);
  if(chance>rnd) {
    result.OK = false;
    result.msg += 'Using agility, '+ target.name +' was able to dodge the attack.</br> '
  }
  return(result);
}
/*If evasion-roll fails, their is a chance that parry is rolled:
- consumes some poise
- parry only works for weapon of similiar size: a Zweihänder is to slow to parry a saber, a dagger is to light to deflect a club
- requires minimum weapon-skill (f.e. projectile deflection )
otherwise continue chain
parry-result depends on agility+perception
- bonus for skills
- bonus for some weapons
on critical fail- full damage, poise damage
on fail - full damage
on success no damage is taken (might consume weapon-stability)
if a critical is rolled, 50% of the attackers damage is reflected to him*/
window.gm.combat.calcParry=function(attacker,target, attack) {
  var result = {OK:true,msg:'',foo:null}
  var rnd = _.random(0,100);

  if(target.Effects.findItemSlot(effStunned.name)>=0) {
    result.OK = true; 
    result.msg = target.name+' is stunned and cannot parry or block. '
    attack.crit = true; //when stunned always critical hit
    return(result);
  }
  //todo block if has shield, parry if has weapon
  var lvlDiffBonus = window.gm.combat.lvlDiffBonus(attacker,target);
  var chance = 0+lvlDiffBonus*(target.Stats.get("agility").value + target.Stats.get("endurance").value);  
  chance-=attack.mod.hitChance/100*(attacker.Stats.get("agility").value + attacker.Stats.get("endurance").value);
  window.gm.pushLog(`parry roll: ${chance} vs ${rnd} `,window.story.state._gm.dbgShowCombatRoll);
  if(chance>rnd && rnd<10) { 
    result.OK = false;
    if(rnd<10) {
      result.msg = target.name +' parried the attack and was even able to land a hit.</br>'  //todo how to add textual variation based on used weapon and skill?
      attack.effects.push( {target:attacker,eff:([effDamage.factory(5,"blunt")])}); //todo how much damage? 
    } else {
      result.msg = target.name +' parried the attack.</br> '
    }
  } else {
    result.OK = true;
  }
  return(result);
}
/*if all else failed you have to absorb the hit:
DR = sum of armor (with individual skill-bonus) + magic armor
attack = weapon damage formula + weakness-bonus
attack increases on critical
hp-dmg = attack -DR but min.1 */
window.gm.combat.calcAbsorb=function(attacker,defender, attack) {
  let result = {OK:true,msg:''}
  let rnd = _.random(1,100);
  if(attack.mod.onCrit.length>0 && ((rnd<attack.mod.critChance) || attack.crit===true)) {  //is critical
    attack.crit=true, result.msg = defender.name +' got critical hit by '+attacker.name+'. ';
    for(el of attack.mod.onCrit) {
        attack.effects.push( {target:el.target, eff:el.eff}); //el.eff is []
    }
  } else {
    result.msg = defender.name +' got hit by '+attacker.name+'.</br> ';
    for(el of attack.mod.onHit) {
        attack.effects.push( {target:el.target, eff:el.eff});
    }
  }
  return(result);
}
/**
 * damage types
 */
window.gm.combat.TypesDamage = [
  {id: 'blunt'},
  {id: 'slash'},
  {id: 'pierce'},
  {id: 'tease'},
  {id: 'spark'},
  {id: 'ice'},
  {id: 'fire'},
  {id: 'poison'},
  {id: 'acid'}
]

//object to store attack-data
window.gm.combat.defaultAttackData = function() {
  return({msg:'',value:0,total:0,crit:false,effects:[]}); 
}
// calculates the damage of an physical attack
window.gm.combat.calcAttack=function(attacker,defender,attack) {
  let result = {OK:false,msg:''};
  window.gm.combat.scaleEffect(attack);
  //check if target can evade
  result = window.gm.combat.calcEvasion(attacker,defender,attack);
  if(result.OK===false) { return(result);  }
  var _tmp = result.msg;
  //check if target can block or parry
  result = window.gm.combat.calcParry(attacker,defender,attack);
  if(result.OK===false) {    return(result);  }
  _tmp += result.msg;
  //deal damage
  result = window.gm.combat.calcAbsorb(attacker,defender,attack);
  _tmp += result.msg;
  result.msg = _tmp;
  return(result);
}
/**
 * helper function to scale effective damage according to armor & resistance
 * @param {*} attack 
 */
window.gm.combat.scaleEffect = function(attack) {
  let res = {OK:true,msg:''};
  function _adapt(op){
    let res = {OK:true,msg:''};
    let target,dmg,rst,arm=0;
    for(var i=0; i<op.length;i++){
      target = op[i].target;
      for(el of op[i].eff) {
        if(el.name===effDamage.name) {  //dmg = (attack-armor)*(100%-resistance) but min. 1pt
          arm = target.Stats.getItem('arm_'+el.type).value;
          rst = target.Stats.getItem('rst_'+el.type).value;
          dmg = Math.max(1,(el.amount-arm)*(100-rst)/100);
          el.amount=dmg;
          if(target.Effects.findEffect("effMasochist").length>0) {
            op[i].eff.push(effTeaseDamage.factory(dmg,'slut',{slut:1})); //todo lewd-calc
          }
        }
        if(el.name===effTeaseDamage.name) {
          //todo no dmg if blinded, stunned,
          //todo vulnerable if inHeat, like/dislike attacker
          //bondage-fetish -> bonus for bond-gear
          el.amount *= 1+Math.sqrt(el.lewds.slut)/10; //bonus for slutty wear
          arm = target.Stats.getItem('arm_tease').value;
          rst = target.Stats.getItem('rst_tease').value;
          dmg = Math.max(0,(el.amount-arm)*(100-rst)/100); //might cause 0 dmg
          el.amount=dmg;
        }
      }
    }
    return(res);
  }
  _adapt(attack.mod.onHit);
  _adapt(attack.mod.onCrit);
  return(res);
}
window.gm.combat.calcTeaseAttack=function(attacker,defender,attack) {
  let result = {OK:true,msg:''},_tmp='';
  window.gm.combat.scaleEffect(attack);
  //todo chance to fail?
  //todo self-dmg if exhibitionist/stripper
  result = window.gm.combat.calcAbsorb(attacker,defender,attack);  //deal damage
  /*if(attack.crit) { //todo text should be generated in Skill: "by tweezing those nipples on your gorgous DD bust..."
    result.msg = defender.name +' got heavily teased by '+attacker.name+'. ';
  } else {
    result.msg = defender.name +'\'s arousal increased. ';
  }*/
  _tmp += result.msg;
  result.msg = _tmp;
  return(result);
}