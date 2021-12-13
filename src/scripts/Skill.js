"use strict";
class SkillResult{
    constructor(){
          this.OK = false,
          this.source = null,
          this.targets = [],
          this.skill = null,
          this.msg = "",
          this.effects = [];
    }
}
class SkillCost{
    constructor(){
          this.will = 0,
          this.energy = 0,
          this.health = 0,
          this.items =[]    //Todo
    }
    asText() {
        let msg='';
        if(this.will>0) msg+=this.will.toString()+' will';
        if(this.energy>0) msg+=this.energy.toString()+' energy';
        if(this.health>0) msg+=this.health.toString()+' health';
        if(msg==='') msg = 'without cost';
        else msg = 'requires ' +msg;
        return(msg);
    }
    canPay(Char) {
        let res = {OK:true,msg:''};
        if(this.will> Char.Stats.get('will').value) {
            res.OK=false; res.msg +='not enough will';
        }
        if(this.health+1> Char.Stats.get('health').value) { //+1 to not selfkill
            res.OK=false; res.msg +='not enough health';
        }
        if(this.energy> Char.Stats.get('energy').value) {
            res.OK=false; res.msg +='not enough energy';
        }
        return(res);
    }
    pay(Char) {
        Char.Stats.increment('health',this.health*-1);
        Char.Stats.increment('will',this.will*-1);
        Char.Stats.increment('energy',this.energy*-1);
    }
}

class SkillMod {
    constructor() {
        this.hitChance =100;
        this.critChance =4;
        this.onHit = [];    // [{ target: 'target', eff: [combatEffect]]
        this.onCrit = [];
        this.onUse = [];
        this.onMiss = [];
    }
}

class Skill {
constructor(id) {
    this.id=this.name = id;
    this.cost = new SkillCost();
    this.level=1;
    this.startDelay=0,this.coolDown=0,this.defCoolDown=0; //how many turns disabled after use
}
//_parent will be added dynamical
get parent() {return this._parent?this._parent():null;}
_relinkItems(parent){this._parent=window.gm.util.refToParent(parent);}
get caster() {return this.parent.parent;}
//implement this for description
get desc() { return(this.name);}
getMaxTargetCount() {return 1;}

isValidPhase() {
        //todo: returns True if the skill can be used in tha actual game-phase (combatPhase,explorePhase)
        return true;
}
/**
 * returns false and text if the skill cannot be used because its temporary disabled (silenced mage, blinded)
 * the text should indicate why and how long it is disabled
 * call super to check cost !
 */
isEnabled() {
    let res={OK:true,msg:''};
    if(this.coolDown>0) res={OK:false,msg:this.coolDown+' turns cooldown'}; 
    if(!res.OK) return(res);
    res=this.getCost().canPay(this.parent.parent);
    return (res);
}
/**
 *
 *
 * @memberof Skill
 */
onCombatStart(){
    this.coolDown=this.startDelay;
}

onTurnStart() { 
    this.coolDown=Math.max(0,this.coolDown-1);
}
//this is used to filter possible targets for a skill
//the function returns a array of arrays containing the targets  
//f.e. [[dragon],[mole1,mole2]] to indicate that the skill can be used on dragon or both moles at same time
targetFilter(targets){
    return(this.targetFilterEnemy(targets));
}
//returns True if the skill can be used on the target(s)
isValidTarget(target) {
    // filtered can be [[mole1,mole2]] or [[dragon],[mole1,mole2]]
    //target is [dragon] or [mole1,mole2]
    var filtered = this.targetFilter([target]); //[[]] !
    for(var targ of target) {
        var _i = filtered.indexOf(target);
        if(_i<0) return false;
    }
    return true;
}
/**
 * returns information about the cost to execute the skill
 */
getCost(){ //Todo
    return (this.cost);
}
getName(){
    //returns name of the skill for listboxes/labels"""
    return this.name;
}
getCastDescription(result) {
    //update msg after sucessful cast
    return(this.caster.name +" uses "+ this.name +" on " + result.targets[0].name+".");
}
previewCast(target){
    var result = new SkillResult();
    result.msg = this.caster.name +" will use "+ this.name +" on " + targets.name;
    return(result);
}
cast(target){
    //execute the skill on the targets
    var result = this.previewCast(target);
    var cost = this.getCost();
    if(result.OK) {
        result.msg = "";
        for(var X of result.effects) {// for each target
            for(var Y of X.eff) {//...multiple effects
                    X.target.addEffect(Y,Y.id);
                    result.msg+=Y.castDesc();
            }
        }
        cost.pay(this.parent.parent);
        this.coolDown=this.defCoolDown;
        result.msg = this.getCastDescription(result)+result.msg; 
    }
    return(result)
}

//some predefined filter; chain them to narrow down the targets
targetFilterSelf(targets){
        var possibleTarget = [];
        for(var target of targets) {
            var valid = true;
            for(var targ of target) {
                if(this.caster != targ) valid=false;
            }
            if(valid) possibleTarget.push(target);           
        }
        return possibleTarget;
}
targetFilterAlly(targets){
        var possibleTarget = [];
        for(var target of targets){
            var valid = true;
            for(var targ of target) {
                if(this.caster.faction != targ.faction) valid=false;
            }
            if(valid) possibleTarget.push(target);     
        }
        return possibleTarget;
}
targetFilterEnemy(targets){
        var possibleTarget = [];
        for(var target of targets){
            var valid = true;
            for(var targ of target) {
                if(this.caster.faction == targ.faction) valid=false;
                //if(targ.isKnockedOut()) valid=false;
            }
            if(valid) possibleTarget.push(target);
        }
        return possibleTarget;
}
targetFilterFighting(targets){   //chars that are not inhibited
        var possibleTarget = [];
        for(var target of targets){
            var valid = true;
            for(var targ of target) {
                if(!targ._canAct().OK) valid=false;
            }
            if(valid) possibleTarget.push(target); 
        }
        return possibleTarget
}
targetFilterAlive(targets){    //chars that are not dead
        var possibleTarget = [];
        for(var target of targets){
            var valid = true;
            for(var targ of target) {
                if(targ.isKnockedOut()) valid=false; //todo ..isDead()??
            }
            if(valid)
                possibleTarget.push(target); 
        }
        return possibleTarget;
}
targetFilterDead(targets){    //chars that are dead
        var possibleTarget = [];
        for(var target of targets){
            var valid = true;
            for(var targ of target) {
                if(!targ.isDead()) valid=false;
            }
            if(valid)
                possibleTarget.push(target); 
        }
        return possibleTarget;
}
targetMultiple(targets){
    var possibletarget = targets.slice(0);
    //[[mole1],[mole2]]
    var multi = [];
    multi.name = "all"; //there has to be a name for display
    for(var el of possibletarget) {
        if(el.length===1)   //dont stack multi-targets
            multi.push(el[0]);
    }
    if(multi.length>0) possibletarget.push(multi);
    //[[mole1],[mole2],[mole1,mole2]]
    return(possibletarget);
}
}