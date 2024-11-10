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
 * a person that works in a Facility or on their own
 *
 * @class Operator
 */
 class Operator extends Character { 
    constructor(){ super(),
        this.id = IDGenerator.createID();
        this.name='Operator'+this.id;
        this.job=Operator.Job.Nothing;this.jobActive=false;
        this.traits ={};
        this.civil="free";  //"worker", "slave", "prisoner", "pet?"//
        this.WorkOptions=[window.gm.LibJobs.Rest()];
        this.WorkSchedule={};   //{Monday:{Dawn:{Rest:{}},{Morning:{}} } }
        this.temper=0,      //  -100=rebellious 100=kind
        this.obedience=0,   //  -100=never obeys 0= 100= always obeys
        this.trust=0;       //  -100=fearsome 100=trustful
        //mood        -100 very sad 100=always happy
        //lust        -100=gets frigid fast 0=no change over time 100=gets eager fast
    }
    getWorkOption(jobid){
        return(window.gm.getArrayElementById(this.WorkOptions,jobid));
    }
    addWorkOption(job){
        let _x=window.gm.getArrayIndexById(this.WorkOptions,job.id); 
        if(_x>=0) this.WorkOptions[_x]=job;
        else this.WorkOptions.push(job);
    }
    dropWorkOption(job){
        let _x=window.gm.getArrayIndexById(this.WorkOptions,job.id); 
        if(_x>=0) this.WorkOptions.splice(_x,1);
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
    static fromJSON(value) { 
        let _x= window.storage.Generic_fromJSON(Operator, value.data);
        _x._relinkItems();
        return(_x);
    };
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
/**
 * Work / Leisure / Training
 *
 * @class Job
 */
 class Job {
    constructor() {
        this.id=this.name='';
        this.level=0;  // 
        this.workspaces=[];
    }
    toJSON() {return window.storage.Generic_toJSON("Job", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Job, value.data);};
    desc(){return(this.name);}
    requiredWorkspace(){    
        return(this.workspaces);
    }
    params(){return({})}
} 
/**
 * this is a building or equipment, it keeps track of the workprogress
 */
class Workspace {
    constructor() {
        this.id=this.name='';
        this.reqStats=[];//[{id:"strength",min:5,max:10}];
        this.reqSkills=[];//[{id:"Smithing",min:0,max:5}];
        this.reqEnergy=0;
        this.maxPeople=1;
        this.produces=false;    //flag set if was/is producing
        this.produceStack=[]; //a configured stack of items to produce {id: "Iron", count:-1 }
        this.produce="";    //current produce
        this.progress=0;    // 100%
        this.lastTick="";
    }
    toJSON() {return window.storage.Generic_toJSON("Workspace", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Workspace, value.data);};
    desc(){return(this.name);}
    requiredEnergy(){
        return(this.reqEnergy);
    }
    /*
    *   calculates work-output and skill-gain 
    *   first person is boss
    */
    calcWorkforce(people,run){
        let _res ={OK:true,msg:'',output:[], gain:[], finished:false};
        //gain = {id:"strength",gain:1, person:"Lydia"}
        //output = {id:"Money", gain:5}    {id:"Potion", gain:0}    
        //finished is set when non-unlimited producestack cleared
        let cappedStats=[],cappedSkills=[],wf,g,z,_P,temp;
        let wfFactor=0.5; //TODO depends on job/produce
        //a job requires skill-level and minimum stats (1 or more)
        //stats & skill above cap are ignored

        //for each person...
        people.forEach((person)=>{
            _P = window.gm.getArrayElementById(window.story.state.City.Slaves,person);
            if(_P.Stats.get("energy").value<this.reqEnergy){ //ignore person if outof energy
                _res.OK=false;
                _res.msg+=_P.name+'doesnt have enough energy.'
            } else {    //calc capped Stats
                // chance to increase skill/stats: low skill -> higher chance to increase; skill>=cap -> no increase
                // gain=(skill_ul-capped_skill)/(skill_ul*2)        (5-2)/(5*2)=30%     
                temp=[];
                this.reqStats.forEach((x)=>{ //capped stats
                    z=Math.min(x.max,_P.Stats.get(x.id).value);
                    cappedStats.push(z); 
                    if(z<x.max){
                        g=(x.max-z)/(2*x.max);
                        temp.push({id:x.id,gain:g,person:_P.id});
                    }
                });
                this.reqSkills.forEach((x)=>{ //capped job-skills
                    z=Math.min(x.max,_P.getWorkOption(x.id).level);
                    cappedSkills.push(z); 
                    if(z<x.max){
                        g=(x.max-z)/(2*x.max);
                        temp.push({id:x.id,gain:g,person:_P.id});
                    }
                });
                // only one increase (stat or skill) per person
                if(temp.length>0){  //pick gain with biggest chance
                    temp.sort((a,b)=>{return(b.gain-a.gain);});
                    _res.gain.push(temp[0]);
                }
                _.random(0,temp.length-1);
            }
        })

        
        //wf= sqrt(1+capped_skill)*sum(capped_stats)/N   
        wf=1;
        if(cappedSkills.length>0){
            cappedSkills.forEach((x)=>{wf+=x;});
            wf=Math.sqrt(wf);
        }
        z=0;
        if(cappedStats.length>0){
            cappedStats.forEach((x)=>{z+=x;});
            z=z/(cappedStats.length/people.length);
        }
        wf=wf*z;        
        // + bonus for outfit
        // + bonus if boss present

        //output= Item*wf  Item is either coin/h  or  Item/wf (50% Axe)
        while(wf>0){ //after creating item, use remaining wf on next item
            if(this.produce=="" && this.produceStack.length>0) { //pull next item to produce
                this.produces=true;
                this.produce=this.produceStack[0].id;
                this.progress=0.0;  //todo deduct resources depending recipe
                if(this.produceStack[0].count>1){
                    this.produceStack[0].count-=1;
                } else if(this.produceStack[0].count==1){
                    this.produceStack.shift();
                } //else unlimited
            }
            if(this.produces==true && this.produce!="") { //working on item
                z=(1-this.progress)-wf*wfFactor;//work left
                if(z>0.0) { //still work to do
                    this.progress=1-z;
                    break;
                }else if(z<=0.0){ //no or some wf left
                    wf=-1*z/wfFactor;
                    _res.output.push({id:this.produce, gain: 1});   //TODO combine multiple Iron:1 to Iron:5
                    this.produce="";this.progress=0;
                }
            } else if(this.produces==true && this.produce=="") {    //stack finished
                _res.finished=true;//Todo set job to Rest
                break;
            } else {    //other work for money
                _res.output.push({id:"Money", gain: Math.floor(wf*wfFactor)});
                this.progress=0; //100% ?
                break;
            }
        }
    
        if(run==true){
            people.forEach((person)=>{ //for each person...
                _P = window.gm.getArrayElementById(window.story.state.City.Slaves,person);
                if(_P.Stats.get("energy").value>=this.reqEnergy){ //ignore person if outof energy
                    _P.Stats.increment("energy",-1*this.reqEnergy);    //remove energy
                                    //apply skillgain
                }
            })
            //resource-gain needs to be handled outside,see _res.output !
            //skill-gain needs to be handled outside,see _res.gain !
        }
        return(_res);
    }
    canDo(person){  //check if the person can do the job in generell
        let _res={OK:true,msg:""};
        //dont check energy!
        //check skill
        //check Stats
        this.reqStats.forEach((x)=>{
            if(person.Stats.get(x.id).value<x.min){
                _res.OK=false;
                _res.msg=person.name+'doesnt have enough '+x.id+'.'
            }
        })
        return(_res);
    }
    doJob(people,now){  //this is called by schedule per timeslot. 
        let _res=_doJob(people,now);
        if(_res.OK==false){ //something was nok
            GMEvent.createNextBt('Next');
            return(true); //halt for display
        }
        return(false);
    }
    _doJob(people,now){
        this.lastTick=now;
        let entry, _res=this.calcWorkforce(people);
        _res.output.forEach((x)=>{
            let _R = new ResourceChange();_R.Resource=x.id,_R.gain=x.gain;
                window.story.state.Events.push(_R);
        })
        if(_res.OK==false){
            entry = document.createElement('p');
            entry.textContent = _res.msg;
            document.querySelector("div#panel").appendChild(entry);
            GMEvent.createNextBt('Next');
            return(true); //halt for display
        }
        return(_res);
    }
    renderTick() { //OBSOLETE?
        return(true);
    }
    /*tick(time){ //overwrite this with the result of the work
        let delta = window.gm.getDeltaTime(time,this.lastTick);  
        if(delta>(4*60-1)) {
            this.lastTick=time;
        }          
    }*/
}
/**
 * base class for the events
 */
class GMEvent extends Entity {
    static createButton(label,foo) {
        let link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){foo();});
        link.textContent=label;
        document.querySelector("div#panel").appendChild(link);
    }
    static createNextBt(label) {
        let link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){window.story.show('_Event');});
        link.textContent=label;
        document.querySelector("div#panel").appendChild(link);
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