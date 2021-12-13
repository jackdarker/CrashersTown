"use strict;"

class Resource extends ResourceBase {
    constructor(){super(); this.style=Resource.ID.Wood;}
    set style(style) {
        this._style = style; 
        this.id=this.name=style;
        /*switch(style) {
        case Resource.ID.Wood: 
            this.id=this.name='Wood';
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }*/
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case Resource.ID.Wood: 
                msg ='Wood for building and making fire.';
                break;
            case Resource.ID.Food: 
                msg ='Something that your people can eat.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Resource", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Resource, value.data);};
}
Resource.ID = { 
    Food : 'Food',
    Wood : 'Wood',
    Stone : 'Stone',
    Iron : 'Iron',
    Energy: 'Energy'
}
window.gm.ResourcesLib = (function (Lib) {
    window.storage.registerConstructor(Resource);
    Lib['Food']= function () { let x= new Resource();x.style=(Resource.ID.Food);return(x);};
    Lib['Energy']= function () { let x= new Resource();x.style=(Resource.ID.Energy);return(x);};
    Lib['Wood']= function () { let x= new Resource();x.style=(Resource.ID.Wood);return(x);};
    Lib['Stone']= function () { let x= new Resource();x.style=(Resource.ID.Stone);return(x);};
    return Lib; 
}(window.gm.ResourcesLib || {}));