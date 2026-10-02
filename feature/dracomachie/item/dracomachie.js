import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Version } from "../../../module/common/version.js";

export class DracomachieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-dracomachie"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/dracomachie/item/dracomachie.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('dracomachie')
            }
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les champs appartiennent à la version affichée : les clefs du formulaire portent
        // son préfixe, celui-là même que le gabarit a posé.
        const prefixe = Version.prefix(this.document, this.version);

        // Set element for passes
        if (formData.object[prefixe + ".cercle"] === "dracomachie@passes" || formData.object[prefixe + ".cercle"] === "dracomachie@charmes") {
            formData.object[prefixe + ".element"] = "choix"
        } else {
            formData.object[prefixe + ".element"] = new foundry.data.operators.ForcedDeletion();
            formData.object[prefixe + ".degre"] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);
    }

}