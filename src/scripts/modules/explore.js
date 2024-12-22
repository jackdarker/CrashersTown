"using strict";
/**
 * an Area stores information about the state of a location and also handles the "exploration" of the player
 */
class AreaPorthcrawl extends MapArea {
    constructor(){super();
        this.name='Porthcrawl';
        this.FlagMarket=0,
        this.FlagInn=0;
    }
    toJSON() {return window.storage.Generic_toJSON("AreaPorthcrawl", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaPorthcrawl, value.data);};
    explore() {
        this.nextScene='';this.timesExplored+=1;
        window.story.state.tmp.args[2]=_.random(0,100); //rng
        this.nextScene='City_Explore';return(true);
    }
    desc(){return('This town might now be your new home.');}
}
class AreaCrashsite extends MapArea {
    constructor(){super();this.name='Crashsite';}
    toJSON() {return window.storage.Generic_toJSON("AreaCrashsite", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaCrashsite, value.data);};
    explore() {
        this.nextScene='';this.timesExplored+=1;
        if(this.timesExplored>2 && (window.story.state.Map.CrashsiteRuins===undefined)){
            this.nextScene='CS_Ruins_Explore';return(true);
        } 
        this.nextScene='CS_Explore';return(true);
    }
    desc(){return('Anything that grew here before your arrival was destroyed as your ship "landed".');}
}
class AreaCrashsiteRuins extends MapArea {
    constructor(){super();this.name='Crashsite Ruins';
    }
    toJSON() {return window.storage.Generic_toJSON("AreaCrashsiteRuins", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaCrashsiteRuins, value.data);};
    explore(PerId) {
        this.nextScene='';
        return(false);
    }
    scavenge(PerId) {
        this.nextScene='';
        let _rnd= _.random(0,100);
        if(_rnd>30) {
            this.nextScene='CS_Ruins_Scavenge';
            if(_rnd>60) window.story.state.tmp.args=['Iron',1];
            else window.story.state.tmp.args=['Stone',2];
            return(true);
        }  
        return(false);
    }
    desc(){return('Ruins of old buildings are located close to the crashsite. It might be possible to scavenge some stones and even some metall from this place. There is nothing here that is worth hunting.');}
}
///////////////////////////////////////////////////
class AreaLapineVillage extends MapArea {
    constructor(){super();this.name='Village of the lapines';
    }
    toJSON() {return window.storage.Generic_toJSON("AreaLapineVillage", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaLapineVillage, value.data);};
}
///////////////////////////////////////////////////
class AreaHills extends MapArea {
    constructor(){super();
        this.name='Hills';
    }
    toJSON() {return window.storage.Generic_toJSON("AreaHills", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaHills, value.data);};
    explore() {
        this.nextScene='';this.timesExplored+=1;
        this.nextScene='Hills_Explore';return(true);
    }
    desc(){return("Directly outside the town are the 'Hills'. Large areas of gras and several fields of grain and vegetables are covering there flat flanks.");}
}
///////////////////////////////////////////////////
class AreaForest extends MapArea {
    constructor(){super();this.name='Forest northern of the crashsite';
        this.trapState=this.trapCount=0;
    }
    toJSON() {return window.storage.Generic_toJSON("AreaForest", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaForest, value.data);};
    explore(PerId) {
        this.nextScene='';this.timesExplored+=1;
        this.nextScene='CS_Forest_Explore';return(true);
    }
    scavenge(PerId) {
        this.nextScene='';
        let _rnd= _.random(0,100);
        if(_rnd>30) {
            this.nextScene='CS_Forest_Scavenge';
            if(_rnd>60) window.story.state.tmp.args=['RedGel',1];
            else window.story.state.tmp.args=['Wood',2];
            return(true);
        }  
        return(false);
    }
    hunt(PerId) {
        this.nextScene='';
        let _rnd= _.random(0,100);
        if(_rnd>50) {
            if(this.trapState===1) { //1 = trap prepared
                this.trapState=30;//30 = got food
                if(_rnd>65) this.trapState=20;//20 = trap destroyed
                if(_rnd>80) this.trapState=10; //10 = Lapine trapped
            } 
            this.nextScene='CS_Forest_Hunt';
            return(true);
        }  
        return(false);
    }
}
window.gm.ExploreLib = (function (Lib) {
    window.storage.registerConstructor(AreaPorthcrawl);
    window.storage.registerConstructor(AreaCrashsite);
    window.storage.registerConstructor(AreaCrashsiteRuins);
    window.storage.registerConstructor(AreaLapineVillage);
    window.storage.registerConstructor(AreaForest);
    window.storage.registerConstructor(AreaHills);
    Lib['AreaPorthcrawl']= function () { let x= new AreaPorthcrawl();return(x);};
    Lib['AreaCrashsite']= function () { let x= new AreaCrashsite();return(x);};
    Lib['AreaCrashsiteRuins']= function () { let x= new AreaCrashsiteRuins();return(x);};
    Lib['AreaLapineVillage']= function () { let x= new AreaLapineVillage();return(x);};
    Lib['AreaForest']= function () { let x= new AreaForest();return(x);};
    Lib['AreaHills']= function () { let x= new AreaHills();return(x);};
    //Lib['AreaDeepForest']= function () { let x= new AreaDeepForest();return(x);};
    return Lib; 
}(window.gm.ExploreLib || {}));
