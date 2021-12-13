"use strict;"

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
    tick(){ return(false);}
    renderTick(){ return(false);}
}

class ResourceBase extends Entity {
    constructor() {
        super();
        this._amount=0;
    }
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
    }
}
/**
 * a building that is used as home for someone
 */
class Homestead extends Facility {
    constructor() {
        super();
    }
}

/**
 * a person that works in a Facility or on their own
 *
 * @class Operator
 */
class Operator extends Entity { 
    constructor(){ super(),this.name='Operator'+this.id;this.style=Operator.Job.Nothing;}
    set style(style) {
        this._style = style; 
        switch(style) {
        case Operator.Job.Nothing: 
        case Operator.Job.Scavenger:
        case Operator.Job.Hunter:
        case Operator.Job.WoodChopper:
        case Operator.Job.Farmer:
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='Operator#'+this.id;
        switch(this._style) {
            case Operator.Job.Nothing:
                msg ='Has no job assigned.';
                break;
            case Operator.Job.WoodChopper:
                msg ='chop wood.';
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
            if(this.style===Operator.Job.Hunter) {
                let _R = new ResourceChange();_R.Resource='Food';
                window.story.state.Events.push(_R);
            }
        }
        return(false);
    }
    getDamage(){}
    fixDamage(){}
    getNeeds(){}
    satisfyNeed() {}
    getTraits(){}
    getHome(){}
    setHome(){}
}
Operator.Job = {
    Nothing : 'Nothing',
    Scavenger : 'Scavenger',
    WoodChopper : 'WoodChopper',
    Hunter : 'Hunter',
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
 * 
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