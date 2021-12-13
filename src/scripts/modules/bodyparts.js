"use strict"

/* Todo:
- wings (insect, leathery, feathered )
- feet (talons, paws, hooves)
- horns (antlers, goat)
- ears
*/

/*
 * bodyparts are special equipment 
 * base define the overall body structure; how many legs,..
 * there are some special properties on certain bodyparts:
 * maxGrowth of base = typical bodysize in m; depends on race
 * maxGrowth of other bodyparts = max size of bodypart relative to body size in %/100
 * growth = size of bodypart relative to maxGrowth; modified on mutation event
*/
class BodyPart extends Equipment {
    constructor(name) {super(name); }
    /*
    * converts a relative size to size in m or cm
    */
    sizeString(size) {
        let base = this.parent.getItemForSlot(window.gm.OutfitSlotLib.bBase);
        let bodysize = base.data.maxGrowth*base.data.growth*size;
        if(bodysize<1) return(window.gm.util.formatNumber(bodysize*100,1)+"cm");
        if(bodysize<0.05) return(window.gm.util.formatNumber(bodysize*1000,0)+"mm");
        return(window.gm.util.formatNumber(bodysize,2)+"m");
    }
}
class BaseHumanoid extends BodyPart {
    constructor() {
        super('BaseHumanoid');
        this.data = {maxGrowth:1.8,growth:1};
        this.addTags(['body']);this.slotUse = ['bBase'];
    }
    descLong(fconv) {return(fconv('$[My]$ body is that of an human, around '+this.sizeString(1)+' in size.'));}
    get descShort() {return this.desc;};
    get desc() { return '';}
    toJSON() {return window.storage.Generic_toJSON("BaseHumanoid", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BaseHumanoid, value.data));}
}
class BaseQuadruped extends BodyPart {
    constructor() {
        super('BaseQuadruped');
        this.data = {maxGrowth:1.5,growth:1};
        this.addTags(['body']);this.slotUse = ['bBase'];
    }
    get descShort() {return this.desc;};
    get desc() { return '';}
    toJSON() {return window.storage.Generic_toJSON("BaseQuadruped", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BaseQuadruped, value.data));}
    descLong(fconv) {return(fconv('$[I]$ $[am]$ walking on 4 legs like a feral mammal.'));}
}
class BaseWorm extends BodyPart {
    constructor() {
        super('BaseWorm');
        this.data = {maxGrowth:0.3,growth:1};
        this.addTags(['body']);this.slotUse = ['bBase'];
    }
    get descShort() {return this.desc;};
    get desc() { return '';}
    toJSON() {return window.storage.Generic_toJSON("BaseWorm", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BaseWorm, value.data));}
    descLong(fconv) {return(fconv('$[I]$ $[am]$ wriggling around like a snake.'));}
}
class BaseWasp extends BodyPart {
    constructor() {
        super('BaseWasp');
        this.data = {maxGrowth:0.3,growth:1};
        this.addTags(['body']);this.slotUse = ['bBase'];
    }
    get descShort() {return this.desc;};
    get desc() { return '';}
    toJSON() {return window.storage.Generic_toJSON("BaseWasp", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BaseWasp, value.data));}
    descLong(fconv) {return(fconv('$[My]$ body is like that of an insect.'));}
}
class FaceHuman extends BodyPart {
    static dataPrototype() {    
        return({femininity:0.2,style:'human'});
        //1 = full female 0= male
    }
    static factory(id) {
        let obj =  new FaceHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('FaceHuman');
        this.addTags(['body']);
        this.slotUse = ['bFace','bMouth'];
        this.data = FaceHuman.dataPrototype();   
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'human':
                break;
            case 'elve':
                break;
            default:
                throw new Error("unknown Face-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return 'human face';}
    get desc() { return 'hominid face';}
    toJSON() {return window.storage.Generic_toJSON("FaceHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(FaceHuman, value.data));}
    descLong(fconv) {
        return(fconv('$[My]$ face ressembles that of a human'));
    }
}
class FaceWolf extends BodyPart {
    static dataPrototype() {    
        return({style:'wolf',femininity:0.2});    }
    static factory(id) {
        let obj =  new FaceWolf();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('FaceWolf');
        this.addTags(['body']);
        this.slotUse = ['bFace','bMouth'];  //todo separate mouth-bodypart??
        this.data = FaceWolf.dataPrototype();   
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'cat':
            case 'dog':
            case 'wolf':
            case 'lizard':
                break;
            case 'horse':
                break;
            default:
                throw new Error("unknown Face-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return this.data.style+'\'like face.';}
    toJSON() {return window.storage.Generic_toJSON("FaceWolf", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(FaceWolf, value.data));}
    onEquip(context) {
        let old = context.parent.Skills.countItem(SkillBite.name);
        if(old>0) context.parent.Skills.removeItem(SkillBite.name,old);
        context.parent.Skills.addItem(new SkillBite());
        return({OK:true, msg:'shifted'});
    }
    onUnequip() {
        let old = this.parent.parent.Skills.countItem(SkillBite.name);
        if(old>0) this.parent.parent.Skills.removeItem(SkillBite.name,old);
        return({OK:true, msg:'shifted'});
    }
    descLong(fconv) {
        return(fconv('$[I]$ $[have]$ a muzzle like a '+this.data.style+'.'));
    }
    attackMod(target){
        let mod = new SkillMod();
        mod.onHit = [{ target:target, eff: [effDamage.factory(11,'slash')]}]; //bite damage
        return(mod);
    }
}
class FaceHorse extends BodyPart {
    static dataPrototype() {    
        return({femininity:0.2,style:'horse'});    }
    static factory(id) {
            return(new FaceHorse());
    }
    constructor() {
        super('FaceHorse');
        this.addTags(['body']);
        this.slotUse = ['bFace','bMouth'];
        this.data = FaceHorse.dataPrototype();   
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'bunny':
            case 'horse':
                break;
            case 'deer':
                break;
            default:
                throw new Error("unknown Face-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return this.data.style+' muzzle';}
    get desc() { return this.descShort;}
    toJSON() {return window.storage.Generic_toJSON("FaceHorse", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(FaceHorse, value.data));}
    descLong(fconv) {
        return(fconv('$[I]$ $[have]$ a muzzle like a '+this.data.style));
    }
}
class FaceLeech extends BodyPart {
    static dataPrototype() {    
        return({style:'leech'});    }
    static factory(id) {
        let obj =  new FaceLeech();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('FaceLeech');
        this.addTags(['body']);
        this.slotUse = ['bFace','bMouth'];
        this.data = FaceLeech.dataPrototype();   
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'slug':
                break;
            case 'leech':
                break;
            default:
                throw new Error("unknown Face-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return this.data.style+'\'like face.';}
    toJSON() {return window.storage.Generic_toJSON("FaceLeech", this); }
    static fromJSON(value) {return(window.storage.Generic_fromJSON(FaceLeech, value.data));}
    onEquip(context) {
        let old = context.parent.Skills.countItem(SkillBite.name);
        if(old>0) context.parent.Skills.removeItem(SkillBite.name,old);
        context.parent.Skills.addItem(new SkillBite());
        return({OK:true, msg:'shifted'});
    }
    onUnequip() {
        let old = this.parent.parent.Skills.countItem(SkillBite.name);
        if(old>0) this.parent.parent.Skills.removeItem(SkillBite.name,old);
        return({OK:true, msg:'shifted'});
    }
    descLong(fconv) {
        return(fconv('$[I]$ $[have]$ a muzzle like a '+this.data.style+'.'));
    }
    attackMod(target){
        let mod = new SkillMod();
        if(this.data.style==='slug') {
            mod.onHit = [{ target:target, eff: [effDamage.factory(5,'acid','The slug spits some acid that eats at '+target.name+' armor.')]}];
        } else {
            mod.onHit = [{ target:target, eff: [effDamage.factory(5,'acid')]}];
        }
        return(mod);
    }
}
/**
 * natural Armor for creatures not using gear
 *
 * @class ArmorTorso
 * @extends {BodyPart}
 */
class ArmorTorso extends BodyPart {
    static dataPrototype() {    
        return({style:'scales'}); }
    static factory(id) {
        let obj =  new ArmorTorso();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('ArmorTorso');
        this.addTags(['body']);
        this.slotUse = ['Breast','Stomach'];
        this.data = ArmorTorso.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'scales':
                break;
            case 'slime':
                break;
            case 'fur':
                    break;
            default:
                throw new Error("unknown Armor-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 'The '+this.data.style+' improves resistance.';}
    toJSON() {return window.storage.Generic_toJSON("ArmorTorso", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(ArmorTorso, value.data));}
    descLong(fconv) {
        return(fconv('$[My]$ body is covered with '+this.data.style+' .'));
    }
    onEquip(context) {
        let arm,rst;
        for(let el of window.gm.combat.TypesDamage) {
            arm=rst=0;
            if(this.data.style ==='slime') {
                if(el.id==='fire' || el.id==='poison' || el.id==='acid') arm=5,rst=70;

            } else if(this.data.style ==='fur') {
                if(el.id==='ice') arm=5,rst=30;
                if(el.id==='blunt') arm=5,rst=20;
            } else if(this.data.style ==='scales') {
                if(el.id==='ice') rst=-30;
                if(el.id==='slash') arm=5,rst=20;
            }
            if(arm!==0) context.parent.Stats.addModifier('arm_'+el.id,{id:'arm_'+el.id+':'+this.id, bonus:arm});
            if(rst!==0) context.parent.Stats.addModifier('rst_'+el.id,{id:'rst_'+el.id+':'+this.id, bonus:rst});
        }
        return({OK:true, msg:'equipped'});
    }
    onUnequip() {
        for(let el of window.gm.combat.TypesDamage) {
            context.parent.Stats.removeModifier('arm_'+el,{id:'arm_'+el+':'+this.id});
            context.parent.Stats.removeModifier('rst_'+el,{id:'rst_'+el+':'+this.id});
        }
        return({OK:true, msg:'unequipped'});
    }
}
class WeaponStinger extends BodyPart {
    static dataPrototype() { return({style:'wasplike', skill:''}); }
    static factory(id) {
        let obj =  new WeaponStinger();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('WeaponStinger');
        this.addTags(['body']);
        this.slotUse = ['bTailBase'];
        this.data = WeaponStinger.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'wasplike': 
                this.data.skill = 'wasp-stinger';
                this.slotUse = ['bTailBase'];
                break;
            default:
                throw new Error("unknown Stinger-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 'A '+this.data.style+' stinger.';}
    toJSON() {return window.storage.Generic_toJSON("WeaponStinger", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(WeaponStinger, value.data));}
    descLong(fconv) {
        return(fconv('$[I]$ $[have]$ a '+this.data.style+' sting.'));
    }
    onEquip(context) {
        let old = context.parent.Skills.countItem(this.data.skill);
        if(old>0) context.parent.Skills.removeItem(this.data.skill,old);
        context.parent.Skills.addItem(SkillSting.factory(this.data.skill));
        return({OK:true, msg:'shifted'});
    }
    onUnequip() {
        let old = this.parent.parent.Skills.countItem(this.data.skill);
        if(old>0) this.parent.parent.Skills.removeItem(this.data.skill,old);
        return({OK:true, msg:'shifted'});
    }
    attackMod(target){
        let mod = new SkillMod();
        let _dmg =5;
        if(this.data.style==='wasplike' ) _dmg+=5;
        mod.onHit = [{ target:target, eff: [effDamage.factory(_dmg,'pierce', this.parent.parent.name+' pokes its '+this.data.style+' stinger into '+target.name )]}];
        return(mod);
    }
}
class SkinHuman extends BodyPart {
    static dataPrototype() {    
        return({style:'human', color:'olive', pattern: 'smooth'}); }
    static factory(id) {
        let obj =  new SkinHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('SkinHuman');
        this.addTags(['body']);
        this.slotUse = ['bSkin'];
        this.data = SkinHuman.dataPrototype();
    }
    setStyle(id,color='pale') {
        this.data.style = id; 
        this.data.color = color;
        switch(id) {
            case 'human':
                this.data.pattern = 'smooth';
                break;
            case 'latex':
                this.data.pattern = 'thick';
                break;
            default:
                throw new Error("unknown Skin-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 'a smooth skin mostly bare of noticable hair.';}
    toJSON() {return window.storage.Generic_toJSON("SkinHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(SkinHuman, value.data));}
    descLong(fconv) {
        return(fconv('$[My]$ body is covered with '+this.data.pattern+' '+this.data.color+' '+this.data.style+' skin.'));
    }
}
class SkinFur extends BodyPart {
    static dataPrototype() {    
        return({style:'wolf', color:'dark grey', pattern: 'dense'}); }
    static factory(id) {
        let obj =  new SkinFur();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('SkinFur');
        this.addTags(['body']);
        this.slotUse = ['bSkin'];
        this.data = SkinFur.dataPrototype();
    }
    setStyle(id,color='dark grey') {
        this.data.style = id; 
        this.data.color = color;
        switch(id) {
            case 'cat','bunny':
                this.data.pattern = 'fine';
                break;
            case 'dog':
                this.data.pattern = 'spotted';
                break;
            case 'horse':
                this.data.pattern = 'short';
                break;
            case 'wolf':                
                this.data.pattern = 'rough';
                break;
            default:
                throw new Error("unknown Fur-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 'a dense fur covering the whole body.';}  //todo color
    toJSON() {return window.storage.Generic_toJSON("SkinFur", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(SkinFur, value.data));}
    descLong(fconv) {
        return(fconv('A '+this.data.pattern+', '+this.data.color+' fur covers $[my]$ body.'));
    }
}
class SkinScales extends BodyPart {
    static dataPrototype() {    
        return({style:'lizard', color:'dark green', pattern: 'smooth'}); }
    static factory(id) {
        let obj =  new SkinScales();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('SkinScales');
        this.addTags(['body']);
        this.slotUse = ['bSkin'];
        this.data = SkinScales.dataPrototype();
    }
    setStyle(id,color='dark grey') {
        this.data.style = id; 
        this.data.color = color;
        switch(id) {
            case 'lizard':
                this.data.pattern = 'smooth';
                break;
            default:
                throw new Error("unknown Fur-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 'scales like a eptile.';}  //todo color
    toJSON() {return window.storage.Generic_toJSON("SkinScales", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(SkinScales, value.data));}
    descLong(fconv) {
        return(fconv('$[My]$ body is covered in '+this.data.pattern+', '+this.data.color+' scales.'));
    }
}
class TailWolf extends BodyPart {
    static dataPrototype() {    
        return({style:'wolf',growth:0.1, maxGrowth: 1.5});    }
    static factory(id) {
        let obj =  new TailWolf();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('TailWolf');
        this.addTags(['body']);
        this.slotUse = ['bTailBase'];
        this.data = TailWolf.dataPrototype();  
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'cat':
            case 'dog':
            case 'horse':
            case 'wolf':
            case 'lizard':  
                this.data.growth = 0.10; //in %/100 maxGrowth
                this.data.maxGrowth = 1.2; //in meter, todo depends on bodysize
                break;
            case 'bunny':
                this.data.growth = 0.40; //in %/100 maxGrowth
                this.data.maxGrowth = 0.2; //in meter, todo depends on bodysize
            case 'human':
                this.data.growth =1;
                this.data.maxGrowth = 0.0; //todo no tail??
            default:
                throw new Error("unknown Tail-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 
        var msg ='';
        switch(this.data.style) {
            case 'cat':
                msg ='a flexible,furred tail like that of a cat.';
            break;
            default:
                msg = this.data.style+'\'like tail.';
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("TailWolf", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(TailWolf, value.data));}
    descLong(fconv) { 
        return(fconv('Some '+this.data.style+'-tail is attached to $[my]$ spine.'));
    }
}
class HandsPaw extends BodyPart { //paws of ferals
    static dataPrototype() {    
        return({style:'wolf'});
    }
    static factory(id) {
        let obj =  new HandsPaw();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('HandsPaw');
        this.addTags(['body']);
        this.slotUse = ['bHands'];
        this.data = HandsPaw.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id; 
        switch(id) {
            case 'cat':
            case 'dog':
            case 'wolf':
            case 'bunny':
            case 'lizard':
                break;
            default:
                throw new Error("unknown HandsPaw-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return this.data.style+'\'like paws.';}
    toJSON() {return window.storage.Generic_toJSON("HandsPaw", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(HandsPaw, value.data));}
    descLong(fconv) { 
        return(fconv('$[I]$ $[have]$ paws like that of a '+this.data.style+'.'));
    }
    attackMod(target){
        let mod = new SkillMod();
        let _dmg =5;
        if(this.data.style==='cat' || this.data.style==='lizard' ) _dmg+=5;
        mod.onHit = [{ target:target, eff: [effDamage.factory(_dmg,'slash')]}];
        return(mod);
    }
}
class HandsHoof extends BodyPart { //hoves of horse,...
    static dataPrototype() {    
        return({style:'horse'});
    }
    static factory(id) {
        let obj =  new HandsHoof();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('HandsHoof');
        this.addTags(['body']);
        this.slotUse = ['bHands'];
        this.data = HandsHoof.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id; 
        switch(id) {
            case 'horse':
            case 'deer':
                break;
            default:
                throw new Error("unknown HandsHoof-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return this.data.style+'\'like hoves.';}
    toJSON() {return window.storage.Generic_toJSON("HandsHoof", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(HandsHoof, value.data));}
    descLong(fconv) { 
        return(fconv('$[I]$ $[have]$ hoves like that of a '+this.data.style+'.'));
    }
    attackMod(target){
        let mod = new SkillMod();
        let _dmg =5;
        if(this.data.style==='horse' ) _dmg+=5;
        mod.onHit = [{ target:target, eff: [effDamage.factory(_dmg,'blunt')]}];
        return(mod);
    }
}
class HandsHuman extends BodyPart { //hands with digits to use tools
    static dataPrototype() {    
        return({style:'human'});
    }
    static factory(id) {
        let obj =  new HandsHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('HandsHuman');
        this.addTags(['body']);
        this.slotUse = ['bHands'];
        this.data = HandsHuman.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id; 
        switch(id) {
            case 'dog':
            case 'wolf':
            case 'horse':
            case 'bunny':
                break;
            case 'cat':
            case 'lizard':
                break;
            case 'human':
                break;
            default:
                throw new Error("unknown Hands-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return ('human like hands.');}
    toJSON() {return window.storage.Generic_toJSON("HandsHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(HandsHuman, value.data));}
    descLong(fconv) { 
        let msg = '$[My]$ hands consist of a palm and fingers.';
        msg += ['horse','deer'].includes(this.data.style)?(this.data.style+'-hoofes adorn the fingertips'):'';
        msg += ['dog','wolf','cat','bunny'].includes(this.data.style)?(this.data.style+'-claws adorn the fingertips'):'';
        msg += ['lizard'].includes(this.data.style)?('Large talons grow from their fingertips.'):'';
        return(fconv(msg));
    }
}
class BreastHuman extends BodyPart {
    static dataPrototype() {    
        return({style:'human',growth:0.1, maxGrowth: 1.5});
    }
    static factory(id) {
        let obj =  new BreastHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('BreastHuman');
        this.addTags(['body']);
        this.slotUse = ['bBreast'];
        this.data = BreastHuman.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'human':
            case 'horse':
                break;
            case 'cat':
            case 'dog':
            case 'wolf':
            case 'bunny':
                break;
            case 'lizard':
                break;
            default:
                throw new Error("unknown breast-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { return 'some '+this.data.style+' breasts.';}
    toJSON() {return window.storage.Generic_toJSON("BreastHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(BreastHuman, value.data));}
    descLong(fconv) { 
        return(fconv('$[My]$ breasts are small but perky.'));
    }
}
class AnusHuman extends BodyPart {
    static dataPrototype() {    
        return({virgin:true,wetgen:1, stretch:1,depth:1,spermtype:'',sperm:0});
    }
    static factory(id) {
        let obj =  new AnusHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('AnusHuman');
        this.addTags(['body']);
        this.slotUse = ['bAnus'];
        this.data = AnusHuman.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'human':
            case 'cat':
            case 'dog':
            case 'horse':
            case 'wolf':
            case 'bunny':
            case 'lizard':
                break;
            default:
                throw new Error("unknown anus-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return(this.data.style+' hole');}
    get desc() { return 'tailhole';}
    toJSON() {return window.storage.Generic_toJSON("AnusHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(AnusHuman, value.data));}
    descLong(fconv) {
        let msg= "$[My]$ anus can snuggly fit around "+this.data.stretch+"cm in diameter and "+this.data.depth+"cm in depth.";
        if(this.data.spermtype!=='') {
            msg+= this.data.sperm+"ml of sperm from a "+this.data.spermtype+" might be deposited in $[my]$ bum.";  
        }
        return(fconv(msg));
    }
    addSperm(type,amount) {
        if(amount>this.data.sperm || this.data.spermtype) {
            this.data.spermtype=type;
        }
        this.data.sperm+=amount;
    }
    removeSperm(amount) {
        if(amount>0) {
            this.data.sperm-=amount;
        } else this.data.sperm=0;
        if(this.data.sperm<=0) {
            this.data.sperm=0;this.data.spermtype='';
        }
    }
}
//variation: snatch - cooch - slit - cunt - cooter - fuck-hole - 
class VulvaHuman extends BodyPart {
    static dataPrototype() {    
        return({labia:0, virgin:true,wetgen:1, stretch:1,depth:1,clitsize:0.5, spermtype:'',sperm:0});
    }
    static factory(id) {
        let obj =  new VulvaHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('VulvaHuman');
        this.addTags(['body']);
        this.slotUse = ['bVulva'];
        this.data = VulvaHuman.dataPrototype();
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'human':
            case 'cat':
            case 'dog':
            case 'horse':
            case 'wolf':
            case 'bunny':
            case 'lizard':
                break;
            default:
                throw new Error("unknown vulva-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return(this.data.style+' vagina');}
    get desc() { return 'puffy cunt';}
    toJSON() {return window.storage.Generic_toJSON("VulvaHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(VulvaHuman, value.data));}
    descLong(fconv) {
        let msg= "$[My]$ vagina can snuggly fit around "+this.data.stretch+"cm in diameter and "+this.data.depth+"cm in depth.";
        msg+= "Its clit is of a size of around "+this.data.clitsize+"cm."; 
        if(this.data.spermtype!=='') {
            msg+= this.data.sperm+"ml of sperm from a "+this.data.spermtype+" might be deposited in $[my]$ womb.";  
        }
        return(fconv(msg));
    }
    onEquip(context){
        //context.parent.addEffect(new window.storage.constructors['effSpermDecay'](),'effSpermDecay');
        context.parent.addEffect(new window.storage.constructors['effVaginalFertil'](),'effVaginalFertil');
        return({OK:true,msg:'equipped'});
    }
    onUnequip(context) {
        context.parent.Effects.removeItem('effVaginalFertil');
        context.parent.Effects.removeItem('effVaginalPregnant');
        //context.parent.Effects.removeItem('effSpermDecay');
        return({OK:true,msg:'unequipped'});
    }
    addSperm(type,amount) {
        if(amount>this.data.sperm || this.data.spermtype) {
            this.data.spermtype=type;
        }
        this.data.sperm+=amount;
    }
    removeSperm(amount) {
        if(amount>0) {
            this.data.sperm-=amount;
        } else this.data.sperm=0;
        if(this.data.sperm<=0) {
            this.data.sperm=0;this.data.spermtype='';
        }
    }
}
class PenisHuman extends BodyPart {
    static dataPrototype() {    
        return({style:'human',maxGrowth:0.2,growth:0.4, virgin:true, wetgen:1,sheath:0, ballsize:2.3});
    }
    static factory(id) {
        let obj =  new PenisHuman();
        obj.setStyle(id);
        return(obj);
    }
    constructor() {
        super('PenisHuman');
        this.addTags(['body']);
        this.slotUse = ['bPenis','bBalls'];
        this.data = PenisHuman.dataPrototype();   
    }
    setStyle(id) {
        this.data.style = id;
        switch(id) {
            case 'human':
            case 'cat':
            case 'dog':
            case 'horse':
            case 'wolf':
            case 'bunny':
                break;
            case 'lizard':    
                break;
            default:
                throw new Error("unknown penis-style "+id);
        }
    }
    getStyle() { return this.data.style; }
    get descShort() { return (this.desc);}
    get desc() { 
        var msg ='';
        switch(this.data.style) {
            case 'cat':
                msg ='a slim but spiked cat-member.';
            break;
            default:
                msg = 'a schlong of a '+ this.data.style+'.';
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("PenisHuman", this); };
    static fromJSON(value) {return(window.storage.Generic_fromJSON(PenisHuman, value.data));}
    canEquip(context) {return({OK:true, msg:'equipable'});}
    canUnequip() {return({OK:true, msg:'unequipable'});}
    descLong(fconv) {
        let msg= "$[My]$ "+this.data.style+"-dong is around "+this.sizeString(this.data.growth*this.data.maxGrowth)+" long.";
        msg+= "A Ballsack dangles below it that measures around "+this.data.ballsize+"cm.";   
        return(fconv(msg));
    }
}
//todo BodyPartLib ??
window.gm.ItemsLib = (function (ItemsLib) {
    window.storage.registerConstructor(AnusHuman);
    window.storage.registerConstructor(ArmorTorso);
    window.storage.registerConstructor(WeaponStinger);
    window.storage.registerConstructor(BaseHumanoid);
    window.storage.registerConstructor(BaseQuadruped);
    window.storage.registerConstructor(BaseWasp);
    window.storage.registerConstructor(BaseWorm);
    window.storage.registerConstructor(HandsHoof);
    window.storage.registerConstructor(HandsHuman);
    window.storage.registerConstructor(HandsPaw);
    window.storage.registerConstructor(FaceHorse);
    window.storage.registerConstructor(FaceHuman);
    window.storage.registerConstructor(FaceLeech);
    window.storage.registerConstructor(FaceWolf);
    window.storage.registerConstructor(SkinHuman);
    window.storage.registerConstructor(SkinFur);
    window.storage.registerConstructor(SkinScales);
    window.storage.registerConstructor(TailWolf);
    window.storage.registerConstructor(BreastHuman);
    window.storage.registerConstructor(PenisHuman);
    window.storage.registerConstructor(VulvaHuman);
    return ItemsLib; 
}(window.gm.ItemsLib || {}));