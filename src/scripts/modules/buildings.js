"use strict";
class Shipwreck extends Homestead {
    constructor(){super(); this.style=0;}
    set style(style) {
        this._style = style; 
        switch(style) {
        case 0: 
            this.id=this.name='Shipwreck';
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='The remains of your crashed ship.</br> It currently acts as a base homestead and storage. </br> Each day it will produce some rations and energy to help survival.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Shipwreck", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Shipwreck, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) {
            this.gain=5,this.lastTick=time;
            let _R = new ResourceChange();_R.Resource='Food',_R.gain=(9);
            window.story.state.Events.push(_R);
            _R = new ResourceChange();_R.Resource='Energy',_R.gain=(3);
            window.story.state.Events.push(_R);
        }
        return(false);
    }
    getCapacity(typ) {
        if(typ==='people') return(3);
        retur(0); 
    }
}
class Housing extends Homestead {
    constructor(){super(); this.style='Tent';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {Resources:[],time:0};
        switch(style) {
        case 'Tent': 
            this.cost.Resources.push({ResId:'Wood',amount:3}),this.cost.time=2;
            break;
        case 'Cabin': 
            this.cost.Resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:3}],this.cost.time=3;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Tent': 
                msg ='A tent made from wood and other scavenged material.';
                break;
            case 'Cabin': 
                msg ='A wooden cabin.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    getCapacity(typ) {
        if(typ==='people') return(3);
        retur(0); 
    }
    toJSON() {return window.storage.Generic_toJSON("Housing", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Housing, value.data);};
}
class SlavePen extends Homestead {
    constructor(){super(); this.style='SlavePen';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {Resources:[],time:0};
        switch(style) {
        case 'SlavePen': 
            this.cost.Resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:3}],this.cost.time=3;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'SlavePen': 
                msg ='A homestead for your slaves.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    getCapacity(typ) {
        if(typ==='slave') return(2);
        retur(0); 
    }
    toJSON() {return window.storage.Generic_toJSON("SlavePen", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(SlavePen, value.data);};
}
class Smithy extends Facility {
    constructor(){super(); this.style='Smithy';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {Resources:[],time:0};
        switch(style) {
        case 'Smithy': 
            this.cost.Resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:5}],this.cost.time=5;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Smithy': 
                msg ='A small forge fire and an anvil to make simple metal parts.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Smithy", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Smithy, value.data);};
}
class Farm extends Facility {}
class Windmill extends Facility {}
class Wall extends Facility {}

window.gm.BuildingsLib = (function (Lib) {
    window.storage.registerConstructor(Operator); //todo operator-Lib?
    window.storage.registerConstructor(Shipwreck);
    window.storage.registerConstructor(Housing);
    window.storage.registerConstructor(Smithy);
    Lib['Shipwreck']= function () { let x= new Shipwreck();return(x);};
    Lib['Tent']= function () { let x= new Housing();return(x);};
    Lib['Cabin']= function () { let x= new Housing();x.style='Cabin';return(x);};
    Lib['Smithy']= function () { let x= new Smithy();return(x);};
    Lib['SlavePen']= function () { let x= new SlavePen();return(x);};
    return Lib; 
}(window.gm.BuildingsLib || {}));