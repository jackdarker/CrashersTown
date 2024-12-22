"use strict";
//////////////////////////////////////////
class Mansion extends Facility {
    constructor(){super(); this.style=0;
        this.storage[Resource.ID.Money]=10000;
        this.storage[Resource.ID.Wood]=10,this.storage[Resource.ID.Iron]=10,this.storage[Resource.ID.IronOre]=10,
        this.storage[Resource.ID.Food]=8,this.storage[Resource.ID.Energy]=4,this.storage[Resource.ID.Stone]=10;
        //Building upgrades: 0=not present, 1=ready, 2=blocked by other upgrade
        this.Room1=0,
        this.Smithy=0
    }
    set style(style) {
        this._style = style; 
        switch(style) {
        case 0: 
            this.id=this.name='Mansion';
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 0: 
                msg ='This is the mansion you call home. </br>';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Mansion", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Mansion, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        /*if(delta>(24*60-1)) {
            this.gain=5,this.lastTick=time;
            let _R = new ResourceChange();_R.Resource='Food',_R.gain=(9);
            window.story.state.Events.push(_R);
            _R = new ResourceChange();_R.Resource='Energy',_R.gain=(3);
            window.story.state.Events.push(_R);
        }*/
        return(false);
    }
    getCapacity(typ) {
        if(typ==='people') return(3);
        if(typ==='slave') return(3);
        return(0); 
    }
    getUpgrades(){   
        let _list=[];
        //let _mansion=window.gm.getArrayElementById(window.story.state.City.Facilities,"Mansion");
        if(this.Room1===0){
            _list.push({id:"ClearRoom1", item:"Build_Room1",count:1, 
            desc:'Clear out a room to have some more space.',    
            preCond:function(){return({OK:true,msg:""});},
            resources:[{item:'Stone',count:5},{item:'Wood',count:5}], 
            wf:{skill:'Build', minLevel:0, eff:15} //eff = #timeslots
            })
        }
        if(this.Smithy===0){
            _list.push({id:"Smithy", item:"Build_Smithy",count:1,
            desc:'Setup a smithy for crafting and repair.', 
            preCond:function(){
                let _res={OK:true,msg:""};
                if(this.Room1!=1){
                    _res.OK=false,_res.msg="You would need some more room to build a smithy."
                }
                return(_res)
                },
            resources:[{item:'Stone',count:5},{item:'Wood',count:5}], 
            wf:{skill:'Build', minLevel:0, eff:15} //eff = #timeslots
            })
        }
        _list.push({id:"ClearCellar", item:"Build_Cellar",count:1,
          desc:'Remove the rubble that blocks the entrance of the cellar.', 
          preCond:function(){
            let _res={OK:true,msg:""};
            return(_res)
            },
          resources:[{item:'Stone',count:5},{item:'Wood',count:5}], 
          wf:{skill:'Build', minLevel:0, eff:15} //eff = #timeslots
        })
        return(_list);
    }
}
class SlavePen extends Facility {
    constructor(){super(); this.style='SlavePen';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {Resources:[],time:0};
        switch(style) {
        case 'SlavePen': 
            this.cost.resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:3}],this.cost.time=3;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'Kennel': 
                msg ='Some cages for caught critters. And slaves that haven\'t earned a comfy cell.';
                break;
            case 'SlavePen': 
                msg ='A homestead for your slaves.';
                break;
            case 'TentaclePit': 
                msg ='Where your Tentacle creatures live. Might be useful to send a slave there to teach them a lesson.';
                break;
            case 'Stocks': 
                msg ='Show the public what happens to slaves refusing to work or breaking a law.';
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
        this.cost = {builders:[],resources:[],time:0};
        switch(style) {
        case 'Smithy': 
            this.cost.resources=[{ResId:'Wood',amount:8},{ResId:'Stone',amount:5}],this.cost.time=5;
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
class Farm extends Facility {
    constructor(){super(); this.style='FarmGrain';}
    set style(style) {
        this.id=this.name=this._style = style; 
        this.cost = {builders:[],resources:[],time:0};
        switch(style) {
        case 'FarmGrain': 
            this.cost.resources=[{ResId:'SeedCrops',amount:8},{ResId:'Iron',amount:2}],this.cost.time=8;
            break;
        case 'FarmFungus': 
            this.cost.resources=[{ResId:'SeedFungus',amount:8},{ResId:'Iron',amount:2}],this.cost.time=8;
            break;
        default: throw new Error(this.id +' doesnt know '+style);
        }
    }
    get style() {return this._style;}
    get desc() { 
        let msg ='';
        switch(this._style) {
            case 'FarmGrain': 
                msg ='A plot of land to grow crops for food.';
                break;
            case 'FarmFungus': 
                msg ='A plantation of that fungus used for drugs.';
                break;
            default: throw new Error(this.id +' doesnt know '+style);
        }
        return(msg);
    }
    toJSON() {return window.storage.Generic_toJSON("Farm", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(Farm, value.data);};
    tick(time) {
        let delta = window.gm.getDeltaTime(time,this.lastTick);
        if(delta>(24*60-1)) { this.lastTick=time;
            let _R = new ResourceChange();_R.Resource='Crops',_R.gain=(9);
            window.story.state.Events.push(_R);
        }
        return(false);
    }
}

window.gm.LibFacilities = (function (Lib) {
    window.storage.registerConstructor(Operator); //todo operator-Lib?
    window.storage.registerConstructor(Mansion);
    window.storage.registerConstructor(Smithy);
    Lib['Mansion']= function () { let x= new Mansion();return(x);};
    Lib['Smithy']= function () { let x= new Smithy();return(x);};
    Lib['SlavePen']= function () { let x= new SlavePen();return(x);};
    return Lib; 
}(window.gm.LibFacilities || {}));