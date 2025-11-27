import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
import { NephilimItem } from "../item/nephilimItem.js"
import { Tools } from "../common/tools.js"

/**
 * A DocumentReference is a reference to a document.
 * A reference can be added or deleted to a document using the field.
 * UUIDReferenceField. When a document is deleted, all references must
 * be deleted also.
 */

export class DocumentReference extends DocumentIdentifier {

    /**
     * @param {*} document The document in which to look for the current reference.
     * @returns true if the specified document references the current reference.
     */
    isReferencedBy(document) {

        var referenced = false;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                referenced = document.system[field.name] === this.id;
            })
            .withCallbackSet(field => {
                referenced = document.system[field.name].has(this.id);
            })
            .forEach(document);

        return referenced;

    }

    /**
     * This method is used to add the reference of the specified document.
     * The reference can be set or added to a set of references depending of the schema of the item.
     * @param {*} document The document to update.
     */
    async addTo(document) {

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                if (field.droppable) {
                    updates["system." + field.name] = this.id;
                }
            })
            .withCallbackSet(field => {
                if (field.element.droppable) {
                    updates["system." + field.name] = new Set(document.system[field.name]).add(this.id);
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

    /**
     * This method is used to remove the reference of the specified document.
     * The reference can be unset or removed from a set of references depending of the schema of the item.
     * @param {*} document The document to update.
     */
    async removeFrom(document) {

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                if (field.droppable) {
                    updates["system.-=" + field.name] = null;
                }
            })
            .withCallbackSet(field => {
                if (field.element.droppable) {
                    updates["system." + field.name] = new Set(document.system[field.name]).filter(v => v != this.id);
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

}