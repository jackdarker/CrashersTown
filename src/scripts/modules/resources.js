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
            case Resource.ID.Money:
                msg='Coins' 
            case Resource.ID.Wood: 
                msg ='Wood for building and making fire.';
                break;
            case Resource.ID.Food: 
                msg ='Something that your people can eat.';
                break;
            case Resource.ID.Fungus: 
                msg ='A strange fungus.';
                break;
            case Resource.ID.Crops: 
                msg ='Some crops that can be processed to food.';
                break;
            case Resource.ID.Stone: 
                msg ='Stones for buildings.';
                break;
            case Resource.ID.IronOre: 
                msg ='Raw ore that can be smeltered to iron.';
                break;
            case Resource.ID.Iron: 
                msg ='Iron for forging tools and weapons.';
                break;
            case Resource.ID.Energy: 
                msg ='Electrical energy to power devices.';
                break;
            case Resource.ID.BlueGel: 
            case Resource.ID.RedGel: 
            case Resource.ID.BlackGel: 
                msg ='Could be used for chemical experiments.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Resource", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Resource, value.data);};
}
Resource.ID = { 
    Money : 'Money',
    Crops : 'Crops',
    Food : 'Food',
    Fungus : 'Fungus',
    Wood : 'Wood',
    Stone : 'Stone',
    IronOre : 'IronOre',
    Iron : 'Iron',
    Energy: 'Energy',
    BlueGel: 'BlueGel',
    RedGel: 'RedGel',
    BlackGel: 'BlackGel'
}
window.gm.ResourcesLib = (function (Lib) {
    window.storage.registerConstructor(Resource);
    Lib['Money']= function () { let x= new Resource();x.style=(Resource.ID.Money);return(x);};
    Lib['Crops']= function () { let x= new Resource();x.style=(Resource.ID.Crops);return(x);};
    Lib['Fungus']= function () { let x= new Resource();x.style=(Resource.ID.Fungus);return(x);};
    Lib['Food']= function () { let x= new Resource();x.style=(Resource.ID.Food);return(x);};
    Lib['Energy']= function () { let x= new Resource();x.style=(Resource.ID.Energy);return(x);};
    Lib['Wood']= function () { let x= new Resource();x.style=(Resource.ID.Wood);return(x);};
    Lib['Stone']= function () { let x= new Resource();x.style=(Resource.ID.Stone);return(x);};
    Lib['IronOre']= function () { let x= new Resource();x.style=(Resource.ID.IronOre);return(x);};
    Lib['Iron']= function () { let x= new Resource();x.style=(Resource.ID.Iron);return(x);};
    Lib['BlueGel']= function () { let x= new Resource();x.style=(Resource.ID.BlueGel);return(x);};
    Lib['RedGel']= function () { let x= new Resource();x.style=(Resource.ID.RedGel);return(x);};
    Lib['BlackGel']= function () { let x= new Resource();x.style=(Resource.ID.BlackGel);return(x);};
    return Lib; 
}(window.gm.ResourcesLib || {}));