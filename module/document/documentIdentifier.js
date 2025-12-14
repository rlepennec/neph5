import { NephilimItem } from "../item/nephilimItem.js"

/**
 * The DocumentIdentifier class defines an identifier of a system object.
 */
export class DocumentIdentifier {

    /**
     * The foundry compendium name which contains the document: world.com
     */
    #compendium = null;

    /**
     * The foundry document name: Item, Actor, ... defined in game.collections
     */
    #documentName = null;

    /**
     * The foundry document type of object defined by the system: competence, vecu, ...
     */
    #type = null;

    /**
     * The foundry document identifier: JYxbdtxqlFSwFyQn, ...
     */
    #id = null;

    /**
     * The system document identifier: f24e651c-b022-4cd5-8eb6-06cb8f909c36
     */
    #sid = null;

    /**
     * @param {*} source The source from which to create the identifier which can be:
     *  - a foundry object
     *  - an attribute data-fsid in a html element provided by the system
     *  - a string with the following format: (compendiumName.)documentName.id.type.fsid
     */
   constructor(source) {

        switch (source.constructor) {

            // The event target from which to create the identifier. The data-fsid
            // attribute must defined the textual expression of the identifier. 
            case HTMLElement:
            case HTMLSpanElement: {
                this.#parse(source.closest("[data-fsid]")?.dataset.fsid);
                break;
            }

            // The item from which to create the identifier.
            case NephilimItem: {
                this.#parse(source);
                break;
            }

            // The textual expression from which to create the identifier.
            // It must be built as follow: (compendiumName.)documentName.id.type.sid
            case String: {
                this.#parse(source);
                break;
            }

            // The dropped document from which to create the identifier. 
            case DragEvent: {
                this.#parse(fromUuidSync(foundry.applications.ux.TextEditor.implementation.getDragEventData(source).uuid));
                break;
            }

            default:
                throw new Error("Unsupported type to create a document identifier");

        }

    }

    /**
     * @returns the foundry compendium name which contains the document
     */
    get compendium() {
        return this.#compendium;
    }

    /**
     * @returns the foundry document name
     */
    get documentName() {
        return this.#documentName;
    }

    /**
     * @returns the foundry document type of object defined by the system
     */
    get type() {
        return this.#type;
    }

    /**
     * @returns the foundry document identifier
     */
    get id() {
        return this.#id;
    }

    /**
     * @returns the system document identifier
     */
    get sid() {
        return this.#sid;
    }

    /**
     * @returns the full foundry document identifier which can be used as 
     * parameter in the function fromUuidSync to retrieve a world document
     * or to retrieve a compendium document index
     * Compendium.world.com.Item.I5B5iaZvkhOVGicK, Item.I5B5iaZvkhOVGicK, ...
     */
    get uuid() {
        return (this.#compendium != null ? "Compendium." + this.#compendium + "." : "") + this.#documentName + "." + this.#id;;
    }

    /**
     * @returns the full system identifier of the document: (compendiumName.)documentName.id.type.sid
     */
    get fsid() {
        return this.uuid + "." + this.#type + "." + this.#sid; 
    }

    /**
     * @returns the game document according to the document name.
     */
    toDocument() {
        return this.#compendium != null ? null : fromUuidSync(this.uuid);
    }

    /**
     * @returns the game document index according to the document name.
     */
    toIndex() {
        return this.#compendium == null ? null : fromUuidSync(this.uuid);
    }

    /**
     * @returns the textual expression of the document identifier: Item.vecu.JYxbdtxqlFSwFyQn
     */
    toString() {
        return this.sid;
    }

    /**
     * @param {*} source The source to parse which can be a string or a nephilim item.
     */
    #parse(source) {

        switch (source.constructor) {

            case String: {
                const words = source.split(".");
                this.#sid = words.pop();
                this.#type = words.pop();
                this.#id = words.pop();
                this.#documentName = words.pop();
                this.#compendium = words.length > 0 ? words.shift() : null;
                break;
            }

            case NephilimItem: {
                this.#sid = source.system.sid;
                this.#type = source.type;
                this.#id = source.id;
                this.#documentName = source.documentName;
                this.#compendium = source.pack;
                break;
            }

            case Object: {
                const words = source.uuid.split(".");
                this.#sid = null;
                this.#type = source.pack;
                this.#id = words.pop();
                this.#documentName = words.pop();
                this.#compendium = source.pack;
                break;
            }

            default:
                throw new Error("Unsupported type to create a document identifier");

        }

    }

}