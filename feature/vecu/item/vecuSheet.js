import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class VecuSheet extends NephilimItemSheet {

    static #ID = 'vecu';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
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

    async _prepareContext(options) {

        const competences = [];

        this.document.system.competences.forEach(id => {
            const item = game.items.find(i => i.system.id === id);
            competences.push(
                {
                    "id": id,
                    "name": item.name,
                    "uuid": item.uuid
                }
            );
        });
        competences.sort((a,b) => { return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1});

        const context = {
            ...await super._prepareContext(options),
            sheet: {
                competences: competences,
            }
        };

        return context;
    }

}