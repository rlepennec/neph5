import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
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
     * @param {*} id The optional nephilim document identifier.
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
     * @returns the textual expression of the document reference.
     */
    toString() {
        return this.documentName + "." + this.type + "." + this.id;
    }

    /**
     * This method is used to update the references of the specified document.
     * @param {*} document The document to update using the specified callback.
     * @param {*} callbackSet The callback used to update a set of reference in the specified document.
     */
    async #update(document, callbackSet) {

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                if (field.element.droppable) {
                    updates["system." + field.name] = callbackSet(new Set(document.system[field.name]), this.id);
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

}