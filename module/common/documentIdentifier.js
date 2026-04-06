/**
 * The DocumentIdentifier class defines an identifier of a system document. Identified
 * document can be embedded in another document or can world document.
 * This class doesn't manage compendium.
 */
export class DocumentIdentifier {

    /**
     * The parent foundry document which contains the foundry document to identify.
     */
    #parent = null;

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
     * The document name to display.
     */
    #name = null;

    /**
     * @param {*} source The source from which to create the identifier which can be:
     * with an argument:
     *  - a HTML element. The closest data-fsid attribute defines the document
     *  - a NephilimActor object
     *  - a NephilimItem object, world or embedded
     *  - a string with the following format ["World"|ParentDocumentName.ParentId].documentName.id.type.sid
     *  - a DragEvent which defines the uuid of the dropped document
     *  - a document name
     * with two arguments:
     *  - a document name and a document uuid or sid for a world document
     */
   constructor(...args) {

        switch (args.length) {

            case 1: {

                const source = args[0];

                // The event target from which to create the identifier. The data-fsid
                // attribute must defined the textual expression of the identifier.
                if (source instanceof HTMLElement) {
                    this.#parse(source.closest("[data-fsid]")?.dataset.fsid);
                }

                // The world actor from which to create the identifier.
                else if(source instanceof Actor) {
                    this.#parse(source);
                }

                // The world item or the actor from which to create the identifier.
                else if(source instanceof Item) {
                    this.#parse(source);
                }

                // The textual expression from which to create the identifier.
                // It must be built as follow: ["World"|ParentDocumentName.ParentId].documentName.id.type.sid
                else if(source instanceof String || typeof source === "string") {
                    this.#parse(source);
                }

                // The dropped document from which to create the identifier. 
                else if(source instanceof DragEvent) {
                    this.#parse(fromUuidSync(foundry.applications.ux.TextEditor.implementation.getDragEventData(source).uuid));
                }

                // Unsupported
                else {
                    throw new Error("Unsupported type to create a document identifier");
                }

                break;
            
            }

            case 2: {

                // The first argument is the name of the collection, the second a system identifier
                if (args[1].includes('-')) {
                    this.#parse(game.collections.get(args[0]).find(d => d.system.id === args[1]));

                // The first argument is the name of the collection, the second a foundry identifier
                } else {
                    this.#parse(game.collections.get(args[0])).get(args[1]);
                }

                break;

            }

            default:
                throw new Error("Unsupported number of arguments to create a document identifier");

        }

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
     * @returns the document name to display
     */
    get name() {
        return this.#name;
    }

    /**
     * @returns the full foundry document identifier which can be used as 
     * parameter in the function fromUuidSync to retrieve a world document
     * Item.I5B5iaZvkhOVGicK, Item.I5B5iaZvkhOVGicK, ...
     */
    get uuid() {
        return this.isNull() ? null : this.#documentName + "." + this.#id;;
    }

    /**
     * @returns the full system identifier of the document: ["World"|ParentDocumentName.ParentId].documentName.id.type.sid
     */
    get fsid() {
        return this.isNull() ? null : (this.#parent == null ? "World" : this.#parent.documentName + "." + this.#parent.id) + "." + this.uuid + "." + this.#type + "." + this.#sid; 
    }

    /**
     * @param type The type of identifier to return, 'id', 'sid', 'fsid', 'uuid'.
     * @returns the specified document identifier.
     */
    identifierOf(type) {
        switch (type) {
            case 'id':
                return this.#id;
            case 'sid':
                return this.#sid;
            case 'fsid':
                return this.fsid;
            case 'uuid':
                return this.uuid;
            default:
                throw new Error("Invalid identifier type " + type);
        }
    }

    /**
     * @returns true if this identifier is well defined.
     */
    isNull() {
        return this.#documentName == null;
    }

    /**
     * @returns the game document according to the document name.
     */
    toDocument() {
        if (this.isNull()) {
            return null;
        } else if (this.#parent == null) {
            return fromUuidSync(this.uuid);
        } else {
            return this.#parent.getEmbeddedDocument(this.#documentName, this.#id);
        }
    }

    /**
     * @returns the textual expression of the document identifier: Item.vecu.JYxbdtxqlFSwFyQn
     */
    toString() {
        return this.isNull() ? null : this.sid;
    }

    /**
     * @param {*} source The source to parse which can be a string or a nephilim document.
     */
    #parse(source) {

        if (source == null) {
            throw new Error("Fail to parse null source to create nephilim document identifier");
        }

        switch (true) {

            case source instanceof String:
            case typeof source === "string":
                const words = source.split(".");
                this.#sid = words.pop();
                this.#type = words.pop();
                this.#id = words.pop();
                this.#documentName = words.pop();
                this.#parent = words.length === 2 ? game.collections.get(words.at(0)).get(words.at(1)) : null;
                this.#name = this.toDocument().name;
                break;

            case source instanceof Actor:
            case source instanceof Item:
                this.#sid = source.system.id;
                this.#type = source.type;
                this.#id = source.id;
                this.#documentName = source.documentName;
                this.#parent = source.parent;
                this.#name = source.name;
                break;

            default:
                this.#sid = null;
                this.#type = null;
                this.#id = null;
                this.#documentName = null;
                this.#parent = null;
                this.#name = null;
                break;

        }

    }

}