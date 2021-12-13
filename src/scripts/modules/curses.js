
"use strict";
/**
 * Items can have bonus/curse(s) that is applied when its condition is met 
 * condition is checked when equipped and on every timechange (no check if not equipped ? )
 * if trigger succeeds, apply-function is called  
 * the curse should be initially hidden to the player but might be revealed by a magican
 * 
 * possible conditions to think of:
 * - is activated if worn for some time
 * - is activated if other certain (cursed) items are worn
 * - is activated if effect is active
 * - is activated if in location
 * 
 * possible actions to think of:
 * - disable unequip/ locking
 * - replace the item with a different one
 * - add an effect
 * 
 * use deffered event to show the triggerd curse
 * 
 * ways to remove a curse (not yet triggered)
 * - by magican?
 * 
 * ways to remove active curse
 * - a key to unlock
 * - dissolve the item by a magican
 * - use item/potion that counters the effect
 * - mutate body to remove bodypart (snake -> no wristcuffs) 
 */
/**
 * //hidden 0 = visible, 1= name=???, 2= , 4= hidden
 */
class Curse {
    constructor() {
        this.hidden=0;
        this.trigger = null;
        this.list=[];
    }
    /* 
    * parent is the item !
    * Attention !! _parent will be added dynamical
    */
    get parent() {return(this._parent?this._parent(): null);} 
    _relinkItems(parent) {
        this._parent = window.gm.util.refToParent(parent);
        this.trigger._parent=window.gm.util.refToParent(this);
        for(el of this.list) {
            el._parent=window.gm.util.refToParent(this);
        }
    }
    configureCurse(item,trigger,curses) {
        this.trigger = trigger;
        this.list=curses;
        item.bonus.push(this);
        this._relinkItems(item);
        //todo: basePrice if bonus/curse is hidden; if bonus/curse is known, increase/lower price; if bonus/curse is not fully known, increase price slightly 
        item.price=item.basePrice*(1+item.bonus.length);
        item._updateId();
    }
    toJSON() {return window.storage.Generic_toJSON("Curse", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(Curse, value.data);return(x);}
    onEquip() {
        if(this.trigger.onEquip()) this.apply();
    }
    onUnequip() {
        if(this.trigger.onUnequip()) this.apply(true);
    }
    canUnequip() { //ask effects if allowed to unequip/not locked
        let res;
        for(el of this.list) {
            res = el.canUnequip();
            if(res.OK==false) return(res);
        }
        res = {OK:true, msg:'unequipable'};
        return(res);
    }
    onTimeChange(time) {
        if(this.trigger.onTimeChange(time)) this.apply();
    }
    apply(unapply){
        this.hidden=0; //reveal
        for(el of this.list) {
            el.apply(unapply); //todo 3 effects would generate 3 defferedEvents; instead combine text into single event
        }
    }
    get desc() {
        let msg='';
        if((this.hidden & 0x4)>0) {  //completely hidden

        } else if((this.hidden & 0x1)>0) {
            msg = 'unknown effect';
        } else if(this.hidden===0 ) {
            msg = this.trigger.desc;
            for(el of this.list) {
                msg += "; " + el.desc;
            }
        }
        return(msg);
    }
}
//-------------------------------------------------------------------------
class CrsTrigger { //each curse has a trigger that evaluates if the curse gets triggered
    constructor() { }
     /* 
    * parent is the curse !
    * Attention !! _parent will be added dynamical
    */
    get parent() {return(this._parent?this._parent(): null);} 
    _relinkItems(parent){this._parent=window.gm.util.refToParent(parent);}
    onEquip() {return(false);}
    onUnequip() {return(true);} //by default trigger unapply when unequipped
    onTimeChange(time) {return(false);}
    get desc() { return('');}
}
class CrsTrgOnEquip extends CrsTrigger {
    constructor() {
        super();
        this.minItems=0; //if 0 always trigger onEquip
        this.curseName='crs'; // ..otherwise min no. items with this tag need to be equipped
    }
    onEquip() {
        if(this.minItems<=0) return(true);
        let owner=this.parent.parent.parent.parent.Outfit,list = owner.getAllIds();
        let _c = 0;
        for(el of list){
            if(owner.getItem(el).hasTag(this.curseName)) _c+=1;
        }
        return(_c>=this.minItems);  
    }
    onTimeChange(time) {
        if(this.minItems<=0) return(false);
        return(this.onEquip());
    }
    toJSON() {return window.storage.Generic_toJSON("CrsTrgOnEquip", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsTrgOnEquip, value.data));}
    get desc() { return('when equipped');}
}
class CrsTrgDelayed extends CrsTrigger {
    constructor() {
        super();
        this.timeToTrigger = 60*2;
        this.timeStart=null;
    }
    onEquip() {
        this.timeStart = window.gm.getTime();
        return(false);
    }
    onTimeChange(time) {
        return(this.timeToTrigger< window.gm.getDeltaTime(time,this.time));
    }
    toJSON() {return window.storage.Generic_toJSON("CrsTrgDelayed", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsTrgDelayed, value.data));}
    get desc() { return('after '+window.gm.util.formatNumber(this.timeToTrigger,0)+'min');}
}
//-------------------------------------------------------------------------
class CrsEffect {
    constructor() {this.hidden=0;}
     /* 
    * parent is the curse !
    * Attention !! _parent will be added dynamical
    */
    get parent() {return(this._parent?this._parent(): null);} 
    canUnequip() {return({OK:true,msg:'unequipable'});}
    get desc() { return('');}
    apply(unapply) {} //override to do something!
}
class CrsEffLock extends CrsEffect{
    constructor() { super(); this.key='KeyRestraintA';}
    toJSON() {return window.storage.Generic_toJSON("CrsEffLock", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsEffLock, value.data));}
    get desc() {return("The item can only be unlocked with a "+this.key+".")}
    canUnequip() {
        let res= {OK:true,msg:'This devices requires '+this.key+' to unlock'};
        if(this.parent.parent.parent.parent.Inv.countItem(this.key)<=0) {
            res.OK=false;
        }
        return(res);
    }
    apply(unapply) {
        if(unapply) {
            this.parent.parent.parent.parent.Inv.removeItem(this.key,1);
            window.gm.pushDeferredEvent("GenericDeffered",['With the key, it was now possible to unlock and remove '+this.parent.parent.name+' !']);
        } else {
            window.gm.pushDeferredEvent("GenericDeffered",['As soon as you equiped '+this.parent.parent.name+', some hidden lock sealed the item on you !']);
        }
    }
}
class CrsEffConvert extends CrsEffect{
    constructor() {   super(); this.newItem='GlovesRubber'; this.newCurse={lock:true,energydrain:2}; }
    toJSON() {return window.storage.Generic_toJSON("CrsEffConvert", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsEffConvert, value.data));}
    get desc() {return("Converts the item to "+this.newItem+".")}
    apply(unapply) {
        if(unapply) {
        } else {
            let item = window.gm.ItemsLib[this.newItem]();
            item.addTags(['cursed']);//this is ugly
            window.gm.makeCursedItem(item,this.newCurse); //todo how to configure this
            if(this.parent.parent.parent.parent.Outfit.removeItem(this.parent.parent.id).OK) {
            this.parent.parent.parent.parent.Wardrobe.removeItem(this.parent.parent.id);
            window.gm.pushDeferredEvent("GenericDeffered",['To your surprise, '+this.parent.parent.name+' contorts its shape to something different, reforming itself into '+item.name+'! ']);
            this.parent.parent.parent.parent.Wardrobe.addItem(item);
            this.parent.parent.parent.parent.Outfit.addItem(item);
            }
        }
    }
}
class CrsEffEnergyDrain extends CrsEffect{
    constructor() {   super();  }
    toJSON() {return window.storage.Generic_toJSON("CrsEffEnergyDrain", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsEffEnergyDrain, value.data));}
    get desc() {return("Drains wearers energy.")}
    apply(unapply) {
        if(unapply) {
            this.parent.parent.parent.parent.Effects.removeItem(this.parent.parent.id+'_EnergyDrain');
        } else {
        //this->curse->item->outfit->char     id="cursed_leather_bracer.EnergyDrain"
            this.parent.parent.parent.parent.addEffect(new window.storage.constructors['effEnergyDrain'](),this.parent.parent.id+'_EnergyDrain');
        }
    }
}
class CrsEffStatBonus extends CrsEffect{
    constructor() {
        super();
        this.statid ='strength';
        this.statbonus = 5;
    }
    toJSON() {return window.storage.Generic_toJSON("CrsEffStatBonus", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CrsEffStatBonus, value.data));}
    get desc() {return(this.statid+" +"+this.statbonus)}
    apply(unapply) {
        if(unapply) {
            this.parent.parent.parent.parent.Stats.removeModifier(this.statid,{id:this.statid+":"+this.parent.parent.id});
        } else {
            this.parent.parent.parent.parent.Stats.addModifier(this.statid,{id:this.statid+":"+this.parent.parent.id, bonus:this.statbonus});
        }
    }
}
//todo wrap you in rubber; pony gear,
/**
 * adds a curse-function to an item
 */
window.gm.makeCursedItem = function(item, extra) {
    let curse = new Curse();
    let eff =null;
    let list=[];
    curse.trigger = new CrsTrgOnEquip();
    if(extra.hidden) {          //hidden:4
        curse.hidden=extra.hidden;
    } else curse.hidden=4; //by default hidden
    if(extra.minItems) {
        curse.trigger.minItems=extra.minItems;
        curse.trigger.curseName = 'cursed'; //todo PonyCurse
        item.addTags([curse.trigger.curseName]); 
    }
    if(extra.delayed) {         //delayed:60
        curse.trigger = new CrsTrgDelayed();
        curse.trigger.timeToTrigger=extra.delayed;
    }
    if(extra.lock) {            //lock:1
        eff = new CrsEffLock();
        list.push(eff);
    }
    if(extra.convert) {         //convert:'rubber'
        eff = new CrsEffConvert();
        eff.newItem=extra.convert;
        eff.newCurse={lock:1};
        list.push(eff);
    }
    if(extra.energydrain) {     //energydrain:3
        eff = new CrsEffEnergyDrain();
        list.push(eff);
    }
    curse.configureCurse(item,curse.trigger,list);  //todo should change item-id or the item would not properly add to wardrobe if there is already similiar item;item.getHash()??
    return(item);
}
window.gm.makeBonusItem = function(item, extra) {
    let curse = new Curse();
    let eff =null;
    let list=[];
    curse.trigger = new CrsTrgOnEquip();
    if(extra.hidden) { 
        curse.hidden=extra.hidden;
    } else curse.hidden=0; //by default visible?
    if(extra.statBoost && extra.statBonus) {
        eff = new CrsEffStatBonus();
        eff.statid=extra.statBoost, eff.statbonus=extra.statBonus;
        list.push(eff);
    }
    curse.configureCurse(item,curse.trigger,list);
    return(item);
}

window.gm.ItemsLib = (function (ItemsLib) {
    window.storage.registerConstructor(Curse);
    window.storage.registerConstructor(CrsTrgDelayed);
    window.storage.registerConstructor(CrsTrgOnEquip);
    window.storage.registerConstructor(CrsEffLock);
    window.storage.registerConstructor(CrsEffConvert);
    window.storage.registerConstructor(CrsEffEnergyDrain);
    window.storage.registerConstructor(CrsEffStatBonus);
}(window.gm.ItemsLib || {}));