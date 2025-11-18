/**
 * A DocumentContext is the context provided to prepare the sheet context.
 */

export class DocumentContext {

    /**
     * @param {*} id The nephilim document identifier
     * @param {*} name The document name
     * @param {*} uuid The foundry document identifier
     */
    constructor(id, name, uuid) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
    }

    /**
     * @param {*} item The document from which to create the context.
     * @returns the context.
     */
    static createFromDocument(document) {
        return document == null ? null : new DocumentContext(document.system.id, document.name, document.uuid);
    }

    /**
     * @returns the object to add in the sheet context.
     */
    toContext() {
        return {
            id: this.id,
            name: this.name,
            uuid: this.uuid
        }
    }

}