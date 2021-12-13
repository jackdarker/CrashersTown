"use strict";

/*bunch of combat encounters are defined here */
window.gm = window.gm || {};
window.gm.encounters = window.gm.encounters || {};

//params = {location:window.passage.name, amount:1};
window.gm.encounters.mole = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount?amount:1;i>0;i-=1) {
            let x = window.gm.Mobs.Mole(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.onSubmit = function() {
        return('What will now happen to you?</br>'+ window.gm.printPassageLink('Next','Mole Submit'));
    }
    window.gm.Encounter.initCombat();
}
window.gm.encounters.leech = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount?amount:1;i>0;i-=1) {
            let x = window.gm.Mobs.Leech(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.slug = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount?amount:1;i>0;i-=1) {
            let x = window.gm.Mobs.Slug(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.slugLeech = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount?amount:1;i>0;i-=1) {
            let x = window.gm.Mobs.Slug(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
            x = window.gm.Mobs.Leech(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.succubus = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Succubus(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.mechanicguy = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = window.gm.Mobs.Mechanic;
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.hornett = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    var noStart = (params&&params.noStart)?true:false;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Hornett(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    if(!noStart) window.gm.Encounter.initCombat();
}
window.gm.encounters.huntress = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Huntress(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.lizan = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Lizan(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
/*------------------------*/
window.gm.encounters.wolf = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    var type =(params&&params.type)?params.type:0;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x;
            x = window.gm.Mobs.Wolf(type); x.scaleLevel(window.gm.player.level);
            if(_.random(1,100)>50) {
                window.gm.MutationsLib.swapGender(x,window.storage.constructors["VulvaHuman"]);
            } 
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('You cannot fight anymore and surrender to the beast.</br>'+ window.gm.printPassageLink('Next','WolfSubmit'));
    }
    window.gm.Encounter.onVictory = function() {
        window.story.state.tmp.args=[(function() { window.gm.sex.wolfOnPlayer({state:0, battleResult:'victory'});})];
        return('Intimitated, the wolf rolls on its back, whimpering submissively and exposing its throat.</br>'+this.fetchLoot()+'</br>'+ window.gm.printPassageLink('Next','GenericPassage'));
        //return('Intimitated, the wolf rolls on its back, whimpering submissively and exposing its throat.</br>'+this.fetchLoot()+'</br>'+ window.gm.printPassageLink('Next','WolfVictory'));
    }
    /*window.gm.Encounter.sceneDone=false; //attach flag to Encounter-Instance;
    window.gm.Encounter.onMoveSelect = function() {
        let s=window.story.state;
        let result = {OK:false, msg:''};
        if(window.gm.Encounter.sceneDone===false && s.combat.turnCount===3) {
            result.OK=window.gm.Encounter.sceneDone=true;
            result.msg = 'Wolf growls at you.</br>'+ window.gm.printPassageLink('Next','WolffightIntermezzo');
        } 
        return(result);
    }*/
    window.gm.Encounter.initCombat();
}
window.gm.encounters.lapine = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Lapine(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('That bunny literally kicked your ass.</br>'+ window.gm.printPassageLink('Next','LapineDefeat'));
    }
    window.gm.Encounter.onVictory = function() {
        return('The bunny surrenders.</br>'+this.fetchLoot()+'</br>'+ window.gm.printPassageLink('Next','LapineVictory'));
    }
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
window.gm.encounters.dryad = function(params) {
    var amount=(params&&params.amount)?params.amount:1, location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let mobs =[];
        for(var i=amount;i>0;i-=1) {
            let x = window.gm.Mobs.Dryad(); x.scaleLevel(window.gm.player.level);
            x.name+='#'+i;mobs.push(x);
        }
        return(mobs);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('You cannot fight anymore and surrender to the strange woman.</br>'+ window.gm.printPassageLink('Next','DryadSubmit'));
    }
    window.gm.Encounter.onVictory = function() {
        return('The dryad has run out of energy.</br>'+this.fetchLoot()+'</br>'+ window.gm.printPassageLink('Next','DryadVictory'));
    }
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.initCombat();
}
/////////////////////////////////////////////////////////////
//special encounter
window.gm.encounters.Carlia = function(params) {
    var location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let x = window.story.state.Carlia;
        x.Stats.increment("health",9999); x.Stats.increment("energy",9999);x.Stats.increment("will",9999);
        return([x]);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('You surrender to the monster-girl.</br>'+ window.gm.printPassageLink('Next','CarliaSubmit'));
    }
    window.gm.Encounter.onVictory = function() {
        return('Carlia doesnt want to fight anymore.</br>'+ window.gm.printPassageLink('Next','CarliaVictory'));
    }
    window.gm.Encounter.sceneDone=0; //attach flag to Encounter-Instance;
    window.gm.Encounter.onMoveSelect = function() {
        let s=window.story.state;
        let result = {OK:false, msg:''};
        if(window.gm.Encounter.sceneDone===0 && s.combat.turnCount>=4) {
            result.OK=window.gm.Encounter.sceneDone=100;
            window.gm.Encounter.endCombat();
            result.msg = window.gm.printPassageLink('Next','CarliaMakeDeal');
        } 
        return(result);
    }

    window.gm.Encounter.initCombat();
}
window.gm.encounters.Trent = function(params) {
    var location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let x = window.story.state.Trent; 
        x.Stats.increment("health",9999); x.Stats.increment("energy",9999);x.Stats.increment("will",9999); 
        return([x]);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('You cannot fight anymore and surrender to the beast-man.</br>'+ window.gm.printPassageLink('Next','TrentSubmit'));
    }
    window.gm.Encounter.onVictory = function() {
        return('It was barely an even fight but you showed this horsy its place.</br>'+ window.gm.printPassageLink('Next','TrentVictory'));
    }
    window.gm.Encounter.initCombat();
}
window.gm.encounters.Ruff = function(params) {
    var location=(params&&params.location)?params.location:window.passage.name;
    window.gm.Encounter = new Encounter();
    window.gm.Encounter.EnemyFunc = (function() { 
        let x = window.story.state.Ruff; 
        x.Stats.increment("health",9999); x.Stats.increment("energy",9999);x.Stats.increment("will",9999); 
        return([x]);});
    window.gm.Encounter.Location = location?location:window.passage.name;
    window.gm.Encounter.scenePic = window.gm.getScenePic(window.gm.Encounter.Location);
    window.gm.Encounter.onSubmit =window.gm.Encounter.onDefeat = function() {
        return('You cannot fight anymore and surrender to the beast-man.</br>'+ window.gm.printPassageLink('Next','RuffSubmit')); //TODO !!
    }
    window.gm.Encounter.onVictory = function() {
        return('It was barely an even fight but you showed this horsy its place.</br>'+ window.gm.printPassageLink('Next','RuffVictory'));
    }
    window.gm.Encounter.initCombat();
}