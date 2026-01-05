
import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReferencesIterator } from "./documentReferencesIterator.js"
import { Tools } from '../common/tools.js'

export class DocumentReferences {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     * @param {*} document The document in which to gather the current reference type.
     * @param {*} path The path used to get references.
     */
    constructor(documentName, type, document, path) {
        this.documentName = documentName;
        this.type = type;
        this.collection = this.#gatherCollection(document, path);
        this.reference = this.#gatherReference(document, path);
    }

    /**
     * @param {*} document The document in which to gather the current reference type.
     * @param {*} path The path used to get references.
     * @returns the array of references in the specified document which matches the current reference type.
     */    
    #gatherCollection(document, path) {

        const references = [];

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                const root = Tools.getObjectPropertyFromPath(document, path, references);
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
     * @param {*} path The path used to get reference.
     * @returns the reference in the specified document which matches the current reference type.
     */    
    #gatherReference(document, path) {

        let reference = null;

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackReference(field => {
                const root = Tools.getObjectPropertyFromPath(document, path, reference);
                console.log("gatherReference");
                console.log(path);
                console.log(root);

                const sid = root[field.name];
                if (sid != null) {
                    reference = new DocumentIdentifier(this.documentName, sid);
                }
            })
            .forEach(document);

        return reference;

    }

}