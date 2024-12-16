"use strict";
//////////////////////////////////////////
// this will loop over all events and break if something needs to display
// display is done in _event-Passage
window.gm.newTurn=function() {
    //daycount++
    window.gm.addTime(4*60); //6 slots a day    //TODO ensure proper time slot cycle  22-2-6-10-14-18-22 
    window.story.state.PrcEvent=null;
    window.story.state.Summary={ResourceChange:new ResourceChangeSummary(),FoodDrain:new FoodDrain()};
    window.story.show("_Event");
    };
window.gm.processEvents=function() {
    // events were sorted into groups and the groups are evaluated here left to right !
    window.story.state.PrcEvent = window.story.state.PrcEvent || {i:-1, list:'', group:['Facilities','Jobs','People','Events','Summary']};
    let _list2,_E,now = window.gm.getTime(), {daytime,DoW}= window.gm.getTimeStruct(), PrcEvent=window.story.state.PrcEvent;

    while(true){
        if(PrcEvent.list==='') {    //proceed to next group
            if(PrcEvent.group.length>0) {
            PrcEvent.list=PrcEvent.group.shift(),PrcEvent.i=-1;
            } else {
            return(false); //all list done
            }
        }
        if(PrcEvent.list==='Facilities') _list2= window.story.state.City.Facilities;
        else if(PrcEvent.list==='Jobs') _list2=window.story.state.Schedule.getJobsAtTime(window.gm.DoWs[DoW],daytime);
        else if(PrcEvent.list==='People') _list2= window.story.state.City.People;
        else if(PrcEvent.list==='Events') _list2= window.story.state.Events;
        else if(PrcEvent.list==='Summary') {
            var _list = Object.keys(window.story.state.Summary); _list2=[];
            for(el of _list){
            _list2.push(window.story.state.Summary[el]); 
            //todo because Summary is no array, the removal of done events doesnt work
            }
        }
        while(PrcEvent.i+1<_list2.length) {
            PrcEvent.i+=1;
            _E =_list2[PrcEvent.i];
            if(_E.tick(now) && _E.renderTick()) { //if there is a event triggered and output requires interaction, halt the processing
                return(true);
            }
        }
        //remove all done events
        PrcEvent.i = _list2.length-1;
        while(PrcEvent.i>=0) {
            _E =_list2[PrcEvent.i];
            if(_E.done ) { _list2.splice(PrcEvent.i,1);  }
            PrcEvent.i -=1;
        }
        PrcEvent.list='';
    }
};
//
window.gm.listScouts=function() {
    var _J,_P,link,_list={},_list2,panel=$("div#panel")[0];
    //find people assigned to scout
    _list = window.story.state.Events;
    _list2 = window.story.state.City.People; 
    for(_P of _list2){
        if(_P.job===Operator.Job.Scout || _P.job===Operator.Job.Hunter || _P.job===Operator.Job.Scavenger){
            for(_J of _list) { //check if person has already job assigned
                if(_J.Person===_P.id) break;
                _J=null;
            } 
            const _P2=_P, _J2=_J;
            if(!_J){
                link = document.createElement('a');
                link.href='javascript:void(0)',link.addEventListener("click", function(me){window.gm.exploreQry(_P2)});
                link.textContent='send '+_P2.name +' as a '+_P2.job;
                panel.appendChild(link);
            } else if(!_J.done) {
                link = document.createElement('span');
                link.textContent=_P.name +' is busy as a '+ _P.job+' in '+_J.Area;
                panel.appendChild(link);
                link = document.createElement('a');
                link.href='javascript:void(0)',link.addEventListener("click", function(me){window.gm.exploreAbort(_P2,_J2)});
                link.textContent='call '+_P2.name +' back';
                panel.appendChild(link);
            } else {
                link = document.createElement('p');
                link.textContent=_P.name +' is aborting the job and will be back soon.';
                panel.appendChild(link);
            } 
            link = document.createElement('br');panel.appendChild(link);
        }
    }
};
window.gm.listAreas=function() {
    var _A,link,div,_list={},_list2,panel=$("div#panel2")[0];
    _list=window.story.state.Map,_list2=Object.keys(_list);
    for(el of _list2){
        link = document.createElement('a');div=document.createElement('div');
        div.textContent=_list[el].desc();div.id=_list[el].id;div.toggleAttribute('hidden');
        link.href='javascript:void(0)',link.addEventListener("click", function(me){me.currentTarget.nextSibling.toggleAttribute("hidden");});
        link.textContent=_list[el].name;//link.id=_list[el].id;
        panel.appendChild(link);panel.appendChild(div);
        link = document.createElement('br');panel.appendChild(link);
    }
};
//send scout to exploration
window.gm.exploreQry=function(_P){
    let choice=$("div#choice")[0];  
    while(choice.firstChild) choice.removeChild(choice.firstChild);
    var link = document.createElement('p');
    link.textContent="Where should "+_P.name+" explore?";
    choice.appendChild(link);
    let _J,_list2 = Object.keys(window.story.state.Map),_list = window.story.state.Events;
    //only send one scout to one area at a time
    _list=_list.reduce(function(prev,act){if(act.Area!==undefined)prev.push(act.Area);return(prev)},[])
    _list2=_list2.reduce(function(prev,act){if(!_list.includes(act))prev.push(act);return(prev); },[])
    for(el of _list2){
        const _P2 =_P, _Area=el;
        link = document.createElement('a');
        link.href='javascript:void(0)',
        link.addEventListener("click", function(me){_P2.jobActive=true;
            var _S;
            if(_P2.job===Operator.Job.Hunter) _S = new HuntProgress();
            else if(_P2.job===Operator.Job.Scavenger) _S = new ScavengeProgress();
            else _S = new ScoutProgress();
            _S.Person=_P2.id,_S.Area=_Area;
            window.story.state.Events.push(_S);
            window.story.show(window.passage.name);
        });
        link.textContent=el;
        choice.appendChild(link);
    }
}
// abort exploration
window.gm.exploreAbort=function(_P,_J){
    let choice=$("div#choice")[0];  
    while(choice.firstChild) choice.removeChild(choice.firstChild);
    _P.jobActive=false;
    _J.done =true; //this will abort event on next loop
    window.story.show(window.passage.name);
}
//
window.gm.buildFacilityQry=function(evt) {
    const _id=evt.currentTarget.id;
    var _tmp='',_R,_B = window.gm.LibFacilities[_id]();
    var link = document.createElement('p');
    link.textContent="Build a "+_id+".";
    var canBuild=true;
    
    for(el of Object.keys(_B.storage)) {
        _tmp+=' '+el+':'+_B.storage[el];
    }
    if(_tmp.length>0) link.textContent+=' Storage capacity: '+_tmp;
    link.textContent+="Requires "+_B.cost.time+" days building using ";
    for(el of _B.cost.resources) {
        _R = window.story.state.City.Resources[el.ResId];
        if(!_R || _R.amount<el.amount) {
            canBuild=false;
        }
        link.textContent+=(el.ResId+':'+el.amount+' of '+((_R===undefined)?("0"):(_R.amount))+" ");
    }
    let choice=$("div#choice")[0];  
    while(choice.firstChild) choice.removeChild(choice.firstChild);
    choice.appendChild(link);
    if(canBuild) {
    link = document.createElement('a');
    link.href='javascript:void(0)',link.addEventListener("click", function(){window.gm.buildFacilityStart(_id);});
    link.textContent = 'Do it !';
    } else {
    link = document.createElement('p');
    link.textContent = 'You dont have the resources !';
    }
    choice.appendChild(link);
};
window.gm.buildFacilityStart=function(what) {
    var _R,_B = window.gm.LibFacilities[what](),_R;
    var link = document.createElement('p');
    link.textContent="They are now building a "+what+" with ";
    for(el of _B.cost.resources) {
    _R = window.story.state.City.Resources[el.ResId];
    _R.consume(el.amount);
    link.textContent+=el.ResId+':'+el.amount+' ';
    }  
    let choice=$("div#choice")[0];  
    while(choice.firstChild) choice.removeChild(choice.firstChild);
    choice.appendChild(link); 
    var _E = new BuildProgress();_E.Facility=what,_E.daysLeft=_B.cost.time;
    window.story.state.Events.push(_E); 
};
//
window.gm.listBuildings =function(){
    var link,_list={},_list2,_list3, panel=$("div#panel")[0],panel2=$("div#panel2")[0];
    //sum up buildings
    for(var i=window.story.state.City.Facilities.length-1;i>=0;i--) {
        var _b=window.story.state.City.Facilities[i];
        if(_list[_b.id]===undefined) _list[_b.id]=1;
        else _list[_b.id]+=1;
    }
    _list2 = Object.keys(_list);
    for(var i=_list2.length-1;i>=0;i--){ //building interaction
        link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){}); //todo
        link.textContent=_list2[i]+':'+_list[_list2[i]];
        panel.appendChild(link);
    }
    _list3 =window.story.state.Known;//what buildings you know
    _list2 = Object.keys(_list3); 
    var _item='';
    for(el of _list2) {
        switch(el) {
            case 'Farm': _item='FarmGrain';
                break;
            case 'Barracks': _item='Tent';
                break;
            case 'Slavery':  _item='SlavePen';
                break;
            default:
                _item='';
        }
        if(_item!=='') {
            link = document.createElement('a');
            link.id=_item,link.href='javascript:void(0)',link.addEventListener("click", window.gm.buildFacilityQry);
            link.textContent=link.id;
            panel2.appendChild(link);
        }
    }
};
window.gm.addResource=function(array,ResId,gain) { //adds the resource to a a list
    let _R = array[ResId];
    if(_R===null || _R===undefined) {
        _R = window.gm.ResourcesLib[ResId]();
        array[ResId]=(_R);
    }
    _R.consume(-1*gain);
}
window.gm.hasResource=function(array,ResId) { //returns number of resource
    let _R = array[ResId];
    if(_R===null || _R===undefined) {
        return(0);
    }
    return(_R.amount);
}
//
window.gm.listResources=function() {
    var _list={},_list2,Cap={};
    _list2=window.story.state.City.Facilities;
    for(var i=_list2.length-1;i>=0;i--) { //sum up storage capacity
        _list=Object.keys(_list2[i].storage);
        for(el of _list) {
            Cap[el] = Cap[el]|| 0;
            Cap[el]+=_list2[i].storage[el];
        }
    }
    _list2 = Object.keys(window.story.state.City.Resources);
    _list2.sort();
    for(el of _list2){
        var _p = window.story.state.City.Resources[el];
        var link = document.createElement('a');
        link.id=_p.id,link.href='javascript:void(0)';
        //todo link.addEventListener("click", function(me){window.story.state.tmp.args=[me.currentTarget.id];window.story.show('Menu_ResourceInfo');});
        link.textContent=_p.style+':'+_p.amount+' (max '+(Cap[_p.id])+')';
        $("div#panel")[0].appendChild(link);
    }
};
/** renders slave description and options
 * 
 */
window.gm.listSlave=function(id){
    var _P,_list,panel=$("div#panel")[0]; //id=Number(id)
    _list = window.story.state.City.Slaves;
    for(el of _list){
        _P=el;
        if(_P.id===id) break;
        _P=null;
    }
    if(!_P) return;
    //manuel training
    //or assign trainer cruel,balanced,kind
    var link = document.createElement('p');
    link.textContent=_P.name+' is a slave with a obedience= '+_P.obedience+' and a trust= '+_P.trust;
    panel.appendChild(link);
    link = document.createElement('hr');panel.appendChild(link);
    link = document.createElement('p');link.textContent='The slave has to attend...';panel.appendChild(link);
    link = document.createElement('button'),link.textContent='Work & Training Schedule';
    link.addEventListener("click", function(me){window.story.show("Menu_WorkSchedule");}),panel.appendChild(link);
    link = document.createElement('p');link.textContent='Possible options for work or training depends on available facilities and trainers.';panel.appendChild(link);
    link = document.createElement('hr');panel.appendChild(link);
    link = document.createElement('p');link.textContent='While resting, the slave should...';panel.appendChild(link);
    _list=['outside','cell','shackled','restrain'];
    for(var i=_list.length-1;i>=0;i--) { 
        link = document.createElement('button'),link.id=_list[i];
        link.textContent='...may leave the cell';
        const _option=_list[i];
        switch(_option) {
            case 'outside':
                break;
            case 'cell':
                link.textContent='...may not leave the cell';
                break;
            case 'shackled':
                link.textContent='...be shackled with a chain';
                break;
            case 'restrain':
                link.textContent='...be restrained tightly';
                break;
            default:
        }
        link.addEventListener("click", function(me){_P.RestOption=_option;window.gm.refreshAllPanel();}),panel.appendChild(link);
    }
    link = document.createElement('p');link.textContent='There is a high risk that the slave might flee if it is allowed to move around outside the cell. Having a slave restrained might help with breaking its will, but might also reduce its fitness or healthyness.';panel.appendChild(link);
    link = document.createElement('hr');panel.appendChild(link);
    link = document.createElement('p');link.textContent='The slave may wear...';panel.appendChild(link);
    _list=['nude','tatters','anything'];
    for(var i=_list.length-1;i>=0;i--) { 
        link = document.createElement('button'),link.id=_list[i];
        link.textContent='...nothing at all.';
        switch(_list[i]) {
            case 'nude':
                break;
            case 'tatters':
                link.textContent='...some tattered cloths for a minimum decency';
                break;
            case 'anything':
                link.textContent='...any cloths in possesion';
                break;
            default:
        }
        link.addEventListener("click", function(me){}),panel.appendChild(link);
    }
    link = document.createElement('p');link.textContent='Having the slave walk around nude might humilate him. Beside this clothing restriction, the slave has to wear the assigned gear and may only switch if training or work requires it.';panel.appendChild(link);
    link = document.createElement('hr');panel.appendChild(link);
    link = document.createElement('p');link.textContent='The slave might...';panel.appendChild(link);
    //command other slaves to fullfill his need, may talk to other slaves, has to stay silent
    //may reject inappropiate commands of other slaves 
    link = document.createElement('hr');panel.appendChild(link);
};
/**  
 * prints a list of slaves as link to a node 
*/
window.gm.listSlaves=function() {
    var _list={},_list2,panel2=$("div#panel2")[0],panel=$("div#panel")[0];;
    _list2 = window.story.state.City.Slaves;
    for(var i=_list2.length-1;i>=0;i--){
        var _P = _list2[i];
        if(_list[_P.job]===undefined) _list[_P.job]=1;
        else _list[_P.job]+=1;
        var link = document.createElement('a');
        link.id=_P.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){window.story.state.tmp.args=[me.currentTarget.id,"Slave"];window.story.show('Menu_Person');});
        link.textContent=_P.name;//+':'+_P.job; TODO job in current time slot & train-stats
        panel2.appendChild(link);panel2.appendChild(document.createElement("br"));
    }
    /*_list2 = Object.keys(_list);
    for(var i=_list2.length-1;i>=0;i--) { //list job-overview
        var link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){});
        link.textContent=_list2[i]+':'+_list[_list2[i]];
        panel.appendChild(link);
    }*/
};
/** 
 * print Schedule-table for worker. It requires:
 * #schedule>tbody to display day & Time assignment of Jobs
 * div#panel1 to display person-info
 * div#panel2 to display job selector
 * div#choice to display info for selected job
 */
window.gm.planWork=function(personid,params) {
    //let showall=(params&&params.showall)?params.showall:false;
    let s=window.story.state;
    var _P,_list,link,link2;
    var panel=document.querySelector("#schedule>tbody"),panel1=document.querySelector("div#panel"),panel2=document.querySelector("div#panel2"),choice=document.querySelector("div#choice");
    _list = window.story.state.City.Slaves;
    _P=window.gm.getArrayElementById(_list,personid);
    if(!_P) return;
    
    link = document.createElement('p');link.textContent = _P.name+' has '+_P.Stats.get('energyMax').value+' energy/day.';panel1.appendChild(link);
    //link = document.createElement('hr');panel.appendChild(link);
    const at='@';   //delimiter for ids
    //Todo instead of selecting timeslot and then work -> select work then time 
    link2=document.createElement('tr');panel.appendChild(link2);
    link=document.createElement('th'),link.textContent="   ";link2.appendChild(link);
    link=document.createElement('th'),link.textContent="   ";link2.appendChild(link);
    window.gm.timeslots.forEach((x)=>{link=document.createElement('th'),link.textContent=x;link2.appendChild(link);});

    window.gm.DoWs.forEach((x)=>{dayWork(x)});

    function dayWork(day){
        var row = document.createElement('tr');panel.appendChild(row);
        link=document.createElement('td');link.textContent="   ";link.id=day+"_alert";row.appendChild(link);  //Todo indicator for overload
        link=document.createElement('td');link.textContent=day;row.appendChild(link);
        link=document.createElement('td'),link.textContent="   ";link2.appendChild(link);   
        window.gm.timeslots.forEach((x)=>{timeWork(x,day,row)});
    }
    function timeWork(time,day,dayrow){
        link=document.createElement('td');dayrow.appendChild(link);
        let _j=s.Schedule.getJobAtTimePerson(day,time,personid);
        link2 = document.createElement('button'),link2.id=day+at+time,
            link2.textContent=_j.job;
        link2.addEventListener("click", function(me){createSelector(me.currentTarget.id)});
        link.appendChild(link2);
    }
    function createSelector(day_time){  //workspace-selector
        while(panel2.hasChildNodes()) {
            panel2.removeChild(panel2.children[0]);
        }
        _P.WorkOptions.forEach((x)=>{x.workspaces.forEach((y)=>{addOption(day_time,y);})}); //Todo filter options that are general unavailable (missing workspace)
    }
    function addOption(day_time,work){
        link = document.createElement('button');link.id=day_time+at+work, link.textContent = work;panel2.appendChild(link);
        link.addEventListener("click", function(me){workPreview(me.currentTarget.id)});
    }
    function workPreview(day_time_work){
        var info=day_time_work.split(at),    //Monday@Dawn@Maid_Inn
            day=info[0],time=info[1],work=info[2];
        while(choice.hasChildNodes()) {
            choice.removeChild(choice.children[0]);
        }
        var _res=window.gm.workPreview(_P,day,time,work);
        if(_res.OK==true){
            link = document.createElement('p');link.textContent=day_time_work;choice.appendChild(link);
            s.Schedule.setJob(day,time,work,personid,_res.work.params());
            dayPreview(day);
            document.getElementById(day+at+time).textContent=_res.msg;
        } else {
            link = document.createElement('p');link.textContent=_res.msg;choice.appendChild(link);
        }
    }
    function dayPreview(day){
        let _res={OK:true,msg:""},_en=0;
        window.gm.timeslots.forEach((x)=>{
            let _j=s.Schedule.getJobAtTimePerson(day,x,personid);
            if(_j){
                _en+=window.gm.getArrayElementById(s.City.Workspaces,_j.job).requiredEnergy();
                //_en+=_P.getWorkOption(_j.job).requiredEnergy();  //Resting has 0 Energy
            }
        })
        if(_en>_P.Stats.get('energyMax').value){
            _res.OK=false,_res.msg="Jobs require to much energy and might fail. "
        }
        if(_res.OK==false){
            document.getElementById(day+"_alert").innerHTML='<div class="popup combateff"><div class="combaticon">'+window.gm.images.ic_warn()+'</div><span class="popuptext" id="myPopup2">'+_res.msg+'</span></div>';
            
        } else {
            document.getElementById(day+"_alert").innerHTML="";
        }
    }
};
/**
 * estimate effect of work
*/
window.gm.workPreview=function(person,day,time,workspace){
    let _res={msg:'',OK:true}
    //P has WorkOption + add. requirements
    var work=workspace.split("_")[0];  //"Rest_Mansion"
    let _work=person.getWorkOption(work)
    if(_work==null){
        _res.OK=false, _res.msg="doesnt know about "+work+"!";
    }
    if(_res.OK==true) {
        //Time ok
        if(work!="Rest" && (time=="Night" || time=="Dawn")) {
            _res.OK=false, _res.msg="People rest at this time!";
        }
    }
    if(_res.OK==true) {
        //Workplace avaliable
    }
    if(_res.OK==true) {
        //Resources available
    }
    if(_res.OK==true) {
        //Resources available
        _res.msg=person.name+" will use "+_work.workspaces[0]+ ". Requires TODO?? energy.";
        _res.work=_work;
    }
    return(_res)
}
/** 
 * update available jobs for someone; this will also remove the active job if it becomes unavailable 
*/
window.gm.updataJobCapabilitys=function(person){
    let s=window.story.state;
    if(person==null) { //check all people & slaves
        s.City.Slaves.forEach((x)=>{window.gm.updataJobCapabilitys(x.id)});
        s.City.People.forEach((x)=>{window.gm.updataJobCapabilitys(x.id)});
        return;
    }
    let _P = window.gm.getArrayElementById(window.story.state.City.Slaves,person);
    if(_P==null) {
        _P = window.gm.getArrayElementById(window.story.state.City.People,person);
    }
    Object.keys(window.gm.LibJobs).forEach((x)=>{_P.addWorkOption(window.gm.LibJobs[x]())});   
    window.story.state.Schedule.presetJob("Rest_Mansion",person,{}) 
}
window.gm.randomizePerson=function(params) {
    let slave=(params&&params.slave)?params.slave:false;
    //Todo name,gender,race,traits,stats
    let _P= new Operator();
    if(slave) { _P.slave=slave; 
        _P.obedience=-70,_P.trust=-70; //todo values depends on race and attitude to humans
    }
    return _P;
};
window.gm.getArrayElementById=function(array,id) {
    var _id=Number(id),_p=null;  //id is either a number or string
    for(el of array){
        _p=el;
        if(_p.id===id || _p.id===_id) break;
    }
    return(_p);
}
window.gm.getArrayIndexById=function(array,id) {
    var _id=Number(id),_p=null,i=0;
    for(el of array){
        _p=el;
        if(_p.id===id || _p.id===_id) break;
        i++;
    }
    return((_p==null)?-1:i);
}
window.gm.listPerson=function(id){
    var _p,_list,_list2,_AreaJobs=["Hunter","Scout","Scavenger"], panel=$("div#panel")[0];
    _list = window.story.state.City.People;
    _p=window.gm.getArrayElementById(_list,id);
    if(!_p) return;
    var link = document.createElement('p');
    link.textContent=_p.name+' is currently working as '+_p.job+'. Change to...';
    panel.appendChild(link);
    if(_p.jobActive) {
        link.textContent+=' You cant change the job right now !';
    } else {
    //todo list possible jobs depending on training and open position
        _list = Object.keys(Operator.Job);_list2=window.story.state.Known;
        for(el of _list){
            if(_list2[el]===undefined) continue;
            link = document.createElement('a'),link.href='javascript:void(0)';
            const job=el;
            link.addEventListener("click", function(me){_p.job=job;window.story.show('Menu_Person');});  //todo confirmation popup
            link.id=el,link.textContent=el;
            if(_AreaJobs.includes(el)) link.textContent+=" (requires assigned Area in Exploration-Menu)"
            panel.appendChild(link);panel.appendChild(document.createElement("br"));
        }
    }
};
window.gm.listPeople=function() {
    var _list={},_list2,panel2=$("div#panel2")[0],panel=$("div#panel")[0];
    _list2 = window.story.state.City.People;
    for(var i=_list2.length-1;i>=0;i--){
        var _p = _list2[i];
        if(_list[_p.job]===undefined) _list[_p.job]=1;
        else _list[_p.job]+=1;
        var link = document.createElement('a');
        link.id=_p.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){window.story.state.tmp.args=[me.currentTarget.id,"People"];window.story.show('Menu_Person');});
        link.textContent=_p.name+':'+_p.job;
        panel2.appendChild(link);panel2.appendChild(document.createElement("br"));
    }
    _list2 = Object.keys(_list);
    for(var i=_list2.length-1;i>=0;i--) { //list job-overview
        var link = document.createElement('a');
        link.href='javascript:void(0)',link.addEventListener("click", function(){});
        link.textContent=_list2[i]+':'+_list[_list2[i]];
        panel.appendChild(link);
    }
};
/* lists the available workspaces (that support production) and their configured producestack & productivity
* 
*/
window.gm.listProduction=function() {
    var _list={},_list2,panel2=$("div#panel2")[0],panel=$("div#panel")[0];
    _list2 = window.story.state.City.Workspaces;
    for(var i=_list2.length-1;i>=0;i--){ //for each ws...
        var _ws = _list2[i],_rec=_ws.getProducables();
        if(_rec===null) break; //produce nothing - skip
        var link = document.createElement('a');
        link.id=_ws.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){window.story.state.tmp.args=[{ws_id:me.currentTarget.id}];window.story.show('Menu_ProductionWS');});
        if(_ws.produce!=""){
            link.textContent=_ws.name+" produces actually "+ _ws.produce + " and " +_ws.produceStack.length +" more.";
        } else {
            link.textContent=_ws.name+" is preparing for " +_ws.produceStack.length +" more.";
        }
        panel2.appendChild(link);panel2.appendChild(document.createElement("br"));
    }
}
/* lists producables on workspace
* 
*/
window.gm.listProductionWS=function(params) {
    var ws_id=(params?.ws_id)??"";
    var _list={},_list2,panel2=$("div#panel2")[0],panel=$("div#panel")[0];
    let _ws = window.gm.getArrayElementById(window.story.state.City.Workspaces,ws_id);
    link = document.createElement('a');
    link.id=_ws.id,link.href='javascript:void(0)',
    link.addEventListener("click", function(me){
        let _ws = window.gm.getArrayElementById(window.story.state.City.Workspaces,me.currentTarget.id);
        _ws.produceStack=[];
        window.story.show('Menu_ProductionWS');});
    link.textContent="flush production-stack (but not active production)"; 
    panel2.appendChild(link);

    _list2=_ws.getProducables();
    var link = document.createElement('p');
    link.textContent=_ws.name + " has the follwoing production-stack: "; 
    _ws.produceStack.forEach((x)=>{
        link.textContent=link.textContent+" "+x.id+":"+x.count; 
    });
    panel2.appendChild(link);
    link = document.createElement('p');
    link.textContent=_ws.name + " could produce:"; 
    panel2.appendChild(link);panel2.appendChild(document.createElement("br"));
    for(var i=_list2.length-1;i>=0;i--){ //for each recipe...
        let _rec=_list2[i];
        link = document.createElement('a');
        link.id=_ws.id+"@"+_rec.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){
            let _d=me.currentTarget.id.split('@');  //ws_id@rec_id
            let _ws = window.gm.getArrayElementById(window.story.state.City.Workspaces, _d[0]);
            _ws.produceStack.push({id:_d[1], count:1});     //TODO confiure count
            window.story.show('Menu_ProductionWS');
        });
        _list=_rec.resources;
        _list.forEach((x)=>{
            link.textContent+= x.item+":"+x.count+" ";
        });
        link.textContent=_rec.item +" with "+link.textContent;  //iron with ironore:2 wood:2 
        panel2.appendChild(link);
        panel2.appendChild(document.createElement("br"));
    }
}