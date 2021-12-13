"use strict";

//operations for save/reload

// ??window.onload = function() {};

window.storage = {  
  // A list of constructors the smart reviver should know about  
  // you need to register the class of each object that you want to serialize to this list
  // and each class also has to have a method toJSON and static method fromJSON (calling Generic_-versions, see below )
  // the namme of ctor needs to be unique !
  constructors : {}, 
  registerConstructor: function(ctor) {
    window.storage.constructors[ctor.name] = ctor;
  },
  // A generic "smart reviver" function.
  // Looks for object values with a `ctor` property and
  // a `data` property. If it finds them, and finds a matching
  // constructor that has a `fromJSON` property on it, it hands
  // off to that `fromJSON` fuunction, passing in the value.
  Reviver: function(key, value) {
    //console.info( 'reviver with key =' + key )
    var ctor;
    if (value !==null && typeof value === "object" &&
        typeof value.ctor === "string" &&
        typeof value.data !== "undefined") {
      ctor = window.storage.constructors[value.ctor] || window[value.ctor];
      if (typeof ctor === "function" &&
          typeof ctor.fromJSON === "function") {
        return ctor.fromJSON(value);
      }
    }
    return value;
  },
  //this function works with Json.stringify to remove circular references
  // unused because Reviver has even more problems with that
  /*_replacerFunc: function(){
    const visited = new WeakSet();
    return (key, value) => {
      if (value !== null && typeof value === "object") {
        if (visited.has(value)) {  return;  }
        visited.add(value);
      }
      return value;
    };
  },*/ 
  // A generic "toJSON" function that creates the data expected by Reviver.
  // `ctorName`  The name of the constructor to use to revive it
  // `obj`       The object being serialized
  // `keys`      (Optional) Array of the properties to serialize,
  //             if not given then all of the objects "own" properties
  //             that don't have function values will be serialized.
  //             (Note: If you list a property in `keys`, it will be serialized
  //             regardless of whether it's an "own" property.)
  // Returns:    The structure (which will then be turned into a string
  //             as part of the JSON.stringify algorithm)
  // Stringify it with a replacer: var str = JSON.stringify(myObj);
  Generic_toJSON: function(ctorName, obj, keys) {
    var data, index, key;
    
    if (!keys) {
      keys = Object.keys(obj); // Only "own" properties are included
    }
    
    data = {};
    for (index = 0; index < keys.length; ++index) {
      key = keys[index];
      data[key] = obj[key];                 //causes infinite loop on circular ref   Character->Inventory->Character
    }
    return {ctor: ctorName, data: data};
  },
  
  // A generic "fromJSON" function for use with Reviver: Just calls the
  // constructor function with no arguments, then applies all of the
  // key/value pairs from the raw data to the instance.
  // Only useful for constructors that can be reasonably called without arguments!
  // `ctor`      The constructor to call
  // `data`      The data to apply
  // Returns:    The object
  Generic_fromJSON: function(ctor, data) {
    var obj, name, setter, setter2;
    
    obj = new ctor();
    for (name in data) {
      setter = "set"+name[0].toUpperCase()+name.substr(1); // we get the name of the setter for that property (e.g. : key=property => setter=setProperty
      // that kind of names cannot be found in obj??? setter2 = "set "+name.substr(1); // e.g. : key=_property => setter=set property   (javascript style setter)
      if(setter in obj){ // if the setter exists 
        obj[setter](data[name]); // we call the setter
     // } else if(setter2 in obj){ // ..or...
     //   obj[setter2](data[name]); 
      } else { // if not, we set it directly
        if(typeof obj[name] === "object" && data[name]!==null) {  //cannot assign(curse,null)
          if(obj[name]===null) obj[name]=data[name];//obj[name]={};
          Object.assign(obj[name], data[name]);
        } else {
          obj[name] = data[name];       //todo ??? obj[name] is constructed properly but will be overwritten with data[name]; use assign ?!
        }
      }
    }
    return obj;
  },
  ok: function() {
    try {
        var storage = window["localStorage"],
          x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      }
      catch(e) {
        return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
      }
  },
  delete: function(slot) {
    window.localStorage.removeItem(window.story.name +slot);
    window.localStorage.removeItem(window.story.name +slot.concat('info'));
  },
    getSaveInfo: function(slot) {
        var info=null;
      if(window.storage.ok()) {
          info =window.localStorage.getItem(window.story.name+slot.concat('info'));		
      }
    if(!info) {
      return('');
    }
    return(info);
      
  },
  compressLocalSave: false, //this is for debugging (save file uncompressed)
  loadFile: function(input){
      let file = input.files[0]; 
      let fileReader = new FileReader(); 
      fileReader.onload = function() {
        var _blobs = fileReader.result.split("!achievements!");
        window.storage.rebuildFromSave(_blobs[0],window.storage.compressLocalSave);
        window.storage.rebuildAchievements(_blobs[1],window.storage.compressLocalSave)
        var div = document.querySelector('#backdrop'); //see save/load dialog
        div.parentNode.removeChild(div);
      }; 
      fileReader.onerror = function() {
        alert(fileReader.error);
      }; 
    fileReader.readAsText(file);
    return(true);  //todo how to make async
  },
  saveFile: function(){
    var hash = JSON.stringify({state:window.story.state,
      history:window.story.history,checkpointName:window.story.checkpointName});
    var ahash = window.storage.getAchievements();
    if(window.storage.compressLocalSave) {
      hash = LZString.compressToBase64(hash);
      ahash = LZString.compressToBase64(ahash);
    }
    var filename= window.story.name+"_Save.dat";
    var blob = new Blob([hash,"!achievements!",ahash], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  },
  saveBrowser: function(slot) {
    //var hash= window.story.save();    this call somehow messes up html and I had to copy the following from snowman script
    //always compress or storage could be full soon !
    var hash = LZString.compressToBase64(JSON.stringify({state:window.story.state,
        history:window.story.history,checkpointName:window.story.checkpointName}));
    var ahash = LZString.compressToBase64(window.storage.getAchievements());
    var options = {year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"};
    var info=window.gm.player.location +' - '+ (new Intl.DateTimeFormat("default", options).format(new Date()));
    //add storyname to avoid conflict with other games on same host (see Document.origin)
    window.localStorage.setItem(window.story.name+slot.concat('info'),info);
    window.localStorage.setItem(window.story.name+slot,hash);
    window.localStorage.setItem(window.story.name+'achievements',ahash);
    return(info);
  },
  loadBrowser: function(slot) {
    var hash,info;
    if(window.storage.ok()) {
        //not possible to save object {info,hash} ??
        hash=window.localStorage.getItem(window.story.name+slot);
        info=window.storage.getSaveInfo(window.story.name+slot);
        window.storage.rebuildFromSave(hash,true);
        var ahash=window.localStorage.getItem(window.story.name+'achievements');
        window.storage.loadAchivementsFromBrowser();
    }
    return(info);
  },
  rebuildFromSave: function(hash,compressed){
    if(!compressed) hash=LZString.compressToBase64(hash);
      //copied from window.story.restore because reviver  //window.story.restore(hash) ;
      var save = JSON.parse(LZString.decompressFromBase64(hash), window.storage.Reviver);
      window.story.state = save.state;
      //todo doesnt work because nested objects are copied by reference, not sub-elements; this would replace already constructed object with old shit: window.story.state=Object.assign(window.story.state,save.state );
      /*
       function merge(target,...arg) {
        // create a new object
        //let target = {}; todo dont create plain-object, we need proper class-object!
        // deep merge the object into the target object
          const merger = (obj) => {
              for (let prop in obj) {
                  if (obj.hasOwnProperty(prop)) {
                      if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                          // if the property is a nested object
                          target[prop] = merge(target[prop], obj[prop]);  <- todo doesnt work because target["Breast"] might not yet exist
          !TODO! Reviver works for class-objects because it merges save into constructed object
          but it doesnt work for plain objects because they dont use reviver
          ergo: anything needs to be a class or I need special post-load-operation to update plain object to new version
          ps.: if old saved object has propertys that are not present in new version, they will be attached to the newly created object too and create clutter
                      } else {
                          // for regular property
                          target[prop] = obj[prop];
                      }
                  }
              }
          };
          // iterate through all objects and deep merge them with target
          for (let i = 0; i < arg.length; i++) {
              merger(arg[i]);
          }
          return target;
      };
      window.story.state = merge(window.story.state,save.state);*/
      window.story.history = save.history;
      window.story.checkpointName = save.checkpointName;
      window.gm.rebuildObjects();  // this is for handling version-upgrades
      window.gm.postVictory();//teleport into dng or other location   
  },
  getAchievements: function() {
    var ahash = JSON.stringify({achievements : window.gm.achievements});
    return(ahash);
  },
  loadAchivementsFromBrowser:function() {
    if(window.storage.ok()) {
      var ahash=window.localStorage.getItem(window.story.name+'achievements');
      if(ahash!==null) window.storage.rebuildAchievements(ahash,true);
    }
  },
  rebuildAchievements: function(ahash,compressed) {
    if(!compressed) ahash=LZString.compressToBase64(ahash);
    var achievements = JSON.parse(LZString.decompressFromBase64(ahash)).achievements; //no reviver?!
    //it might be necessary to adapt the achievements here if a newer game-version is started !
    var _keys = Object.keys(window.gm.achievements);
    for(var i=0;i<_keys.length;i++) {
      if(achievements.hasOwnProperty(_keys[i])) { 
        var _old = achievements[_keys[i]];
        var _now = window.gm.achievements[_keys[i]];
        if(_old>_now) window.gm.achievements[_keys[i]]=_old;  //merge loaded achievements into present
      }
    }
  }
};
/*  //save demo
window.gm.testsaveReviver = function () {
  window.storage.registerConstructor(Bar);
  window.storage.registerConstructor(Foo);
  var before = {
    foo: new Foo(21, 44),foo2: new Foo(100, 111),
  };
  before.foo.print(); // Stringify it with a replacer:
  var str = JSON.stringify(before); // Show that
  console.log(str); // Re-create it with use of a "reviver" function
  var after = JSON.parse(str, window.storage.Reviver);
  after.foo.print();after.foo2.print();
};
class Bar {
  constructor(x) {
    this.__type="Bar";
    this._x = x;
  }
  get parent() {return this._parent();}
  print() {      console.log("parent="+this.parent.a.toString()+ this._x);    };
 toJSON() {return window.storage.Generic_toJSON("Bar", this); };
 static fromJSON(value) { return window.storage.Generic_fromJSON(Bar, value.data);};
}

class Foo {
  constructor(a=0, b=0) {
    this.__type = 'Foo';
    this.a = a, this.b = b;
    this._bar = new Bar('fooboo'+this.a.toString());
    this._bar2 = new Bar('ba2'+this.b.toString());
    //this._bar._parent = (function(me){ return function(){return me;}}(this));
    //this._bar2._parent = (function(me){ return function(){return me;}}(this));
  }
  toJSON() {return window.storage.Generic_toJSON("Foo", this); };
  static fromJSON(value) { return window.storage.Generic_fromJSON(Foo, value.data);};
  setA(a) {   this.a = -1 * a;  };
  print() {console.log(this.a.toString()); this._bar.print(); this._bar2.print();  };
}
*/



/* this should also work instead of reviver
window.gm.testsaveAssign = function () {
  var before = {
    foo: new Foo(21, 44)
  };
  before.foo.print(); // Stringify it with a replacer:
  var str = JSON.stringify(before); // Show that
  console.log(str); // Re-create it with use of a "reviver" function
  var after = window.storage.assignType(str);
  after.foo.print();
};*/
/*assignType: function(object){
    if(object && typeof(object) === 'object' && window[object.__type]) {
        object = window.storage.assignTypeRecursion(object.__type, object);
    }
    return object;
  },
  assignTypeRecursion: function(type, object){
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            var obj = object[key];
            if(Array.isArray(obj)){
                 for(var i = 0; i < obj.length; ++i){
                     var arrItem = obj[i];
                     if(arrItem && typeof(arrItem) === 'object' && window[arrItem.__type]) {
                         obj[i] = window.storage.assignTypeRecursion(arrItem.__type, arrItem);
                     }
                 }
            } else  if(obj && typeof(obj) === 'object' && window[obj.__type]) {
                object[key] = window.storage.assignTypeRecursion(obj.__type, obj);
            }
        }
    }
    return Object.assign(new window[type](), object);
  },*/