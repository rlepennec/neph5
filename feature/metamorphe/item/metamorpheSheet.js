import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { MetamorpheData } from "./metamorpheData.mjs";

export class MetamorpheSheet extends NephilimItemSheet {

    static #ID = 'metamorphe';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
        form: {
            handler: MetamorpheSheet.#onSubmit,
        },
        position: {
            height: 500,
            width: 590,
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.html`,
        }
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: MetamorpheData.defineSchema().element.choices,
                humeurs: MetamorpheData.defineSchema().humeur.choices,
            }
        }
    }

    static #onSubmit(event, form, formData) {

        console.log(formData);

        /*
        const settings = foundry.utils.expandObject(formData.object);
        await Promise.all(
            Object.entries(settings).map(([key, value]) => game.settings.set("foo", key, value))
        );
        */
    }


    /**
     * @override
     */
    _updateObject(event, formData) {


        console.log(formData);

        // Update object
        super._updateObject(event, formData);
    }



    /**
     * @override
     */
    /*
    _updateObject(event, formData) {

        // Update voies
        if (formData["system.cercle"] === "basseMagie") {
            formData["system.voies"] = [];
        } else {
            let size = this.item.system.voies == null ? 0 : this.item.system.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = "system.voies.[" + index + "]";
                voies.push(formData[name]);
                delete formData[name];
            }
            formData["system.voies"] = voies;
        }

        // Update syntaxe & incantation
        if (formData["system.cercle"] !== "grandSecret") {
            formData['system.-=syntaxe'] = null;
            formData['system.-=incantation'] = null;
        }

        // Update object
        super._updateObject(event, formData);
    }
        */

}