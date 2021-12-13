"use strict";
/*
- imp
- nymph
- kobold
- lizard-man
- naga
- bunny-girl
- stag-boy/-Stud  archer, drumer, warrior
- cougar-girl/-mistress
- grizzly
- werwolf
- vile vine
- lush orchid
- slug
- Giant-Snake
- Giant wasp
- spider/tarantula
- glyphid swarmers/ Brood hive
- glyphid soldiers
- cave leech
- Naeodocyte shocker
- raptor
- gryphon
- felkin
- drider
- dragon/wyvern

 */

////////////////////////////////////////////////////////
// normal foes
class Mole extends Mob {
    static factory(type) {
        let foe = new Mole();
        if(type==='Squirrel') {
            foe.name = foe.id = 'Squirrel';
            this.pic= 'squirrel1';
        }
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Mole';
        this.pic= 'squirrel1';//todo
        this.Stats.increment('healthMax',-0.5*(this.health().max));
    }
}
class Wolf extends Mob {
    static factory(type) {
        let foe = new Wolf();
        if(type==='AlphaWolf') {
            foe.name = foe.id = 'AlphaWolf';
            foe.Stats.increment('healthMax',-0.3*(foe.health().max));
            foe.Skills.addItem(SkillCallHelp.factory('Wolf')); //todo chance to call?
            foe.pic= 'assets/battlers/wolf1';
        } else {
            foe.Stats.increment('healthMax',-0.5*(foe.health().max));
        }
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Wolf';
        this.pic= "wolf3";//'assets/battlers/wolf3.svg';
        this.level_min =3;
        this.loot= [{id:'WolfTooth',chance:25,amount:1}];
        this.Outfit.addItem(new BaseQuadruped());
        this.Outfit.addItem(SkinFur.factory('wolf','black'));
        this.Outfit.addItem(HandsPaw.factory('wolf'));
        this.Outfit.addItem(PenisHuman.factory('wolf'));
        this.Outfit.addItem(AnusHuman.factory('wolf'));
        this.Outfit.addItem(TailWolf.factory('wolf'));
        this.Outfit.addItem(FaceWolf.factory('wolf'));
        this.Stats.increment('arm_blunt',5);
        this.fconv = null; //lazy init because descfixer depends on gm.player
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};//this._canAct();
        let rnd = _.random(1,100);
        let spawn="CallHelpWolf";
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        if(window.story.state.combat.turnCount%2===0) {
            rnd = _.random(0,enemys.length-1);
            result.action = "Bite";
            result.target = [enemys[rnd]];
            result.msg =this.name+" snaps at "+result.target[0].name+".</br>"+result.msg;
            return(result);
        } else if(window.story.state.combat.turnCount>3 && this.Skills.countItem(spawn)>0 &&
            this.Skills.getItem(spawn).isEnabled().OK) {
            result.action = spawn;
            result.target = [this];
            result.msg =this.name+" howls to call its pack for support.</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Slug extends Mob { 
    static factory(type) {
        let foe = new Slug();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Slug';
        this.pic= 'slug2';
        this.level_min =1;
        this.Outfit.addItem(new BaseWorm());
        this.Outfit.addItem(FaceLeech.factory('slug')); 
        this.Outfit.addItem(ArmorTorso.factory('slime'));
        this.fconv = null;
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        if(this.Stats.countItem(effKamikaze.name)<=0) { //self-exploding
            this.addEffect(new effKamikaze());
        }
        if(window.story.state.combat.turnCount%2===0) {
            rnd = _.random(0,enemys.length-1);
            result.action = "Bite";
            result.target = [enemys[rnd]];
            result.msg =this.name+" slurps at "+result.target[0].name+".</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Leech extends Mob {
    static factory(type) {
        let foe = new Leech();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Leech';
        this.pic= 'leech2';
        this.level_min =1;
        this.Outfit.addItem(new BaseWorm());
        this.Outfit.addItem(FaceLeech.factory('leech'));
        this.Skills.addItem(new SkillLeechHealth());
        this.tmp = {grappleCoolDown:1};
        this.fconv = null; //lazy init because descfixer depends on gm.player
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        if(this.Effects.countItem(effGrappling.name)>0) {
            this.tmp.grappleCoolDown=2;
            result.msg =this.fconv(this.name +" sucks blood.</br>")+result.msg;
            return(result);
        } else if(this.tmp.grappleCoolDown<=0){
            this.tmp.grappleCoolDown=2;
            rnd = _.random(0,enemys.length-1);
            result.action = "Leech";
            result.target = [enemys[rnd]];
            result.msg =this.fconv("$[I]$ $[snap]$ at "+result.target[0].name+".</br>")+result.msg;
            return(result);
        } else {
            this.tmp.grappleCoolDown-=1;
        } 
        return(super.calcCombatMove(enemys,friends));
    }
}
class Lizan extends Mob {
    static factory(type) {
        let foe = new Lizan();
        if(type==='spearthrower') {
            foe.Outfit.addItem(SpearWodden.factory(100));
        } else {
            foe.Outfit.addItem(new DaggerSteel());
        }
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Lizan';
        this.pic= 'lizan1';
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(SkinScales.factory('lizard'));
        this.Outfit.addItem(HandsHuman.factory('lizard'));
        this.Outfit.addItem(BreastHuman.factory('lizard'));
        this.Outfit.addItem(FaceWolf.factory('lizard'));
        this.Outfit.addItem(AnusHuman.factory('lizard'));
        this.Outfit.addItem(PenisHuman.factory('lizard'));
        this.Outfit.addItem(ShortsLeather.factory(100));
        let sk = new SkillGuard();
        sk.style=2;
        this.Skills.addItem(sk);
        this.levelUp(3);
        this.autoLeveling();
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        let rnd = _.random(1,100);
        result.action =result.target= null;
        //todo shoot arrow, pounce, throw net
        if(window.story.state.combat.turnCount%2===0) {
            result.action = "Guard";
            result.target = [this];
            result.msg =this.name+" croutches into a defensive stance.</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Lapine extends Mob {
    static factory(type) {
        let foe = new Lapine();
        if(type==='spearthrower') {
            foe.Outfit.addItem(SpearWodden.factory(100));
        } else {
            foe.Outfit.addItem(new DaggerSteel());
        }
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Lapine';
        this.pic= 'Bunny1';
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(SkinFur.factory('bunny'));
        this.Outfit.addItem(HandsHuman.factory('bunny'));
        this.Outfit.addItem(BreastHuman.factory('bunny'));
        this.Outfit.addItem(FaceHorse.factory('bunny'));
        this.Outfit.addItem(AnusHuman.factory('bunny'));
        this.Outfit.addItem(VulvaHuman.factory('bunny'));
        this.Outfit.addItem(ShortsLeather.factory(100));
        let sk = new SkillKick();
        this.Skills.addItem(sk);
        this.levelUp(1);
        this.autoLeveling();
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        let rnd = _.random(1,100);
        result.action =result.target= null;
        let skill = this.Skills.getItem("Kick");
        if(window.story.state.combat.turnCount>2 && rnd>30 && skill.canPay().OK) {
            result.action = skill.name;
            result.target = [this];
            result.msg =this.name+" prepares for a powerful jump-kick.</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Huntress extends Mob {
    static factory(type) {
        let foe = new Huntress();
        if(type==='spearthrower') {
            foe.Outfit.addItem(SpearWodden.factory(100));
        } else {
            foe.Outfit.addItem(new DaggerSteel());
        }
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Huntress';
        this.pic= 'unknown';
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(new SkinHuman());
        this.Outfit.addItem(HandsHuman.factory('cat'));
        this.Outfit.addItem(BreastHuman.factory('cat'));
        this.Outfit.addItem(FaceWolf.factory('cat'));
        this.Outfit.addItem(AnusHuman.factory('cat'));
        this.Outfit.addItem(VulvaHuman.factory('cat'));
        this.Outfit.addItem(new BikiniBottomLeather());
        this.Outfit.addItem(new BikiniTopLeather());
        let sk = new SkillGuard();
        sk.style=2;
        this.Skills.addItem(sk);
        this.levelUp(3);
        this.autoLeveling();
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        let rnd = _.random(1,100);
        result.action =result.target= null;
        //todo shoot arrow, pounce, throw net
        if(window.story.state.combat.turnCount%2===0) {
            result.action = "Guard";
            result.target = [this];
            result.msg =this.name+" retreats somewhat and moves into a defensive stance.</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Succubus extends Mob {
    static factory(type) {
        let foe = new Succubus();
        foe.Outfit.addItem(new WhipLeather());
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Succubus';
        this.pic= 'succubus1';
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(new SkinHuman());
        this.Outfit.addItem(HandsHuman.factory('human'));
        this.Outfit.addItem(BreastHuman.factory('human'));
        this.Outfit.addItem(new FaceHuman());
        this.Outfit.addItem(AnusHuman.factory('human'));
        this.Outfit.addItem(VulvaHuman.factory('human'));
        this.Outfit.addItem(new BikiniBottomLeather());
        this.Outfit.addItem(new BikiniTopLeather());
        let sk = new SkillGuard();
        sk.style=2;
        this.Skills.addItem(sk);
        this.levelUp(4);
        this.autoLeveling();
        this.Skills.getItem('Tease').level=3;
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        //if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        let rnd = _.random(1,100);
        result.action =result.target= null;
        //todo whiplash, call tentacles
        if(window.story.state.combat.turnCount %3 ===0) {
            result.action = "Guard";
            result.target = [this];
            result.msg =this.name+" moves into a defensive stance.</br>"+result.msg;
            return(result);
        } else if (window.story.state.combat.turnCount %4 ===0) {
            rnd = _.random(0,enemys.length-1);
            result.action = "Tease";
            result.target = [enemys[rnd]];
            result.msg =this.name+" throws a kiss at "+result.target[0].name+".</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Dryad extends Mob {
    static factory(type) {
        let foe = new Dryad();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Dryad';
        this.pic= 'unknown';
        this.loot= [{id:'DryadVine',chance:25,amount:1}];
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(new SkinHuman());
        this.Outfit.addItem(HandsHuman.factory('human'));
        this.Outfit.addItem(BreastHuman.factory('human'));
        this.Outfit.addItem(new FaceHuman());
        this.Outfit.addItem(AnusHuman.factory('human'));
        this.Outfit.addItem(VulvaHuman.factory('human'));
        this.Outfit.addItem(new BikiniBottomLeather());
        this.Skills.addItem(SkillCallHelp.factory('Vine'));
        this.levelUp(3);
        this.autoLeveling();
        this.tmp = {vines:0};
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        if(this.tmp.vines<1) {
            this.tmp.vines+=1;
            result.msg =this.fconv(this.name +" starts to summon something...</br>")+result.msg;
            result.action='CallHelp';
            result.target=[this];
            return(result);
        }
        //todo poison
        return(super.calcCombatMove(enemys,friends));
    }
}
class Vine extends Mob {
    static factory(type) {
        let foe = new Vine();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Vine';
        this.pic= 'unknown';
        this.Outfit.addItem(new BaseWorm());
        this.Skills.addItem(new SkillGrapple());
        this.levelUp(1);
        this.autoLeveling();
        this.tmp = {grappleCoolDown:1};
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        if(this.Effects.countItem(effGrappling.name)>0) {
            this.tmp.grappleCoolDown=5;
            result.msg =this.fconv(this.name +" entwines its prey.</br>")+result.msg;
            return(result);
        } else if(this.tmp.grappleCoolDown<=0){
            this.tmp.grappleCoolDown=2;
            rnd = _.random(0,enemys.length-1);
            result.action = "Grapple";
            result.target = [enemys[rnd]];
            result.msg =this.fconv(this.name + " wraps itself around "+result.target[0].name+".</br>")+result.msg;
            return(result);
        } else {
            this.tmp.grappleCoolDown-=1;
        } 
        return(super.calcCombatMove(enemys,friends));
    } 
}
class Mechanic extends Mob {
    static factory(type) {
        let foe = new Mechanic();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Mechanic-Guy';
        this.pic= 'unknown';
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        result.action =result.target= null;
        if(window.story.state.combat.turnCount<3) {
            rnd = _.random(0,enemys.length-1);
            result.action = "Stun";
            result.target = [enemys[rnd]];
            result.msg =this.name+" trys to hit your head whith his wrench.</br>"+result.msg;
            return(result);
        }
        return(super.calcCombatMove(enemys,friends));
    }
}
class Hornett extends Mob {
    static factory(type) {
        let foe = new Hornett();
        return foe;
    }
    constructor() {
        super();
        this.name = this.id = 'Hornett';
        this.pic= 'wasp1';
        this.level_min =1;
        this.Outfit.addItem(new BaseWasp());
        this.Outfit.addItem(WeaponStinger.factory('wasplike'));
        this.fconv = null; //lazy init because descfixer depends on gm.player
    }
    calcCombatMove(enemys,friends){
        let result = {OK:true,msg:''};
        let rnd = _.random(1,100);
        if(!this.fconv) this.fconv = window.gm.util.descFixer(this);
        result.action =result.target= null;
        let sting= 'wasp-stinger';
        if(this.Skills.getItem(sting).isEnabled()){
            rnd = _.random(0,enemys.length-1);
            result.action = sting;
            result.target = [enemys[rnd]];
            result.msg =this.fconv("$[I]$ thrust $[my]$ stinger at "+result.target[0].name+".</br>")+result.msg;
            return(result);
        } else {
        } 
        return(super.calcCombatMove(enemys,friends));
    }
}
/////////////////////////////////////////////////////////
// special NPC
class Carlia extends Mob {
  constructor() {
      super();
      this.name = this.id = 'Carlia';
      this.pic= 'unknown';
      this.Outfit.addItem(new BaseHumanoid());
      this.Outfit.addItem(new SkinHuman());
      this.Outfit.addItem(HandsHuman.factory('cat'));
      this.Outfit.addItem(FaceWolf.factory('cat'));
      this.Outfit.addItem(BreastHuman.factory('human'));
      CSS
      this.Outfit.addItem(VulvaHuman.factory('human'));
      this.Outfit.addItem(new BikiniBottomLeather());
      this.Outfit.addItem(new BikiniTopLeather());
      this.levelUp(3);
      this.autoLeveling();
  }
}
class Ruff extends Wolf {
    constructor() {
        super();
        this.name = this.id = 'Ruff';
        this.pic= 'unknown';
        this.Outfit.addItem(AnusHuman.factory('wolf'));
        this.Outfit.addItem(PenisHuman.factory('wolf'));
        this.levelUp(3);
        this.autoLeveling();
    }
}
class Trent extends Mob {
    constructor() {
        super();
        this.name = this.id = 'Trent';
        this.pic= 'unknown';
        this.Outfit.addItem(new BaseHumanoid());
        this.Outfit.addItem(SkinFur.factory('horse', 'brown'));
        this.Outfit.addItem(HandsHuman.factory('horse'));
        this.Outfit.addItem(TailWolf.factory('horse'));
        this.Outfit.addItem(FaceWolf.factory('horse'));
        this.Outfit.addItem(AnusHuman.factory('horse'));
        this.Outfit.addItem(PenisHuman.factory('horse'));
        this.Outfit.addItem(new ShortsLeather());
        this.Outfit.addItem(new MaceSteel());
        this.Stats.increment('strength',3);
        this.levelUp(6);
        this.autoLeveling();
    }
}
//collection of mob-constructors
window.gm.Mobs = (function (Mobs) {
    Mobs.Lapine = Lapine.factory;
    Mobs.Mole = Mole.factory;
    Mobs.Squirrel = function() { return function(param){return(Mole.factory(param));}("Squirrel")};
    Mobs.Hornett = Hornett.factory;
    Mobs.Huntress = Huntress.factory;
    Mobs.Lizan = Lizan.factory;
    Mobs.Wolf = Wolf.factory;
    Mobs.AlphaWolf = function() { return function(param){return(Wolf.factory(param));}(100)};
    Mobs.Leech = Leech.factory;  
    Mobs.Slug = Slug.factory; 
    Mobs.Succubus = Succubus.factory;
    Mobs.Dryad = Dryad.factory; 
    Mobs.Vine = Vine.factory; 
    Mobs.Mechanic = Mechanic.factory;
    return Mobs; 
}(window.gm.Mobs || {}));