import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CercleSheet extends NephilimItemSheet {

    static #ID = 'cercle';

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

}