"use strict";
class Leggings extends Equipment {
    constructor() {
        super('Leggings');
        this.addTags(['cloth']);
        this.slotUse = ['Legs','Hips'];
    }
    get desc() { return 'Spandex-leggings for sport. (agility+)';}
    toJSON() {return window.storage.Generic_toJSON("Leggings", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Leggings, value.data));}
    onEquip(context) {
        context.parent.Stats.addModifier('agility',{id:'agility:Leggings', bonus:5});
        return({OK:true, msg:'equipped'});}
    onUnequip() {
        this.parent.parent.Stats.removeModifier('agility',{id:'agility:Leggings'});
        return({OK:true, msg:'unequipped'});}
}
class Jeans extends Equipment {
    constructor() {
        super('Jeans');
        this.addTags(['cloth']);
        this.slotUse = ['Legs','Hips'];
    }
    get desc() { return 'plain old blue jeans';    }
    toJSON() {return window.storage.Generic_toJSON("Jeans", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Jeans, value.data));}
}
class Sneakers extends Equipment {
    constructor() {
        super('Sneakers');
        this.addTags(['cloth']);
        this.slotUse = ['Feet'];
    }
    get desc() { return 'Sneakers for sport and recreational activities.';    }
    toJSON() {return window.storage.Generic_toJSON("Sneakers", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Sneakers, value.data));}
}
class TankShirt extends Equipment {
    constructor() {
        super('TankShirt');
        this.addTags(['cloth']);
        this.slotUse = ['Breast','Stomach'];
    }
    get desc() { return 'light blue tank-top';}
    toJSON() {return window.storage.Generic_toJSON("TankShirt", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(TankShirt, value.data));}
}
class Pullover extends Equipment {
    constructor() {
        super('Pullover');
        this.addTags(['cloth']);
        this.slotUse = ['Breast','Stomach','Arms'];
    }
    descLong(fconv) {
        let msg='';
        if(this.isEquipped()) msg='A warm pullover adorns $[me]$.';
        else msg='$[I]$ $[have]$ '+this.name+".";
        return(fconv(msg));
    }
    get desc() { return 'warm pullover';}
    toJSON() {return window.storage.Generic_toJSON("Pullover", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Pullover, value.data));}
}
class BracerLeather extends Equipment {
    constructor() {
        super('BracerLeather');
        this.addTags(['cloth']);
        this.slotUse = ['Wrists'];
        this.price=this.basePrice=10;this.style = 0;   
        this.lossOnRespawn = true;
    }
    set style(style) { 
        this._style = style; 
        if(style===200) this.id='GlovesRubber',this.name='Rubber-Gloves';
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='worn bracers made of leather';
        switch(this._style) {
            case 100:
                msg=('leather bracers with steel-studs');
                break;
            case 200:
                msg=('elbow-length rubber gloves');
                break;
            default:
        }
        return(msg+this.bonusDesc());
    }
    descLong(fconv) {
        let msg='';
        if(this.isEquipped()) msg='A pair of '+this.desc+' adorns $[my]$ lower arms.';
        else msg='$[I]$ $[have]$ '+this.name+".";
        return(fconv(msg));
    }
    toJSON() {return window.storage.Generic_toJSON("BracerLeather", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BracerLeather, value.data));}
}
class HandCuffs extends Equipment {
    constructor() {
        super('HandCuffs');
        this.addTags(['restrain']);
        this.slotUse = ['RHand','LHand','Wrists'];
    }
    get desc() { return 'handcuffs like the police use them';  }
    toJSON() {return window.storage.Generic_toJSON("HandCuffs", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(HandCuffs, value.data));}
    usable(context) {return(this.canEquip(context));}
    use(context) { //context here is inventory not outfit
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) {  
            this.parent.parent.Outfit.removeItem(this.id); 
            return( {OK:true, msg:'unequipped '+ this.name}); //todo
        } else {
            this.parent.parent.Outfit.addItem(this); 
            return( {OK:true, msg:'equipped '+ this.name}); //todo
        }
    }
    canEquip(context) { 
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) return({OK:true, msg:'unequip'});    //todo check for key
        else return({OK:true, msg:'equip'});
    }
    canUnequip() {return({OK:false, msg:'You need to find a key first to be able to remove it!'});}
}
class WristCuffs extends Equipment {
    constructor() {
        super('WristCuffs');
        this.slotUse = ['Wrists'];
        this.lossOnRespawn = false;
    }
    get desc() { return 'some leather cuffs for wrists';  }
    toJSON() {return window.storage.Generic_toJSON("WristCuffs", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(WristCuffs, value.data));}
    usable(context) {return(this.canEquip(context));}
    use(context) { //context here is inventory not outfit
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) {  
            this.parent.parent.Outfit.removeItem(this.id); 
            return( {OK:true, msg:'unequipped '+ this.name}); //todo
        } else {
            this.parent.parent.Outfit.addItem(this); 
            return( {OK:true, msg:'equipped '+ this.name}); //todo
        }
    }
    canUnequip() {return({OK:false, msg:'Those cuffs can only be removed by a magican!'});}
}
class CollarQuest extends Equipment {
    constructor() {
        super('CollarQuest');
        this.slotUse = ['Neck'];
        this.lossOnRespawn = false;
    }
    get desc() { return 'a collar';  }
    toJSON() {return window.storage.Generic_toJSON("CollarQuest", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CollarQuest, value.data));}
    usable(context) {return(this.canEquip(context));}
    use(context) { //context here is inventory not outfit
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) {  
            this.parent.parent.Outfit.removeItem(this.id); 
            return( {OK:true, msg:'unequipped '+ this.name}); //todo
        } else {
            this.parent.parent.Outfit.addItem(this); 
            return( {OK:true, msg:'equipped '+ this.name}); //todo
        }
    }
    canUnequip() {return({OK:false, msg:'This can only be removed by a magican!'});}
}
class PiercingClit extends Equipment {
    constructor() {
        super('PiercingClit');
        this.addTags(['piercing']);
        this.slotUse = ['pClit'];    
        this.style = 0;   
        this.lossOnRespawn = true;
    }
    set style(style) { 
        this._style = style; 
        if(style===100) this.lossOnRespawn=false;
    }
    get style() {return this._style;}
    get desc() { 
        if(this.style===100) return('cursed piercing');
        return('small clitoris-piercing');
    }
    toJSON() {return window.storage.Generic_toJSON("PiercingClit", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(PiercingClit, value.data));}
    onEquip(context) {
        if(this.style===100) {
            context.parent.addEffect(new window.storage.constructors['effGrowVulva'](),"effGrowVulva",); //only works for player since effects of NPC dont receive ticks!
        } 
        return({OK:true, msg:'equipped'});}
}
class TattooGroin extends Equipment {
    constructor() {
        super('TattooGroin');
        this.addTags(['tattoo']);
        this.slotUse = ['tStomach'];    
        this.style = 0;   
        this.lossOnRespawn = false;
    }
    set style(style) { 
        this._style = style; 
    }
    get style() {return this._style;}
    get desc() { 
        if(this.style===100) return('a kind of lewd mark');
        return('a tribal tatto on the lower belly');
    }
    toJSON() {return window.storage.Generic_toJSON("TattooGroin", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(TattooGroin, value.data));}
    canUnequip() {return({OK:false, msg:'not so easy to get rid off'});}
    onEquip(context) {
        if(this.style===100) {
            context.parent.addEffect(new window.storage.constructors['effLewdMark'](),"effLewdMark"); //only works for player since effects of NPC dont receive ticks!
        } 
        return({OK:true, msg:'tattoed'});}
}
class RobesZealot extends Equipment {
    constructor() {
        super('RobesZealot');
        this.addTags(['cloth']);
        this.slotUse = ['Breast','Stomach','Hips','Legs'];
        this.slotCover = ['bBreast','uBreast','pNipples'];    
        this.lossOnRespawn = true;
    }
    get desc() { return 'a robe made from coarse cloth';}
    toJSON() {return window.storage.Generic_toJSON("RobesZealot", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(RobesZealot, value.data));}

}
class HarnessRubber extends Equipment {
    constructor() {
        super('HarnessRubber');
        this.addTags(['rubber']);
        this.slotUse = ['Breast','Stomach'];
        this.slotCover = ['bBreast','uBreast'];    
        this.lossOnRespawn = true;
    }
    get desc() { return 'a harness made from straps of rubber that barely covers someones torso';}
    toJSON() {return window.storage.Generic_toJSON("HarnessRubber", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(HarnessRubber, value.data));}
}
class Briefs extends Equipment {
    constructor() {
        super('Briefs');
        this.addTags(['cloth']);
        this.slotUse = ['uHips'];
        this.slotCover = ['bPenis','bVulva','bBalls','bClit','bAnus','pPenis','pClit'];    
        this.lossOnRespawn = true;
        this.lewd.slut = 1;
    }
    get desc() { return 'plain briefs';}
    toJSON() {return window.storage.Generic_toJSON("Briefs", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Briefs, value.data));}
}
class AnalPlug extends Equipment {
    static factory(style) {
        let x = new AnalPlug();
        x.style=style;
        return(x);
    }
    constructor() {
        super('AnalPlug');
        this.addTags(['ButtPlug']);
        this.slotUse = ['uAnus'];
        this.slotCover = [];    
        this.lossOnRespawn = false;
        this.style=0,this.lewd.slut = 3;
    }
    toJSON() {return window.storage.Generic_toJSON("AnalPlug", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(AnalPlug, value.data));}
    set style(style) { 
        this._style = style; 
        if(style===0) this.id=this.name='AnalPlugSmall';
        else if(style===100) {
            this.id=this.name='AnalPlugMedium';
        }
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='a small rubber-toy for someones rear';
        switch(this._style) {
            case 100:
                msg=('a medium-sized buttplug');
                break;
            default:
        }
        return(msg);
    }
    onEquip(context) {
        //if(this.style===100) {
            context.parent.addEffect(new window.storage.constructors['effButtPlugged'](),"effButtPlugged"); //only works for player since effects of NPC dont receive ticks!
        //} 
        return({OK:true, msg:'stuffed'});}
}
class CockRing extends Equipment {
    static factory(style) {
        let x = new CockRing();
        x.style=style;
        return(x);
    }
    constructor() {
        super('CockRing');
        this.addTags(['lewd']);
        this.slotUse = ['uPenis'];
        this.slotCover = [];    
        this.lossOnRespawn = false;
        this.style=0,this.lewd.slut = 1;
    }
    toJSON() {return window.storage.Generic_toJSON("CockRing", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(CockRing, value.data));}
    set style(style) { 
        this._style = style; 
        if(style===0) this.id=this.name='CockRing';
        else if(style===100) this.id=this.name='CockAndBallRing';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='a heavy cockring made of steel';
        switch(this._style) {
            case 100:
                msg=('a contraption that squeezes tightly around base of dick and balls');
                break;
            default:
        }
        return(msg);
    }
}
class ChastityBelt extends Equipment {
    static factory(style) {
        let x = new ChastityBelt();
        x.style=style;
        return(x);
    }
    constructor() {
        super('ChastityBelt');
        this.addTags(['steel']);
        this.slotUse = ['uPenis','uVulva'];
        this.slotCover = ['bPenis','bVulva','bClit','pPenis','pClit'];    
        this.lossOnRespawn = false;
        this.style=0,this.lewd.slut = 1;
    }
    toJSON() {return window.storage.Generic_toJSON("ChastityBelt", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(ChastityBelt, value.data));}
    set style(style) { 
        this._style = style; 
        if(style===0) this.id=this.name='ChastityBelt';
        else if(style===100) this.id=this.name='CockCage';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='chastity belt covering your privates';
        switch(this._style) {
            case 100:
                msg=('a cockcage to restrict ones erection');
                break;
            default:
        }
        return(msg);
    }
}
class BikiniBottomLeather extends Equipment {
    constructor() {
        super('BikiniBottomLeather');
        this.addTags(['cloth']);
        this.slotUse = ['uHips'];
        this.slotCover = ['bPenis','bVulva','bBalls','bClit','bAnus','pPenis','pClit'];    
        this.lossOnRespawn = true;
    }
    get desc() { return 'leather triangle-bikini bottom';}
    toJSON() {return window.storage.Generic_toJSON("BikiniBottomLeather", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BikiniBottomLeather, value.data));}
}
class BikiniTopLeather extends Equipment {
    constructor() {
        super('BikiniTopLeather');
        this.addTags(['cloth']);
        this.slotUse = ['uBreast'];
        this.slotCover = ['pNipples'];    
        this.lossOnRespawn = true;
    }
    get desc() { return 'leather triangle-bikini top';}
    toJSON() {return window.storage.Generic_toJSON("BikiniTopLeather", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BikiniTopLeather, value.data));}
}
class ShortsLeather extends Equipment {
    toJSON() {return window.storage.Generic_toJSON("ShortsLeather", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(ShortsLeather, value.data));}
    static factory(style) {
        let x = new ShortsLeather();
        x.style=style;
        return(x);
    }
    constructor() {
        super();
        this.addTags(['cloth']);
        this.slotUse = ['Hips','Legs'];
        this.slotCover = ['bPenis','bVulva','bBalls','bClit','bAnus','pPenis','pClit'];   
        this.lossOnRespawn = true;
        this.style=0;
    }
    set style(style) { 
        this._style = style; 
        if(style===0) this.id=this.name='ShortsLeather';
        else if(style===100) this.id=this.name='Loincloth';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='short trousers made from leather';
        switch(this._style) {
            case 100:
                msg=('a crude loincloth made from leather');
                break;
            default:
        }
        return(msg);
    }
}
//this is an Inventory-item, not wardrobe
class Crowbar extends Weapon {
    constructor() {
        super();this.id=this.name='Crowbar';
        this.addTags(['tool', 'weapon']);
        this.slotUse = ['RHand'];
        this.lossOnRespawn = true;
    }
    descLong(fconv) {return(fconv('$[I]$ $[hold]$ a crowbar.'));}
    get desc() { return 'durable crowbar.';}
    toJSON() {return window.storage.Generic_toJSON("Crowbar", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Crowbar, value.data));}
}
//this is an Inventory-item, not wardrobe
class Shovel extends Weapon {
    constructor() {
        super();this.id=this.name='Shovel';
        this.addTags(['tool', 'weapon']);
        this.slotUse = ['RHand','LHand'];
        this.lossOnRespawn = true;
    }
    get desc() { return('A rusty,old shovel.');}
    toJSON() {return window.storage.Generic_toJSON("Shovel", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(Shovel, value.data));}
}
class BowWodden extends Weapon {
    constructor() {
        super();this.id=this.name='BowWodden';
        this.slotUse = ['RHand','LHand'];
        this.lossOnRespawn = true;
    }
    get desc() { return('A simple bow');}
    toJSON() {return window.storage.Generic_toJSON("BowWodden", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BowWodden, value.data));}
    usable(context) {return(this.canEquip(context));}
    use(context) { //context here is inventory not outfit
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) {  
            this.parent.parent.Outfit.removeItem(this.id); 
            return( {OK:true, msg:'unequipped '+ this.name});
        } else {
            this.parent.parent.Outfit.addItem(this); 
            return( {OK:true, msg:'equipped '+ this.name}); 
        }
    }
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(6,'pierce')]}];
        mod.critChance=25;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(10,'pierce')]}];
        return(mod);
    }
}
class DaggerSteel extends Weapon {
    constructor() {
        super();this.id=this.name='DaggerSteel';
        this.slotUse = ['RHand'];
        this.lossOnRespawn = true;;
    }
    get desc() { return('A steel dagger.');}
    toJSON() {return window.storage.Generic_toJSON("DaggerSteel", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(DaggerSteel, value.data));}
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(5,'slash')]}];
        mod.critChance=50;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(5,'slash'),effDamage.factory(3,'pierce')]}];
        return(mod);
    }
}
class WhipLeather extends Weapon {
    constructor() {
        super();this.id=this.name='WhipLeather';
        this.slotUse = ['RHand'];
        this.lossOnRespawn = true;;
    }
    get desc() { return('a leather whip.');}
    toJSON() {return window.storage.Generic_toJSON("WhipLeather", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(WhipLeather, value.data));}
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(5,'slash')]}];
        mod.critChance=5;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(10,'slash'),effMasochist.factory(1)]}];
        return(mod);
    }
}
class StaffWodden extends Weapon {
    constructor() {
        super();this.id=this.name='StaffWodden';
        this.slotUse = ['RHand','LHand'];
        this.lossOnRespawn = true;
    }
    get desc() { return('A staff made from wood.');}
    toJSON() {return window.storage.Generic_toJSON("StaffWodden", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(StaffWodden, value.data));}
    onEquip(context) {
        let sk = new SkillStrongHit();
        sk.weapon = this.id;
        this.parent.parent.Skills.addItem(sk);
        return({OK:true, msg:'equipped'});}
    onUnequip() {
        this.parent.parent.Skills.removeItem('StrongAttack');
        return({OK:true, msg:'unequipped'});}
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(11,'blunt')]}];
        mod.critChance=5;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(11,'blunt'), new effStunned()]}];
        return(mod);
    }
}
class SpearWodden extends Weapon {
    static factory(style) {
        let x = new SpearWodden();
        x.style=style;
        return(x);
    }
    constructor() {
        super();
        this.slotUse = ['RHand','LHand'];
        this.lossOnRespawn = true;
        this.style=0;
    }
    set style(style) { 
        this._style = style; 
        if(style===0) this.id=this.name='SpearWodden';
        else if(style===100) this.id=this.name='SpearStone';
        else throw new Error(this.id +' doesnt know '+style);
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='a large, smooth branch with a firehardened tip';
        switch(this._style) {
            case 100:
                msg=('a stone-triangle mounted on a long stick');
                break;
            default:
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("SpearWodden", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(SpearWodden, value.data));}
    onEquip(context) {
        let sk = new SkillStrongHit();
        sk.weapon = this.id;
        this.parent.parent.Skills.addItem(sk);
        return({OK:true, msg:'equipped'});}
    onUnequip() {
        this.parent.parent.Skills.removeItem('StrongAttack');
        return({OK:true, msg:'unequipped'});}
    attackMod(target){
        let mod = new SkillMod();
        let bonus = Math.floor(this.style/20);
        mod.onHit = [{ target:target, eff: [effDamage.factory(8+bonus,'pierce')]}];
        mod.critChance=5;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(10+bonus*1.5,'pierce'), new effBleed(4)]}];
        return(mod);
    }
}
class ShieldSmall extends Equipment {
    constructor() {
        super('ShieldSmall');
        this.addTags(['shield']);
        this.slotUse = ['LHand'];
        this.style=0; this.lossOnRespawn = true;
    }
    set style(style) { 
        this._style = style; 
        if(style===100) this.block=3,this.id='ShieldWodden',this.name='wooden shield';
        else if(style===200) this.block=5,this.id='ShieldIron',this.name='iron shield';
        else this.block=1,this.id='ShieldBuckler',this.name='small buckler';
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='small buckler';
        switch(this._style) {
            case 100:
                msg=('small wooden shield');
                break;
            case 200:
                msg=('reinforced shield');
                break;
            default:
        }
        return(msg+'(blocking +'+this.block+') '+this.bonusDesc());
    }
    descLong(fconv) {
        let msg='';
        if(this.isEquipped()) msg='In $[my]$ left hand $[I]$ $[carry]$ a '+this.desc+' .';
        else msg='$[I]$ $[have]$ '+this.name+".";
        return(fconv(msg));
    }
    toJSON() {return window.storage.Generic_toJSON("ShieldSmall", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(ShieldSmall, value.data));}
    usable(context) {return(this.canEquip(context));}
    use(context) { //context here is inventory not outfit
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) {  
            this.parent.parent.Outfit.removeItem(this.id); 
            return( {OK:true, msg:'unequipped '+ this.name}); //todo
        } else {
            this.parent.parent.Outfit.addItem(this); 
            return( {OK:true, msg:'equipped '+ this.name}); //todo
        }
    }
    onEquip(context) {
        /*let sk = new SkillStrongHit();
        sk.weapon = this.id;
        this.parent.parent.Skills.addItem(sk);*/
        return({OK:true, msg:'equipped'});}
    onUnequip() {
        //this.parent.parent.Skills.removeItem('Smash');
        return({OK:true, msg:'unequipped'});}
}
class MaceSteel extends Weapon {
    constructor() {
        super();this.id=this.name='MaceSteel';
        this.slotUse = ['RHand'];
        this.lossOnRespawn = true;
    }
    get desc() { return('A heavy steel mace.');}
    toJSON() {return window.storage.Generic_toJSON("MaceSteel", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(MaceSteel, value.data));}
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(11,'blunt')]}];
        mod.critChance=50;
        mod.onCrit = [{ target:target, eff: [effDamage.factory(11,'blunt'), new effStunned()]}];
        return(mod);
    }
}
class TailRibbon extends Equipment {
    constructor() {
        super('TailRibbon');
        this.addTags(['cloth']);
        this.slotUse = ['TailTip'];
    }
    get desc() { 'a fancy color band that can be wrapped around someones tailtip';}
    toJSON() {return window.storage.Generic_toJSON("TailRibbon", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(TailRibbon, value.data));}
    canEquip(context) { 
        if(this.parent.parent.Outfit.findItemSlot(this.id).length>0) return({OK:true, msg:'unequip'});
        else {
            if(this.parent.parent.Outfit.countItem("TailWolf")>0) {
                return({OK:true, msg:'equip'}); 
            } else {
                return({OK:false, msg:'This requires a propper tail to attach to!'}); 
            }
        }
    }
}
//todo bow,whip,blowpipe
//todo vest,chaps,bikini top, greaves , jacket
window.gm.ItemsLib = (function (ItemsLib) {
    window.storage.registerConstructor(AnalPlug);
    window.storage.registerConstructor(BikiniBottomLeather);
    window.storage.registerConstructor(BikiniTopLeather);
    window.storage.registerConstructor(BracerLeather);
    window.storage.registerConstructor(Briefs);
    window.storage.registerConstructor(ChastityBelt);
    window.storage.registerConstructor(CockRing);
    window.storage.registerConstructor(CollarQuest);
    window.storage.registerConstructor(DaggerSteel);
    window.storage.registerConstructor(HarnessRubber);
    window.storage.registerConstructor(Leggings);
    window.storage.registerConstructor(MaceSteel);
    window.storage.registerConstructor(TankShirt);
    window.storage.registerConstructor(Jeans);
    window.storage.registerConstructor(Sneakers);
    window.storage.registerConstructor(Pullover);
    window.storage.registerConstructor(Crowbar);
    window.storage.registerConstructor(Shovel);
    window.storage.registerConstructor(TailRibbon);
    window.storage.registerConstructor(PiercingClit);
    window.storage.registerConstructor(TattooGroin);
    window.storage.registerConstructor(RobesZealot);
    window.storage.registerConstructor(ShortsLeather);
    window.storage.registerConstructor(ShieldSmall);
    window.storage.registerConstructor(StaffWodden);
    window.storage.registerConstructor(WristCuffs);
    window.storage.registerConstructor(WhipLeather);
    //.. and Wardrobe
    ItemsLib['AnalPlugSmall'] = function () { let x= new AnalPlug();x.style=0;return(x); };
    ItemsLib['AnalPlugMed'] = function () { let x= new AnalPlug();x.style=100;return(x); };
    ItemsLib['BikiniBottomLeather'] = function () { return new BikiniBottomLeather();};
    ItemsLib['BikiniTopLeather'] = function () { return new BikiniTopLeather();};
    ItemsLib['Briefs'] = function () { return new Briefs();};
    ItemsLib['ChastityBelt'] = function () { let x= new ChastityBelt();x.style=0;return(x); };
    ItemsLib['CockCage'] = function () { let x= new ChastityBelt();x.style=100;return(x); };
    ItemsLib['CockRing'] = function () { let x= new CockRing();x.style=0;return(x); };
    ItemsLib['CollarQuest'] = function () { return new CollarQuest();};
    ItemsLib['Leggings'] = function () { return new Leggings();};
    ItemsLib['Tank-shirt'] = function () { return new TankShirt(); };
    ItemsLib['Jeans'] = function () { return new Jeans();};
    ItemsLib['Sneakers'] = function () { return new Sneakers();};
    ItemsLib['Pullover'] = function () { return new Pullover();};
    ItemsLib['TailRibbon'] = function () { return new TailRibbon();};
    ItemsLib['PiercingClit'] = function () { return new PiercingClit();};
    ItemsLib['TattooGroin'] = function () { return new TattooGroin();};
    ItemsLib['LewdMark'] = function () { let x= new TattooGroin();x.style=100;return(x); };
    ItemsLib['RobesZealot'] = function () { return new RobesZealot();};
    ItemsLib['WristCuffs'] = function () { return new WristCuffs();};
    ItemsLib['HarnessRubber'] = function () { return new HarnessRubber();};
    ItemsLib['BracerLeather'] = function () { let x= new BracerLeather();return(x); };
    ItemsLib['GlovesRubber'] = function () { let x= new BracerLeather();x.style=200;return(x); };
    //special wardrobe-item combination
    ItemsLib['Crowbar']  = function () { return new Crowbar();};
    ItemsLib['Shovel']  = function () { return new Shovel();};
    ItemsLib['StaffWodden']  = function () { return new StaffWodden();};
    ItemsLib['Handcuffs'] = function () { return new HandCuffs();};
    ItemsLib['DaggerSteel'] = function () { return new DaggerSteel();};
    ItemsLib['ShieldBuckler'] = function () { let x= new ShieldSmall();x.style=0;return(x);};
    ItemsLib['ShieldWodden'] = function () { let x= new ShieldSmall();x.style=100;return(x);};
    ItemsLib['ShieldIron'] = function () { let x= new ShieldSmall();x.style=200;return(x);};
    ItemsLib['SpearWodden'] = function () { let x= new SpearWodden();return(x);};
    ItemsLib['SpearStone'] = function () { let x= new SpearWodden();x.style=100;return(x);};
    ItemsLib['WhipLeather'] = function () { let x= new WhipLeather();return(x);};
    return ItemsLib; 
}(window.gm.ItemsLib || {}));