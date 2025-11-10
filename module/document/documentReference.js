import { UUIDReferenceField } from "../common/UUIDReferenceField.js"
import { Tools } from "../common/tools.js"

export class DocumentReference {

    constructor(documentName, type, id) {
        this.documentName = documentName;
        this.type = type;
        this.id = id;
    }

    static createFromItem(item) {
        return new DocumentReference(item.documentName, item.type, item.system.id);
    }

    static createFromString(expression) {
        const words = expression.split(".");
        return new DocumentReference(words[0], words[1], words[2]);
    }

    static createFromTarget(target) {
        return DocumentReference.createFromString(target.closest("[data-id]")?.dataset.id);
    }

    /**
     * @param {*} document The document from which to add the reference.
     */
    async addTo(document) {

        let updates = {};

        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === this.documentName && field.element.type === this.type) {
                        if (field.element.droppable) {
                            updates["system." + fieldName] = new Set(document.system[fieldName]).add(this.id);
                        }
                        return false;
                    }
                }
            }
            return true;
        })

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }


    /**
     * @param {*} document The document from which to remove the reference.
     */
    async deleteFrom(document) {

        let updates = {};

        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === this.documentName && field.element.type === this.type) {
                        if (field.element.deletable) {
                            updates["system." + fieldName] = new Set(document.system[fieldName]).filter(v => v != this.id);
                        }
                        return false;
                    }
                }
            }
            return true;
        })

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }


}