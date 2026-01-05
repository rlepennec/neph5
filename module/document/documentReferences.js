
import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
import { Tools } from '../common/tools.js'

export class DocumentReferences {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     * @param {*} document The document in which to gather the current reference type.
     */
    constructor(documentName, type, document) {
        this.documentName = documentName;
        this.type = type;
        this.collection = this.#gatherCollection(document);
        this.reference = this.#gatherReference(document);
    }

    /**
     * @param {*} document The document in which to gather the current reference type.
     * @returns the array of references in the specified document which matches the current reference type.
     */    
    #gatherCollection(document) {

        const references = [];

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                const root = Tools.getObjectPropertyFromPath(document, field.parent.fieldPath, references);
                root[field.name].forEach(sid => {
                    references.push(new DocumentIdentifier(this.documentName, sid));
                });
                references.sort((a,b) => { return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1 });
            })
            .forEach(document);

        return references;

    }

    /**
     * @param {*} document The document in which to gather the current reference type.
     * @returns the reference in the specified document which matches the current reference type.
     */    
    #gatherReference(document) {

        let reference = null;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                const root = Tools.getObjectPropertyFromPath(document, field.parent.fieldPath, reference);
                const sid = root[field.name];
                if (sid != null) {
                    reference = new DocumentIdentifier(this.documentName, sid);
                }
            })
            .forEach(document);

        return reference;

    }

}