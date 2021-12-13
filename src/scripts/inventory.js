"use strict";
class Item {
    constructor(name) {
        this.id = this.name = name;  //id is unique in database(no whitespace !); name is for display
        this.tags = [];
        this.price=this.basePrice=10; //how much worth it is
    }
    get parent() {return this._parent?this._parent():null;}
    _relinkItems(parent){this._parent=window.gm.util.refToParent(parent);}
    _updateId() { 
        //because equipment can have dynamic assigned curses, id needs to be generated dynamical too
        //and then we also have to update id in inventory list
        var nId="_"+md5(JSON.stringify(this));  //add _ or queryselector() might not work if id starts with number ?!
        //md5 is less acurate but smaller then LZString.compress(JSON.stringify(this));
        var _oldId = this.id;
        this.id=nId;
        if(this.parent) this.parent._updateId(_oldId);
    }
    //called by SkillUseItem
    targetFilter(targets) {
        return([]); //default unuseable in combat
    }
    //tag or [tag]
    hasTag(tags) {
        if(tags instanceof Array) {
            for(var i=0;i<tags.length;i++) {
                if(this.hasTag(tags[i])) return(true);
            }
            return(false);
        }
        return(this.tags.includes(tags));
    }
    removeTags(tags){
        for(var i= this.tags.length-1;i>=0;i--){
            if(tags.includes(this.tags[i])) this.tags.splice(i,1);
        }
    }
    addTags(tags){
        for(var i= tags.length-1;i>=0;i--){
            if(!this.tags.includes(tags[i])) this.tags.push(tags[i]);
        }
    }
    //implement this for description
    get desc() { return(this.descShort);}
    //implement this for description
    get descShort() { return(this.name);}
    //context is the owner of item (parent of inventory), on is target (character)
    usable(context,on=null) {return({OK:false, msg:'Cannot use.'});}
    use(context,on=null) {return({OK:false, msg:'Cannot use.'});}
    onTimeChange(now) {};
}
//an Inventory-Component to store items
class Inventory {
    constructor(externlist) {  
        this.list = externlist ? externlist : [];
      window.storage.registerConstructor(Inventory);
    }
    get parent() {return this._parent?this._parent():null;}
    toJSON() {return window.storage.Generic_toJSON("Inventory", this); }
    static fromJSON(value) { 
        var _x = window.storage.Generic_fromJSON(Inventory, value.data);
        return(_x);
    }
    _relinkItems() {  //call this after loading save data the reparent
        for(var i=0; i<this.list.length; i++) {
            if(this.list[i].item) this.list[i].item._relinkItems(this);
        }
    }
    _updateId(oldId) { //updates id if changed, see item._updateId
        let slot = findItemSlot(oldId);
        if(slot<0) return;
        this.list[slot].id = this.list[slot].item.id;
    }
    postItemChange(id,operation,msg) {
        window.gm.pushLog('Inventory: '+operation+' '+id+' '+msg);
    }
    count() {return(this.list.length);}
    countItem(id) {
        var _i = this.findItemSlot(id);
        if(_i<0) return(0);
        return(this.list[_i].count);  
    }
    findItemSlot(id) {
        for (var i = 0; i < this.count(); i++) {
            if(this.list[i].id===id) return(i);
        }
        return(-1);
    }
    getItemId(slot) {
        return(this.list[slot].id);
    }
    getItem(id) {
        var _idx = this.findItemSlot(id);
        if(_idx<0) throw new Error('no such item: '+id);
        return(this.list[_idx].item);
    }
    //returns all Ids in list
    getAllIds() {   
        var ids=[];
        for(var i=0;i<this.list.length;i++) {
            ids.push(this.list[i].id);
        }
        return(ids);
    }
    addItem(item,count=1) {
        var _i = this.findItemSlot(item.id);
        if(_i<0) {
            item._parent=window.gm.util.refToParent(this)
            this.list.push({id: item.id,count: count, item:item});
        }
        else this.list[_i].count+=count;
        this.postItemChange(item.name,"added","");
    }
    removeItem(id,count=1) {
        var _i = this.findItemSlot(id);
        if(_i<0) return; //just skip if not found
        var _item = this.getItem(id);
        this.list[_i].count -=count;
        if(this.list[_i].count<1) this.list.splice(_i,1);
        this.postItemChange(_item.name,"removed","");
    }
    //convience method to check if item is usable
    usable(id,on=null) {
        var _item = this.getItem(id);
        return (_item.usable(this,on));
    }
    //uses an item by calling item.use
    use(id,on=null) {
        var _item = this.getItem(id);
        var result = _item.use(this,on);
        if(result.OK) {
            this.postItemChange(_item.name,"used",result.msg);
        }
        return(result);
    }
}