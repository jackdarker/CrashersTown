"use strict";

/**
 *a baseclass containing common functions
 *
 * @class Entity
 */
export class Entity {
    //static UID(){Entity.prototype.UID=(Entity.prototype.UID===undefined)?1:Entity.prototype.UID+=1; return(Entity.prototype.UID);};
    constructor() {
        this.id=IDGenerator.createID(),this.name = 'Entity'+this.id;
        this.tags = [], this.lastTick = window.gm.getTime();
    }
    get parent() {return this._parent?this._parent():null;}
    _relinkItems(parent){this._parent=window.gm.util.refToParent(parent);}
    _updateId(){ 
        var _oldId = this.id;
        this.id=IDGenerator.createID();
        if(this.parent) this.parent._updateId(_oldId);  //TODO required?
    }
    //tag or [tag]
    hasTag(tags) {
        if(tags instanceof Array) {
            for(var i=0;i<tags.length;i++) {
                if(this.hasTag(tags[i])) return(true);
            }
            return(false);
        }
        return(this.tags.includes(tags));
    }
    removeTags(tags){
        for(var i= this.tags.length-1;i>=0;i--){
            if(tags.includes(this.tags[i])) this.tags.splice(i,1);
        }
    }
    addTags(tags){
        for(var i= tags.length-1;i>=0;i--){
            if(!this.tags.includes(tags[i])) this.tags.push(tags[i]);
        }
    }
    tick(){ return(false);}
    renderTick(){ return(false);}
}

class ResourceBase extends Entity {
    constructor() {
        super();
        this._amount=0;
    }
    set amount(amount) {this._amount=amount;}
    get amount() { return this._amount;}
    consume(count){
        this._amount = Math.max(0,this._amount-count);
    }
}


/**
 * represents a workshop converting resources in other resources
 *
 * @class Generator
 */
class Generator extends Entity {
    constructor() {
        super();
    }
    getConsum(){}
    getRequired(){}
    getProject(){}
    getEfficiency(){}
    getDamage(){}
    fixDamage(){}
    getOpState(){}
    getProgress(){}
}
/**
 * a building or device; has generators
 *
 * @class Facility
 */
class Facility extends Entity{
    constructor() {
        super();
        this.cost = {builders:[],resources:[],time:0}; //how much for building it
        this.storage ={}; //what resources to store .Iron=2
        this.operator = []; //what kind of person is required for minimum production
        this.bonusOperator= []; //who can help with production eg farmhand
    }
}
/**
 * a building that is used as home for someone
 */
class Homestead extends Facility {
    constructor() {
        super();
    }
    // how many people/animals can life here
    getCapacity(typ) {retur(0); }
}

/**
 * a Skill, Mallus or Bonus
 *
 * @class Trait
 */
class Trait {
    constructor() {
        this.id=this.name='';
        this.level=0;  // tells how strong the trait is; negative values for opposite effect e.g. smart=-10 -> dumb
        this.hidden=0; // "???" if 
    }
    toJSON() {return window.storage.Generic_toJSON("Trait", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Trait, value.data);};
    desc(){return(this.name);}
    /* */
} 
/**
 * Work / Leisure / Training
 *
 * @class Job
 */
 class Job {
    constructor() {
        this.id=this.name='';
        this.level=0;  // 
        this.hidden=0; // "???" 
        this.workspace=null;
        this.workspaces=[];
    }
    toJSON() {return window.storage.Generic_toJSON("Job", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Job, value.data);};
    desc(){return(this.name);}
    requiredWorkspace(){    // [[]]
        return([this.workspaces]);
    }
    requiredResource(){ //for 100% Build
        return([]);
    }
    requiredEnergy(){
        return(30);
    }
    requiredBoss(){ //
        return([]);
    }
    params(){return({})}
} 
/**
 * this is a building or equipment, it keeps track of the workprogress
 */
class Workspace {
    constructor() {
        this.id=this.name='';
        this.level=0;  // 
        this.maxPeople=1;
        this.produceStack=[]; //a stack of items to produce {id: "Iron", count:-1 }
        this.produce="";    //current produce
        this.progress=0;    // 100%
        this.lastTick="";
    }
    toJSON() {return window.storage.Generic_toJSON("Workspace", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Workspace, value.data);};
    desc(){return(this.name);}
    doJob(people,now){
        this.lastTick=now;
        if(true){
            var entry = document.createElement('p');
            entry.textContent = "Someone worked here.";
            document.querySelector("div#panel").appendChild(entry);
            GMEvent.createNextBt('Next');
            return(true); //halt for display
        }
        return(false);
    }
    renderTick() {
        return(true);
    }
    /*tick(time){ //overwrite this with the result of the work
        let delta = window.gm.getDeltaTime(time,this.lastTick);  
        if(delta>(4*60-1)) {
            this.lastTick=time;
        }          
    }*/
}
class WS_Maid extends Workspace{
    constructor() {
        super();
    }
    toJSON() {return window.storage.Generic_toJSON("WS_Maid", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(WS_Maid, value.data);};
    desc(){return(this.name);}
}
class WS_Smithy extends Workspace{
    constructor() {
        super();
    }
    toJSON() {return window.storage.Generic_toJSON("WS_Smithy", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(WS_Smithy, value.data);};
    desc(){return(this.name);}
}
/**
 * base class for the events
 */
class GMEvent extends Entity {
    static createButton(label,foo) {
        let link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){foo();});
        link.textContent=label;
        $("div#panel")[0].appendChild(link);
    }
    static createNextBt(label) {
        let link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){window.story.show('_Event');});
        link.textContent=label;
        $("div#panel")[0].appendChild(link);
    }
    constructor() {
        super();
        this.done=false;
    }
}
/**
 * represents an area you can explore or do some resource gathering
 */
class MapArea extends Entity {
    constructor() {
        super();
        this.timesExplored=0;
        this.nextScene='';
    }
    desc(){return(this.name);}
    explore(PerId) {
        this.nextScene='';  
        return(false);
    }
    hunt(PerId) {
        this.nextScene='';  //todo if we hunt&explore at same time we would need separate scene
        return(false);
    }
    scavenge(PerId) {
        this.nextScene='';  
        return(false);
    }
}