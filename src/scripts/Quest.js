"use strict";
/* classes to manage a quest
 */
///////////////////////////////////////////////////////////////
class QuestMilestone {
    constructor(id,name,descr,CondCheckCB,HiddenCB=null) {
        this.id =id,this.name=name;
        this.HiddenCB = (HiddenCB===null)? (function(){return(false);}): HiddenCB;
        this.descr =descr;
        this.CondCheckCB =CondCheckCB;
        window.storage.registerConstructor(QuestMilestone);
    }
    toJSON() {return window.storage.Generic_toJSON("QuestMilestone", this); };
    static fromJSON(value) {
        var _x = window.storage.Generic_fromJSON(QuestMilestone, value.data);
        return(_x);
    }
    //return value: 0 = condition nok, -1 = condition ok- quest finished, >0 condition ok & next MileID 
	evaluateCondition() {
		return(this.CondCheckCB());
	}
}
// a Quest contains multiple milestones
class Quest  { 
    constructor(id,name,descr,HiddenCB=null) {
        this.id =id,this.name=name,this.descr =descr;
        this.HiddenCB = (HiddenCB===null)? (function(){return(false);}): HiddenCB;
        this.miles=new Map();
        window.storage.registerConstructor(Quest);
    }
    toJSON() {return window.storage.Generic_toJSON("Quest", this); };
    static fromJSON(value) {
        var _x = window.storage.Generic_fromJSON(Quest, value.data);
        return(_x);
    }
    
    /* those are not used - see questmanager
    getCurrMile() {
        return(this.mile);
    }
    questUpdated() {
        let nodeChangeEvent = new Event("change");
        nodeChangeEvent.id = this.id;
        this.pubSub.publish("change",nodeChangeEvent)
    }
     //returns the Quest & Milestone description for Quest-Log
	getLogDescription(){
        if (this.hidden()) return("");
		var log= this.descr+"</br>";
		if(this.getCurrMile()!=null && !this.getCurrMile().hidden) log+= this.getCurrMile().descr+"</br>";
		return(log);
	}
	activateMileByID(id){
        var _mile = this.getMileById(id);
        if (_mile !== null) {
            if (this.mile != null && this.mile.ExitMilestoneCB!==null) {
                this.mile.ExitMilestoneCB();
            }
            this.mile = _mile;
            if (this.mile != null && this.mile.EnterMilestoneCB !== null) {
                this.mile.EnterMilestoneCB();
            }

            if (!this.mile.hidden) {
                this.hidden=false;
                this.questUpdated();
            }
        }
	}
	
    // check here if progress to next milestone can be made (Condition of current MS met)
    // if there is no curent MS set, this quest is not started; 
    // the condition of the MS is the EXIT-condition
    evaluateCondition(){
        if (this.finished )  return;
        var Next = -1;
		if(this.mile !== null) {
			Next = this.mile.evaluateCondition();
		} 
		if (Next === -1) {
			this.finished = true;
		}else if (Next > 0) {
			this.activateMileByID(Next);
		}
	}*/
	getMileById(ID) {
        if (this.miles.has(ID))
            return(this.miles.get(ID));
		return(null);
    }
    addMileStone(Mile) {
        if (Mile !== null) {
            this.miles.set(Mile.id,Mile);
        }
        /*if (this.mile === null) {
            this.mile = Mile; //automatical activate entry milestone
            this.hidden = Mile.hidden;
        }*/
    }
}
// QuestData only contains the state of the quests (finished, active milestone) but no function
// dont change the data manually - this is done by QuestManager ! 
// separation is necessary for save/reload issue
class QuestData {
    constructor() {
        this.activeQuests=[];   //{id:"xyz",flags:0x0}
        this.activeQuestsMS=[];
        this.finishedQuests=[];
        this.finishedQuestsMS=[];
        window.storage.registerConstructor(QuestData);
    }
    toJSON() {return window.storage.Generic_toJSON("QuestData", this); };
    static fromJSON(value) {
        var _x = window.storage.Generic_fromJSON(QuestData, value.data);
        return(_x);
    }
}

// the Questmanager contains a list of all quests
// because of save/restore issues this contains only the IDs of the active quest and milestones; all other data is defined in questDef
// todo: this should be singleton
class QuestManager {
    //questDef is an object with properties that contain a quest-object and its milestones: questDef["myQuest"] = new Quest("myQuest") 
    constructor(questDef) {
        this.pubSub = window.gm.util.PubSub();
        this.questDef = questDef;           
    }
    // data is a QuestData-Object
    setQuestData(data) {
        this.questData = data;
    }
    questUpdated(questId) {
        let nodeChangeEvent = new Event("change");
        nodeChangeEvent.questId = questId;
        this.pubSub.publish("change",nodeChangeEvent);
        //alert(id);
    }
    //can be used to progress a active quest to next milestone if its at current milestone
    //tick will be called to check for finished or progress-condition
    forceQuestMilestone(questId,mileId, reqMileId) {
        var needsUpdate=false;
        for (var i=0; i< this.questData.activeQuests.length; i++) {
            var qID = this.questData.activeQuests[i].id;
            var msID = this.questData.activeQuestsMS[i].id;
            if(qID===questId && reqMileId===msID) {
                this.questData.activeQuestsMS[i].id=mileId;
                needsUpdate =true;
            }
        }
        if(needsUpdate) this.tick();
        else {
            window.gm.pushLog("cant force "+questId +" to "+mileId);
        }
    }
    //this will get called - sometimes - and will trigger the conditioncheck of the milestones
    tick() {
        var tickAgain = false;
        var tmpfinishedQuest =[];
        for (var i=0; i< this.questData.activeQuests.length; i++) {
            var qID = this.questData.activeQuests[i].id;
            var msID = this.questData.activeQuestsMS[i].id;
            var quest = this.questDef[qID]
            var mile = quest.getMileById(msID);
            //if (quest.finished ) continue;
            var Next = -1;
            if(!mile) {
                throw new Error("cant find mileId "+msID+" in "+quest.id);
            } 
            Next = mile.evaluateCondition();
            if (Next === -1) {
                tmpfinishedQuest.push(i);
            }else if (Next > 0) {
                this.questData.activeQuestsMS[i].id = Next;
                if(!quest.getMileById(Next).HiddenCB()) this.questUpdated(qID);
                tickAgain=true;
            }
        }
        //remove finished quests
        for(var k=tmpfinishedQuest.length-1;k>=0;k--) {
            this.questData.finishedQuests.push(this.questData.activeQuests[tmpfinishedQuest[k]]);
            this.questData.finishedQuestsMS.push(this.questData.activeQuestsMS[tmpfinishedQuest[k]]);
            this.questData.activeQuests.splice(tmpfinishedQuest[k],1);
            this.questData.activeQuestsMS.splice(tmpfinishedQuest[k],1);
            //if(!this.questDef[qID].getMileById(msId).HiddenCB()) this.questUpdated(qID);
        }
        // sometimes not only one milestone is fullfilled but several
        // so we need to recheck again until no more progressing milestone
        // also required to remove finished quests 
        if(tickAgain) this.tick();
    }
    getMilestoneState(questId) {
        for (var i=0; i< this.questData.activeQuests.length; i++) {
            if(questId===this.questData.activeQuests[i].id) 
                return(this.questData.activeQuestsMS[i]);
        }
        for (var i=0; i< this.questData.finishedQuests.length; i++) {
            if(questId===this.questData.finishedQuests[i].id) 
                return(this.questData.finishedQuestsMS[i]);
        }
        return({});
    }
    getQuestState(questId) {
        for (var i=0; i< this.questData.activeQuests.length; i++) {
            if(questId===this.questData.activeQuests[i].id) 
                return(this.questData.activeQuests[i]);
        }
        for (var i=0; i< this.questData.finishedQuests.length; i++) {
            if(questId===this.questData.finishedQuests[i].id) 
                return(this.questData.finishedQuests[i]);
        }
        return({});
    }
    // cchecks if the quest is active and, if given, has the certain milestone
    hasActiveQuest(questId,msId=null) {
        for (var i=0; i< this.questData.activeQuests.length; i++) {
            if(questId===this.questData.activeQuests[i].id && (msId===null || msId===this.questData.activeQuestsMS[i].id)) 
                return(true);
        }
        return(false);
    }
    hasFinishedQuest(questId,msId=null) {
        for (var i=0; i< this.questData.finishedQuests.length; i++) {
            if(questId===this.questData.finishedQuests[i].id && (msId===null || msId===this.questData.finishedQuestsMS[i].id))
                return(true);
        }
        return(false);
    }
    //add & start a quest if not existent; if noRedo==false, finished quests will be restarted
	addQuest(questId,msID,noRedo=true){
        if(!noRedo) this.removeQuest(questId);//remove from finished if redoing a quest
        if(!(this.hasActiveQuest(questId) || this.hasFinishedQuest(questId))) {
            this.questData.activeQuests.push({id:questId,flags:0});
            this.questData.activeQuestsMS.push({id:msID}); 
            if(!this.questDef[questId].getMileById(msID).HiddenCB()) this.questUpdated(questId);  
        }
    }
    //removes quest from active&finished
    removeQuest(Id) {
        for (var i=this.questData.activeQuests.length-1; i>=0; i--) {
            if(this.questData.activeQuests[i].id===Id) {
                this.questData.activeQuests.splice(i,1);
                this.questData.activeQuestsMS.splice(i,1);
            }
        }
        for (var i=this.questData.finishedQuests.length-1; i>=0; i--) {
            if(this.questData.finishedQuests[i].id===Id) {
                this.questData.finishedQuests.splice(i,1);
                this.questData.finishedQuestsMS.splice(i,1);
            }
        }
	}
    /*getQuestCount(){
		return(this.quests.length);
	}

    getQuestById(Id){
        if (this.quests.has(Id)) {
            return(this.quests.get(Id));
        }
        return(null);
    }
    tick() {
        for (let [key, value] of this.quests.entries( )) {
            value.evaluateCondition();
          }
    }
	addQuest(quest){
        quest.pubSub.subscribe("change", this.questUpdated)
        this.quests.set(quest.id, quest);    //Todo update 
	}
    removeQuest(Id) {
        if (this.quests.has(Id)) {
            //todo quest.removeEventListener("change",this.questUpdated)
            this.quests.delete(Id);

        }
	}*/
}
