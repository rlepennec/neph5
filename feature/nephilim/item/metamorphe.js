import { Constants } from "../../../module/common/constants.js";
import { Version } from "../../../module/common/version.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MetamorpheSheet extends NephilimItemSheet {

    // Taille d'ouverture : voir module/item/positions.js (elle depend du style).

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/nephilim/item/metamorphe.html`,
        }
    }

    /**
     * Le bandeau de la fenêtre est hors de .item-root : on applique le skin
     * du Ka sur la fenêtre elle-même pour qu'il en hérite les variables.
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.applySkin(Version.data(this.document, this.version).element);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS
            }
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les métamorphoses appartiennent à la version affichée : les clefs du formulaire
        // portent son préfixe, celui-là même que le gabarit a posé.
        const prefixe = Version.prefix(this.document, this.version);

        // Update metamorphoses
        const metamorphoses = [];
        for (let index = 0; index < 10; index++) {
            const name = prefixe + ".metamorphoses.[" + index + "]";
            metamorphoses.push({ name: formData.object[name + ".name"] });
            delete formData.object[name + ".name"];
        }
        formData.object[prefixe + ".metamorphoses"] = metamorphoses;

        // Update object
        await this.document.update(formData.object);
    }

}