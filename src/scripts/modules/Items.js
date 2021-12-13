"use strict";
///////////////////////////////////////////////////////////////
//RL-Items
class LighterDad extends Item {
    constructor() {super('LighterDad');this.addTags([window.gm.ItemTags.Quest]);}
    get desc() { return('I got this lighter from my real dad.');}
    toJSON() {return window.storage.Generic_toJSON("LighterDad", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(LighterDad, value.data);};
};
class Money extends Item {
    constructor() {super('Money'); this.addTags([window.gm.ItemTags.Money]);}
    get desc() { return('shiny,clinky coin.');}
    toJSON() {return window.storage.Generic_toJSON("Money", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Money, value.data);};
};

class LaptopPS extends Item {
    constructor() {super('LaptopPS');this.addTags([window.gm.ItemTags.Quest]);}
    get desc() { return 'Power converter for laptop.';    }
    toJSON() {return window.storage.Generic_toJSON("LaptopPS", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(LaptopPS, value.data);};
};
class Dildo extends Item {
    constructor() {super('Dildo');this.price=this.basePrice=20;this.style=0;}
    toJSON() {return window.storage.Generic_toJSON("Dildo", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Dildo, value.data);};
    set style(style) { 
        this._style = style; 
        if(style===0) this.id='DildoSmall',this.name='small dildo';
        else if(style===100) this.id='DildoMedium',this.name='medium dildo';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='A dildo made from rubbery plastic, smaller than an average human dick.';
        switch(this._style) {
            case 100:
                msg=('A medium sized pink dong.');
                break;
            default:
        }
        return(msg);
    }
}
class Lube extends Item {
    constructor() {     super('Lube');  this.addTags([window.gm.ItemTags.Ingredient]);this.price=this.basePrice=4;  }
    get desc() { return 'Slippery lubricant for personal use.';    }
    toJSON() {return window.storage.Generic_toJSON("Lube", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Lube, value.data);};
}
class Battery extends Item {
    constructor() { super('Battery'); this.addTags([window.gm.ItemTags.Ingredient]); this.price=this.basePrice=3;}
    get desc() { return 'Provides electricity for devices.';   }
    toJSON() {return window.storage.Generic_toJSON("Battery", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Battery, value.data);};
}
/////////////////////////////////////////////////////////////////
//VR-Items
class GameVoucher extends Item {
    constructor() {
        super('GameVoucher');
        this.addTags([window.gm.ItemTags.Money]);this.price=this.basePrice=100;
        this.style=0;this.lossOnRespawn = false;
    }
    toJSON() {return window.storage.Generic_toJSON("GameVoucher", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(GameVoucher, value.data);};
    set style(style) { 
        this._style = style; 
        if(style===0) this.id='BronzeCoupon',this.name='BronzeCoupon';
        else if(style===100) this.id='SilverCoupon',this.name='SilverCoupon';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='bronze-voucher for ingame-shop';
        switch(this._style) {
            case 100:
                msg=('silver-voucher for ingame-shop');
                break;
            default:
        }
        return(msg);
    }
};
class QuestItems extends Item { //ingredients you have to collect for quest
    constructor() { super('QuestItems');
    this.addTags([window.gm.ItemTags.Quest]); this.price=this.basePrice=10;   
    this.style=0;this.lossOnRespawn = true;
    }
    set style(style) { //instead of creating full class for every useless junk I use this and just add variable that will be restored after load
        this._style = style; 
        if(style===0) this.id='IgneumPage',this.name='IgneumPage';
        else if(style===10) this.id=this.name='RedAnkh';
        else if(style===20) this.id=this.name='RingOfBurden';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='Pages from the book Igneum Frigus Thalamum';
                break;
            case 10:
                msg='A pendant made from red crystal shaped like the famous Ankh.';
                break;
            case 20:
                msg='This ring is heavyer then it looks.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("QuestItems", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(QuestItems, value.data);};
}
class Ingredient extends Item {
    constructor() { super('Ingredient');
        this.addTags([window.gm.ItemTags.Ingredient]); this.price=this.basePrice=10;   
        this.style=0;this.lossOnRespawn = true;
    }
    set style(style) { //instead of creating full class for every useless junk I use this and just add variable that will be restored after load
        this._style = style; 
        if(style===0) this.id='ApocaFlower',this.name='ApocaFlower';
        else if(style===10) this.id=this.name='PurpleBerry';
        else if(style===20) this.id=this.name='BogBovus';
        else if(style===30) this.id=this.name='SquishedLeech';
        else if(style===40) this.id=this.name='WolfTooth';
        else if(style===50) this.id=this.name='DryadVine';
        else if(style===60) this.id=this.name='Dimetrium';
        else if(style===70) this.id=this.name='GiantPlum';
        else if(style===80) this.id=this.name='EmptyGlas';
        else if(style===90) this.id=this.name='CrystalWater';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='yellow bluish flower';
                break;
            case 10:
                msg='purple berrys grown in the forest';
                break;
            case 20:
                msg='a mushroom with purple cap and yellow splotches';
                break;
            case 30:
                msg='I dont wanna carry that around';
                break;
            case 40:
                msg='Some canines from a canine';
                break;
            case 50:
                msg='fibers of a sturdy plant';
                break;
            case 60:
                msg='a arcane metal';
                break;
            case 70:
                msg='a huge purple plum, bigger than your fist';
                break;
            case 80:
                msg='an empty drinking glas';
                break;
            case 90:
                msg='a glas filled with crystal clear water';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Ingredient", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Ingredient, value.data);};
}
class SoulGem extends Item {
    constructor() { super('SoulGem');   
        this.addTags([window.gm.ItemTags.Ingredient]);this.price=this.basePrice=100;
        this.style=0;this.lossOnRespawn = true;
    }
    set style(style) { //instead of creating full class for every useless junk I use this and just add variable that will be restored after load
        this._style = style; 
        if(style===0) this.id=this.name='TinySoulGem';
        else if(style===10) this.id=this.name='TinyBlackSoulGem';
        else if(style===20) this.id=this.name='SmallSoulGem';
        else if(style===30) this.id=this.name='SmallBlackSoulGem';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("SoulGem", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Ingredient, value.data);};
}
class Rope extends Item {
    constructor() { super('Rope');  
    this.addTags([window.gm.ItemTags.Tool]); this.price=this.basePrice=10;
       this.style=0;this.lossOnRespawn = true;
    }
    set style(style) { //instead of creating full class for every useless junk I use this and just add variable that will be restored after load
        this._style = style; 
        if(style===0) this.id=this.name='Rope';
        else if(style===10) this.id='RopeSturdy',this.name='Sturdy Rope';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Rope", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Rope, value.data);};
}
class KeyRestraint extends Item {
    constructor() { super('KeyRestraint');   
        this.style=0;this.lossOnRespawn = true;
    }
    set style(style) {
        this._style = style; 
        if(style===0) this.id=this.name='KeyRestraintA';
        else if(style===10) this.id=this.name='KeyRestraintB';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("KeyRestraint", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(KeyRestraint, value.data);};
}
class FlashBang extends Item {
    constructor() { super('FlashBang');  }
    get desc() { return 'Stun someone with a blinding light.';  }
    toJSON() {return window.storage.Generic_toJSON("FlashBang", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(FlashBang, value.data);};

    //context is the skillUseItem calling this
    targetFilter(targets,context) {
        if(!window.gm.combat.inCombat()) return([]);
        //to use skill-targetfilter we need an instance of skill bound to the caster  - todo this is ugly
        //let _sk = this.parent.parent.Skills.getItem('UseItem');//._parent=window.gm.util.refToParent(this.parent.parent.Skills); 
        return(context.targetMultiple(context.targetFilterFighting(context.targetFilterEnemy(targets))));
    }
    usable(context,on=null) {
        //can only be used while in combat and target is enemy
        let result = {OK:false, msg:'cannot use'};
        if(!window.gm.combat.inCombat()) {
            result.msg= 'can only be used in combat';
        } else {
            result.msg= 'use',result.OK=true;
        }
        return(result);
    }
    use(context,on=null) { 
        let result = {OK:false,msg:''};
        if(context instanceof Inventory) {
            context.removeItem('FlashBang');
            if(context.parent instanceof Character){
                if(on===null) on=context.parent;
                if(on.length && on.length>0) { 
                    //on can be several targets (array)
                } else {
                    on = [on];  //..if not an array change it
                }
                result.msg = context.parent.name+' uses '+this.name+'.';
                for(let _targ of on) {
                    _targ.addEffect(new effStunned(),effStunned.id);  //todo should 'FlashBang:Stunned' merge with other stunned? 
                    result.msg +=_targ.name+' got stunned. ';
                }
                result.OK=true;
                return(result);
            }
        } else throw new Error('context is invalid');
    }
};
class CanOfCoffee extends Item {
    constructor() {   super('CanOfCoffee'); this.addTags([window.gm.ItemTags.Drink]);this.price=this.basePrice=2;}
    get desc() { return 'Cold coffee in a can. Tasty? Not really!';    }
    toJSON() {return window.storage.Generic_toJSON("CanOfCoffee", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(CanOfCoffee, value.data);};
    usable(context) {return({OK:true, msg:'drink'});}
    use(context) { 
        if(context instanceof Inventory) {
            context.removeItem('CanOfCoffee');
            if(context.parent instanceof Character){
                context.parent.addEffect(new effEnergized(),'CanOfCoffee:Energized');    //apply over-time-effect instead directly changing stat
            return({OK:true, msg:context.parent.name+' gulped down a can of iced coffee.'});
            }
        } else throw new Error('context is invalid');
    }
};
class SimpleFood extends Item {
    constructor() {super('SimpleFood'); this.addTags([window.gm.ItemTags.Food]);this.price=this.basePrice=5;}
    get desc() { return 'Something to eat.';    }
    toJSON() {return window.storage.Generic_toJSON("SimpleFood", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(SimpleFood, value.data);};
    usable(context,on=null) {return({OK:true, msg:'eat'});}
    use(context,on=null) { 
        var _gaveAway=false;
        if(context instanceof Inventory) {
            if(on===null) on=context.parent;
            else _gaveAway=true;
            context.removeItem('Simple food');
            if(on instanceof Character){
                on.addEffect(new effEnergized(),'Simple food:Energized');
            return({OK:true, msg:on.name+' ate some plain foods.'});
            }
        } else throw new Error('context is invalid');
        
    }
}
class HealthPotion extends Item {
    constructor() { super('HealthPotion'); this.addTags([window.gm.ItemTags.Drink]); this.price=this.basePrice=5;this.style=0; }
    toJSON() {return window.storage.Generic_toJSON("HealthPotion", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(HealthPotion, value.data);};
    usable(context,on=null) {return({OK:true, msg:'drink'});}
    use(context,on=null) { 
        var _gaveAway=false;
        if(context instanceof Inventory) {
            if(on===null) on=context.parent;
            else _gaveAway=true;
            context.removeItem(this.id);
            if(on instanceof Character){ 
                on.Stats.increment("health",this.amount);
                return({OK:true, msg:on.name+' drank a potion.'});
            }
        } else throw new Error('context is invalid');
    }
    set style(style) {
        this._style = style; 
        if(style===0) this.id=this.name='HealthPotion',this.amount=40;
        else if(style===10) this.id=this.name='HealthPotionSmall',this.amount=20;
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        return(msg);
    }
}
class HorsePotion extends Item {
    constructor() { super('HorsePotion'); this.addTags([window.gm.ItemTags.Drink]);this.price=this.basePrice=15;this.style=0;}
    toJSON() {return window.storage.Generic_toJSON("HorsePotion", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(HorsePotion, value.data);};
    usable(context,on=null) {return({OK:true, msg:'drink'});}
    use(context,on=null) { 
        var _gaveAway=false;
        if(context instanceof Inventory) {
            if(on===null) on=context.parent;
            else _gaveAway=true;
            context.removeItem(this.id);
            if(on instanceof Character){ 
                if(on instanceof Character){
                    if(this.style===0) {
                        on.addEffect(new effHorsePower(),'HorsePower');
                    } else if(this.style===10) {
                        on.addEffect(new effLapineSpeed(),'LapineSpeed');
                    }
                    on.Stats.increment("health",80);on.Stats.increment("energy",40);
                }
                return({OK:true, msg:on.name+' drank a potion.'});
            }
        } else throw new Error('context is invalid');
    }
    set style(style) {
        this._style = style;
        if(style===0)  this.id=this.name='HorsePotion';
        else if(style===10) this.id=this.name='CarrotJuice';
        else throw new Error(this.id +' doesnt know '+style); 
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        return(msg);
    }
}
class RegenderPotion extends Item {
    constructor() { super('RegenderPotion'); this.addTags([window.gm.ItemTags.Drink]);this.price=this.basePrice=500;this.style=0;}
    toJSON() {return window.storage.Generic_toJSON("RegenderPotion", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(RegenderPotion, value.data);};
    usable(context,on=null) {return({OK:true, msg:'drink'});}
    use(context,on=null) { 
        var _gaveAway=false;
        if(context instanceof Inventory) {
            if(on===null) on=context.parent;
            else _gaveAway=true;
            context.removeItem(this.id);
            if(on instanceof Character){ 
                if(on instanceof Character){
                    window.gm.MutationsLib.swapGender(window.gm.player,
                        new window.storage.constructors[(this.style===0)?"VulvaHuman":"PenisHuman"]);
                }
                return({OK:true, msg:on.name+' drank a potion.'});
            }
        } else throw new Error('context is invalid');
    }
    set style(style) {
        this._style = style; 
        if(style===0) this.id=this.name='Vaginarium';
        else if(style===10) this.id=this.name='Penilium';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg =this.name;
        if(this.style===0) msg+= ' gets you some female bits.';
        else if(this.style===10) msg+= ' gets you some male bits.';
        return(msg);
    }
}
window.gm.ItemTags = { //
    //Items
    Quest   : "quest", //quest-item; dont sell or give away
    Cursed  : "cursed",
    Money   : 'money', //...for trading
    Ingredient : 'ingred',
    Drink   : 'drink',
    Food    : 'food',
    //Outfit
    Piercing    : "piercing",
    Tattoo      : "tattoo",
    Armor      : "armor",
    //weapons
    Tool    : 'tool',
    Weapon  : "weapon",
    Shield  : "shield",
    Melee   : "melee",
    Ranged  : "ranged" 
};
window.gm.ItemsLib = (function (ItemsLib) {
    window.storage.registerConstructor(LighterDad);
    window.storage.registerConstructor(GameVoucher);
    window.storage.registerConstructor(Money);
    window.storage.registerConstructor(LaptopPS);
    window.storage.registerConstructor(Battery);
    window.storage.registerConstructor(Dildo);
    window.storage.registerConstructor(Lube);
    window.storage.registerConstructor(Rope);
    window.storage.registerConstructor(CanOfCoffee);
    window.storage.registerConstructor(KeyRestraint);
    window.storage.registerConstructor(SimpleFood);
    window.storage.registerConstructor(HealthPotion);
    window.storage.registerConstructor(HorsePotion);
    window.storage.registerConstructor(Ingredient);//only need constructor for base-ingredient
    window.storage.registerConstructor(FlashBang);
    window.storage.registerConstructor(QuestItems);
    window.storage.registerConstructor(SoulGem);
    
    //Some of those items are generics that need some setup; so I create a template-library here
    ItemsLib['Money'] = function () { return new Money();};
    ItemsLib['LighterDad'] = function () { return new LighterDad();};
    ItemsLib['LaptopPS'] = function () { return new LaptopPS();};
    ItemsLib['Battery'] = function () { return new Battery();};
    ItemsLib['Dildo_small'] =function(){let x=new Dildo();return(x);};
    // consumables
    ItemsLib['Lube'] = function () { return new Lube();};
    ItemsLib['CanOfCoffee'] = function () { return new CanOfCoffee(); };
    ItemsLib['SimpleFood'] = function () { return new SimpleFood(); };
    ItemsLib['FlashBang'] = function () { return new FlashBang(); };
    //healthpotion
    ItemsLib['HealthPotion'] = function () { let x= new HealthPotion();return(x); };
    ItemsLib['HealthPotionSmall'] = function () { let x= new HealthPotion();x.style=10;return(x); };
    ItemsLib['HorsePotion'] = function () { let x= new HorsePotion();return(x); }
    ItemsLib['CarrotJuice'] = function () { let x= new HorsePotion();x.style=10;return(x); }
    ItemsLib['Vaginarium'] = function () { let x= new RegenderPotion();return(x); };
    ItemsLib['Penilium'] = function () { let x= new RegenderPotion();x.style=10;return(x); };
    //Ingredient
    ItemsLib['SquishedLeech'] = function(){ let x=new Ingredient();x.style=30;return(x);};
    ItemsLib['BogBovus'] = function(){ let x=new Ingredient();x.style=20;return(x);};
    ItemsLib['PurpleBerry'] = function(){ let x=new Ingredient();x.style=10;return(x);};
    ItemsLib['WolfTooth'] = function(){ let x=new Ingredient();x.style=40;return(x);};
    ItemsLib['ApocaFlower'] = function(){ let x=new Ingredient();return(x);};
    ItemsLib['DryadVine'] = function(){ let x=new Ingredient();x.style=50;return(x);};
    ItemsLib['Dimetrium'] = function(){ let x=new Ingredient();x.style=60;return(x);};
    ItemsLib['GiantPlum'] = function(){ let x=new Ingredient();x.style=70;return(x);};
    ItemsLib['EmptyGlas'] = function(){ let x=new Ingredient();x.style=80;return(x);};
    ItemsLib['CrystalWater'] = function(){ let x=new Ingredient();x.style=90;return(x);};
    //Questitems
    ItemsLib['IgneumPage'] = function(){ let x=new QuestItems();x.style=0;return(x);};
    ItemsLib['RedAnkh'] = function(){ let x=new QuestItems();x.style=10;return(x);};
    ItemsLib['RingOfBurden'] = function(){ let x=new QuestItems();x.style=20;return(x);};
    //soulgem
    ItemsLib['TinySoulGem'] = function () { let x= new SoulGem();return(x); };
    //keys
    ItemsLib['Rope'] = function () { let x= new Rope();return(x);};
    ItemsLib['RopeSturdy'] = function () { let x= new Rope();x.style=10;return(x);};
    ItemsLib['KeyRestraintA'] = function () { let x= new KeyRestraint();return(x);}; 
    ItemsLib['KeyRestraintB'] = function () { let x= new KeyRestraint();x.style=10;return(x);};
    //voucher
    ItemsLib['GameVoucherBronze'] = function () { let x= new GameVoucher();return(x); };
    ItemsLib['GameVoucherSilver'] = function () { let x= new GameVoucher();x.style=100;return(x);};
    return ItemsLib; 
}(window.gm.ItemsLib || {}));