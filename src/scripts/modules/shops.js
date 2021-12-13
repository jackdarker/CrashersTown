"use strict";

window.gm.shop.findWaresToSell = function(TagsAllowed,TagsNotAllowed=[window.gm.ItemTags.Quest]) {
    window.gm.shop.WaresToSell=[];
    let whom =window.gm.player;
    var _ids=whom.Inv.getAllIds();
    var _ids2=whom.Wardrobe.getAllIds();
    for (let el of _ids) {
        let item=whom.Inv.getItem(el);
        if(!item.hasTag(TagsNotAllowed) && item.hasTag(TagsAllowed)) { //filter by tag
            let cost = window.gm.shop.calculateSellPrice(item);
            if(cost) {
                window.gm.shop.WaresToSell.push({item:item,cost:cost});
            }
        }
    }
    for (let el of _ids2) {
        let item=whom.Wardrobe.getItem(el);
        if(!item.hasTag(TagsNotAllowed) && item.hasTag(TagsAllowed)) { //filter by tag
            let cost = window.gm.shop.calculateSellPrice(item);
            if(cost) {
                window.gm.shop.WaresToSell.push({item:item,cost:cost});
            }
        }
    }
};
// Todo depending on shop & gamestate, return list of buyables
window.gm.shop.findWaresToBuy = function(shop) {
    let list = [];
    if(shop==='Mall:GeneralStore') {
        list=[window.gm.ItemsLib['Lube'](),window.gm.ItemsLib['Battery']()];
    } else if("Arena:Shop") {
        list=[window.gm.ItemsLib['HealthPotionSmall'](),window.gm.ItemsLib['HealthPotion'](),
        window.gm.ItemsLib['SpearWodden'](),
        window.gm.ItemsLib['DaggerSteel'](),
        window.gm.ItemsLib['Vaginarium'](),
        window.gm.ItemsLib['Penilium']()
        ];
    }
    let list2 = [];
    for(el of list) {
        let cost = window.gm.shop.calculateBuyPrice(el);
        if(cost) {
            list2.push({item:el,cost:cost});
        }
    }
    window.gm.shop.WaresToBuy = list2;
};
window.gm.shop.calculateSellPrice=function(item) {
    let cost={id:'Money',count:1, for:0};
    if(item.id==='Lube') cost.count=item.price,cost.for=4;
    else if(item.id==='Battery') cost.count=item.price,cost.for=3;
    else {//there might be items with random id
        /*if(item instanceof BracerLeather)*/
        cost.count=item.price,cost.for=1; 
    }
    cost.count = Math.ceil(cost.count*0.25); //
    if(cost.for===0) cost=null;
    return(cost);
};
window.gm.shop.calculateBuyPrice=function(item) {
    let cost={id:'Money',count:1, for:0};
    if(item.id==='Lube') cost.count=item.price,cost.for=4;
    else if(item.id==='Battery') cost.count=item.price,cost.for=3;
    else {//there might be items with random id
        cost.count=item.price,cost.for=1; 
    }
    cost.count = cost.count*2; //todo: special sales price reduction
    if(cost.for===0) cost=null;
    return(cost);
};