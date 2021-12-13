//todo UNUSED
/**
     * standfaceback
     * standfaceface
     * doggystyle
     * doggystyle3some
     * missionary|mf
     * cowgirl|fm
     * spoon|mf
     * kneelfaceface
     * 69
     */
/*window.gm.sex.fuck = function(style, setup) {
    //style defines number of involved chars and how to interact
    //order of chars defines theire role in position f.e. CharA is giving,CharB is receiving
    //addtional modifiers
    //style = '69|m,m', setup=[{Char:Player},{Char:Carlia}] 
    //m = cock  a=anal f= vagina, o =oral
    let option = style.split('|');
    let genders = option[1].split(',');
    let count =2; //how many partakers expected
    if(option[0]==='doggystyle3some'){

    }
    if(setup.length<count || genders.length<count) throw new Error("requires more parttakers");
    let tools = [];
    let tool;
    for(var i=0;i<count-1;i++) {
        if(genders[i]==='m') {
            tool = setup[i].Char.Outfit.getItemId("bPenis");
        } else if (genders[i]==='f') {
            tool = setup[i].Char.Outfit.getItemId("bVulva");
        } else {
            tool = setup[i].Char.Outfit.getItemId("bAnus");
        }
        tools.push(tool);
    }
    //deposit

    
}*/
/**
 * this is a collection of programatic sex-scenes for use after combat defeat/victory
 * It is easier to debug logic in js then in the passage-code
 */
window.gm.sex = window.gm.sex||{};
/**
 * create and append a button on choice panel
 * @param {*} label 
 * @param {*} foo 
 */
window.gm.sex.createButton=function(label,foo) {
    let link;
    link = document.createElement('a');
    link.href='javascript:void(0)';
    link.addEventListener("click", function(){foo();});
    link.textContent=label;
    $("div#choice")[0].appendChild(link);
};
//cleans up choice-list
window.gm.sex.beginScene=function(){
    for(var i=$("div#choice")[0].childNodes.length-1;i>=0;i-- ) {
        $("div#choice")[0].removeChild($("div#choice")[0].childNodes[i]);
    }
};
//add scenedescription to panel
window.gm.sex.updateScene=function(entry){
    $("div#panel")[0].appendChild(entry); 
};
/*
* calculates which of the generic scenes can play after a battle
*/
/*window.gm.sex.setupPostBattleScene = function(battleResult,sexsceneCB,extra) {
    let s=windows.story.state;
    //s.combat.playerParty  detect scene by available actors?
    let data = {state:0 , battleResul:battleResult, player:s._gm.activePlayer }; //data should not contain objects beause using object.assign!
    data.foes = [];
    for(el of s.combat.enemyParty)
    {
        data.foes.push(String.toLowerCase(el.id));
    }
    data.foes.sort();

}*/
window.gm.sex.wolfOnPlayer=function(data) {
    let foo = window.gm.sex.wolfOnPlayer; //each button-click will call this sm again and switch state
    let player = window.gm.player, foe = window.story.state.combat.enemyParty[0]; //todo
    window.gm.sex.beginScene();
    let entry = document.createElement('p');
    let createButton=window.gm.sex.createButton;
    let newdata = {};//need a copy to create different data-values
    if(data.state<0) { //quit if scene is done
        if(data.battleResult==='victory') window.gm.postVictory(); //todo flee, submit, defeat
        else window.gm.postDefeat();
        return;
    } else if(data.state===0) { //start-menu
        if(data.battleResult==='victory') {
            if(player.Stats.get('arousal').value>40) {
                entry.textContent ="The beast is quite in the mood to fool around. | You need some hard wolfcock right now. ";
                //detect gender,.. -> available position;
                if(player.getPenis()) {
                    data.state='plDomPosSelect';
                    if(foe.getVagina()) {
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Mount Her';
                        createButton(newdata.position,foo.bind(null,newdata));
                    } 
                }
                if(foe.getPenis()) {
                    data.state='plSubPosSelect';
                    newdata = {},Object.assign(newdata,data);
                    newdata.position = 'Straddle Him';
                    createButton(newdata.position,foo.bind(null,newdata));
                    newdata = {},Object.assign(newdata,data);
                    newdata.position = 'On all 4';
                    createButton(newdata.position,foo.bind(null,newdata));
                }
            } else entry.textContent ="You arent horny enough"; 

            newdata = {},Object.assign(newdata,data);
            newdata.state=-1;
            createButton('Walk away',foo.bind(null,newdata));
        } else {
            entry.textContent ="The creature isnt interested in you."; //Todo
            data.state=-1;
            createButton('Pass out',foo.bind(null,data));
        }
    } else if(data.state==='plDomPosSelect') { //player topping
        if(data.position==='Mount Her') {
            entry.textContent ="You strip of your gear and crawl up behind her.";
        }
        entry.textContent += "Lets see what your option are."
        //detect available holes and let select
        data.state='plDomHoleSelect';
        Object.assign(newdata,data);
        newdata.hole = "anal";
        createButton(newdata.hole,foo.bind(null,newdata));
        if(foe.getVagina()) {
            newdata = {},Object.assign(newdata,data);
            newdata.hole = "vaginal";
            createButton(newdata.hole,foo.bind(null,newdata));
        }
    } else if(data.state==='plSubPosSelect') { //ride foe
        if(data.position==='On all 4') {
            entry.textContent ="You strip of your gear and drop down on knees and hands.";
        } else {
            entry.textContent ="Rolling the big,bad wuff on its back, you climb on top of it, straddeling him with your naked body.";
        }
        entry.textContent += "The question now is, which of your holes would you like to get filled?"
        //detect available holes and let select
        data.state='plSubHoleSelect';
        Object.assign(newdata,data);
        newdata.hole = "anal";
        createButton(newdata.hole,foo.bind(null,newdata));
        if(player.getVagina()) {
            newdata = {},Object.assign(newdata,data);
            newdata.hole = "vaginal";
            createButton(newdata.hole,foo.bind(null,newdata));
        }
    } else if(data.state==='plDomHoleSelect') {
        entry.textContent ="You press hard into that wolf-bitchs "+data.hole+" hole.";
        data.state='plDomOrgasm';
        Object.assign(newdata,data);
        createButton("Rile her",foo.bind(null,newdata));
    } else if(data.state==='plDomOrgasm') {
        entry.textContent ="You unload your jizzm into that hot wolf-hole."
        if(data.hole==='vaginal') {
            foe.getVagina().addSperm('wolf',3);
        } else if(data.hole==='anal') {         //todo insert sperm in hole
        }
        data.state=-1;
        Object.assign(newdata,data);
        createButton("Next",foo.bind(null,newdata));
    } else if(data.state==='plSubHoleSelect') {
        entry.textContent ="The wolf mounts you and drills into your "+data.hole+" opening.";
        // Surprised, you find your comrade has grown a large lump at the base of its cock that now bumps against your entrance.
        // to late you notice that his knot is already swelling in your thight orifice. You wouldnt be able to dislodge unless he gets his rocks off.
        data.state='plSubOrgasm';
        Object.assign(newdata,data);
        createButton("Take it",foo.bind(null,newdata));
    } else if(data.state==='plSubOrgasm') {
        entry.textContent ="Wolf-jizzm is painting your insides white.";  //Unfortunatly, the stud came before you did -- 
        if(data.hole==='vaginal') {
            player.getVagina().addSperm('wolf',3);
        } else if(data.hole==='anal') {         //todo stretch hole with knot
            player.getAnus().addSperm('wolf',3);
        }
        data.state=-1;
        Object.assign(newdata,data);
        createButton("Pass out",foo.bind(null,newdata));
    }
    window.gm.sex.updateScene(entry); 
};
window.gm.sex.succubusOnPlayer=function(data) { //todo
    let foo = window.gm.sex.dryadOnPlayer;
    let player = window.gm.player;
    let foe = window.story.state.combat.enemyParty[0]; //todo
    window.gm.sex.beginScene();
    let entry = document.createElement('p');
    let createButton=window.gm.sex.createButton;
    let newdata = {};//need a copy to create different data-values
    if(data.state<0) { //quit if scene is done
        if(data.battleResult==='victory') window.gm.postVictory(); 
        else window.gm.postDefeat(); //todo flee, submit, defeat
        return;
    } else if(data.state===0) { //start-menu
        if(data.battleResult==='victory') {
            if(player.Stats.get('arousal').value>40) {
                entry.textContent ="How about we get to know each other better?";
                //detect gender,.. -> available position;
                if(player.getPenis()) {
                    data.state='plDomPosSelect';
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Mount Her';
                        createButton(newdata.position,foo.bind(null,newdata));
                }
            } else entry.textContent ="You arent horny enough"; 
            newdata = {},Object.assign(newdata,data);
            newdata.state=-1;
            createButton('Walk away',foo.bind(null,newdata));
        } else {
            entry.textContent ="The succubus strides over to your defeated form.</br> \"Lets see what we have here...\"</br>";
            data.state='plSubOrgasm';
            createButton('Get Dommed',foo.bind(null,data));
        }
    } else if(data.state==='plSubOrgasm') {
            entry.textContent ="serving the Succubus";
            data.state=-1;
            Object.assign(newdata,data);
            createButton("Pass out",foo.bind(null,newdata));
        }
        window.gm.sex.updateScene(entry); 
    /**
     * 
     */
};
window.gm.sex.dryadOnPlayer=function(data) { //todo
    let foo = window.gm.sex.dryadOnPlayer,createButton=window.gm.sex.createButton;;
    let player = window.gm.player,foe = window.story.state.combat.enemyParty[0]; //todo
    window.gm.sex.beginScene();
    let entry = document.createElement('p');
    let newdata = {};//need a copy to create different data-values
    if(data.state<0) { //quit if scene is done
        if(data.battleResult==='victory') window.gm.postVictory(); //todo flee, submit, defeat
        else window.gm.postDefeat();
        return;
    } else if(data.state===0) { //start-menu
        if(data.battleResult==='victory') {
            if(player.Stats.get('arousal').value>40) {
                entry.textContent ="How about we get to know each other better?";
                //detect gender,.. -> available position;
                if(player.getPenis()) {
                    data.state='plDomPosSelect';
                    if(foe.getVagina()) {
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Mount Her';
                        createButton(newdata.position,foo.bind(null,newdata));
                    } 
                }
            } else entry.textContent ="You arent horny enough"; 

            newdata = {},Object.assign(newdata,data);
            newdata.state=-1;
            createButton('Walk away',foo.bind(null,newdata));
        } else {
            entry.textContent ="She isnt interested in you.";
            data.state=-1;
            createButton('Pass out',foo.bind(null,data));
        }
    } else if(data.state==='plSubOrgasm') {
            entry.textContent ="Wolf-jizzm is painting your insides white.";  //Unfortunatly, the stud came before you did -- 
            if(data.hole==='vaginal') {
                player.getVagina().addSperm('wolf',3);
            } else if(data.hole==='anal') {         //todo insert sperm in hole
            }
            data.state=-1;
            Object.assign(newdata,data);
            createButton("Pass out",foo.bind(null,newdata));
        }
        window.gm.sex.updateScene(entry); 
    /**
     * dryads are female but their tendrils can be fill you up quite well
     * They produce some kind of sap that is very regenerative but might also make you their slave
     * 
     * Just before the dryad is able to vanish into her tree, you grab er around her waist and pull her away. Her struggles are meek.
     * [Let her go]
     * 
     * [Fondle Breast]
     * 
     * Plunging in her sodden snatch you dont' notice that some vines made her way toward you.
     */
};
window.gm.sex.lizanOnPlayer=function(data) { //todo
    //I savenged this from CoC :O
    let foo = window.gm.sex.lizanOnPlayer,createButton=window.gm.sex.createButton;;
    let player = window.gm.player,foe = window.story.state.combat.enemyParty[0]; //todo
    window.gm.sex.beginScene();
    let entry = document.createElement('p');
    let newdata = {};//need a copy to create different data-values
    if(data.state<0) { //quit if scene is done
        if(data.battleResult==='victory') window.gm.postVictory(); //todo flee, submit, defeat
        else window.gm.postDefeat();
        return;
    } else if(data.state===0) { //start-menu
        if(data.battleResult==='victory') {
            if(player.Stats.get('arousal').value>40) {
                entry.textContent ="You wonder what you should do to the lizan.";
                //detect gender,.. -> available position;
                if(player.getVagina()) {
                    data.state='plDomPosSelect';
                    if(foe.getPenis()) {
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Get your pussy plowed';
                        newdata.yourTool='vagina';newdata.foeTool='penis';
                        createButton(newdata.position,foo.bind(null,newdata));
                    } 
                }
                if(player.getPenis()) {
                    data.state='plDomPosSelect';
                    newdata = {},Object.assign(newdata,data);
                    newdata.position = 'Rail his ass';
                    createButton(newdata.position,foo.bind(null,newdata));
                }
            } else entry.textContent ="You arent in the mood right now."; 

            newdata = {},Object.assign(newdata,data);
            newdata.state=-1;
            createButton('Walk away',foo.bind(null,newdata));
        } else { //defeat
            entry.textContent ="He isnt interested in you."; //todo
            data.state=-1;
            createButton('Pass out',foo.bind(null,data));
        }
    } else if(data.state==='plDomPosSelect') { //player topping
        if(data.position==='Get your pussy plowed') {
            entry.textContent ="With a grin you slip off your garments, the lizan doesn’t fight it in the least. In fact as you shove him onto his back he breathes a sigh of relief. Despite your having beaten him he is obviously quite attracted to you.";
            entry.textContent += "</br>He groans when you grab his twin peckers and inspect them. Each irregularly patterned bump is mirrored on its counterpart, like two sexy phallic twins. They grow hard in your hand. With a grin you look up into his face and watch his sexual attraction war with his lofty morals.He groans when you grab his twin peckers and inspect them. Each irregularly patterned bump is mirrored on its counterpart, like two sexy phallic twins. They grow hard in your hand. With a grin you look up into his face and watch his sexual attraction war with his lofty morals.";
            entry.textContent += "</br></br>When you straddle him with his lizan dicks pointed up at your [vagina] you look down into his eyes and watch as your body causes his lust to win the war.";
            //if (player.looseness(true) < 2) {
            entry.textContent += "</br>With a deep breath you descend, engulfing only one of his purple dicks. The sensation of your [vagina] being spread open by his cock his like an electric wave of tingling ecstasy. Below you the lizan cringes, eyes wide as he feels how tight you are. You revel in the power you have over him. Soon his hands slide onto your hips and he begins thrusting up into your [pussy]."
            //player.cuntChange(24, true, true, true);
            entry.textContent += "</br>You sit upon a living throne of hot flesh. Your lust crazed servant worships your body with his hands and mouth, grinding his cock around inside your [pussy]. You can barely stand the way the large organ swirls around inside you, so deep inside you as it stretches your vaginal walls wide open. Yet you endure the mind numbingly intense sensations because a true monarch would never abdicate [his] throne."
            //todo add logic here
            //} else if (player.looseness(true) < 4) {
            //entry.textContent += "</br>With a sigh, you descend, engulfing one of his bumpy purple dicks. The tingling feeling of fullness hits you as one cock slides up into your [vagina] while the other slides against your [asshole]. Below you the lizan cringes, eyes wide as he you slowly ride him. You watch a war of emotions stream across his face. Disbelief rages against desire, pride slowing loses to lust. Soon all the right emotions prove victorious as a decision is made. Two scaled hands slide onto your waist as he begins thrusting up into your [pussy]."
            //player.cuntChange(24, true, true, true);
            //entry.textContent += "</br>You smile upon your living throne of hot flesh. Your lust crazed servant worships your body with his hands and mouth as he grinds around inside your [pussy]. His lips suck your [chest] one nipple at a time as his hands rub and massage your body. Chest to chest he serves you like the monarch you are."				
            //}	else {
            //entry.textContent += "</br>With a grin you press both of his lizan cocks together and descend, engulfing them both. Inside you feel blissfully full, your very experienced [vagina] more than able to take the combined girths. Beneath you the lizan’s entire being cringes with disbelief. His breaths are ragged, his voice on edge as he says, “Gods give me strength.” Then the war of emotions begins. His face contorts as duty and pride struggle valiantly against desire. You squeeze his dicks together and the tide turns. His hands slide onto your hips and he thrusts upward, eyes flooded with desire."
            //player.cuntChange(48, true, true, true);
            //entry.textContent += "</br>You grin in triumph as you sit upon your living throne of hot flesh. Your lust crazed servant worships your body with hand and mouth as he grinds his dual peckers around inside your [pussy]. Eager lips suck your [nipples] one at a time as his hands rub and massage your body. Chest to chest he gets lost in your regal splendor, serving you like the monarch you are.");
            //}
        }
        data.state='plDomOrgasm';
        Object.assign(newdata,data);
        createButton("FUCK",foo.bind(null,newdata));
    } else if(data.state==='plDomOrgasm') {
        entry.textContent ="</br>You take control, your hips swirling as you bounce up and down. The mind numbing pleasure of your ride is just what you need. Beneath you the lizan gasps and trembles. He holds on for dear life as you ride him hard.";
		//if (player.hasCock()) outputText("\n\nThen you feel an unexpected wetness. Looking down you watch your servant open his mouth and lick your [cock] again. The trembling lizan tastes you, kissing your [cockHead] and nibbling at its belly. Then he looks up and kisses you and you taste your [cock] on his lips."
        entry.textContent +="</br>His voice comes out in a hoarse groan as he begins to tremble. You’re riding him as hard as you can now, making him babble like a mad man. His arms hold you tightly as he buries his face in your [fullChest]. You keep up the pressure and soon a strangled cry rises from your servant as heat blooms inside of you. The feeling pushes you over the edge and you erupt, flooding his ejaculating cocks with your vaginal fluids. ";
        //entry.textContent +=(player.hasCock() ? "Meanwhile, your cock is spurting hot seed into your combined chests." : "");      
        if(data.yourHole==='vagina' && data.foeTool==='penis') {
            player.getVagina().addSperm('lizard',3);
        } 
        entry.textContent +="</br></br>You leave the passed out lizan where he lies, covered in your combined sexual fluids. You raid his pack and leave.";
        data.state=-1;
        Object.assign(newdata,data);
        createButton("Get on your way",foo.bind(null,newdata));
    } else if(data.state==='plSubOrgasm') {
            if(data.yourHole==='vagina' && data.foeTool==='penis') {
                player.getVagina().addSperm('lizard',3);
            } 
            data.state=-1;
            Object.assign(newdata,data);
            createButton("Pass out",foo.bind(null,newdata));
    }
    window.gm.sex.updateScene(entry); 
};
window.gm.sex.lapineOnPlayer=function(data) { //todo
    let foo = window.gm.sex.lapineOnPlayer,createButton=window.gm.sex.createButton;;
    let player = window.gm.player,foe = window.story.state.combat.enemyParty[0]; //todo
    window.gm.sex.beginScene();
    let entry = document.createElement('p');
    let newdata = {};//need a copy to create different data-values
    if(data.state<0) { //quit if scene is done
        if(data.battleResult==='victory') window.gm.postVictory(); //todo flee, submit, defeat
        else window.gm.postDefeat();
        return;
    } else if(data.state===0) { //start-menu
        if(data.battleResult==='victory') {
            if(player.Stats.get('arousal').value>40) {
                entry.textContent ="\'Lets see what we have here\'.";
                //detect gender,.. -> available position;
                if(player.getVagina()) {
                    data.state='plDomPosSelect';
                    if(foe.getPenis()) {
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Get your pussy plowed';
                        newdata.yourTool='vagina';newdata.foeTool='penis';
                        createButton(newdata.position,foo.bind(null,newdata));
                    } 
                }
                if(player.getPenis()) {
                    data.state='plDomPosSelect';
                    newdata = {},Object.assign(newdata,data);
                    newdata.position = 'Rail her ass';
                    createButton(newdata.position,foo.bind(null,newdata));
                    if(foe.getVagina()) {
                        newdata = {},Object.assign(newdata,data);
                        newdata.position = 'Use her snatch';
                        newdata.yourTool='penis';newdata.foeTool='vagina';
                        createButton(newdata.position,foo.bind(null,newdata));
                    }
                }
            } else entry.textContent ="You arent in the mood right now."; 

            newdata = {},Object.assign(newdata,data);
            newdata.state=-1;
            createButton('Walk away',foo.bind(null,newdata));
        } else { //defeat
            entry.textContent ="She isnt interested in you."; //todo
            data.state=-1;
            createButton('Pass out',foo.bind(null,data));
        }
    } else if(data.state==='plDomPosSelect') { //player topping
        if(data.position==='Rail her ass') {
            entry.textContent ="TODO bunny stuffing";
        } else if('Use her snatch') {
            entry.textContent ="TODO stretch her hole";
        }
        data.state='plDomOrgasm';
        Object.assign(newdata,data);
        createButton("FUCK",foo.bind(null,newdata));
    } else if(data.state==='plDomOrgasm') {
        entry.textContent ="</br>You take control, your hips swirling as you bounce up and down. The mind numbing pleasure of your ride is just what you need. Beneath you the lizan gasps and trembles. He holds on for dear life as you ride him hard.";
		//if (player.hasCock()) outputText("\n\nThen you feel an unexpected wetness. Looking down you watch your servant open his mouth and lick your [cock] again. The trembling lizan tastes you, kissing your [cockHead] and nibbling at its belly. Then he looks up and kisses you and you taste your [cock] on his lips."
        entry.textContent +="</br>His voice comes out in a hoarse groan as he begins to tremble. You’re riding him as hard as you can now, making him babble like a mad man. His arms hold you tightly as he buries his face in your [fullChest]. You keep up the pressure and soon a strangled cry rises from your servant as heat blooms inside of you. The feeling pushes you over the edge and you erupt, flooding his ejaculating cocks with your vaginal fluids. ";
        //entry.textContent +=(player.hasCock() ? "Meanwhile, your cock is spurting hot seed into your combined chests." : "");      
        if(data.yourHole==='vagina' && data.foeTool==='penis') {
            player.getVagina().addSperm('lapine',3);
        } 
        entry.textContent +="</br></br>Unwrappig yourself from the exhausted bunny, you get ready to leave.";
        data.state=-1;
        Object.assign(newdata,data);
        createButton("Get on your way",foo.bind(null,newdata));
    } else if(data.state==='plSubOrgasm') {
            if(data.yourHole==='vagina' && data.foeTool==='penis') {
                player.getVagina().addSperm('lapine',3);
            } 
            data.state=-1;
            Object.assign(newdata,data);
            createButton("Pass out",foo.bind(null,newdata));
    }
    window.gm.sex.updateScene(entry); 
};
/**
 * :: HuntressSubmit
"You are a worthy opponent. Lets see if you have some stamina left."
She is stradeling your prone form. Gyrating her hips around, she guides your hard pecker between her wet folds. After she grows tired on teasing you and herself, she plunges dowm, engulfing your rigid member in one smooth stroke.
Riding you like a pro, you have considerable difficulty to not just shoot your load into her.    
"I dare you, if you cum before I do, I will cut your pecker of. "


:: HuntressVictory
Give her her own poison | Grabing some rope you carry with you, you tie the fierce female face first against a tree.
Undo her leathers.

Give her some spanking

Tease her cunt

Ravage her vaginally

"Lets sate that appetite of yours."
...
Take it all in slut. I hope you bear some big soulgems for me when I met you again.
 */


