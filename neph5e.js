import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";

import { NephilimItem } from "./module/item/entity.js";

import { AlchimieData } from "./feature/alchimie/item/alchimie.mjs";
import { AlchimieSheet } from "./feature/alchimie/item/alchimie.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;

    CONFIG.Item.dataModels = {
        alchimie: AlchimieData,
    }

    Handlebars.registerHelper({
        concat: CustomHandlebarsHelpers.concat,
        isNull: CustomHandlebarsHelpers.isNull,
        nonNull: CustomHandlebarsHelpers.nonNull,
        select: CustomHandlebarsHelpers.select,
        getItem: CustomHandlebarsHelpers.getItem,
        loop: CustomHandlebarsHelpers.loop,
        log: CustomHandlebarsHelpers.log,
        html: CustomHandlebarsHelpers.html,
        includes: CustomHandlebarsHelpers.includes,
        sum: CustomHandlebarsHelpers.sum,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getLevel: CustomHandlebarsHelpers.getLevel,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getNextCost: CustomHandlebarsHelpers.getNextCost,
        isEmptyCollection: CustomHandlebarsHelpers.isEmptyCollection,
        isEmptyString: CustomHandlebarsHelpers.isEmptyString,
        isContact: CustomHandlebarsHelpers.isContact,
        cercles: CustomHandlebarsHelpers.cercles,
        focus: CustomHandlebarsHelpers.focus,
        numberOfFocus: CustomHandlebarsHelpers.numberOfFocus,
        sciences: CustomHandlebarsHelpers.sciences,
        savoir: CustomHandlebarsHelpers.savoir,
        laboratoryOwner: CustomHandlebarsHelpers.laboratoryOwner,
        constructOf: CustomHandlebarsHelpers.constructOf,
        getMaxBaseMP: CustomHandlebarsHelpers.getMaxBaseMP,
        getMaxFinalMP: CustomHandlebarsHelpers.getMaxFinalMP,
        science: CustomHandlebarsHelpers.science,
        fraterniteBonus: CustomHandlebarsHelpers.fraterniteBonus,
        getSystemOption: CustomHandlebarsHelpers.getSystemOption,
        minus: (v1, v2) => v1 - v2,
    });

    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    foundry.documents.collections.Items.registerSheet('nephilim', AlchimieSheet, { types: ['alchimie'], makeDefault: true });

})