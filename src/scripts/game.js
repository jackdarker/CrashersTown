"use strict";

window.gm = window.gm || {}; //game related operations
window.gm.util = window.gm.util || {};  //utility functions
class IDGenerator {//extends Singleton{
  constructor(){
      if(IDGenerator._instance){ return IDGenerator._instance; }
      IDGenerator._instance = this;
      this._idCounter=1;
      window.storage.registerConstructor(IDGenerator);
  }
  static instance() {
      if(!IDGenerator._instance){return new IDGenerator(); }
      return IDGenerator._instance;
  }
  static resetID(useID){ //this should be only called after reload
    //hack: reloading save causes constructor calls causes calls to createID which would increase counter (the ids are reverted by merging loaded data into the constructed objects)
    //so we need a way to revert this increase
    IDGenerator.instance()._idCounter=useID;
  }
  static createID() {let x=IDGenerator.instance()._idCounter++;return("_"+x);} //add _ or queryselector() might not work if id starts with number ?!
  toJSON(){return window.storage.Generic_toJSON("IDGenerator", this); }
  static fromJSON(value){return(window.storage.Generic_fromJSON(IDGenerator, value.data));}
}
// helper for publisher/subscriber-pattern; myObject.ps =PubSub(); myObject.ps.subscribe(...
// !! warning, dont use for objects that need to be loaded from savegame
// the reviver calls constructor of nested objects multiple times which lead to multiple registrations with partially incomplete objects in the PubSub;
// since there are no destructors, there is no easy way to cleanup
window.gm.util.PubSub = function(){ 
  return ({
    events: {},
    subscribe: function (event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];    
        }
        this.events[event].push(handler);
    },
    unsubscribe: function (event, handler) {
      if (!this.events[event]) return;
      let i= this.events[event].indexOf(handler);
      if(i>=0) this.events.splice(i,1);
    },
    publish: function (event, data) {
        this.events[event] && this.events[event].forEach(publishData);
        function publishData(handler) {
            handler(data);   
        };
    }
  }); 
};
// can be used to create deep clones of class-obj; 
// requires that the class has registered its constructor to window.storage 
// and class implements _relinkItems() to restore parent-ship of sub-objects
window.gm.util.deepClone=function(obj){
  let clone=JSON.parse(JSON.stringify(obj), window.storage.Reviver);
  clone._relinkItems();
  return(clone);
};
//create pretty name for passage; requires a tag (replace space with _ !) [name:"My_Room"]
window.gm.util.printLocationName=function(passage) {
  let tags = window.story.passage(passage).tags;
  for(el of tags) {
    let ar = el.split(":");    
    if(ar.length>1 && ar[0]==='name') {
      return(ar[1].split('_').join(' '));
    }
  }
  return(passage);
}
//prints a div with text "value/max" and bargraph-background
window.gm.util.bargraph=function(value,max,color,text="") {
  let msg ='';
  let rel = value/max*100;
  msg ='<div class="progressbar"><div style="background-color:'+color+'; width: '+rel.toString()+'%;"><div style="width: max-content;">'+text+value.toString()+'/'+max.toString()+'</div></div></div>';
  return(msg); //todo bargraph css-animation doesnt work because the whole page is reloaded instead of just width change
}
/* Uploads SVG files from local file system, based on file selected in input; https://github.com/fizzstudio/svg-load-save */
window.gm.util.loadLocalSVG=function(event) {
    let file = event.target.files[0]; // FileList object
    if (file) {
      const file_reader = new FileReader();
      if (`image/svg+xml` == file.type) {
        file_reader.readAsText(file);
        file_reader.addEventListener(`load`, function () {
          var file_content = file_reader.result;
          window.gm.util.insertSvg(file_content);
        }.bind(this), false);
      }
    }
};
/* Inserts SVG files into HTML document */
window.gm.util.insertSvg=function(file_content) {
    // insert SVG file into HTML page
    const svg_container = document.getElementById("svg_container");
    svg_container.innerHTML = file_content;
    // TODO: insert any SVG handler here
    // adds `click` event listener to inserted SVG to test modification of SVG file, for later saving
    if (this.event_handler) {
      svg_container.firstChild.addEventListener("click", this.event_handler, false)
    }
};
/*
* use this to merge multiple objects into one. If used with class-objects their methods will go missing!
* this will properly deep-merge nested objects (not like Object.assign)
*/
window.gm.util.mergePlainObject=function(...arg) {
  let target = {};
  // deep merge the object into the target object
    const merger = (obj) => {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    // if the property is a nested object
                    target[prop] = window.gm.util.mergePlainObject(target[prop], obj[prop]);
                } else {
                    // for regular property
                    target[prop] = obj[prop];
                }
            }
        }
    };
    // iterate through all objects and deep merge them with target
    for (let i = 0; i < arg.length; i++) {
        merger(arg[i]);
    }
    return target;
};
//-------------------------------------------------
// reimplement to setup the game !
window.gm.initGame= function(forceReset,NGP=null) {
  window.gm.toasty= new Toasty();
    $(window).on('sm.passage.showing', function(event, eventObject) {
        // Current Passage object
        $("tw-passage").fadeIn(500);  //fade in if was previously faded out
      //console.log('showing '+eventObject.passage.name);
    });
    // Render the passage named HUD into the element todo replace with <%=%>??
    $(document).on('sm.passage.shown', function (ev,eventObject) { 
      window.gm.refreshSidePanel();
      window.gm.restorePage();
    });
    var s = window.story.state; //s in template is window.story.state from snowman!
    if (!window.gm.timeEvent||forceReset) {
      window.gm.timeEvent = window.gm.util.PubSub();  //subscribe to "change" event to receive time updates
      // !! make sure to reregister after load !
    }
    if(!s.quests || forceReset) {
      s.quests =  new QuestData();
      window.gm.quests = new QuestManager(window.gm.questDef);
      window.gm.quests.setQuestData(s.quests);
      window.gm.quests.pubSub.subscribe("change",function(data){window.gm.toasty.info("Quest "+data.questId+" updated")});
    }
    if (!s._gm||forceReset) {
      s._gm = {
        version : window.gm.getSaveVersion(),
        style: 'default', //css profile to use
        log : [],
        IDGenBkup:0,
        IDGen: new IDGenerator(),
        passageStack : [], //used for passage [back] functionality
        defferedStack : [], //used for deffered events
        onholdStack : [], //used for deffered events
        time : 700, //represented as hours*100 +minutes
        day : 1,  //daycount
        activePlayer : '', //id of the character that the player controls currently
        nosave : false,
        playerParty: [],  //names of NPC in playerParty 
        debug : false,    //globally enables debug
        dbgShowCombatRoll : false,  //log combat calculation details
        dbgShowQuestInfo : false,  //show internal quest state
        dbgShowMoreInfo : false
      }
    }
    if (!s.dng||forceReset) { //stores the state of the current dungeon
      s.dng = {
        id : "",
        floorId : "",
        roomId : ""
      }
    }
    if (!s.tmp||forceReset) { 
      // storage of temporary variables; dont use them in stacking passages or deffered events      
      s.tmp = {
        flags: [], //can store flags for showing/hidding page-elements 
        args: [],  // can be used to set arguments before another passage is called (passage-arguments) 
        msg: ''   // memorizes a message to display when returning from _back-passage; please clear it when leaving the passage
      }
    }
    if (!s.GlobalChest||forceReset) {  
      let ch = new Character();
      ch.id="GlobalChest";
      ch.name="GlobalChest";
      ch.faction="Player";
      s.GlobalChest=ch;
    }
    if (!s.combat||forceReset) { //see encounter & combat.js
      s.combat = {
        enemyParty : [],  //collection of enemy-chars involved 
        enemyIdx : 0,  //index of actual enemy 
        playerParty : [],
        playerIdx : 0,
        enemyFirst : false, //if true, enemy moves first
        inCombat: false,  //for query window.gm.combat.inCombat
        turnCount: 0,
        scenePic : 'assets/bg_park.png'
      }
    }
  }
//reimplement for your game !
window.gm.newGamePlus = function() {
  var NGP = { //be mindful if adding complex objects to NGP, they might not work as expected ! simple types are ok 
    crowBarLeft: window.story.state.vars.crowBarLeft
    }
  window.gm.initGame(true,NGP);
  window.story.show('Home');
};
//reimplement this to handle version upgrades on load !
window.gm.rebuildObjects= function(){ 
  var s = window.story.state;
  IDGenerator.resetID(s.IDGenBkup);
  window.styleSwitcher.loadStyle(); //since style is loaded from savegame
  window.gm.quests.setQuestData(s.quests); //necessary for load support
  window.gm.switchPlayer(s._gm.activePlayer);
}
//called before data is serialized
window.gm.preSave=function(){
  var s = window.story.state;
  s.IDGenBkup=IDGenerator.instance()._idCounter;
}
//--------------- time management --------------
//returns timestamp since start of game
window.gm.getTime= function() {
  return(window.story.state._gm.time+2400*window.story.state._gm.day);
}
/*
* calculates timedifference a-b in minutes for hhmm time format
*/
window.gm.getDeltaTime = function(a,b){
  var m=a%100;         
  var h=((a-m)/100);
  var m2=b%100;         
  var h2=((b-m2)/100);
  return((h*60+m)-(h2*60+m2));
}
//adds MINUTES to time
window.gm.addTime= function(min) {
  let v=window.story.state._gm;
  let m=v.time%100;         
  let h=parseInt((v.time-m)/100);
  m= m+min;
  let m2 = m%60;
  let h2 = h+parseInt((m-m2)/60);
  window.story.state._gm.time = (h2*100+m2%60);
  while(window.story.state._gm.time>=2400) {
    window.story.state._gm.time -= 2400;
    window.story.state._gm.day += 1;
  }
  window.gm.timeEvent.publish("change",min);
  window.gm.player.Effects.updateTime(); //todo not happy with that; see PubSub-comment
  window.gm.player.Outfit.updateTime();
  // updating all existing chars might not be wise (some could be dead)
  // but what if I have to update other chars too?
  //
  
};
window.gm.getTimeString= function() {
  var c=window.gm.getTimeStruct();
  return (c.hour<10?"0":"")+c.hour.toString()+":"+(c.min<10?"0":"")+c.min.toString()+"("+c.daytime+")";
};
// DoW = DayOfWeek  7 = Sunday, 1 = Monday,...6 = Saturday 
window.gm.getTimeStruct=function() {
  var v=window.story.state._gm;
  var m=v.time%100;
  var h=((v.time-m)/100);
  var daytime = ''; 
  //"Night","Dawn","Morning","Noon","Afternoon","Evening"
  //"22-2"  "2-6" "6-10"  "10-14" "14-18" "18-22" "22-2"]
  if(v.time>200 && v.time<600) {
    daytime = 'Dawn';
  } else if(v.time>600 && v.time<1000) {
    daytime = 'Morning';
  } else if(v.time>=1000 && v.time<1400) {
    daytime = 'Noon';
  } else if(v.time>=1400 && v.time<1800) {
    daytime = 'Afternoon';
  } else if(v.time>=1800 && v.time<2200) {
    daytime = 'Evening';
  } else {
    daytime = 'Night';
  }
  var DoW = window.story.state._gm.day%7;
  return({'hour':h,'min':m, 'daytime': daytime, 'DoW':DoW});
};
window.gm.timeslots=["Night","Dawn","Morning","Noon","Afternoon","Evening"];
window.gm.DoWs = ['Monday', 'Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
window.gm.getDateString= function() {
  var v=window.story.state._gm;
  return v.day.toString()+". day "+ window.gm.DoWs[(v.day%8)-1];
};
//forward time to until (1025 = 10:25), regenerate player
//warning dont write 0700 because this would be take as octal number
window.gm.forwardTime=function(until) {
  let v=window.story.state._gm;
  let msg='';
  let m=v.time%100;
  let h=parseInt((v.time-m)/100);
  let m2=until%100;
  let h2=parseInt((until-m2)/100);
  let min = (h2-h)*60+(m2-m);
  //if now is 8:00 and until 10:00 we assume you want to sleep 2h and not 2+24h
  //if now is 10:00 and until is 9:00 we assume sleep for 23h
  if(until<v.time) {
    min = 24*60-(h-h2)*60+(m-m2);
  }
  if(min===0) { //if sleep from 700 to 700, its a day
    min=24*60;
  }
  msg+="</br>"+min%60+" hours pass by.</br>";
  window.gm.addTime(min);
  window.gm.pushLog(msg);
  return({msg:msg,delta:min});
};


// use: child._parent = window.gm.util.refToParent(parent);
window.gm.util.refToParent = function(me){ return function(){return(me);}};  //todo causes problem with replaceState??
//since there is no builtin function to format numbers here is one: formatNumber(-1002.4353,2) -> 1,002.44  
window.gm.util.formatNumber = function(n, dp){
  var s = ''+(Math.floor(n)), d = Math.abs(n % 1), i = s.length, r = '';
  while ( (i -= 3) > 0 ) { r = ',' + s.substr(i, 3) + r; }  //todo . & , is hardcoded
  return s.substr(0, i + 3) + r + (dp>0 ? '.' +(d ? Math.round(d * Math.pow(10, dp || 2)) : '0'.repeat(dp)) : '');
};
//---------------------------------------------------------------------------------
//TODO 
//maybe you sometimes dont want to trigger an event immediatly, 
//f.e. if you send a email, it might take some time until you get a response-email 
//(you can receive email at anytime on your phone, so we would have to add checks on ALL passages)
//use this function to push a passage to a stack of deffered events; 
//the passage will trigger under the given condition: minimum time, location-tag, at a certain time-window
//the passage will show when a new passage is requested and will be removed from stack
//if this passage is already pushed, only its condition will be updated
window.gm.pushDeferredEvent=function(id,args,front=false) {
    /*var cond1 = {waitTime: 6,
                locationTags: ['Home','City'],      //Never trigger in Combat
                dayTime: [1100,600]
              },
        cond2 = { waitTime: 60,
                  locationTags: ['Letterbox'],
        };
      */
    let cond = [];//[cond1,cond2]; //passage is executed if any of the conds is met
    if(front) {
      window.story.state._gm.defferedStack.unshift({id:id,cond:cond,args:args});
    } else {
      window.story.state._gm.defferedStack.push({id:id,cond:cond,args:args});
    }
};
window.gm.popDeferredEvent= function() {
  let evt = window.story.state._gm.defferedStack.shift();
  window.story.state.tmp.args = evt.args;
  return evt.id;
}
window.gm.removeDefferedEvent=function(id=""){
  if(id!=="") {
    for(var i=window.story.state._gm.defferedStack.length-1;i>0;i--) {
      if(window.story.state._gm.defferedStack[i].id===id) 
      window.story.state._gm.defferedStack.splice(i,1);
    }
  }else {
    window.story.state._gm.defferedStack = [];
  }
}
/*window.gm.hasDeferredEvent = function(id="") {
  if(id!=="") {
    for(var i=0;i<window.story.state._gm.defferedStack.length;i++) {
      if(window.story.state._gm.defferedStack[i].id===id) return(true);
    }
    return(false);
  } else {
    return(window.story.state._gm.defferedStack.length>0);
  }
}
window.gm.showDeferredEvent= function() {
  var msg = '';

  var namenext = window.passage.name;
  //var tagsnext = window.story.passage(namenext).tags;
  var evt = window.story.state._gm.defferedStack.shift();
  if(evt!==null) {
    msg += window.gm.printPassageLink("Next",evt.id);
  }
  return msg;
}*/
//when show is called the previous passage is stored if the new has [_back_]-tag
//if the new has no back-tag, the stack gets cleared
window.gm.pushBackPassage=function(id) {
  if(!window.story.state.hasOwnProperty("_gm")) return;  //exist only after initGame
  if(window.story.state._gm.passageStack.length>0 && window.story.state._gm.passageStack[window.story.state._gm.passageStack.length-1]===id){
    //already pushed
  } else {
    window.story.state._gm.passageStack.push({id:id, flags:window.story.state.tmp.flags});
  }
};
//call on [_back_]-passages to get the previous passage
window.gm.popBackPassage=function() {
    let pass = window.story.state._gm.passageStack.pop();
    if(!pass) throw new Error('nothing to pop from stack');
    window.story.state.tmp.flags = pass.flags;
    return(pass.id);
};
//push passage on hold before playing deffered passage
window.gm.pushOnHold=function(id) {
  if(!window.story.state.hasOwnProperty("_gm")) return;  //exist only after initGame
  if(window.story.state._gm.onholdStack.length>0){
    throw new Error('passage allready onHold: '+id); //already some pushed
  } else {
    window.story.state._gm.onholdStack.push({id:id, args:window.story.state.tmp.args});
  }
};
//
window.gm.popOnHold=function() {
    let pass = window.story.state._gm.onholdStack.pop();
    if(!pass) throw new Error('nothing on hold to pop.');
    window.story.state.tmp.args=pass.args;
    return(pass.id);
};
//overriding show:
//- to enable back-link
//- todo to intercept with deffered events
let _origStoryShow = window.story.__proto__.show;
window.story.__proto__.show = function(idOrName, noHistory = false) {
  let next = idOrName;
  let inGame = window.story.state.hasOwnProperty("_gm"); //the logic doesnt work if initGame not already done
  let tagsnext,namenext,nextp,namenow;
  if(idOrName==='') tagsnext=[];
  else tagsnext = window.story.passage(idOrName).tags;
  if(inGame && window.story.state._gm.defferedStack.length>0 && //deffered event if allowed and requested
    //tagsnext.indexOf('_back_')<0 &&
    tagsnext.indexOf('_nosave_')<0 && tagsnext.indexOf('_nodeffered_')<0 ) { 
      //before entering a new passage check if there is a defferedEvent that we should do first
      //if so, push the normal-passage onto stack, show deffered passage
      //after the deffered passage(s) finish, make sure to show the original passage
      //this is a problem?how do I know the deffered passage is done? 
    if(idOrName!=='') {//if not continue-cmd
      window.gm.pushOnHold(idOrName);
      if(tagsnext.indexOf('_back_')>=0 && window.passage.name!==idOrName) { //push on stack but only if not re-showing itself
        window.gm.pushBackPassage(window.passage.name); //todo do we need extra back-stack for onhold?
      }
    }
    next = window.gm.popDeferredEvent();
    nextp = window.story.passage(next);
    tagsnext =  nextp.tags; window.story.state.tmp.flags={};
  } else if(inGame && idOrName==='' && window.story.state._gm.onholdStack.length>0) { //continue event onhold
    next =window.gm.popOnHold()
    if(next === '_back_') { //going back
      next = window.gm.popBackPassage();
    }
    nextp = window.story.passage(next);
    tagsnext =  nextp.tags;
  } else if(idOrName === '_back_') { //going back
    next = window.gm.popBackPassage();
    tagsnext = window.story.passage(next).tags;
  } else {  //going forward
    nextp = window.story.passage(next);
    if(!nextp) throw new Error('no such passage: '+next);
    tagsnext = nextp.tags; namenext = nextp.name;
    if(tagsnext.indexOf('_back_')>=0 ) { //push on stack but only if not re-showing itself
      namenow = window.passage.name;
      if(namenext!=namenow) window.gm.pushBackPassage(namenow); 
      window.story.state.tmp.flags={};
    } else if(inGame) { //if not in _back_-passage, drop the _back_-stack
      window.story.state._gm.passageStack.splice(0,window.story.state._gm.passageStack.length);
      window.story.state.tmp.flags={};
    }
    //todo not sure about this: a deffered event should not link to normal passages because this would disentangle the original story-chain
    //this I think could cause issues and should be detected and throw an error
    //uncoment the following to bypass this 
    //    window.story.state._gm.onholdStack.splice(0,window.story.state._gm.onholdStack.length);
  }
  if(inGame) {//disable save-menu on _nosave_-tag 
      window.story.state._gm.nosave = (tagsnext.indexOf('_nosave_')>=0 );
  }
  noHistory = true; //the engines object causes problems with history, namely refToParent
  _origStoryShow.call(window.story,next, noHistory);
};
/* when returning from back-passage, restore view by hiding/unhiding programatical modified elements, see printTalkLink
*/
window.gm.restorePage=function() {
  if(window.story.state.tmp) {
    let elmts =Object.keys(window.story.state.tmp.flags);
    for(var i=0;i<elmts.length;i++) {
      if(window.story.state.tmp.flags[elmts[i]]==='hidden') {
        $(elmts[i])[0].setAttribute("hidden","");
      } else if(window.story.state.tmp.flags[elmts[i]]==='unhide') {
        $(elmts[i])[0].removeAttribute("hidden");
        $(elmts[i])[0].scrollIntoView();
      }
    }
  }
}
//-----------------------------------------------------------------------------
//changes the active player and will add him to party!
window.gm.switchPlayer = function(playername) {
  var s = window.story.state;
  window.gm.player= s[playername];
  s._gm.activePlayer = playername;
  window.gm.addToParty(playername);
}
window.gm.removeFromParty= function(name) {
  var s=window.story.state;
  var i = s._gm.playerParty.indexOf(name);
  if(i>=0) s._gm.playerParty.splice(i,1);
}
//adds the character to the party
//there has to be a CharacterObject for window.story.state[name]
window.gm.addToParty= function(name) {
  var s=window.story.state;
  if(s._gm.playerParty.indexOf(name)<0)
    s._gm.playerParty.push(name);
}
window.gm.isInParty = function(name) {
  return(window.story.state._gm.playerParty.indexOf(name)>=0);
}
//-----------------------------------------------------------------------------


//---------------------------------------------------------------------------------
  //updates all panels
window.gm.refreshAllPanel= function() {
  window.story.show(window.passage.name);
};
//updates only sidepanle,logpanel
window.gm.refreshSidePanel = function(){
  renderToSelector("#sidebar", "sidebar");renderToSelector("#LogPanel", "LogPanel"); 
};
///////////////////////////////////////////////////////////////////////
window.gm.pushLog=function(msg,Cond=true) {
  if(!Cond || msg==='') return;
  var log = window.story.state._gm.log;
  log.unshift(msg+'</br>');
  if(log.length>10) {
      log.splice(log.length-1,1);
  }
};
window.gm.getLog=function() {
  var log = window.story.state._gm.log;
  var msg ='';
  for(var i=0;i<log.length;i++) {
      msg+=log[i];
  }
  return(msg);
};
window.gm.clearLog=function() {
  var log = window.story.state._gm.log;
  var msg ='';
  for(var i=0;i<log.length;i++) {
      msg+=log[i];
  }
  window.story.state._gm.log = [];
  return(msg);
};
//////////////////////////////////////////////////////////////////////
window.gm.roll=function(n,sides) { //rolls n x dies with sides
  var rnd = 0;
  for(var i=0;i<n;i++) {
      rnd += _.random(1,sides);
  }
  return(rnd); 
}
//expects DOM like <section><article>..<div id='output'></div>..</article></section>
window.gm.printOutput= function(text,where="section article div#output") {
  document.querySelector(where).innerHTML = text;
};
//connect to onclick to toggle selected-style for element + un-hiding related text
//the elmnt (f.e.<img>) needs to be inside a parentnode f.e. <div id="choice">
//ex_choice is jquery path to fetch all selectable elmnt
//for a table in a div this could be "div#choice table tbody tr td *"
//text-nodes needs to be inside a parent node f.e. <div id="info"> and have matching id of elmnt
//ex_info is jquery path to fetch all info elmnt
//for a <p> in div this could be "div#info  
window.gm.onSelect = function(elmnt,ex_choice,ex_info) {
  var all = $(ex_choice);//[0].children;
  for(var i=0;i<all.length;i++) {
    if(all[i].id === elmnt.id) {
      all[i].classList.add("selected");
    }
    else all[i].classList.remove("selected");
  }
  all = $(ex_info)[0].children;
  for(var i=0;i<all.length;i++) {
      if(all[i].id === elmnt.id) {
        all[i].hidden=false;
      }
      else all[i].hidden=true;
  }
};
//call this onclick to make the connected element vanish and to unhide another one (if the passage is revisited the initial state will be restored)
//unhidethis needs to be jquery-path to a div,span,.. that is initially set to hidden
//cb can be a function(elmt) that gets called
//todo: if navigating to a back-page and return, the initial page will be reset to default; how to memorize and restore the hidden-flags
window.gm.printTalkLink =function(elmt,unhideThis,cb=null) {
  $(elmt)[0].setAttribute("hidden","");
  if(cb!==null) cb($(elmt)[0]);
  $(unhideThis)[0].removeAttribute("hidden");
  $(unhideThis)[0].scrollIntoView({behavior: "smooth"});
  window.story.state.tmp.flags[elmt]='hidden',window.story.state.tmp.flags[unhideThis]='unhide';
}
//prints the same kind of link like [[Next]] but can be called from code
window.gm.printPassageLink= function(label,target) {
  return("<a href=\"javascript:void(0)\" data-passage=\""+target+"\">"+label+"</a>");
};
//prints a link where target is a expression called onClick
window.gm.printLink= function(label,target) {
  return("<a href=\"javascript:void(0)\" onclick=\""+target+"\">"+label+"</a>");
};

//prints a link that when clicked picksup an item and places it in the inventory, if itemleft is <0, no link appears
window.gm.printPickupAndClear= function(itemid, desc,itemleft,cbAfterPickup=null) {
  var elmt='';
  var s= window.story.state;
  if(!(itemleft>0)) return(elmt);
  var desc2 = desc+" ("+itemleft+" left)";
  var msg = 'took '+itemid;
  elmt +="<a0 id='"+itemid+"' onclick='(function($event){window.gm.pickupAndClear(\""+itemid+"\", \""+desc+"\","+itemleft+","+cbAfterPickup+")})(this);'>"+desc2+"</a></br>";
  return(elmt);
};
window.gm.pickupAndClear=function(itemid, desc,itemleft,cbAfterPickup=null) {
  window.gm.player.Inv.addItem(new window.storage.constructors[itemid]());
  if(cbAfterPickup) cbAfterPickup();
  window.gm.refreshAllPanel();
};
//prints an item with description; used in inventory
window.gm.printItem= function( id,descr,carrier,useOn=null ) {
  var elmt='';
  var s= window.story.state;
  var _inv = window.gm.player.Inv;
  var _count =_inv.countItem(id);
  if(useOn===null) useOn=carrier;
  elmt +=`<a0 id='${id}' onclick='(function($event){document.querySelector(\"div#${id}\").toggleAttribute(\"hidden\");})(this);'>${id} (x${_count})</a>`;
  var useable = _inv.usable(id);
  if(_count>0 && useable.OK) {
      elmt +=`<a0 id='${id}' onclick='(function($event){var _res=window.gm.player.Inv.use(\"${id}\"); window.gm.refreshAllPanel();window.gm.printOutput(_res.msg);}(this))'>${useable.msg}</a>`;
  }
  elmt +=`</br><div hidden id='${id}'>${descr}</div>`;
  if(window.story.passage(id))  elmt +=''.concat("    [[Info|"+id+"]]");  //Todo add comands: drink,eat, use
      elmt +=''.concat("</br>");
      return(elmt);
};
/**
 * prints a list of items/wardrobe and buttons to transfer them
 * @param {*} from 
 * @param {*} to 
 */
window.gm.printItemTransfer = function(from,to,wardrobe) {
  let listFrom,listTo;
  if(wardrobe) listFrom=from.Wardrobe.getAllIds(), listTo=to.Wardrobe.getAllIds(); 
  else listFrom=from.Inv.getAllIds(), listTo=to.Inv.getAllIds();
  let allIds = new Map();
  for(let el of listTo) {
    allIds.set(el,{name:wardrobe?to.Wardrobe.getItem(el).name:to.Inv.getItem(el).name});
  }
  for(let el of listFrom) {
    allIds.set(el,{name:wardrobe?from.Wardrobe.getItem(el).name:from.Inv.getItem(el).name});
  }
  listFrom = Array.from(allIds.keys());listFrom.sort();
  function give(id,amount,charA,charB) {
    let item,count = charA.Inv.countItem(id);
    if(count===0) { //wardrobe or item
      count=charA.Wardrobe.countItem(id);
      item = charA.Wardrobe.getItem(id);
    } else item = charA.Inv.getItem(id);
    count=Math.min(count,amount);
    charA.changeInventory(item,-1*count);
    item = window.gm.util.deepClone(item);//item = window.gm.ItemsLib[id](); doesnt work for dynamic created items
    charB.changeInventory(item,count);
    window.gm.refreshAllPanel();
  }
  for(let id of listFrom) {
    let g,entry = document.createElement('p');
    entry.textContent =allIds.get(id).name;
    let count = wardrobe?from.Wardrobe.countItem(id):from.Inv.countItem(id);
    g = document.createElement('a');
    g.href='javascript:void(0)',g.textContent='store 1 of '+window.gm.util.formatNumber(count,0);
    g.addEventListener("click",give.bind(null,id,1,from,to));
    if(count>0) entry.appendChild(g)
    g = document.createElement('a');
    g.href='javascript:void(0)',g.textContent='store all';
    g.addEventListener("click",give.bind(null,id,count,from,to));
    if(count>0) entry.appendChild(g)
    count = wardrobe?to.Wardrobe.countItem(id):to.Inv.countItem(id);
    g = document.createElement('a');
    g.href='javascript:void(0)',g.textContent='take 1 of '+window.gm.util.formatNumber(count,0);
    g.addEventListener("click",give.bind(null,id,1,to,from));
    if(count>0) entry.appendChild(g)
    g = document.createElement('a');
    g.href='javascript:void(0)',g.textContent='take all';
    g.addEventListener("click",give.bind(null,id,count,to,from));
    if(count>0) entry.appendChild(g)
    $("div#choice")[0].appendChild(entry);      // <- requires this node in html
  }
}
//prints an equipment with description; used in wardrobe
window.gm.printEquipment= function( whom,item) {
  var elmt='';
  var s= window.story.state;
  var res,name,desc;
  name=item.name, desc=item.desc;
  if(item.hasTag('body')) return; //skip bodyparts; 
  let noWear = item.hasTag(['piercing','tattoo']); 
  let g,entry = document.createElement('p');
  g = document.createElement('a'),g.href='javascript:void(0)';
  g.textContent=item.name;g.id=item.id;
  g.addEventListener("click",(function(evt){document.querySelector("div#"+evt.target.id).toggleAttribute("hidden");}));
  entry.appendChild(g);
  g = document.createElement('a'),g.href='javascript:void(0)';
  if(noWear===true) {
    g.textContent='';//cannot un-/equip tattoos & piercing 
  } else if(whom.Outfit.countItem(item.id)<=0) {
    g.textContent='Equip';
    g.addEventListener("click",(function(whom,item){
      return(function(){whom.Outfit.addItem(item);window.gm.refreshAllPanel();});})(whom,item));
  } else {
    res = whom.Outfit.canUnequipItem(item.id,false);
    if(res.OK) {
      g.textContent='Unequip';
      g.addEventListener("click",(function(whom,item){
        return(function(){whom.Outfit.removeItem(item.id);window.gm.refreshAllPanel();});})(whom,item));
    } else {
      g.disabled =true; g.textContent=res.msg;
    }
  }
  entry.appendChild(g)
  g=document.createElement('div');
  g.id=item.id; g.hidden=true;g.textContent=item.desc;
  entry.appendChild(g)
  $("div#choice")[0].appendChild(entry); 
  /*if(window.story.passage(id))  elmt +=''.concat("[[Info|"+id+"]]");  //Todo passages for items?
      elmt +=''.concat("</br>");
      return(elmt);*/
};
//prints a string listing equipped items
window.gm.printEquipmentSummary= function() {
  var whom=window.gm.player;
  var result ='', ids = [];
  ids = whom.Outfit.getAllIds();
  for(var i=0;i<ids.length;i++){
    let item = whom.Outfit.getItem(ids[i]);
    if(item.hasTag('body')) continue;
    result+=item.name+',';
  }
  return(result);
};
//prints a string listing equipped items
window.gm.printRelationSummary= function() {
  var elmt='';
  var s= window.story.state;
  var result ='';
  var ids = [];
  result+='<table>';
  var ids = window.gm.player.Rel.getAllIds();
  ids.sort();
  for(var k=0;k<ids.length;k++){
      if(ids[k].split("_").length===1) {   //ignore _min/_max
          var data = window.gm.player.Rel.get(ids[k]);
          result+='<tr><td>'+data.id+':</td><td>'+data.value+' of '+window.gm.player.Rel.get(ids[k]+"_Max").value+'</td></tr>';
      }
  }   //todo print mom : 10 of 20
  result+='</table>';
  return(result);
};
//prints achievements
window.gm.printAchievements= function() {
  var elmt='';
  var result ='';
  var ids = [];
  result+='<table>';
  var ids = Object.keys(window.gm.achievements);
  ids.sort();
  for(var k=0;k<ids.length;k++){
          result+='<tr><td>'+ids[k]+':</td><td>'+window.gm.achievements[ids[k]]+'</td></tr>';
  }   //todo print mom : 10 of 20
  result+='</table>';
  return(result);
};
//prints a string listing stats and effects
window.gm.printEffectSummary= function(who='player',showstats=true,showfetish=false,showresistane=false) {
  var elmt='';
  var s= window.story.state;
  var result ='';
  var ids = [];
  result+='<table>';
  var ids =window.story.state[who].Stats.getAllIds();
  
  ids.sort(); //Todo better sort
  for(var k=0;k<ids.length;k++){
      var data = window.story.state[who].Stats.get(ids[k])
      let isFetish = (data.id.slice(0,2)==='ft'); //Fetish starts with ft
      let isResistance = (data.id.slice(0,4)==='rst_')||(data.id.slice(0,4)==='arm_'); //
      if(data.hidden!==4) {
        if(isFetish && showfetish && !(data.id.slice(-4,-2)==='_M') ) {
          //expects names of fetish like ftXXX and limits ftXXX_Min ftXXX_Max
          let min = window.story.state[who].Stats.get(ids[k]+"_Min");
          let max = window.story.state[who].Stats.get(ids[k]+"_Max");
          result+='<tr><td>'+((data.hidden & 0x1)?'???':data.id)+':</td><td>'+((data.hidden & 0x2)?'???':data.value)+'</td>';
          result+='<td>'+((data.hidden & 0x2)?'???':'('+(min.value+' to '+max.value))+')</td></tr>';
        }
        if((!isFetish && !isResistance && showstats) || (!isFetish && isResistance && showresistane)) {
          result+='<tr><td>'+((data.hidden & 0x1)?'???':data.id)+':</td><td>'+((data.hidden & 0x2)?'???':data.value)+'</td></tr>';
        }//todo show modifier list for each stat  agility: BracerLeather +2
      }
  }
  result+='</table>';
  result+='</br>Active Effects:<table>'
  ids = window.story.state[who].Effects.getAllIds();
  ids.sort(); //Todo better sort
  for(var i=0;i<ids.length;i++){
      var data = window.story.state[who].Effects.get(ids[i]);
      result+='<tr><td>'+data.id+':</td><td>'+data.desc+'</td></tr>';
  }
  result+='</table>';
  return(result);
};
///show/hides a dialog defined in body
window.gm.toggleDialog= function(id){ 
  const _id = id;
  var dialog = document.querySelector(id),
      closebutton = document.getElementById('close-dialog'),
      pagebackground = document.querySelector('body');
  var div;
  if (!dialog.hasAttribute('open')) {
      // show the dialog 
      div = document.createElement('div');
      div.id = 'backdrop';
      document.body.appendChild(div); 
      dialog.setAttribute('open','open');
      // after displaying the dialog, focus the closebutton inside it
      closebutton.focus();
      closebutton.addEventListener('click',function() {window.gm.toggleDialog(_id);});
  }
  else {		
      dialog.removeAttribute('open');  
      div = document.querySelector('#backdrop');
      div.parentNode.removeChild(div);
      //??lastFocus.focus();
  }
};