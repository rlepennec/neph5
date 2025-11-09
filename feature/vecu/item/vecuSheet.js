import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class VecuSheet extends NephilimItemSheet {

    static #ID = 'vecu';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.html`,
        }
    }

    async _prepareContext(options) {

        const competences = new Map();
        this.document.system.competences.forEach(id => {
            const item = game.items.find(i => i.system.id === id);
            competences.set(id, item.name);
        });

        const context = {
            ...await super._prepareContext(options),
            competences: competences,
        };

        return context;
    }

}