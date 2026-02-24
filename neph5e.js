import { CustomHandlebarsHelpers } from "./handlebars.js";
import { Models } from "./models.js";
import { NephilimActor } from "./module/nephilimActor.js";
import { NephilimItem } from "./module/nephilimItem.js";
import { Sheets } from "./sheets.js";
import { Templates } from "./templates.js";

Hooks.once("init", function () {
    
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Actor.documentClass = NephilimActor;
    CONFIG.Actor.dataModels = Models.actors();

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Item.dataModels = Models.items();

    CustomHandlebarsHelpers.register();
    Templates.register();
    Sheets.register();

})