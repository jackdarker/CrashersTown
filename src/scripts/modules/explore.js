"using strict";

class AreaCrashsite extends MapArea {
    constructor(){super();this.name='Crashsite';}
    toJSON() {return window.storage.Generic_toJSON("AreaCrashsite", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaCrashsite, value.data);};
    explore(PerId) {
        this.nextScene='';
        if(this.timesExplored<1){
            this.timesExplored+=1;
            this.nextScene='CS_Forest_Explore';return(true);
        } else if(this.timesExplored<=4){
            this.nextScene='CS_Ruins_Explore';return(true);
        }
        return(false);
    }
    hunt(PerId) {
        this.nextScene='';
        let _rnd= _.random(0,100);
        if(_rnd>50) {
            this.nextScene='CS_Forest_Hunt';
            return(true);
        }  
        return(false);
    }
}
class AreaCrashsiteRuins extends MapArea {
    constructor(){super();this.name='Crashsite Ruins';}
    toJSON() {return window.storage.Generic_toJSON("AreaCrashsiteRuins", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaCrashsiteRuins, value.data);};
    explore(PerId) {
        this.nextScene='';
        return(false);
    }
    scavenge(PerId) {
        this.nextScene='';
        let _rnd= _.random(0,100);
        if(_rnd>50) {
            this.nextScene='CS_Ruins_Scavenge';
            return(true);
        }  
        return(false);
    }
}
class AreaLapineVillage extends MapArea {
    constructor(){super();this.name='Village of the lapines';}
    toJSON() {return window.storage.Generic_toJSON("AreaLapineVillage", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(AreaLapineVillage, value.data);};
}
window.gm.ExploreLib = (function (Lib) {
    window.storage.registerConstructor(AreaCrashsite);
    window.storage.registerConstructor(AreaCrashsiteRuins);
    window.storage.registerConstructor(AreaLapineVillage);
    Lib['AreaCrashsite']= function () { let x= new AreaCrashsite();return(x);};
    Lib['AreaCrashsiteRuins']= function () { let x= new AreaCrashsiteRuins();return(x);};
    Lib['AreaLapineVillage']= function () { let x= new AreaLapineVillage();return(x);};
    return Lib; 
}(window.gm.ExploreLib || {}));
