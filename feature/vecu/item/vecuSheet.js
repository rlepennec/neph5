import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { DropTools } from "../../../module/document/dropTools.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"
import { Tools } from "../../../module/common/tools.js"

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

}