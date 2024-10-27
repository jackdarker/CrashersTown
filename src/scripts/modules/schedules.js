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
                let people=Object.keys(this.Schedule[day][time][jobs[i]]);
                let ws=window.story.state.City.Workspaces[jobs[i]];
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

class JobMaid extends Job {
    constructor() {
        super();
    }
    toJSON() {return window.storage.Generic_toJSON("JobMaid", this); };
    static fromJSON(value) { return window.storage.Generic_fromJSON(JobMaid, value.data);};
    params(){return({})}
    tick(time){ //overwrite this with the result of the work
        let delta = window.gm.getDeltaTime(time,this.lastTick);  
        if(true/*delta>(4*60-1)*/) {
            let _ws=window.gm.LibWorkspace[this.workspace];

            this.lastTick=time;
        }          
    }
} 


window.gm.LibJobs = (function (Lib) {
    window.storage.registerConstructor(Job);
    window.storage.registerConstructor(JobMaid);
    //Leisure
    Lib['Rest_Mansion']= function () { let x= new Job();x.id=x.name='Rest_Mansion';x.requiredEnergy=function(){return(0);};x.workspaces=['Rest_Mansion'];return(x);};
    //Jobs
    Lib['Maid_Mansion']= function () { let x= new JobMaid();x.id=x.name='Maid_Mansion';x.workspaces=['Maid_Mansion'];return(x);};
    Lib['Maid_Inn']= function () { let x= new JobMaid();x.id=x.name='Maid_Inn';x.workspaces=['Maid_Inn'];return(x);};
    Lib['Trader']= function () { let x= new Job();x.id=x.name='Trader';return(x);};
    //Trainee / Trainer
    Lib['LearnCharm']= function () { let x= new Job();x.id=x.name='LearnCharm';x.workspaces=['Study_Mansion'];return(x);};
    return Lib; 
}(window.gm.LibJobs || {}));

window.gm.LibWorkspace = (function (Lib) {
    window.storage.registerConstructor(Workspace);
    window.storage.registerConstructor(WS_Maid);
    window.storage.registerConstructor(WS_Smithy);
    //Leisure
    Lib['Rest_Mansion']= function () { let x= new Workspace();x.id=x.name='Rest_Mansion';return(x);};
    //Jobs
    Lib['Maid_Mansion']= function () { let x= new WS_Maid();x.id=x.name='Maid_Mansion';return(x);};
    Lib['Maid_Inn']= function () { let x= new WS_Maid();x.id=x.name='Maid_Inn';return(x);};
    Lib['Smith_Mansion']= function () { let x= new WS_Smithy();x.id=x.name='Smith_Mansion';return(x);};
    //Trainee / Trainer
    Lib['Study_Mansion']= function () { let x= new Workspace();x.id=x.name='Study_Mansion';return(x);};
    return Lib; 
}(window.gm.LibWorkspace || {}));