"use strict";
window.gm = window.gm || {};
window.gm.shop = window.gm.shop || {};  //shop functions
//you have to initilaize the wares-list before calling the other functions
window.gm.shop.WaresToSell = [];  //[{item:Bracer, cost:{id:'Money', count:50, for:1}}]
window.gm.shop.WaresToBuy = [];

//dynamically build a link representing a buy option including display of cost and restriction
//count specifys how any items you get for cost
//cbCanBuy points to a function fn(itemid) that returns if can buy {OK:false,msg:'too expensive'} 
//cbPostBuy points to a function fn(itemid) that is called after buying ; 
window.gm.shop.printShopBuyEntry= function(item,cost,cbCanBuy,cbPostBuy=null){
    var desc2=item.name+ 'out of stock</br>';
    var _available = window.gm.player.Inv.countItem(item.id)+window.gm.player.Wardrobe.countItem(item.id); 
    var entry = document.createElement('a');    // entry is a link that will expand to item description
    entry.id=item.id, entry.href='javascript:void(0)';
    var showDesc=function($event){var elmt =document.querySelector("div#"+$event.srcElement.id);
        elmt.innerHTML =item.desc+"</br>";
        elmt.toggleAttribute("hidden");};
    entry.addEventListener("click", showDesc, false);
    var div = document.createElement('div');
    div.id=item.id; div.hidden=true;
    var entryBuy = document.createElement('a'); //entryBuy is a link that actual buys something or shows why not
    entryBuy.id=item.id;entryBuy.href='javascript:void(0)';
    entryBuy.textContent="Buy (got "+_available+")";
    if(cost.for>0) {
        var result = cbCanBuy(item);
        desc2 = item.name+" (x"+cost.for+")";
        if(result.OK===false) {
            entryBuy.textContent="";
            desc2 = desc2 + " "+ result.msg;
        } else {
            desc2+= " "+result.msg;
            var foo = function($event){window.gm.shop.buyFromShop(item,cost,cbPostBuy)};
            entryBuy.addEventListener("click", foo, false);
        }
    }
    entry.textContent=desc2;
    $("div#panel")[0].appendChild(entry);
    $("div#panel")[0].appendChild(entryBuy);
    $("div#panel")[0].appendChild(document.createElement('br'));
    $("div#panel")[0].appendChild(document.createElement('br'));
    $("div#panel")[0].appendChild(div);
  };
  
  //a callback function to check if you can buy something;
  //should return {OK:true,msg:'',postBuy:null} where message will be displayed either as reason why you cannot buy or cost
  //unused because makes it unoverridable ->postboy is {fn:foo, cost:x} where fn points to a function that is called after buying (fn(itemid,x));  
  //this implementation checks: money
  window.gm.shop.defaultCanBuy =function(item,cost){
    var result ={OK:true,msg:''};//, postBuy:null};
    var money= window.gm.player.Inv.countItem(cost.id);
    if(money>=cost.count) {
        result.msg='buy for '+cost.count+'x '+cost.id;
    } else {
        result.OK=false;
        result.msg='requires '+cost.count+'x '+cost.id;
    };
    return(result);
  };
  window.gm.shop.defaultCanSell =function(item,cost){
    var result ={OK:true,msg:''};   //todo check equipped item
    result.msg='sell for '+cost.count+' '+cost.id;
    return(result);
  };
  //requires a <div id='choice'> </div> for displaying bought-message
  window.gm.shop.defaultPostSell =function(item,cost){
    window.gm.player.changeInventory(window.gm.ItemsLib[cost.id](),cost.count);
    $("div#choice")[0].innerHTML='You sold '+ item.name; 
    $("div#choice")[0].classList.remove("div_alarm");
    $("div#choice")[0].offsetWidth; //this forces the browser to notice the class removal
    $("div#choice")[0].classList.add("div_alarm");
  };
  //requires a <div id='choice'> </div> for displaying bought-message
  window.gm.shop.defaultPostBuy =function(item,cost){
    window.gm.player.changeInventory(window.gm.ItemsLib[cost.id](),-1*cost.count);
    $("div#choice")[0].innerHTML='You bought '+ item.name; 
    $("div#choice")[0].classList.remove("div_alarm");
    $("div#choice")[0].offsetWidth; //this forces the browser to notice the class removal
    $("div#choice")[0].classList.add("div_alarm");
  };
  window.gm.shop.cbCanBuyPerverse = function(item,cost,pervcost) {
    var result = window.gm.shop.defaultCanBuy(item,cost);
    if(window.gm.player.Stats.get('corruption').value<pervcost) {
        result.msg += ' ; requires corruption> '+pervcost;
        result.OK=false;
    }
    return(result);
  };
  //this will add item to player; money-deduct or other cost has to be done in cbPostBuy ! 
  window.gm.shop.buyFromShop=function(item, cost,cbPostBuy) {
    window.gm.player.changeInventory(item,cost.for);
    if(cbPostBuy) cbPostBuy(item);
    //window.gm.refreshAllPanel(); dont refresh fullscreen or might reset modified textoutput
    window.gm.refreshSidePanel(); //just update other panels
    renderToSelector("#panel", "listbuy");
  };
  //this will remove item from player; money-deduct or other cost has to be done in cbPostSell ! 
  window.gm.shop.sellToShop=function(item, cost,cbPostSell) {
    window.gm.player.changeInventory(item,-1*cost.for);
    if(cbPostSell) cbPostSell(item);
    //window.gm.refreshAllPanel(); dont refresh fullscreen or might reset modified textoutput
    window.gm.refreshSidePanel(); //just update other panels
    renderToSelector("#panel", "listsell");
  };
  //dynamically build a link representing a sell option including display of cost
  //count defines how many of this item you have to trade in
  window.gm.shop.printShopSellEntry= function(item,cost,cbCanSell,cbPostSell){
    //only items the player has can be sold
    var _available = window.gm.player.Inv.countItem(item.id)+window.gm.player.Wardrobe.countItem(item.id); 
    if(_available<=0) return; 
    var entry = document.createElement('a');
    entry.id=item.id; entry.href='javascript:void(0)';
    var showDesc=function($event){var elmt =document.querySelector("div#"+$event.srcElement.id);
        elmt.innerHTML =item.desc+"</br>";
        elmt.toggleAttribute("hidden");};
    entry.addEventListener("click", showDesc, false);
    var div = document.createElement('div');
    div.id=item.id;
    div.hidden=true;
    var entrySell = document.createElement('a'); //a link where you can sell
    entrySell.id=item.id; entrySell.href='javascript:void(0)';
    entrySell.textContent="Sell (got "+_available+")";
    var desc2 = item.name+" (x"+cost.for+")";
    if(_available>=cost.for) {
        var result = cbCanSell(item);
        if(result.OK===false) {
            entrySell.textContent="";
            desc2 = desc2 + " "+ result.msg;
        } else {
            desc2+= " "+result.msg;
            var foo = function($event){window.gm.shop.sellToShop(item,cost,cbPostSell)};
            entrySell.addEventListener("click", foo, false);
        }
    } else desc2 = desc2 + " not enough items"
  
    entry.textContent=desc2;
    $("div#panel")[0].appendChild(entry);
    $("div#panel")[0].appendChild(entrySell);
    $("div#panel")[0].appendChild(document.createElement('br'));
    $("div#panel")[0].appendChild(document.createElement('br'));
    $("div#panel")[0].appendChild(div);
  };