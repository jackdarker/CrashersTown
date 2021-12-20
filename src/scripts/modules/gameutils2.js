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
            } else {
                link = document.createElement('p');
                link.textContent=_P.name +' is busy as a '+ _P.job+' in '+_J.Area;
                panel.appendChild(link);
                link = document.createElement('a');
                link.href='javascript:void(0)',link.addEventListener("click", function(me){window.gm.exploreAbort(_J2)});
                link.textContent='call '+_P2.name +' back';
                panel.appendChild(link);
            }
        }
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
    var _R,_B = window.gm.BuildingsLib[_id]();
    var link = document.createElement('p');
    link.textContent="Build a "+_id+" within "+_B.cost.time+" days using ";
    var canBuild=true;
    for(el of _B.cost.Resources) {
    _R = window.story.state.City.Resources[el.ResId];
    if(!_R || _R.amount<el.amount) {
        canBuild=false;
    }
    link.textContent+=(el.ResId+':'+el.amount+' of '+((_R===undefined)?"0":_R.amount+" "));
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
    for(el of _B.cost.Resources) {
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
    _list3 =window.story.state.Known;
    _list2 = Object.keys(_list3); //what buildings you know
    var _item='';
    for(el of _list2) {
        switch(el) {
            case 'Farm':
                _item='Farm';
                break;
            case 'Barracks':
                _item='Tent';
                break;
            case 'Slavery':
                _item='SlavePen';
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
//
window.gm.listResources=function() {
    var _list={},_list2;
    _list2 = Object.keys(window.story.state.City.Resources);
    _list2.sort();
    for(el of _list2){
        var _p = window.story.state.City.Resources[el];
        var link = document.createElement('a');
        link.id=_p.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){window.story.state.tmp.args=[me.currentTarget.id];window.story.show('Menu_ResourceInfo');});
        link.textContent=_p.style+':'+_p.amount;
        $("div#panel")[0].appendChild(link);
    }
};
//
window.gm.listSlave=function(id){
    var _p,_list,id=Number(id),panel=$("div#panel")[0];
    _list = window.story.state.City.Slaves;
    for(el of _list){
        _p=el;
        if(_p.id===id) break;
        _p=null;
    }
    if(!_p) return;
    //manuel training
    //or assign trainer
    var link = document.createElement('p');
    link.textContent=_p.name;
    panel.appendChild(link);
    if(_p.jobActive) {
        link.textContent+=' You cant change the job right now !';
    } else { //todo
    }
};
window.gm.listSlaves=function() {
    var _list={},_list2,panel2=$("div#panel2")[0],panel=$("div#panel")[0];;
    _list2 = window.story.state.City.Slaves;
    for(var i=_list2.length-1;i>=0;i--){
        var _p = _list2[i];
        if(_list[_p.job]===undefined) _list[_p.job]=1;
        else _list[_p.job]+=1;
        var link = document.createElement('a');
        link.id=_p.id,link.href='javascript:void(0)',
        link.addEventListener("click", function(me){window.story.state.tmp.args=[me.currentTarget.id,"Slave"];window.story.show('Menu_Person');});
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
window.gm.randomizePerson=function(params) {
        let slave=(params&&params.slave)?params.slave:false;
        let _P= new Operator();
        _P.slave=slave;
        return _P;
    };
window.gm.listPerson=function(id){
    var _p,_list,_AreaJobs=["Hunter","Scout","Scavenger"];
    id=Number(id);
    _list = window.story.state.City.People;
    for(el of _list){
        _p=el;
        if(_p.id===id) break;
        _p=null;
    }
    if(!_p) return;
    var link = document.createElement('p');
    link.textContent=_p.name+' is currently working as '+_p.job;
    $("div#panel")[0].appendChild(link);
    if(_p.jobActive) {
        link.textContent+=' You cant change the job right now !';
    } else {
    //todo list possible jobs depending on training and open position
        _list = Object.keys(Operator.Job);
        for(el of _list){
            link = document.createElement('a');
            link.href='javascript:void(0)';
            const job=el;
            link.addEventListener("click", function(me){_p.job=job;window.story.show('Menu_Person');});  //todo confirmation popup
            link.id=el,link.textContent='change to '+el;
            if(_AreaJobs.includes(el)) link.textContent+="(requires assigned Area in Exploration-Menu)"
            $("div#panel")[0].appendChild(link);$("div#panel")[0].appendChild(document.createElement("br"));
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