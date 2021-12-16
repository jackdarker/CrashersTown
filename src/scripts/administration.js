"use strict";

/**
 *a baseclass containing common functions
 *
 * @class Entity
 */
export class Entity {
    static UID(){Entity.prototype.UID=(Entity.prototype.UID===undefined)?1:Entity.prototype.UID+=1; return(Entity.prototype.UID);};
    constructor() {
        this.id=Entity.UID(),this.name = 'Entity'+this.id;
        this.tags = [], this.lastTick = window.gm.getTime();
    }
    get parent() {return this._parent?this._parent():null;}
    _relinkItems(parent){this._parent=window.gm.util.refToParent(parent);}
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
        this.cost = {Resources:[],time:0}; //how much for building it
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
 * a person that works in a Facility or on their own
 *
 * @class Operator
 */
class Operator extends Entity { 
    constructor(){ super(),
        this.name='Operator'+this.id;
        this.job=Operator.Job.Nothing;
        this.jobActive=false;
    }
    set job(job) {
        this._job = job; 
    }
    get job() {return this._job;}
    get desc() { 
        let msg ='Operator#'+this.id;
        switch(this._job) {
            case Operator.Job.Nothing:
                msg ='Has no job assigned.';
                break;
            case Operator.Job.Scavenger:
                msg ='Searchs an area for some useful resources.';
                break;
            case Operator.Job.WoodChopper:
                msg ='Chops wood.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Operator", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Operator, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) {
            this.lastTick=time;
            let _R;
            if(this._job===Operator.Job.Hunter) {
                _R = new ResourceChange();_R.Resource='Food';
                window.story.state.Events.push(_R);
            } else if(this._job===Operator.Job.WoodChopper) {
                _R = new ResourceChange();_R.Resource='Wood';
                window.story.state.Events.push(_R);
            }
            this.needsSatisfied=false; //todo people dont work if hungry
        }
        return(false);
    }
    getDamage(){}
    fixDamage(){}
    // returns list of resources to feed
    getBasicNeeds(){
        return([{ResId:'Food',amount:3}]);
    }
    satisfyNeeds() {
        this.needsSatisfied=true;
    }
    getTraits(){}
    getHome(){}
    setHome(){}
}
Operator.Job = {
    Nothing : 'Nothing',
    Scavenger : 'Scavenger',
    WoodChopper : 'WoodChopper',
    Hunter : 'Hunter',
    Scout : 'Scout',
    Smith : 'Smith',
    Slaver: 'Slaver',
    BeastTamer: 'BeastTamer',
    Farmer : 'Farmer'
}
/**
 * a Skill, Mallus or Bonus
 *
 * @class Trait
 */
class Trait extends Entity {
    constructor() {
        super();
    }
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