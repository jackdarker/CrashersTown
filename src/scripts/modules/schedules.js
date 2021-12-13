"use strict";

window.gm.jobs = window.gm.jobs || {};

// global definition of repeatable tasks
/*
passage linked to the task
time-schedule; 
used resources; time and energy used
hidden; job is hidden in schedule
disable; job is displayed in schedule but unavailable
critical; indicates that if not done on time there is punishment (just shows the indicator in the sidebar)
onAddTime-CB is called when time passes; can be used to check if task was done on time
 */

class Job {
    constructor(id,name,descr) {
        this.id=id,this.name=name;
        this.descr=descr, this.reqEnergy=0,this.reqTime=0,
        this.startTimeMin=0,this.startTimeMax=0,this.DoW=[], 
        this.onAddTimeCB = null;
    }
    onAddTime() {
    }
    isDisabled() { return(false); }
    disabledReason() { return(""); }
    isHidden() { return(false); }
}

{
    let job;

    job = new Job("Campus","get to the uni","You have to at least attend some of the lectures to keep up with the studys.");
    job.reqEnergy = 5, job.reqTime=15,job.startTimeMin=700,job.startTimeMax=1100,job.DoW =[1,2,3,4,5];
    window.gm.jobs[job.id] = job;

    job = new Job("Harcon_work","work at Hacorn facility","do a shift at Harcon logistic dept.");
    job.reqEnergy = 10, job.reqTime=20,job.startTimeMin=800,job.startTimeMax=930,job.DoW =[1,3,5];
    job.isHidden = function (){ return(!window.gm.quests.hasActiveQuest("qFindAJob",200));};
    window.gm.jobs[job.id] = job;

    job = new Job("Dogsit_NewCall","Dog-sitting","You could call the dogsit agency if they have a new job.");
    job.reqEnergy = 20, job.reqTime=120,job.startTimeMin=900,job.startTimeMax=1300,job.DoW =[2,3,4];
    job.isHidden = function (){ return(true);};
    window.gm.jobs[job.id] = job;

    job = new Job("Home_Study","Studying","Do some studying for your graduation.");
    job.reqEnergy = 20, job.reqTime=120,job.startTimeMin=700,job.startTimeMax=1800,job.DoW =[1,2,3,4,5,6,7];
    job.isDisabled = function (){ return(true);};
    job.disabledReason=function() {return("You are not in the mood to waste your time with books.");};
    window.gm.jobs[job.id] = job;
}