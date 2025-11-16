
import { DocumentReference } from "./documentReference.js";

export class DocumentReferences {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     */
    constructor(documentName, type) {
        this.documentName = documentName;
        this.type = type;
        this.collection = [];
    }

    fromDocument(document) {
        this.collection = new DocumentReference(this.documentName, this.type).getReferencesOf(document);
        return this;
    }





}