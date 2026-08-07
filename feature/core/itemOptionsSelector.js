import { AbstractOptionsSelector } from "../../feature/core/abstractOptionsSelector.js";

export class ItemOptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: { width: 300, height: 200 },
        form: { handler: ItemOptionsSelector.#onSubmit }
    }

    static PARTS = {
        form: { template: `systems/neph5e/templates/item/options.hbs` }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await game.settings.set('neph5e', 'styleItemSheet', formData.object.style);
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