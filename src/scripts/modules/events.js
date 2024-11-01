"use strict";

class ResourceChange extends GMEvent {
    constructor() {
        super();
        this.Resource=Resource.ID.Food;
        this.gain=5; this.common=true;
    }
    toJSON() {return window.storage.Generic_toJSON("ResourceChange", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(ResourceChange, value.data);return(x);}
    tick(time) {
        this.lastTick=time;
        if(this.common) { //add common gains to summary event
            window.story.state.Summary.ResourceChange.add(this.Resource,this.gain);
            this.done=true;
            return(false); //no display now
        } else {
            window.gm.addResource(window.story.state.City.Resources,this.Resource,this.gain)
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
//removes resources consumed by people and limits resources by storage capacity;
class FoodDrain extends GMEvent {
    constructor() {
        super();
        this.ResDrain ={},this.ResSpoil={},this.ResCap={};
    }
    toJSON() {return window.storage.Generic_toJSON("FoodDrain", this); }
    static fromJSON(value) {let x=window.storage.Generic_fromJSON(FoodDrain, value.data);return(x);}
    tick(time) {
        this.lastTick=time;
        var _R,_B,_P,_list2,Res=[];
        _list2 = window.story.state.City.People;
        this.ResDrain={},this.ResSpoil={},this.ResCap={};
        for(el of _list2) { //check people
            Res=el.getBasicNeeds(); 
            //todo satisfyNeeds   //if enough food
            for(_R of Res) { //sum up resources
                this.ResDrain[_R.ResId] = this.ResDrain[_R.ResId]|| {amount:0};
                this.ResDrain[_R.ResId].amount+=_R.amount;
            }
        }
        var _list =Object.keys(this.ResDrain);
        for(el of _list) { //drain resources
            _R = window.story.state.City.Resources[el];
            if(_R===null || _R===undefined) {
                _R = window.gm.ResourcesLib[el]();
                window.story.state.City.Resources[el]=_R;
            }
            _R.consume(this.ResDrain[el].amount);
        }
        _list2=window.story.state.City.Facilities;
        for(var i=_list2.length-1;i>=0;i--) { //sum up storage capacity
            _list=Object.keys(_list2[i].storage);
            for(el of _list) {
                this.ResCap[el] = this.ResCap[el]|| 0;
                this.ResCap[el]+=_list2[i].storage[el];
            }
        }
        _list2=window.story.state.City.Resources;
        _list=Object.keys(_list2);
        for(el of _list) { //limit resources
            _R = _list2[el];
            var diff=this.ResCap[el]-_R.amount;
            if(diff<0) { //todo dont limit rare items
                this.ResSpoil[el]=-1*diff;
                _R.consume(-1*diff);
            }
        }
        this.done=true;
        return(true);
    }
    renderTick() {
        var panel=$("div#panel")[0],entry = document.createElement('p');
        entry.textContent = 'Rations used:';
        panel.appendChild(entry);
        var _list =Object.keys(Resource.ID);
        for(el of _list) {
            var _show=false;
            entry = document.createElement('li');
            entry.textContent = el+': ';
            if(this.ResDrain[el]) {_show=true,entry.textContent+= this.ResDrain[el].amount+' ('+window.story.state.City.Resources[el].amount+' left)';}
            if(this.ResSpoil[el]) {_show=true,entry.textContent+= this.ResSpoil[el]+' lost ';}
            if(_show) panel.appendChild(entry);
        }
        entry = document.createElement('p');entry.textContent = 'If resources are lost, there might not be enough storage space.';panel.appendChild(entry);
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
            //Todo money goes into players pocket?
            window.gm.addResource(window.story.state.City.Resources,el,this.ResTotal[el].amount);
        }
        this.done=true;
        return(true);
    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = 'Other resources produced:';
        document.querySelector("div#panel").appendChild(entry);
        var _list =Object.keys(this.ResTotal);
        for(el of _list) {
            entry = document.createElement('li');
            entry.textContent = el+': '+this.ResTotal[el].amount+' ';
            document.querySelector("div#panel").appendChild(entry);
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
                window.story.state.City.Facilities.push(window.gm.LibFacilities[this.Facility]());
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
            if(this.daysLeft<=0) {this.done=true;
                window.gm.getArrayElementById(window.story.state.City.People,this.Person).jobActive=false;
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
class SlaveCaptured extends GMEvent {
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
        let _P = window.gm.randomizePerson({slave:true});
        this.SlaveId = _P.id;
        window.story.state.City.Slaves.push(_P);
        this.done=true;
        return(true);

    }
    renderTick() {
        var entry = document.createElement('p');
        entry.textContent = 'A slave was captured.';
        $("div#panel")[0].appendChild(entry);
        GMEvent.createNextBt('Next');
        return(true);
    }
}
//SlaveEscaped - send a crew into the area to get him back and punish him
//class PeopleMissing someone has gone missing-send someone to get him back - might lead to a fight with a beast or a tribe
window.gm.EventsLib = (function (Lib) {
    window.storage.registerConstructor(FoodDrain);
    window.storage.registerConstructor(ResourceChange);
    window.storage.registerConstructor(BuildProgress);
    window.storage.registerConstructor(ScoutProgress);
    window.storage.registerConstructor(HuntProgress);
    window.storage.registerConstructor(ScavengeProgress);
    window.storage.registerConstructor(SlaveCaptured);
    Lib['ResourceChange'] = function () { let x= new ResourceChange();return(x);};
    Lib['SlaveCaptured'] = function () { let x= new SlaveCaptured();return(x);};
    return Lib; 
}(window.gm.EventsLib || {}));