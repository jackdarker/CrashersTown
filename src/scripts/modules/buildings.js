"use strict"
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
                msg ='The remains of your crashed ship.';
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
            let _R = new ResourceChange();_R.Resource='Food';
            window.story.state.Events.push(_R);
            _R = new ResourceChange();_R.Resource='Energy';
            window.story.state.Events.push(_R);
        }
        return(false);
    }
}
class Housing extends Homestead {
    constructor(){super(); this.style=0;}
    set style(style) {
        this._style = style; 
        switch(style) {
        case 0: 
            this.id='Tent',this.name='Tent';
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='A tent made from wood and other scavenged material.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Housing", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Housing, value.data);};
}
class Farm extends Facility {}
class Windmill extends Facility {}
class Wall extends Facility {}

window.gm.BuildingsLib = (function (Lib) {
    window.storage.registerConstructor(Shipwreck);
    window.storage.registerConstructor(Housing);
    Lib['Shipwreck']= function () { let x= new Shipwreck();return(x);};
    Lib['Tent']= function () { let x= new Housing();return(x);};
    return Lib; 
}(window.gm.BuildingsLib || {}));