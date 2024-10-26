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

window.gm.LibJobs = (function (Lib) {
    window.storage.registerConstructor(Job);
    //Leisure
    Lib['Rest']= function () { let x= new Job();x.id=x.name='Rest';x.requiredEnergy=function(){return(-50);};x.workspaces=['Bedroom_Mansion'];return(x);};
    //Jobs
    Lib['Maid_Mansion']= function () { let x= new Job();x.id=x.name='Maid_Mansion';x.workspaces=['Maid_Mansion'];return(x);};
    Lib['Maid_Inn']= function () { let x= new Job();x.id=x.name='Maid_Inn';x.workspaces=['Maid_Inn'];return(x);};
    Lib['Trader']= function () { let x= new Job();x.id=x.name='Trader';return(x);};
    //Trainee / Trainer
    Lib['LearnCharm']= function () { let x= new Job();x.id=x.name='LearnCharm';x.workspaces=['Study_Mansion'];return(x);};
    return Lib; 
}(window.gm.LibJobs || {}));

window.gm.LibWorkspace = (function (Lib) {
    window.storage.registerConstructor(Workspace);
    //Leisure
    Lib['Bedroom_Mansion']= function () { let x= new Workspace();x.id=x.name='Bedroom_Mansion';return(x);};
    //Jobs
    Lib['Maid_Mansion']= function () { let x= new Workspace();x.id=x.name='Maid_Mansion';return(x);};
    //Trainee / Trainer
    Lib['Study_Mansion']= function () { let x= new Workspace();x.id=x.name='Study_Mansion';return(x);};
    return Lib; 
}(window.gm.LibWorkspace || {}));
/* knowledge s.Known
Barracks - unlocks Tent    
Farming - unlock FarmGrain
Slavery - unlock SlavePen


 */