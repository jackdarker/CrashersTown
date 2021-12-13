"use strict";
/**
* a class to provide methods to work with PC & NPC
*/
class Character {
    static defaultData() {
        return({
        id:'',
        name: '',
        faction: 'Enemy',
        location : "Home",
        XP: 0,  //this is the XP you have earned but not yet spent
        level: 0,  
        unspentStat: 0, //on level up you get Stat-points to distribute
        inv: [],  //inventory data, needs to be mapped to Inventory-Instance
        wardrobe: [],  //separate wardobe data, needs to be mapped to outfit-Instance
        outfit: [],  // needs to be mapped to outfit-Instance
        stats: [],
        effects: [],
        rel: [],
        skills: []
        });
    }
    constructor(externlist) {
        this._data = externlist ? externlist : Character.defaultData();
        this.Outfit = new Outfit(this._data.outfit);
        this.Outfit._parent = window.gm.util.refToParent(this);
        this.Inv = new Inventory(this._data.inv);
        this.Inv._parent = window.gm.util.refToParent(this);
        this.Wardrobe = new Inventory(this._data.wardrobe);
        this.Wardrobe._parent = window.gm.util.refToParent(this);
        this.Stats = new StatsDictionary(this._data.stats);
        this.Stats._parent = window.gm.util.refToParent(this);
        this.Effects = new Effects(this._data.effects);
        this.Effects._parent = window.gm.util.refToParent(this);
        this.Rel = new StatsDictionary(this._data.rel); //Todo Relation similiar to stats?
        this.Rel._parent = window.gm.util.refToParent(this);
        this.Skills = new Inventory(this._data.skills);
        this.Skills._parent = window.gm.util.refToParent(this);
        //create basic stats
        stHealth.setup(this.Stats,10,10),stEnergy.setup(this.Stats,30,30),stWill.setup(this.Stats,0,0);
        for(let el of window.gm.combat.TypesDamage) {
            stResistance.setup(this.Stats,0,el.id);
            stArmor.setup(this.Stats,0,el.id); 
        }
        stAgility.setup(this.Stats,10,100),stIntelligence.setup(this.Stats,10,100),stLuck.setup(this.Stats,10,100);
        stCharisma.setup(this.Stats,10,100),stPerception.setup(this.Stats,10,100),stStrength.setup(this.Stats,10,100),stEndurance.setup(this.Stats,10,100);
        stSavageness.setup(this.Stats,0,10),stCorruption.setup(this.Stats,0,100),stArousal.setup(this.Stats,0,100);
        for(let name of stFetish.listFetish()) {
            stFetish.setup(this.Stats,0,10,name);
        }         
        this.Skills.addItem(new SkillUseItem());this.Skills.addItem(new SkillStruggle());this.Skills.addItem(new SkillAttack());
        this.Skills.addItem(new SkillStun());this.Skills.addItem(new SkillHeal());this.Skills.addItem(new SkillTease());
        this.Skills.addItem(new SkillFlee()),this.Skills.addItem(new SkillSubmit());    
        this.Effects.addItem(new effCombatRecovery());
        this.Effects.addItem(new effSpermDecay());
        window.storage.registerConstructor(Character);
    }
    toJSON() {return window.storage.Generic_toJSON("Character", this); }
    static fromJSON(value) { 
        var _x = window.storage.Generic_fromJSON(Character, value.data);
        //need to recreate parent links
        _x.Effects._relinkItems();
        _x.Stats._relinkItems();
        _x.Inv._relinkItems();
        _x.Outfit._relinkItems();
        _x.Wardrobe._relinkItems();
        _x.Rel._relinkItems();
        _x.Skills._relinkItems();
        return(_x);
    };
    /**
    * calculates how many levels you can upgrade
    * @param {int} XP available
    * @returns {int} level from
    */
    static calcXPToLevel(XP,fromLvl=1) {
        let XP2 = Character.calcLevelToXP(fromLvl);
        return(Math.floor((-1+Math.sqrt(1+(XP+XP2)*4/50))/2));
    }
    static calcLevelToXP(lvl) {
        return(100*lvl*(lvl+1)/2); //Gauss-Sum
    }
    /**
     * id of char
     */
    get id() { return(this._data.id);  }
    set id(id) {this._data.id=id;}
    get name() { return(this._data.name);  }
    set name(name) {this._data.name=name;}
    get faction() { return this._data.faction; } 
    set faction(name) {this._data.faction=name;}
    get location() {
        return(this._data.location);    
    }
    set location(name) {this._data.location=name;}
    get level() {return(this._data.level);  }
    get canLevelUp() {
        let next = Character.calcXPToLevel(this._data.XP,this._data.level)
        return(next!==this._data.level);
    }
    get level(){return(this._data.level);}
    addXP(XP) { this._data.XP+=XP; }
    /*
     * upgrade level by 1;this will increase level even if not enough XP !
    */
     levelUp(add=1) { 
        if(add<1) return;
        let reqXP=Character.calcLevelToXP(this._data.level+add)-Character.calcLevelToXP(this._data.level);
        this._data.XP-=reqXP; //calculate requires XP and subtract from already gained
        if(this._data.XP<0) this._data.XP=0;
        this._data.level+=add;
        this._data.unspentStat+=add*4;  //todo ?pt Stat per Level?
    }
    //overwrite this to define the wheighting for autoLeveling
    //returns an array of objects with "id" matching the statname and "wgt" as a number that defines the relativ wheight (f.e. if 1 stat should be 50% more then other set this to 20 and all other to 10)
    autolevelWheight() {return([{id:"strength",wgt:10},{id:"agility",wgt:11},{id:"intelligence",wgt:10},{id:"luck",wgt:8},{id:"charisma",wgt:8},{id:"perception",wgt:8},{id:"endurance",wgt:9}]);}
    // this is called for NPC to automatically spent XP and distribute stat-points according to autolevelWheight-property
    autoLeveling() {
        let add = Character.calcXPToLevel(this._data.XP,this._data.level)-this._data.level;
        this.levelUp(add);
        let weight = this.autolevelWheight();        
        let sort = function(a,b){return(b.new-a.new);};
        while(this._data.unspentStat>0) {
            //get the actual stats; immagine wgt as the goal-shape how the values are set at a certain level 
            let sumC =0, sumG = 0; 
            for(el of weight){
                el.value = this.Stats.get(el.id).base;
                sumC += el.value, sumG +=el.wgt;
            }
            //calculate the difference between current value and goal defined by playstyle
            for(el of weight){ //new is the difference in points; +1 to force distribution if the current matches the goal
                el.new = Math.ceil(((el.wgt/sumG) -(el.value/sumC))*sumC) +1 ;
                if(el.new<=0) el.new =1;
            }   
            //and distribute pt
            weight=weight.sort(sort);
            for(el of weight){
                let x = Math.floor(el.new);
                x =  Math.min(this._data.unspentStat,2,x);
                this.Stats.increment(el.id,x);
                this._data.unspentStat-=x;
            }
        }
    }
    isDead() {return(this.Stats.get('health').value<=0);}
    isKnockedOut() {return(this.isDead()||(this.Stats.get('arousal').value>=this.Stats.get('arousalMax').value));}
    /** 
    * "naked" - naked
    * "primal" - cover genitals 
    * "civil" - wears some trousers,footwear and torsocovers
    * "formal" - ...wears underwear too
    */
    clothLevel() { //TODO
        let uwOK = false,civOK =false;
        if(this.Outfit.getItemId(window.gm.OutfitSlotLib.uHips)!=='' && this.Outfit.getItemId(window.gm.OutfitSlotLib.uBreast)!=='')  {
            uwOK= true;
        }
        if(this.Outfit.getItemId(window.gm.OutfitSlotLib.Hips)!=='' && this.Outfit.getItemId(window.gm.OutfitSlotLib.Breast)!=='' &&
            this.Outfit.getItemId(window.gm.OutfitSlotLib.Feet)!=='') {
                civOK= true;
        }
        if(uwOK && civOK) return "formal";
        if(civOK) return "civil";
        if(uwOK ) return "primal"  
        return('naked');
    }
    health() {return({value:this.Stats.get('health').value, max:this.Stats.get('healthMax').value, min:0});}
    energy() {return({value:this.Stats.get('energy').value, max:this.Stats.get('energyMax').value, min:0});}
    will() {return({value:this.Stats.get('will').value, max:this.Stats.get('willMax').value, min:0});}
    arousal() {return({value:this.Stats.get('arousal').value, max:this.Stats.get('arousalMax').value, min:this.Stats.get('arousalMin').value});}
    sleep(until=700) {
        let {msg,delta}=window.gm.forwardTime(until);
        let regen = delta>=360 ? 9999 : parseInt(delta/60*15);  //todo scaling of regeneration
        this.Stats.increment('health',regen);
        this.Stats.increment('energy',regen);
        this.Stats.increment('will',regen);
        if(delta>360) {
            this.Effects.addItem(new effNotTired());
        } 
    }
    addEffect(effect,id) {
        this.Effects.addItem(effect,id);
    }
    //helper function to change Relation 
    gainRelation(char,val) {
        var _idx = this.Rel.findItemSlot(char);
        if(_idx<0) {
            stRelation.setup(this.Rel,val,100,char);
        } else {
            this.Rel.increment(char,val);
        }
    }
    /**
     * helper function to handle wardrobe (not outfit!)/inventory properly; 
     * if amount<0 remove itme, else add
     */
    changeInventory(item,amount) {
        if(item.slotUse && !item.hasTag('weapon')) { //equipment goes into wardrobe except weapons
            if(amount<0) this.Wardrobe.removeItem(item.id,-1*amount);
            else if(amount>0) this.Wardrobe.addItem(item,amount);
        } else {
            if(amount<0) this.Inv.removeItem(item.id,-1*amount); 
            else if(amount>0) this.Inv.addItem(item,amount); 
        }
      }
    //combat related
    _canAct() { //todo even if stunned we should be able to struggle
        var result = {OK:true,msg:''};
        if(this.Effects.findEffect("effStunned").length>0) {    //findItemSlot annot use since there might be different effect ids
            result.OK=false;
            result.msg =this.name+ " is stunned and cannot react."
            return(result);
        }
        return(result);
    }
    //combat related; return a msg describing the state of the character
    //"Wolf is currently entangled by vines."
    //"You have your towershield raised to guard against damage. Your mana is drained by an opponents spell."
    _stateDesc() {
        let result = {OK:true,msg:''};
        let isPlayer = window.gm.player.id === this.id;
        for(let list = this.Effects.getAllIds(), i=list.length-1;i>=0;i-=1) {
            if(list[i]==="effStunned") {
                result.msg = "$[I]$ $[am]$ stunned and cant do a thing.";
            }
        }
        result.msg = window.gm.util.descFixer(this)(result.msg);
        return(result);
    }
    getPenis() {
        let penis = this.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bPenis);
        return(penis);
    }
    getVagina() {
        let vulva = this.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bVulva);
        return(vulva);
    }
    getAnus() {
        return(this.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bAnus));
    }
}