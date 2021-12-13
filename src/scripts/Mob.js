"use strict";

class Mob extends Character {
    constructor() {
        super();
        this.level_min = 1;     
        this.baseXPReward=0;
        this.loot =[];   //[{id:'healthpotion',chance:5, amount:1}]
        this.levelUp(1);
        this.autoLeveling();
        this.despawn=false;
    }
    //override to return the next move to execute
    //OK = false if no action, else true
    //msg should contain a message formatted for view (move description )g 
    //this function should decide what actions the mob takes; 
    //query _canAct to check if stunned or otherwise incapaciated, then run execCombatCmd(moveNOP) 
    calcCombatMove(enemys,friends){
        let rnd = _.random(1,100);
        let result = {OK:true,msg:''};
        result.action =result.target= null;
        if(rnd>20) {  
            rnd = _.random(0,enemys.length-1);
            result.action = "Attack";
            result.target = [enemys[rnd]];
            result.msg =this.name+" trys to attack you.</br>"+result.msg;
        } else {
            if(this.Skills.countItem('Guard')>0) {
                result.action = "Guard";
                result.target = this;
            }
            result.msg =this.name+" takes a defensive stance.</br>"+result.msg;
        }
        return(result);
    }
    //return false if skill should be manually selected
    get isAIenabled() { return(true);}
    //override to adjust the mobs attributes to player level
    scaleLevel(lvl) { 
        let x = Math.max(this.level_min,_.random(lvl-3,lvl+3));
        x=x-this.level;   
        if(x>0) {
            this.levelUp(1);
            this.autoLeveling();
        }
        //refill gained stats 
        this.Stats.increment("health",99999); this.Stats.increment("energy",99999);this.Stats.increment("will",99999);
    };
    levelUp(add) {
        super.levelUp(add);
        this.baseXPReward = this.level*20; //todo baseXP = sum of statpoints + skills ?
    }
}


