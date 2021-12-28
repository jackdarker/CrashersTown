"use strict";
//////////////////////////////////////////
// this will loop over all events and break if something needs to display
// display is done in _event-Passage
window.gm.newTurn=function() {
    //daycount++
    window.gm.addTime(24*60);
    window.story.state.PrcEvent=null;
    window.story.state.Summary={ResourceChange:new ResourceChangeSummary(),FoodDrain:new FoodDrain()};
    window.story.show("_Event");
    };
window.gm.processEvents=function() {
    // the groups are evaluated left to right !
    window.story.state.PrcEvent = window.story.state.PrcEvent || {i:-1, list:'', group:['Facilities','People','Events','Summary']};
    let _list2,_E,now = window.gm.getTime(), PrcEvent=window.story.state.PrcEvent;
    while(true){
    if(PrcEvent.list==='') {
        if(PrcEvent.group.length>0) {
        PrcEvent.list=PrcEvent.group.shift(),PrcEvent.i=-1;
        } else {
        return(false); //all list done
        }
    }
    if(PrcEvent.list==='Facilities') _list2= window.story.state.City.Facilities;
    if(PrcEvent.list==='People') _list2= window.story.state.City.People;
    else if(PrcEvent.list==='Events') _list2= window.story.state.Events;
    else if(PrcEvent.list==='Summary') {
        var _list = Object.keys(window.story.state.Summary); _list2=[];
        for(el of _list){
        _list2.push(window.story.state.Summary[el]); 
        //todo because Summary is no array, the removal of done events doesnt work
        }
    }
    while(PrcEvent.i+1<_list2.length) {
        PrcEvent.i=1+PrcEvent.i;
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
    link = document.createElement('hr'); panel.appendChild(link);
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
    var _tmp='',_R,_B = window.gm.BuildingsLib[_id]();
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
    var _R,_B = window.gm.BuildingsLib[what](),_R;
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
window.gm.addResource=function(array,ResId,gain) {
    let _R = array[ResId];
    if(_R===null || _R===undefined) {
        _R = window.gm.ResourcesLib[ResId]();
        array[ResId]=(_R);
    }
    _R.consume(-1*gain);
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
//
window.gm.listSlave=function(id){
    var _P,_list,id=Number(id),panel=$("div#panel")[0];
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
    link = document.createElement('p');link.textContent='While resting, the slave should...';panel.appendChild(link);
    _list=['outside','cell','shackled','restrain'];
    for(var i=_list.length-1;i>=0;i--) { 
        link = document.createElement('button'),link.id=_list[i];
        link.textContent='...may leave the cell';
        switch(_list[i]) {
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
        link.addEventListener("click", function(me){}),panel.appendChild(link);
    }
    link = document.createElement('p');link.textContent='There is a high risk that the slave might flee if it is allowed to move around outside the cell. Having a slave restrained might help with breaking its will, but might also reduce its fitness or healthyness.';panel.appendChild(link);
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
    link = document.createElement('p');link.textContent='The slave might...';panel.appendChild(link);
    //command other slaves to fullfill his need, may talk to other slaves, has to stay silent
    //may reject inappropiate commands of other slaves 
    link = document.createElement('p');link.textContent='The slave has to attend...';panel.appendChild(link);
    link = document.createElement('p');link.textContent='Possible options for work or training depends on available facilities and trainers.';panel.appendChild(link);
    link = document.createElement('hr');panel.appendChild(link);
};
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
        link.textContent=_P.name+':'+_P.job;
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
window.gm.randomizePerson=function(params) {
    let slave=(params&&params.slave)?params.slave:false;
    let _P= new Operator();
    if(slave) { _P.slave=slave; 
        _P.obedience=-70,_P.trust=-70; //todo values depends on race and attitude to humans
    }
    return _P;
};
window.gm.getById=function(array,id) {
    var _id=Number(id),_p;
    for(el of array){
        _p=el;
        if(_p.id===_id) break;
        _p=null;
    }
    return(_p);
}
window.gm.listPerson=function(id){
    var _p,_list,_list2,_AreaJobs=["Hunter","Scout","Scavenger"], panel=$("div#panel")[0];
    _list = window.story.state.City.People;
    _p=window.gm.getById(_list,id);
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