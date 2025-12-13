import { DocumentIdentifier } from "./documentIdentifier.js"

/**
 * A DocumentContext is the context provided to prepare the sheet context.
 */
export class DocumentContext {

    /**
     * @param {*} fsid The full system document identifier
     * @param {*} name The document name
     */
    constructor(fsid, name) {
        this.fsid = fsid;
        this.name = name;
    }

    /**
     * @param {*} item The document from which to create the context.
     * @returns the context.
     */
    static createFromDocument(documentName, sid) {
        const document = game.collections.get(documentName).find(d => d.system.sid === sid);
        return document == null ? null : new DocumentContext(new DocumentIdentifier(document).fsid, document.name);
    }

    /**
     * @returns the object to add in the sheet context.
     */
    toContext() {
        return {
            fsid: this.fsid,
            name: this.name
        }
    }

}