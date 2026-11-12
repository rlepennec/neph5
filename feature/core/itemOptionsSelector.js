import { AbstractOptionsSelector } from "./abstractOptionsSelector.js";

export class ItemOptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: { width: 300, height: 'auto' },
        form: { handler: ItemOptionsSelector.#onSubmit }
    }

    static PARTS = {
        form: { template: `systems/neph5e/templates/item/options.hbs` }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await game.settings.set('neph5e', 'styleItemSheet', formData.object.style);

        // Le MJ coche l'objet ou non pour chaque version de règles compatible avec son type
        await this.enregistrerVersions(formData.object);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.style = {
            current: game.settings.get('neph5e', 'styleItemSheet'),
            all: ['classique', 'ashbury']
        };
        return context;
    }

}