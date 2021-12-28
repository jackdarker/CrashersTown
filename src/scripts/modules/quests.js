//this holds the definition of all quests; but which quests/ms are active is stored in window.story.state.quests !
window.gm.questDef = window.gm.questDef || {};
{
    let NOP = (function(){  return (0)});
    let hidden = (function(){return(window.gm.quests.getMilestoneState("qLapineMissing").id<100);});
    let quest = new Quest("qLapineMissing","qLapineMissing","qLapineMissing",hidden );
    quest.addMileStone(new QuestMilestone(1,"","",NOP,hidden));
    quest.addMileStone(new QuestMilestone(100,"","The lapines suspect those red-tails have something to do with disappearing people. Some of them live in the hills nort-west from the lapines.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(400,"","Ask around the red-tails if they know something about the lapines.",NOP,hidden));
    quest.addMileStone(new QuestMilestone(500,"","",NOP));
    window.gm.questDef[quest.id]= quest;
}