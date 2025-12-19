import { CercleSheet } from "./feature/cercle/item/cercleSheet.js";
import { CompetenceSheet } from "./feature/competence/item/competenceSheet.js";
import { MetamorpheSheet } from "./feature/metamorphe/item/metamorpheSheet.js";
import { PeriodeSheet } from "./feature/periode/item/periodeSheet.js";
import { VecuSheet } from "./feature/vecu/item/vecuSheet.js";

export class Sheets {

    static register() {
        foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
        foundry.documents.collections.Items.registerSheet('nephilim', CercleSheet, { types: ['cercle'], makeDefault: true });
        foundry.documents.collections.Items.registerSheet('nephilim', CompetenceSheet, { types: ['competence'], makeDefault: true });
        foundry.documents.collections.Items.registerSheet('nephilim', MetamorpheSheet, { types: ['metamorphe'], makeDefault: true });
        foundry.documents.collections.Items.registerSheet('nephilim', PeriodeSheet, { types: ['periode'], makeDefault: true });
        foundry.documents.collections.Items.registerSheet('nephilim', VecuSheet, { types: ['vecu'], makeDefault: true });
    }

}