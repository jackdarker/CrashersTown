Another testgame.
Dont use !

### Structure of storydata
twee-files are locatd in project\twee

story.twee contains the standard-entry point
intro.twee contains the start of the game
HUD.twee contains display-functionality like the sidepanels and dialogs
help.twee is for help-content
styles.twee contains some additional css-styles but most of them are defined in dist\css !
debug.twee ontains some debugging and cheat tools

project\twee\locations stores information for the different locations in the game
project\twee\events stores information for dialogs and other things that occur


### Structure of code
"Engine"-Gamecode is located in src/scripts.  
Gamespecific code is located in src/scripts/modules.
F.e. there is an outfit.js that defines common used wardrobe functionality and a outfitS.js that defines the specific wardrobe items.  