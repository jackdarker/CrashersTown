"use strict;";

window.gm.LibTraits = (function (Lib) {
    window.storage.registerConstructor(Trait);
    //skill
    Lib['Scout']= function () { let x= new Trait();x.id=x.name='Scout';return(x);};
    Lib['Hunter']= function () { let x= new Trait();x.id=x.name='Hunter';return(x);};
    Lib['Scavenger']= function () { let x= new Trait();x.id=x.name='Scavenger';return(x);};
    //mental
    Lib['docile']= function () { let x= new Trait();x.id=x.name='docile';return(x);};
    Lib['smart']= function () { let x= new Trait();x.id=x.name='smart';return(x);};
    //alluring
    //physical
    Lib['fertile']= function () { let x= new Trait();x.id=x.name='fertile';return(x);};
    Lib['enduring']= function () { let x= new Trait();x.id=x.name='enduring';return(x);};
    return Lib; 
}(window.gm.LibTraits || {}));

/* knowledge s.Known
Barracks - unlocks Tent    
Farming - unlock FarmGrain
Slavery - unlock SlavePen


 */