"use strict";
/*
* a database that list who does what 
*/
class JobSchedule {
    constructor() {
        window.storage.registerConstructor(JobSchedule);
        this.Schedule={};   //{Monday:{Noon:{ Maid_Mansion:{Lydia:{},Steven:{}} }}}
    }
    setJob(day,time,jobid,personid,params){
        this.clearJob(day,time,personid);//clear other jobs of this person at that time first
        if(!this.Schedule[day]) this.Schedule[day]={};
        if(!this.Schedule[day][time]) this.Schedule[day][time]={};
        if(!this.Schedule[day][time][jobid]) this.Schedule[day][time][jobid]={};
        this.Schedule[day][time][jobid][personid]=params;
    }
    presetJob(jobid,personid,params){ //fills in a basic job in all slots
        window.gm.DoWs.forEach((x)=>{
            window.gm.timeslots.forEach((y)=>{ 
                this.setJob(x,y,jobid,personid,params);
            })
        })
    }
    getJobAtTimePerson(day,time,personid){  //returns null || {job:job,params:params}
        if(this.Schedule[day] && this.Schedule[day][time]){
            let jobs=Object.keys(this.Schedule[day][time]);
            for(var i=jobs.length-1;i>=0;i--){
                let people=Object.keys(this.Schedule[day][time][jobs[i]]);
                for(var k=people.length-1;k>=0;k--){
                    if(people[k]==personid) return({job:jobs[i],params:this.Schedule[day][time][jobs[i]][people[k]]});
                }
            }
        }
        return(null);
    }
    getJobAtTimeJob(day,time,jobid){  //returns [] || [{person:person,params:params}]
        let _p=[]
        if(this.Schedule[day] && this.Schedule[day][time] && this.Schedule[day][time][jobid]){
            let people=Object.keys(this.Schedule[day][time][jobid]);
            for(var k=people.length-1;k>=0;k--){
                _p.push({person:people[k],params:this.Schedule[day][time][jobid][people[k]]});
            }
        }
        return(_p);
    }
    getJobsAtTime(day,time){    //returns [] || [{person:person,params:params}]
        let list=[];
        if(this.Schedule[day] && this.Schedule[day][time]){
            let jobs=Object.keys(this.Schedule[day][time]);
            for(var i=jobs.length-1;i>=0;i--){
                const people=Object.keys(this.Schedule[day][time][jobs[i]]);
                const ws=window.gm.getArrayElementById(window.story.state.City.Workspaces,jobs[i]);
                list.push({tick:ws.doJob.bind(ws,people),renderTick:ws.renderTick.bind(ws)});
            }
        }
        return(list);
    }
    clearJob(day,time,personid){
        if(this.Schedule[day] && this.Schedule[day][time]){
            let jobs=Object.keys(this.Schedule[day][time]);
            for(var i=jobs.length-1;i>=0;i--){
                let people=Object.keys(this.Schedule[day][time][jobs[i]]);
                for(var k=people.length-1;k>=0;k--){
                    if(people[k]==personid) delete this.Schedule[day][time][jobs[i]][people[k]];
                }
                if(Object.keys(this.Schedule[day][time][jobs[i]]).length===0){
                    delete this.Schedule[day][time][jobs[i]];
                }
            }
            if(Object.keys(this.Schedule[day][time]).length===0){
                delete this.Schedule[day][time];
            }
            if(Object.keys(this.Schedule[day]).length===0){
                delete this.Schedule[day];
            }
        }
    }
    toJSON() {return window.storage.Generic_toJSON("JobSchedule", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(JobSchedule, value.data);};
}
//----------------------------------------------------------------------
window.gm.LibJobs = (function (Lib) {
    window.storage.registerConstructor(Job);
    //Leisure
    Lib['Rest']= function () { let x= new Job();x.id=x.name='Rest';x.workspaces=['Rest_Mansion'];return(x);};
    //Jobs
    Lib['Farmer']= function () { let x= new Job();x.id=x.name='Farmer';x.workspaces=['Farmer_Farm'];return(x);};
    Lib['Maid']= function () { let x= new Job();x.id=x.name='Maid';x.workspaces=['Maid_Mansion','Maid_Inn'];return(x);};
    Lib['Trader']= function () { let x= new Job();x.id=x.name='Trader';return(x);};
    //Trainee / Trainer
    Lib['LearnCharm']= function () { let x= new Job();x.id=x.name='LearnCharm';x.workspaces=['Study_Mansion'];return(x);};
    return Lib; 
}(window.gm.LibJobs || {}));

//----------------------------------------------------------------------
class WS_Maid extends Workspace{
    constructor() {
        super();
        this.reqStats=[{id:"strength",min:1,max:5}];
        this.reqSkills=[];//[{id:"Smithing",min:0,max:5}];
        this.reqEnergy=15;
        this.maxPeople=2;
    }
    toJSON() {return window.storage.Generic_toJSON("WS_Maid", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(WS_Maid, value.data);};
    desc(){return(this.name);}
    doJob(people,now){  //this is called by schedule per timeslot. 
        let _res=this._doJob(people,now);
        if(_res.OK==true){
           //there is a chance something odd happens
            entry = document.createElement('p');
            entry.textContent = 'As '+ people[0];
            if(this.id=='Maid_Mansion'){
                entry.textContent += ' cleaned the mansion, something happened... '
            } else {
                entry.textContent += ' cleaned the other peoples quarters, something happened... '
            }
            document.querySelector("div#panel").appendChild(entry);
            GMEvent.createNextBt('Next');
            return(true); //halt for display
        } else {
            GMEvent.createNextBt('Next');
            return(true); //halt for display
        }
        return(false);
    }
}
class WS_Smithy extends Workspace{
    constructor() {
        super();
    }
    toJSON() {return window.storage.Generic_toJSON("WS_Smithy", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(WS_Smithy, value.data);};
    desc(){return(this.name);}
}
class WS_Farm extends Workspace{
    constructor() {
        super();
        this.reqStats=[{id:"strength",min:1,max:5}];
        this.reqSkills=[];
        this.reqEnergy=20;
        this.produceStack=[{id:Resource.ID.Crops, count:-1}];
    }
    toJSON() {return window.storage.Generic_toJSON("WS_Farm", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(WS_Farm, value.data);};
    desc(){return(this.name);}
}
window.gm.LibWorkspace = (function (Lib) {
    window.storage.registerConstructor(Workspace);
    window.storage.registerConstructor(WS_Maid);
    window.storage.registerConstructor(WS_Smithy);
    window.storage.registerConstructor(WS_Farm);
    //Leisure
    Lib['Rest_Mansion']= function () { let x= new Workspace();x.id=x.name='Rest_Mansion';return(x);};
    //Jobs
    Lib['Maid_Mansion']= function () { let x= new WS_Maid();x.id=x.name='Maid_Mansion';return(x);};
    Lib['Maid_Inn']= function () { let x= new WS_Maid();x.id=x.name='Maid_Inn';return(x);};
    Lib['Smith_Mansion']= function () { let x= new WS_Smithy();x.id=x.name='Smith_Mansion';return(x);};
    Lib['Farmer_Farm']= function () { let x= new WS_Farm();x.id=x.name='Farmer_Farm';return(x);};
    //Trainee / Trainer
    Lib['Study_Mansion']= function () { let x= new Workspace();x.id=x.name='Study_Mansion';return(x);};
    return Lib; 
}(window.gm.LibWorkspace || {}));