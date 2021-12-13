"use strict";

class ResourceChange extends GMEvent {
    constructor() {
        super();
        this.Resource =Resource.ID.Food;
        this.gain=0;
    }
    toJSON() {return window.storage.Generic_toJSON("ResourceChange", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ResourceChange, value.data);return(x);}
    tick(time) {
        this.gain=5,this.lastTick=time;
        let _R = window.story.state.City.Resources[this.Resource];
        if(_R===null || _R===undefined) {
            _R = window.gm.ResourcesLib[this.Resource]();
            window.story.state.City.Resources[this.Resource]=(_R);
        }
        _R.consume(-1*this.gain);
        this.done=true;
        return(true);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = this.gain+' '+this.Resource+' were scavenged.';
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
class ResourceChangeSummary extends GMEvent {
    constructor() {
        super();
        this.Resources=[]; //{ResId:'Food',gain:3}
    }
    toJSON() {return window.storage.Generic_toJSON("ResourceChangeSummary", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ResourceChangeSummary, value.data);return(x);}
    tick(time) {
        this.lastTick=time;
        var _list={}
        for(el of this.Resources) {
            _list[el.ResId] = _list[el.ResId]|| {gain:0};
            _list[el.ResId].gain+=el.gain; 
        }
        for()
        let _R = window.story.state.City.Resources[this.Resource];
        if(_R===null || _R===undefined) {
            _R = window.gm.ResourcesLib[this.Resource]();
            window.story.state.City.Resources[this.Resource]=(_R);
        }
        _R.consume(-1*this.gain);
        this.done=true;
        return(true);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = this.gain+' '+this.Resource+' were scavenged.';
        $("div#panel")[0].appendChild(entry);
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
                window.story.state.City.Facilities.push(new Housing());
                this.done=true;
            }
            return(true);
        }
        return(false);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = this.done?'A tent was constructed.':this.daysLeft+' more days until the building is done.';
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}

window.gm.EventsLib = (function (Lib) {
    window.storage.registerConstructor(ResourceChange);
    window.storage.registerConstructor(BuildProgress);
    Lib['BuildTent'] = function () { let x= new BuildProgress();return(x);};
    return Lib; 
}(window.gm.EventsLib || {}));