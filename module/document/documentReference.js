import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
import { DocumentTools } from './documentTools.js'

/**
 * A DocumentReference is a reference to a document.  * A reference can be added or
 * deleted to a document. When a document is deleted, all references must be also
 * deleted.
 * 
 * References can be implemented in schema in two ways.
 *  - a single reference is implemented by a UUIDReferenceField
 *  - a pool of references is implemented by a SetField of UUIDReferenceField
 * 
 * References can be uni-directional of bi-directional.
 * 
 * Case 1:
 * 
 *     Document-1     o------->     Document-2
 * 
 *       
 * Case 2:
 * 
 *     Document-1     o------->     Document-2 
 *                    <-------o
 * 
 */
export class DocumentReference extends DocumentIdentifier {

    /**
     *     Document-1    o------->     Document-2
     * 
     * Given the current instance is an identifier to Document-2.
     * Given the document Document-1.
     * 
     * @param {*} document The document in which to look for the current reference.
     * @returns true if Document-1 references the identifier Document-2. The reference
     * can be defined as a single one or in a set of references.
     */
    isReferencedBy(document) {

        var referenced = false;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                referenced = document.system[field.name] === this.sid;
            })
            .withCallbackSet(field => {
                referenced = document.system[field.name].has(this.sid);
            })
            .forEach(document);

        return referenced;

    }

    /**
     *     Document-1    o------->    Type-2
     *     (document)                 (this)
     * 
     * Given the current instance is a reference to a document of Type-2.
     * Given the document Document-1,
     * 
     * @param {*} document The document in which to look for the current reference.
     * @returns the document of Type-2 referenced by the document Document-1, null
     * if the document Document-1 doesn't reference a document of Type-2. The
     * reference can be defined as a single one or in a set of references. 
     */
    getReferencedBy(document) {

        let target = null;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbacks(field => {
                const refuuid = document.system[field.name];
                if (refuuid != null) {
                    target = new DocumentIdentifier(this.documentName + "." + this.type + "." + refuuid).toDocument();
                }
            })
            .forEach(document);

        return target;

    }

    /**
     *     Document-1    o------->    Document-2
     *     (document)                   (this)
     * 
     * Given the current instance is an identifier to Document-2,
     * Given the document Document-1.
     * 
     * @param {*} document The document to update.
     * Add the reference of Document-2 to the Document-1. The reference can be set
     * if defined as a single reference or added to a set of references, depending
     * on the schema of Document-1.
     */
    async addTo(document) { // MODIFIE

        let updates = {};

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                if (field.droppable) {
                    updates[field.fieldPath] = this.sid;
                }
            })
            .withCallbackSet(field => {
                if (field.element.droppable) {
                    updates[field.fieldPath] = new Set(DocumentTools.getField(document, field, null)).add(this.sid);
                }
            })
            .forEach(document);

        await DocumentTools.update(document, updates);

    }

    /**
     *     Document-1    o---X--->    Document-2
     *     (document)                   (this)
     * 
     * Given the current instance is an identifier to Document-2.
     * Given the document Document-1.
     * 
     * @param {*} document The document to update.
     * Remove the reference of Document-2 from the Document-1. The reference can be
     * unset if defined as a single reference or removed from a set of references,
     * depending on the schema of Document-1.
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
                    updates["system." + field.name] = new Set(document.system[field.name]).filter(v => v != this.sid);
                }
            })
            .forEach(document);

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

    /**
     *       Type-1
     *       (this)
     *     
     *     Document-1  <-------o    Document-2
     *     (register)  o---X--->    (document)       
     * 
     * Given the current instance is reference to a document of Type-1.
     * Given the document Document-2.
     * 
     * @param {*} document The document to remove.
     * Remove the reference of Document-2 from Document-1. Document-1 must be also
     * registered by Document-2. The reference of Document-1 is not removed from
     * Document-2. The references must be bi-directional.
     */
    async removeFromRegister(document) {
        const register = this.getReferencedBy(document);
        if (register != null) {
            await new DocumentReference(document).removeFrom(register);
        }
    }

}