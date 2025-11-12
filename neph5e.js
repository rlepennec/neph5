import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";

import { NephilimItem } from "./module/item/nephilimItem.js";

import { CercleData } from "./feature/cercle/item/cercleData.mjs";
import { CercleSheet } from "./feature/cercle/item/cercleSheet.js";

import { CompetenceData } from "./feature/competence/item/competenceData.mjs";
import { CompetenceSheet } from "./feature/competence/item/competenceSheet.js";

import { PeriodeData } from "./feature/periode/item/periodeData.mjs";
import { PeriodeSheet } from "./feature/periode/item/periodeSheet.js";

import { VecuData } from "./feature/vecu/item/vecuData.mjs";
import { VecuSheet } from "./feature/vecu/item/vecuSheet.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;

    CONFIG.Item.dataModels = {
        cercle: CercleData,
        competence: CompetenceData,
        periode: PeriodeData,
        vecu: VecuData,
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

    foundry.applications.handlebars.loadTemplates([
        `systems/neph5e/templates/item-description.hbs`,
        `systems/neph5e/templates/item-header.hbs`,
        `systems/neph5e/templates/item-input.hbs`,
    ]);


    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    foundry.documents.collections.Items.registerSheet('nephilim', CercleSheet, { types: ['cercle'], makeDefault: true });
    foundry.documents.collections.Items.registerSheet('nephilim', CompetenceSheet, { types: ['competence'], makeDefault: true });
    foundry.documents.collections.Items.registerSheet('nephilim', PeriodeSheet, { types: ['periode'], makeDefault: true });
    foundry.documents.collections.Items.registerSheet('nephilim', VecuSheet, { types: ['vecu'], makeDefault: true });

})