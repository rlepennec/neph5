import { CustomHandlebarsHelpers } from "./handlebars.js";
import { Models } from "./models.js";
import { NephilimItem } from "./module/item/nephilimItem.js";
import { Sheets } from "./sheets.js";
import { Templates } from "./templates.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Item.dataModels = Models.data();

    CustomHandlebarsHelpers.register();
    Templates.register();
    Sheets.register();

})