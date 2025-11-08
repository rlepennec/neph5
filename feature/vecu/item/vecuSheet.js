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

    async _onDrop(event) {
        event.preventDefault();
        console.log("--------------> event");

        let updates = {};
        const drop = await DropTools.droppedDocument(event);

        Object.entries(this.document.system.schema.fields).forEach(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.droppable && field.element.collection === drop.documentName && field.element.type === drop.type) {
                        console.log(fieldName);
                        updates["system." + fieldName] = new Set(this.document.system[fieldName]).add(drop.system.id);
                    }                   
                }
            }
        });

        if (Tools.isObjectNotEmpty(updates))    {
            await this.document.update(updates);
        }

    }

}