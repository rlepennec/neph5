import { DocumentIdentifier } from "./documentIdentifier.js"

/**
 * A DocumentContext is the context provided to prepare the sheet context.
 */
export class DocumentContext {

    /**
     * @param {*} fsid The full system document identifier
     * @param {*} name The name of the document to display
     */
    constructor(fsid, name) {
        this.fsid = fsid;
        this.name = name;
    }

    /**
     * @param {*} documentName The foundry document name
     * @param {*} sid The system document identifier
     * @returns the context.
     */
    static create(documentName, sid) {
        const document = game.collections.get(documentName).find(d => d.system.sid === sid);
        return document == null ? null : new DocumentContext(new DocumentIdentifier(document).fsid, document.name);
    }

}