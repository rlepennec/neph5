import { NephilimItem } from "../item/nephilimItem.js"

/**
 * The DocumentIdentifier class defines an identifier of a nephilim system object.
 */

export class DocumentIdentifier {

    /**
     * The document name: Item, Actor, ... defined in game.collections
     */
    documentName = null;

    /**
     * The type of object defined by the system: competence, vecu, ...
     */
    type = null;

    /**
     * The nephilim document universal identifier 
     */
    id = null;

    /**
     * @param {*} source The source from which to create the identifier which can be:
     *  - a foundry object
     *  - an attribute data-id in a html element provided by the system
     *  - a string with the following format: documentName.type.id
     */
   constructor(source) {

        switch (source.constructor) {

            // The event target from which to create the identifier. The data-id
            // attribute must defined the textual expression of the identifier. 
            case HTMLElement: {
                const words = source.closest("[data-id]")?.dataset.id.split(".");
                this.documentName = words[0];
                this.type = words[1];
                this.id = words[2];
                break;
            }

            // The item from which to create the identifier.
            case NephilimItem: {
                this.documentName = source.documentName;
                this.type = source.type;
                this.id = source.system.id;
                break;
            }

            // The textual expression from which to create the identifier.
            // It must be built as follow: documentName.type.id
            case String: {
                const words = source.split(".");
                this.documentName = words[0];
                this.type = words[1];
                this.id = words[2];
                break;
            }

            default:
                throw new Error("Unsupported type to create a document identifier");

        }

    }

    /**
     * @returns the game object according to the document name.
     */
    toObject() {
        return game.collections.get(this.documentName).find(d => d.system.id === this.id);
    }

    /**
     * @returns the textual expression of the document identifier.
     */
    toString() {
        return this.documentName + "." + this.type + "." + this.id;
    }

}