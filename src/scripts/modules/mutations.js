"use strict"
window.gm.mutate = window.gm.mutate || {};
/**
 * checks each bodypart for race and calculates race-score (in %)
 * @param {*} char 
 */
window.gm.mutate.calcRacialScore = function(char) { //todo
    /*
    * feral = no hands, 4 legged or other non biped 
    * human
    * horse
    * bunny
    */
}
window.gm.mutate.getScoreHuman = function(char) {
    //human body, human face, legs, arms, tail ignored?
}
window.gm.mutate.getScoreCat = function(char) { //one fct for Lynx/Lion/tiger ?
    //
}
/**
 * modify stats for race-bonus, cat -> better agility
 * @param {*} char 
 * @param {*} scores 
 */
window.gm.mutate.updateRacialBoon = function(char,scores) {
    //remove old RacialBoon
}
///////////////////////////////////////////////////////
window.gm.MutationsLib = window.gm.MutationsLib || {};
/*OBSOLETE window.gm.MutationsLib['vaginaSpermDissolve'] = function (char) {
    let vulva = char.getVagina();
    vulva.removeSperm(2); //todo decay depends on looseness, soulgem absorption??
    let msg='';
    msg+="You can feel some of the cum from your womb dribble down your leg. ";
    let lewdMark=char.Effects.findEffect(effLewdMark.name)[0];
    let pregnancy=char.Effects.findEffect(effVaginalPregnant.name)[0];
    if(pregnancy) {
        if(lewdMark) {
            msg+="More of that precious seed is absorbed by that soulgem growing in you.</br>";
            vulva.removeSperm(2); //todo decay depends on looseness, soulgem absorption??
        } else msg+="But you are pregnant already anyway.</br>"; 
    } 
    if(!pregnancy) {
        pregnancy=char.Effects.findEffect(effVaginalFertil.name)[0];
        if(pregnancy) { 
            //todo random chance according to base-fertility-stat, sperm-fertility, vulva-fertility
            //race-compatibility between father-mother
            if(true || _.random(0,100)>75) {
                msg+="Has your last fling got you impregnated?</br>";
                pregnancy = new effVaginalPregnant();
                pregnancy.data.type=vulva.data.spermtype;
                if(lewdMark) pregnancy.data.type='soulgem'; 
                char.addEffect(pregnancy,effVaginalPregnant.name)
            } else msg+="Hopefully there is nothing to worry about?</br>";
        }
    }    
    if(vulva.data.sperm>0) {
        msg+="There might still be "+window.gm.util.formatNumber(vulva.data.sperm,0)+"ml sperm left.</br>"
    } else msg+="This was possibly the last remains of sperm.</br>";
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
}*/
/* 
 * triggers pregnancy-scene
 */
window.gm.MutationsLib['vaginaPregnancy'] = function (char) {
    let msg='';
    let lewdMark=char.Effects.findEffect(effLewdMark.name)[0];
    let pregnancy=char.Effects.findEffect(effVaginalPregnant.name)[0];
    if(pregnancy) {
        if(lewdMark && pregnancy.data.type==='soulgem') {
            if(pregnancy.data.cycles <=0) {
                pregnancy = new effVaginalFertil();
                char.addEffect(pregnancy,effVaginalFertil.name);
                msg+="A homemade soulgem slips out of your nethers !</br>";
                char.Inv.addItem(window.gm.ItemsLib['TinySoulGem']());
            } else msg+="If you dont provide that soulgem something to feed off, it might absorb some energy from you instead!.</br>";
        } else {
            if(pregnancy.data.cycles <=0) {
                msg+="Congrats, you brought some more "+pregnancy.data.type+" into this world.</br>";
            } else {
                msg+="Your belly is swollen with the spawn of some "+pregnancy.data.type+".</br>"; 
            }
        }
        if(window.story.state._gm.dbgShowMoreInfo) msg+= window.gm.util.formatNumber(pregnancy.data.cycles*pregnancy.data.duration/(60*24),0)+" days to go.";
    } 
    //todo go in heat if fertility-cycle triggers?
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
}
/*
 * also used for buttplug
 */
window.gm.MutationsLib['analPregnancy'] = function (char) {
    let msg='[something is wrong here]';
    let plug = char.Outfit.getItemForSlot('uAnus');
    if(plug) {
        if(plug.style===100) { //todo

        } else {

        }
    }
    /*let pregnancy=char.Effects.findEffect(effAnalPregnant.name)[0]; //todo
    if(pregnancy) {
        if(pregnancy.data.type==='soulgem') {
            if(pregnancy.data.cycles <=0) {
                pregnancy = new effVaginalFertil();
                char.addEffect(pregnancy,effVaginalFertil.name);
                msg+="A homemade soulgem slips out of your nethers !</br>";
                char.Inv.addItem(window.gm.ItemsLib['TinySoulGem']());
            } else msg+="If you dont provide that soulgem something to feed off, it might absorb some energy from you instead!.</br>";
        } else {
            if(pregnancy.data.cycles <=0) {
                msg+="Congrats, you brought some more "+pregnancy.data.type+" into this world.</br>";
            } else {
                msg+="Your belly is swollen with the spawn of some "+pregnancy.data.type+".</br>"; 
            }
        }
        if(window.story.state._gm.dbgShowMoreInfo) msg+= window.gm.util.formatNumber(pregnancy.data.cycles*pregnancy.data.duration/(60*24),0)+" days to go.";
    } */
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
}
window.gm.MutationsLib['swapGender'] = function (char,genderItem) {
    let msg='';
    let penis = char.getPenis();
    let vulva = char.getVagina();
    let style=(penis)?penis.getStyle():((vulva)?vulva.getStyle():'human');
    let newItem =genderItem.factory(style);
    if(newItem.slotUse.includes('bPenis')) {
        if(vulva !==null) {
            window.gm.player.Outfit.removeItem(vulva.id,true);
            msg+= 'You lost your female privats. ';
        }
        if(penis===null) {
            window.gm.player.Outfit.addItem(newItem.factory(style),true);
            msg+= 'Instead a dick sprouts in your nethers.</br>';
        }
    } 
    if(newItem.slotUse.includes('bVulva')) {
        if(penis!==null) {
            window.gm.player.Outfit.removeItem(penis.id,true);
            msg+= 'Your fine penis shrinks down until it is finally completely absorbed in your body. ';
        }
        if(vulva===null) {
            window.gm.player.Outfit.addItem(newItem,true);
            msg+= 'A female opening forms itself in your groin.</br>';
        }
    } 
    if(msg!=='' && char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
}
window.gm.MutationsLib['mutateWolf'] = function (char) {
    let _rnd =_.random(1,100);
    let msg='',_TF="TailWolf";
    if(char.Outfit.countItem(_TF)>0) {
        let item = char.Outfit.getItem("TailWolf");
        if(item.getStyle() !=='wolf') {
            item.setStyle('wolf');
            msg=("Your tail is now a fuzzy bush like that of a wolf.</br>");
        } else {
            let growth = item.growth+0.25;
            let maxGrowth = item.maxGrowth;
            if(growth >= 1) {
                msg+="That tail didnt grow any further.</br>";
            } else {
                item.data.growth=growth;
                msg+="Your bushy tail must have grown and is now "+window.gm.util.formatNumber(growth*maxGrowth,1)+" meter long.</br>";
            }
        }
    } else {
        char.Outfit.addItem(new window.storage.constructors[_TF].factory('wolf'));
        msg+="You have grown a fuzzy tail !</br>";
    }
    _TF = 'FaceWolf';
    let face = char.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bFace);
    let skin = char.Outfit.getItemForSlot(window.gm.OutfitSlotLib.bSkin);
    if(face ===null || face.id !==_TF) {
        char.Outfit.addItem(new window.storage.constructors[_TF].factory('wolf'));
        msg+= "Your face got transformed into a dog-like muzzle.</br>"; 
    } else if(face.getStyle() !=='wolf') {
        face.setStyle('wolf');
        msg+= "Your not so human face got transformed into a dog-like muzzle.</br>"; 
    } else if(skin===null || skin.id !="SkinFur") {
        char.Outfit.addItem(new window.storage.constructors['SkinFur'].factory('wolf'));
        msg+= "A dense coat of fur spreads over your body.</br>";
    }
    if(msg==='') msg= "Your anxiety goes by as you didnt get any more wolflike."
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
window.gm.MutationsLib['mutateCat'] = function(char) {
    let msg='', _TF="TailWolf";
    if(char.Outfit.countItem(_TF)>0) {
        let item = char.Outfit.getItem(_TF);
        if(item.getStyle() !=='cat') {
            item.setStyle('cat');
            msg=("Your tail reshapes itself to a be more cat-like.</br>");
        } else {
            var growth = item.data.growth+0.25;
            var maxGrowth = 2;//window.gm.player.Outfit.getItem("TailWolf").maxGrowth;
            if(growth >= 1) {
                msg=("You already changed to a cat as far as possible.</br>");
            } else {
                item.data.growth=growth;
                msg=("Your tail must have grown and is now "+growth*maxGrowth+" meter long.</br>");
            }
        }
    } else {
        char.Outfit.addItem(new window.storage.constructors['TailWolf'].factory('cat'));
        msg=("You have grown a cat tail !</br>");
    }
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
window.gm.MutationsLib['mutateHorse'] = function(char,magnitude=1) {
    let msg='', bb=window.gm.OutfitSlotLib;
    let fconv =window.gm.util.descFixer(char);
    let base=char.Outfit.getItemForSlot(bb.bBase);//todo bodyparts depends also on feral or anthro body
    let el,slots=[], cnt=0;
    //which part can mutate?
    [bb.bFace,bb.bSkin,bb.bTailBase,bb.bHands].forEach(
        x=>{slots.push({"slot":x,"item":char.Outfit.getItemForSlot(x)})});
    //select a part to mutate, repick if already mutated    
    while(slots.length>0 && cnt<magnitude) {//todo legs,skin,genitals
        el = slots.splice(_.random(0,slots.length-1),1)[0];
        if(el.slot===bb.bTailBase) {
            if(el.item===null) {
                char.Outfit.addItem(window.storage.constructors['TailWolf'].factory('horse'),true);
                msg+=fconv("$[I]$ $[have]$ grown a horse tail !</br>");
                cnt++;
            } else if(el.item.getStyle() !=='horse'|| el.item.id!=='TailWolf') {
                char.Outfit.removeItem(el.item.id,true);
                char.Outfit.addItem(window.storage.constructors['TailWolf'].factory('horse'),true);
                msg+=fconv("$[My]$ tail reshapes itself to a be more horse-like.</br>");
                cnt++;
            } else {
                var growth = el.item.data.growth+0.25;
                var maxGrowth = 2;//window.gm.player.Outfit.getItem("TailWolf").maxGrowth;
                if(growth >= 1) {
                    //msg=("You already changed to a horse as far as possible.</br>");
                } else {
                    el.item.data.growth=growth;
                    msg+=fconv("$[My]$ tail must have grown and is now "+window.gm.util.formatNumber(growth*maxGrowth,1)+" meter long.</br>");
                    cnt++;
                }
            }
        } else if(el.slot===bb.bFace) {
            if(el.item===null) { //grow no face?
            } else if(el.item.getStyle() !=='horse') {
                char.Outfit.removeItem(el.item.id,true);
                char.Outfit.addItem(window.storage.constructors['FaceHorse'].factory('horse'),true);
                msg+=fconv("$[My]$ face transforms into a horse ones.</br>");
                cnt++;
            } 
        } else if(el.slot===bb.bHands) {
            if(el.item===null) { //grow no hands?
            } else if(el.item.getStyle() !=='horse') {
                if(base.id==="BaseHumanoid") {
                    char.Outfit.removeItem(el.item.id,true);
                    char.Outfit.addItem(window.storage.constructors['HandsHuman'].factory('horse'),true);
                    msg+=fconv("$[My]$ hands now look like that of a human but with thick fingernails.</br>");
                } else {
                    char.Outfit.removeItem(el.item.id,true);
                    char.Outfit.addItem(window.storage.constructors['HandsHoof'].factory('horse'),true);
                    msg+=fconv("$[My]$ hands transforms into a horse-like hoves.</br>");
                }
                cnt++;
            }
        }
    }
    if(cnt<magnitude) msg=fconv("$[I]$ already changed to a horse as far as possible.</br>");
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
window.gm.MutationsLib['mutateBunny'] = function(char) {
    let msg='', _TF="TailWolf", style='bunny';
    if(char.Outfit.countItem(_TF)>0) {
        let item = char.Outfit.getItem(_TF);
        if(item.getStyle() !==style) {
            item.setStyle(style);
            msg=("Your tail reshapes itself to a be more bunny-like.</br>");
        } else {
            var growth = item.data.growth+0.25;
            var maxGrowth = char.Outfit.getItem(_TF).maxGrowth;
            if(growth >= 1) {
                msg=("You already changed to a bunny as far as possible.</br>");
            } else {
                item.data.growth=growth;
                msg=("Your tail must have grown and is now "+growth*maxGrowth+" meter long.</br>");
            }
        }
    } else {
        char.Outfit.addItem(new window.storage.constructors['TailWolf'].factory(style));
        msg=("You have grown a small, fluffy bunny tail !</br>");
    }
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
window.gm.MutationsLib['growBreast'] = function(char) {
    let msg='', _TF="BreastHuman";
    if(char.Outfit.countItem(_TF)>0) {
        let item = char.Outfit.getItem(_TF);
        var growth = item.data.growth+0.15; //todo shrinking/increase as parameter?
        var maxGrowth = 3; //todo cupsize dimension?
        if(growth >= 1) {
            msg=("Your milkbags are as big as they can get.</br>");
        } else {
            item.data.growth=growth;
            msg=("Your bust size increased further.</br>");
        }
    } else {
        char.Outfit.addItem(new window.storage.constructors[_TF].factory('human'));
        msg="As you feel up your pecks you notice that they seem to be softer than before !</br>";
    }
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
window.gm.MutationsLib['growVulva'] = function(char) {
    let msg = 'Everything is ok, nothing unusual.</br>', _TF="VulvaHuman";
    if(char.Outfit.countItem(_TF)>0) {
        let item = char.Outfit.getItem(_TF);
        msg ="An unusual feeling lets you move your hand down to your nethers.</br>"
        if(item.data.clitsize>0.9) {
            vulva.data.stretch+=0.5;
            msg+= "Your muff seems to be more loose then before !</br>";
        } else {
            item.data.clitsize+=0.5;
            msg+= "You arent quite sure but could it be possible that your clitoris is larger then before?</br>";
        }
        msg += "</br>"+item.descLong(window.gm.util.descFixer(char))+"</br>";
    }
    if(char===window.gm.player) {
        window.gm.pushDeferredEvent("GenericDeffered",[msg]);
    }
};
//todo grow/shrinkHips