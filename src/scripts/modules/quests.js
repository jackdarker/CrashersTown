//this holds the definition of all quests; but which quests/ms are active is stored in window.story.state.quests !
window.gm.questDef = window.gm.questDef || {};
{
    let quest = new Quest("qFindGarden","Find the garden","The Garden is somewhere around the house.");
    let mile1 = new QuestMilestone(1,"Find the garden","You heard rumors that there is a garden behind the house.Find it.",
        //each milestone should define a function that checks if the milestone is fullfilled or not or if no more milestones
        function(){ 
          if(window.passage.name==="Garden") {
            return(100);
          }
          else return (0);
        });
    let mile2 = new QuestMilestone(100,"Found the garden","Congratulation. You found the garden.",
        function(){ return(-1)});
    quest.addMileStone(mile1);
    quest.addMileStone(mile2);
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let quest = new Quest("qFixLaptop","Upgrade your Laptop","");
    quest.addMileStone(new QuestMilestone(1,"","The powerconverter for your laptop should be somewhere around in the house. ",
    NOP));
    quest.addMileStone(new QuestMilestone(1000,"","The Laptop is working.",
    NOP));
    // install webcam
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let quest = new Quest("qStudy","Do some studying","Do something for your success at university.");
    quest.addMileStone(new QuestMilestone(1,"","Sitting down and reading a book might get you some knowledge.",    NOP));
    quest.addMileStone(new QuestMilestone(100,"","At least you feel a little smarter now.",     function(){ return(-1)}));
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qMyPleasure").id<100);});
    let quest = new Quest("qMyPleasure","Pleasure yourself","Pleasure yourself.",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Rub yourself.",    NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","You created a mess in your bedsheets.",
        function(){ return(-1)}));
    window.gm.questDef[quest.id]= quest;
}{
    //quest-flag counts the shifts done in week
    let NOP = (function(){  return (0)});
    let quest = new Quest("qFindAJob","Find a job","Somehow you have to make a living.");
    quest.addMileStone( new QuestMilestone(1,"","Maybe you can ask around or check the blackboard at the uni for some offers.",    NOP));
    quest.addMileStone( new QuestMilestone(100,"","You've got that job-ad from Harcon Health Inc that is somewhere in downtown. Maybe you could inquire there whats up with it.",NOP));
    quest.addMileStone( new QuestMilestone(200,"","They offered you to work in logistic department. You will move boxes and crates around for little money but at least its a start. Check your job-schedule",NOP));
    quest.addMileStone( new QuestMilestone(300,"","???",  NOP));
    window.gm.questDef[quest.id]= quest;
}//////////////////////////////////////////////////////////////////////////////////////
{   // the quest keeps track of the VR-Game main development
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qDLCMain").id<100);});
    let quest = new Quest("qDLCMain","qDLCMain","qDLCMain",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Sign betatestcontract.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","It will take some days until the game-equipment arrives. Spent some time studying or working.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(500,"","Setup VR-equipment.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(600,"","Enter the game.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(700,"","Get to the settlement.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(800,"","Ask around for a quest.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(900,"","Finish the PurpleBerryQuest.",NOP));
    quest.addMileStone(new QuestMilestone(1000,"","Get past that bridge and find your way to the village",  NOP)); //<--
    quest.addMileStone(new QuestMilestone(1100,"","Ask around in the village for help with that collar.",  NOP));
    quest.addMileStone(new QuestMilestone(1200,"","Someone called \"Librarian\" might be found in ruins north of plains",  NOP));
    window.gm.questDef[quest.id]= quest;
}{   // the quest tracks death for tutorial
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qDiedAgain").id<0);});
    let quest = new Quest("qDiedAgain","qDiedAgain","qDiedAgain",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Life is a game.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(2,"","Find your first death.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","Die with some bonded equipment.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(200,"","Die by pleasure.",NOP,hidden));   //todo what if this is before previous?
    quest.addMileStone(new QuestMilestone(300,"",".",NOP,hidden));
    window.gm.questDef[quest.id]= quest;
}{   //
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(false);});
    let quest = new Quest("qPurpleBerry","qPurpleBerry","qPurpleBerry",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Search the forest for 5 handful of purple berrys and deliver them to the alchemist.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","You delivered the berries to the alchemist.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(200,"","Find 4 purple berrys, 2 apoca-blossoms, 2 leeches.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(300,"","Fetch the potion from the alchemist.",NOP,hidden));
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qCarlia").id<100);});
    let quest = new Quest("qCarlia","Carlia","Carlia",hidden );
    quest.addMileStone(new QuestMilestone(1,"","",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","A strange individual is stalking you.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(200,"","That stalker was eying you again. He was disappearing into the cliffs direction.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(300,"","There were some footprint at the cliff that led you to a concealed path.",  NOP));
    quest.addMileStone(new QuestMilestone(400,"","Someone setup a camp in a cave entrance. Maybe you an find some clues there.",  NOP));
    quest.addMileStone(new QuestMilestone(500,"","Pooking around in other peoples stuff got you a \"present\".",  NOP));
    quest.addMileStone(new QuestMilestone(600,"","The stalker didnt care to hide any longer and accused you of thievery.",  NOP));
    quest.addMileStone(new QuestMilestone(700,"","Try to convince her that she can trust you by finding her a home.",  NOP));
    quest.addMileStone(new QuestMilestone(800,"","Tell Carlia that the Alchemist aggreed to let Carlia sleep in his hut.",  NOP));
    quest.addMileStone(new QuestMilestone(900,"","For your help Carlia showed you a new \'skill\'.",  NOP));
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qWolfMate").id<100);});
    let quest = new Quest("qWolfMate","qWolfMate","qWolfMate",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Saw a wolf.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(400,"","Is that wolf stronger than you? Lets find out.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(500,"","",  NOP));
    window.gm.questDef[quest.id]= quest;
}{   // 
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qBondageKink").id<100);});
    let quest = new Quest("qBondageKink","qBondageKink","qBondageKink",hidden );
    quest.addMileStone(new QuestMilestone(1,"","qBondageKink",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","You got some collar on your neck. Find someone that can check on that.",        NOP,hidden));
    quest.addMileStone(new QuestMilestone(200,"","The alchemist suggested to search for help in the next town. The road along the bridge should lead there.",      NOP,hidden));
    quest.addMileStone(new QuestMilestone(300,"","You found the bridge on your route blocked by a bully. Get rid of him.",      NOP,hidden));
    quest.addMileStone(new QuestMilestone(400,"","Find your way past the bridge to the town.",      NOP,hidden));
    quest.addMileStone(new QuestMilestone(500,"","...",      NOP,hidden));
    window.gm.questDef[quest.id]= quest;
}{
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qBeastKink").id<100);});
    let quest = new Quest("qBeastKink","BeastKink","Humans are fun to fool around with. But how about beasts.",hidden );
    quest.addMileStone(new QuestMilestone(1,"","Beasts have sex too.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(400,"","SEEING is BELIEVING. Catch someone having intercourse with animal.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(500,"","Find some infos about mating habits of dogs.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(600,"","Maybe you can find a dog or other canine and play with him.",  NOP));
    window.gm.questDef[quest.id]= quest;
}