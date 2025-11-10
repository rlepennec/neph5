import { UUIDReferenceField } from "../common/UUIDReferenceField.js"
import { Tools } from "../common/tools.js"

/**
 * A DocumentReference is a reference to a document.
 * A reference can be added or deleted to a document using the field.
 * UUIDReferenceField. When a document is deleted, all references must
 * be deleted also.
 */

export class DocumentReference {

    /**
     * @param {*} documentName The document name: Item or Actor
     * @param {*} type The type of item or actor
     * @param {*} id The nephilim document identifier
     */
    constructor(documentName, type, id) {
        this.documentName = documentName;
        this.type = type;
        this.id = id;
    }

    /**
     * @param {*} item The item from which to create the reference.
     * @returns the reference.
     */
    static createFromItem(item) {
        return new DocumentReference(item.documentName, item.type, item.system.id);
    }

    /**
     * @param {*} expression The textual expression from which to create the reference.
     * It must be built as follow: documentName.type.id
     * @returns the reference.
     */
    static createFromString(expression) {
        const words = expression.split(".");
        return new DocumentReference(words[0], words[1], words[2]);
    }

    /**
     * @param {*} target The event target from which to create the reference. The
     * data-id attribute must defined the textual expression of the reference. 
     * @returns the reference.
     */
    static createFromTarget(target) {
        return DocumentReference.createFromString(target.closest("[data-id]")?.dataset.id);
    }

    /**
     * @param {*} document The document from which to add the reference.
     */
    async addTo(document) {
        await this.#update(document, (set) => set.add(this.id) );
    }

    /**
     * @param {*} document The document from which to remove the reference.
     */
    async deleteFrom(document) {
        await this.#update(document, (set) => set.filter(v => v != this.id));
    }

    /**
     * @param {*} document The document to update using the specified callback.
     * @param {*} callback The callback used to update the document.
     */
    async #update(document, callback) {

        let updates = {};

        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === this.documentName && field.element.type === this.type) {
                        if (field.element.droppable) {
                            updates["system." + fieldName] = callback(new Set(document.system[fieldName]), this.id);
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
     * @returns the textual expression of the document reference.
     */
    toString() {
        return this.documentName + "." + this.type + "." + this.id;
    }

    getReferencesOf(document) {

        const references = [];

        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === this.documentName && field.element.type === this.type) {
                        document.system[fieldName].forEach(id => {
                            const item = this.#getDocuments().find(d => d.system.id === id);
                            references.push(
                                {
                                    "id": id,
                                    "name": item.name,
                                    "uuid": item.uuid
                                }
                            );
                        });
                        references.sort((a,b) => { return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1});
                        return false;
                    }
                }
            }
            return true;
        })

        return references;

    }

    #getDocuments() {
        switch(this.documentName) {
            case 'Actor':
                return game.actors;
            case 'Item':
                return game.items;
        }
    }

}