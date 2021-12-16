"use strict";

class ResourceChange extends GMEvent {
    constructor() {
        super();
        this.Resource=Resource.ID.Food;
        this.gain=5; this.common=true;
    }
    toJSON() {return window.storage.Generic_toJSON("ResourceChange", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ResourceChange, value.data);return(x);}
    static add(array,ResId,gain) {
        let _R = array[ResId];
        if(_R===null || _R===undefined) {
            _R = window.gm.ResourcesLib[ResId]();
            array[ResId]=(_R);
        }
        _R.consume(-1*gain);
    }
    tick(time) {
        this.lastTick=time;
        if(this.common) { //add common gains to summary event
            window.story.state.Summary.ResourceChange.add(this.Resource,this.gain);
            this.done=true;
            return(false); //no display now
        } else {
            ResourceChange.add(window.story.state.City.Resources,this.Resource,this.gain)
            this.done=true;
            return(true);
        }
    }
    renderTick() {
        var entry = document.createElement('p'); //todo message set by caller? 
        entry.textContent = (this.gain>0)?(this.gain+' '+this.Resource+' were scavenged.'):((-1*this.gain)+' '+this.Resource+' were consumed.');
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
//removes resources consumed by people
class FoodDrain extends GMEvent {
    constructor() {
        super();
        this.ResTotal ={};
    }
    toJSON() {return window.storage.Generic_toJSON("FoodDrain", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(FoodDrain, value.data);return(x);}
    tick(time) {
        this.lastTick=time;
        var _R,_P,_list2,Res=[];
        _list2 = window.story.state.City.People;
        this.ResTotal=[];
        for(el of _list2) { //check people
            Res=el.getBasicNeeds(); 
            //todo satisfyNeeds   //if enough food
            for(_R of Res) { //sum up resources
                this.ResTotal[_R.ResId] = this.ResTotal[_R.ResId]|| {amount:0};
                this.ResTotal[_R.ResId].amount+=_R.amount;
            }
        }
        var _list =Object.keys(this.ResTotal);
        for(el of _list) {
            _R = window.story.state.City.Resources[el];
            if(_R===null || _R===undefined) {
                _R = window.gm.ResourcesLib[el]();
                window.story.state.City.Resources[el]=_R;
            }
            _R.consume(this.ResTotal[el].amount);
        }
        this.done=true;
        return(true);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = 'Rations used:';
        $("div#panel")[0].appendChild(entry);
        var _list =Object.keys(this.ResTotal);
        for(el of _list) {
            entry = document.createElement('li');
            entry.textContent = el+': '+this.ResTotal[el].amount+' ';
            $("div#panel")[0].appendChild(entry);
        }
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class ResourceChangeSummary extends GMEvent {
    constructor() {
        super();
        this.Resources=[]; //{ResId:'Food',amount:3}
        this.ResTotal ={};
    }
    toJSON() {return window.storage.Generic_toJSON("ResourceChangeSummary", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ResourceChangeSummary, value.data);return(x);}
    add(ResId,amount){
        this.Resources.push({ResId:ResId,amount:amount});
    }
    tick(time) {
        this.lastTick=time;
        var _R;
        for(el of this.Resources) { //sum up resources
            this.ResTotal[el.ResId] = this.ResTotal[el.ResId]|| {amount:0};
            this.ResTotal[el.ResId].amount+=el.amount; 
        }
        var _list =Object.keys(this.ResTotal);
        for(el of _list) {
            ResourceChange.add(window.story.state.City.Resources,el,this.ResTotal[el].amount);
        }
        this.done=true;
        return(true);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = 'Other resources produced:';
        $("div#panel")[0].appendChild(entry);
        var _list =Object.keys(this.ResTotal);
        for(el of _list) {
            entry = document.createElement('li');
            entry.textContent = el+': '+this.ResTotal[el].amount+' ';
            $("div#panel")[0].appendChild(entry);
        }
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class BuildProgress extends GMEvent {
    constructor() {
        super();
        this.Facility ='Tent';
        this.daysLeft=2;
        this.lastTick = window.gm.getTime();
    }
    toJSON() {return window.storage.Generic_toJSON("BuildProgress", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(BuildProgress, value.data);return(x);}
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) {
            this.daysLeft-=1,this.lastTick=time;
            if(this.daysLeft<=0) {
                window.story.state.City.Facilities.push(window.gm.BuildingsLib[this.Facility]());
                this.done=true;
            }
            return(true);
        }
        return(false);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = this.done?'A '+this.Facility+' was constructed.':this.daysLeft+' more days until the building is done.';
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class ScoutProgress extends GMEvent {
    constructor() {
        super();
        this.Person =0; this.Area='';
        this.daysLeft=3;
        this.lastTick = window.gm.getTime();
    }
    toJSON() {return window.storage.Generic_toJSON("ScoutProgress", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ScoutProgress, value.data);return(x);}
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>=(24*60)) {
            this.daysLeft-=1,this.lastTick=time;
            let _Area=window.story.state.Map[this.Area];
            
            if(this.daysLeft<=0) {
                this.done=true;
            } else {
                _Area.explore(this.Person);
            }
            return(true);
        }
        return(false);
    }
    renderTick() {
        let _SC = window.story.state.Map[this.Area].nextScene;
        if(_SC!=='') {
            window.story.show(_SC);
            window.story.state.Map[this.Area].nextScene='';
            return(true);
        }
        var entry = document.createElement('p');
        entry.textContent = this.done?'Your scout returned from '+this.Area:this.daysLeft+' more days until your scout returns from '+this.Area;
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class HuntProgress extends GMEvent {
    constructor() {
        super();
        this.Person =0; this.Area='';
        this.daysLeft=1;
        this.lastTick = window.gm.getTime();
    }
    toJSON() {return window.storage.Generic_toJSON("HuntProgress", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(HuntProgress, value.data);return(x);}
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>=(24*60)) {
            this.daysLeft-=1,this.lastTick=time;
            if(this.done) return(true); //abort mission
            let _Area=window.story.state.Map[this.Area];
            _Area.hunt(this.Person); //hunt continues until aborted
            return(true);
        }
        return(false);
    }
    renderTick() {
        let _SC = window.story.state.Map[this.Area].nextScene;
        if(_SC!=='') {
            window.story.show(_SC);
            window.story.state.Map[this.Area].nextScene='';
            return(true);
        }
        var entry = document.createElement('p');
        entry.textContent = 'Your hunter returned empty handed from '+this.Area;
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class ScavengeProgress extends GMEvent {
    constructor() {
        super();
        this.Person =0; this.Area='';
        this.daysLeft=1;
        this.lastTick = window.gm.getTime();
    }
    toJSON() {return window.storage.Generic_toJSON("ScavengeProgress", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ScavengeProgress, value.data);return(x);}
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>=(24*60)) {
            this.daysLeft-=1,this.lastTick=time;
            if(this.done) return(true); //abort mission
            let _Area=window.story.state.Map[this.Area];
            _Area.scavenge(this.Person); //hunt continues until aborted
            return(true);
        }
        return(false);
    }
    renderTick() {
        let _SC = window.story.state.Map[this.Area].nextScene;
        if(_SC!=='') {
            window.story.show(_SC);
            window.story.state.Map[this.Area].nextScene='';
            return(true);
        }
        var entry = document.createElement('p');
        entry.textContent = 'Your scavenger returned empty handed from '+this.Area;
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
/*class SlaveCaptured extends GMEvent {
    constructor() {
        super();
        this.SlaveId =0;
        this.daysLeft=2;
        this.lastTick = window.gm.getTime();
    }
    toJSON() {return window.storage.Generic_toJSON("SlaveCaptured", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(SlaveCaptured, value.data);return(x);}
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) {
            this.daysLeft-=1,this.lastTick=time;
            if(this.daysLeft<=0) {
                window.story.state.City.Facilities.push(window.gm.BuildingsLib[this.Facility]());
                this.done=true;
            }
            return(true);
        }
        return(false);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = this.done?'A '+this.Facility+' was constructed.':this.daysLeft+' more days until the building is done.';
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}*/
window.gm.EventsLib = (function (Lib) {
    window.storage.registerConstructor(FoodDrain);
    window.storage.registerConstructor(ResourceChange);
    window.storage.registerConstructor(BuildProgress);
    window.storage.registerConstructor(ScoutProgress);
    window.storage.registerConstructor(HuntProgress);
    window.storage.registerConstructor(ScavengeProgress);
    //Lib['BuildTent'] = function () { let x= new BuildProgress();return(x);};
    return Lib; 
}(window.gm.EventsLib || {}));