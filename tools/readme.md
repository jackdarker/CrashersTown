svgtojs bundles svg-files into script-files that is placed in dist-directory.
You need to edit src/head-content.html to add those scripts to html-header and call their load-function to get the data.

For maps:
- the game adds/removes classes from the svg-nodes; dont assign styles to the elements, only classes or this would conflict
- following classes are used (see also gamecode):
playerPosition:  to show where the player is; for this to work the svg-node-id has to match the passage-name in the game!
roomFound: normal display of a room, will be replaced with playerPosition
roomNotFound: used together with data-reveal to hide parts of the map; should be setup to "display:none" to completely hide the part
- following attributes are used:
- data-reveal: a hexcode ; the printMap-function can be called with a reveal-bitmask. Only parts of the map that have at least one matching bit or dont have the attribute will be revealed

For battlers:
- the game can hide nodes from the svg depending on battler-data
- following attributes are used:
data-male: if the attribute is present and the battler doesnt have a penis, the node is hidden
data-female: if the attribute is present and the battler doesnt have a vagina, the node is hidden
data-arousal: specify 2 integers separated by comma; if the arousal of the battler not in between those values, the node is hidden
data-damage: ??
data-cloth: ?? 
