import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
import { NephilimItem } from "../item/nephilimItem.js"
import { Tools } from "../common/tools.js"

/**
 * A DocumentReference is a reference to a document.
 * A reference can be added or deleted to a document using the field.
 * UUIDReferenceField. When a document is deleted, all references must
 * be deleted also.
 */

export class DocumentReference {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     * @param {*} id The nephilim document identifier.
     */
    constructor(documentName, type, id) {
        this.documentName = documentName;
        this.type = type;
        this.id = id;
    }

    /**
     * @param {*} source The source from which to create the reference.
     * @returns the reference.
     */
    static of(source) {

        switch (source.constructor) {

            // The event target from which to create the reference. The data-id
            // attribute must defined the textual expression of the reference. 
            case HTMLElement: {
                const words = source.closest("[data-id]")?.dataset.id.split(".");
                return new DocumentReference(words[0], words[1], words[2]);
            }

            // The item from which to create the reference.
            case NephilimItem: {
                return new DocumentReference(source.documentName, source.type, source.system.id);
            }

            // The textual expression from which to create the reference.
            // It must be built as follow: documentName.type.id
            case String: {
                const words = source.split(".");
                return new DocumentReference(words[0], words[1], words[2]);
            }

            default:
                throw new Error("Unsupported type to create a document reference");

        }

    }

    /**
     * @param {*} document The document from which to set the reference.
     */
    async setTo(document) {
        await this.#updateReference(document, () => this.id );
    }

    /**
     * @param {*} document The document from which to delete the reference.
     */
    async deleteTo(document) {
        await this.#updateReference(document, () => null );
    }

    /**
     * @param {*} document The document from which to add the reference.
     */
    async addTo(document) {
        await this.#updateSet(document, (set) => set.add(this.id) );
    }

    /**
     * @param {*} document The document from which to remove the reference.
     */
    async removeFrom(document) {
        await this.#updateSet(document, (set) => set.filter(v => v != this.id) );
    }

    /**
     * @returns the textual expression of the document reference.
     */
    toString() {
        return this.documentName + "." + this.type + "." + this.id;
    }

    /**
     * @param {*} document The document in which to look for the current reference.
     * @returns true if the specified document references the current reference.
     */
    isReferencedBy(document) {

        var referenced = false;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                referenced = document.system[field.name].has(this.id);
            })
            .forEach(document);

        return referenced;

    }

    /**
     * This method is used to update the references of the specified document.
     * @param {*} document The document to update using the specified callback.
     * @param {*} callback The callback used to update a simple reference in the specified document.
     */
    async #updateReference(document, callback) {

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                if (field.droppable) {
                    updates["system." + field.name] = callback();
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

    /**
     * This method is used to update the references of the specified document.
     * @param {*} document The document to update using the specified callback.
     * @param {*} callback The callback used to update a set of reference in the specified document.
     */
    async #updateSet(document, callback) {

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                if (field.element.droppable) {
                    updates["system." + field.name] = callback(new Set(document.system[field.name]));
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

}