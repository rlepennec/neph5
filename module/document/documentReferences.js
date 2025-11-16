
import { DocumentContext } from "./documentContext.js"
import { DocumentReferencesIterator } from "./documentReferencesIterator.js"

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
    }

    /**
     * @param {*} document The document in which to gather the current reference type.
     * @returns the array of references in the specified document which matches the current reference type.
     * reference name and type.  
     */    
    #gatherCollection(document) {

        const references = [];

        new DocumentReferencesIterator(this.documentName, this.type)
            .withCallbackSet(field => {
                document.system[field.name].forEach(id => {
                    references.push(DocumentContext.createFromDocument(game.collections.get(this.documentName).find(d => d.system.id === id)));
                });
                references.sort((a,b) => { return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1});
            })
            .forEach(document);

        return references;

    }

}