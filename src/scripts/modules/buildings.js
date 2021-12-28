"use strict";
//////////////////////////////////////////
/**
 * a person that works in a Facility or on their own
 *
 * @class Operator
 */
 class Operator extends Character { 
    constructor(){ super(),
        this.id = Entity.UID();
        this.name='Operator'+this.id;
        this.job=Operator.Job.Nothing;this.jobActive=false;
        this.traits ={};
        this.temper=0,      //  -100=rebellious 100=kind
        this.obedience=0,   //  -100=never obeys 0= 100= always obeys
        this.trust=0;       //  -100=fearsome 100=trustful
        //mood        -100 very sad 100=always happy
        //lust        -100=gets frigid fast 0=no change over time 100=gets eager fast
            
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
    Brewer: 'Brewer',
    Chemist : 'Chemist',
    Worker: 'Worker',
    Builder : 'Builder',
    Scavenger : 'Scavenger',
    WoodChopper : 'WoodChopper',
    Hunter : 'Hunter',
    Scout : 'Scout',
    Smith : 'Smith',
    Technican: 'Technican',
    Slaver: 'Slaver',
    Torturer: 'Torturer',
    BeastTamer: 'BeastTamer',
    Farmhand: 'Farmhand',
    Farmer : 'Farmer',
    Stablehand : 'Stablehand', 
    Stablemaster: 'Stablemaster',
    Guard: 'Guard',
    Soldier: 'Soldier'

}
class Shipwreck extends Homestead {
    constructor(){super(); this.style=0;
        this.storage[Resource.ID.Wood]=10,this.storage[Resource.ID.Iron]=10,this.storage[Resource.ID.IronOre]=10,
        this.storage[Resource.ID.Food]=8,this.storage[Resource.ID.Energy]=4,this.storage[Resource.ID.Stone]=10;
    }
    set style(style) {
        this._style = style; 
        switch(style) {
        case 0: 
            this.id=this.name='Shipwreck';
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='The remains of your crashed ship.</br> It currently acts as a base homestead and storage. </br> Each day it will produce some rations and energy to help survival.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Shipwreck", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Shipwreck, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) {
            this.gain=5,this.lastTick=time;
            let _R = new ResourceChange();_R.Resource='Food',_R.gain=(9);
            window.story.state.Events.push(_R);
            _R = new ResourceChange();_R.Resource='Energy',_R.gain=(3);
            window.story.state.Events.push(_R);
        }
        return(false);
    }
    getCapacity(typ) {
        if(typ==='people') return(3);
        retur(0); 
    }
}
class Housing extends Homestead {
    constructor(){super(); this.style='Tent';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {builders:[],resources:[],time:0};
        switch(style) {
        case 'Tent': 
            this.cost.resources.push({ResId:'Wood',amount:3}),this.cost.time=2;
            break;
        case 'Cabin': 
            this.cost.resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:3}],this.cost.time=3;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Tent': 
                msg ='A tent made from wood and other scavenged material.';
                break;
            case 'Cabin': 
                msg ='A wooden cabin.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    getCapacity(typ) {
        if(typ==='people') return(3);
        return(0); 
    }
    toJSON() {return window.storage.Generic_toJSON("Housing", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Housing, value.data);};
}
class SlavePen extends Homestead {
    constructor(){super(); this.style='SlavePen';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {Resources:[],time:0};
        switch(style) {
        case 'SlavePen': 
            this.cost.resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:3}],this.cost.time=3;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Kennel': 
                msg ='Some cages for caught critters. And slaves that haven\'t earned a comfy cell.';
                break;
            case 'SlavePen': 
                msg ='A homestead for your slaves.';
                break;
            case 'TentaclePit': 
                msg ='Where your Tentacle creatures live. Might be useful to send a slave there to teach them a lesson.';
                break;
            case 'Stocks': 
                msg ='Show the public what happens to slaves refusing to work or breaking a law.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    getCapacity(typ) {
        if(typ==='slave') return(2);
        retur(0); 
    }
    toJSON() {return window.storage.Generic_toJSON("SlavePen", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(SlavePen, value.data);};
}
class Smithy extends Facility {
    constructor(){super(); this.style='Smithy';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {builders:[],resources:[],time:0};
        switch(style) {
        case 'Smithy': 
            this.cost.resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:5}],this.cost.time=5;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Smithy': 
                msg ='A small forge fire and an anvil to make simple metal parts.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Smithy", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Smithy, value.data);};
}
class Farm extends Facility {
    constructor(){super(); this.style='FarmGrain';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {builders:[],resources:[],time:0};
        switch(style) {
        case 'FarmGrain': 
            this.cost.resources=[{ResId:'SeedCrops',amount:8},{ResId:'Iron',amount:2}],this.cost.time=8;
            break;
        case 'FarmFungus': 
            this.cost.resources=[{ResId:'SeedFungus',amount:8},{ResId:'Iron',amount:2}],this.cost.time=8;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'FarmGrain': 
                msg ='A plot of land to grow crops for food.';
                break;
            case 'FarmFungus': 
                msg ='A plantation of that fungus used for drugs.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Farm", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Farm, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) { this.lastTick=time;
            let _R = new ResourceChange();_R.Resource='Crops',_R.gain=(9);
            window.story.state.Events.push(_R);
        }
        return(false);
    }
}
class Windmill extends Facility {}
class Wall extends Facility {}
//repressor-field
//ambulance, clinic
//brewery, canteen



window.gm.BuildingsLib = (function (Lib) {
    window.storage.registerConstructor(Operator); //todo operator-Lib?
    window.storage.registerConstructor(Shipwreck);
    window.storage.registerConstructor(Housing);
    window.storage.registerConstructor(Smithy);
    Lib['Shipwreck']= function () { let x= new Shipwreck();return(x);};
    Lib['Tent']= function () { let x= new Housing();return(x);};
    Lib['Cabin']= function () { let x= new Housing();x.style='Cabin';return(x);};
    Lib['Smithy']= function () { let x= new Smithy();return(x);};
    Lib['SlavePen']= function () { let x= new SlavePen();return(x);};
    return Lib; 
}(window.gm.BuildingsLib || {}));