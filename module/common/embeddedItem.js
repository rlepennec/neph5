import { NephilimItem } from "../item/entity.js";

export class EmbeddedItem {

    /**
     * Constructor.
     * @param actor The owner of the item.
     * @param sid   The system identifier of the source item.
     */
    constructor(actor, sid) {
        this.actor = actor;
        this.sid = sid;
        this.data = new Map();
        this.removeData = [];
        this.deleteAfter = null;
        this.item = null;
        this.context = null;
        this.deleteExisting = false;
        this.notCreatedError = true;
        this.alreadyEmbeddedError = true;
    }

    /**
     * @param {*} context The context to set.
     * @returns the instance.
     */
    withContext(context) {
        this.context = context;
        return this;
    }

    /**
     * Add the specified data.
     * @param name  The name of the property to set.
     * @param value The value of the property to set.
     * @returns the instance.
     */
    withData(name, value) {
        this.data.set(name, value);
        return this;
    }

    /**
     * Remove the specified data.
     * @param names The names of the properties to remove.
     * @returns the instance.
     */
    withoutData() {
        if (arguments != null) {
            this.removeData = arguments;
        }
        return this;
    }

    /**
     * Delete existing item before creation if necessary.
     * @returns the instance.
     */
    withDeleteExisting() {
        this.deleteExisting = true;
        return this;
    }

    /**
     * Delete the specified embedded item after creation.
     * @param items The embedded items to delete.
     * @returns the instance.
     */
    withDeleteAfter(items) {
        this.deleteAfter = items;
        return this;
    }

    /**
     * Indicates no error on deletion if item not created.
     * @returns the instance.
     */
    withoutNotCreatedError() {
        this.notCreatedError = false;
        return this;
    }

    /**
     * Indicates no error if item already embedded.
     * @returns the instance.
     */
    withoutAlreadyEmbeddedError() {
        this.alreadyEmbeddedError = false;
        return this;
    }

    /**
     * Create the embbeded item.
     * @returns the instance.
     */
    async create() {

        // Check system identifier validity
        if (this.sid == null) {
            this.error("Error occurs during embedded item creation because system identifier is not defined");
            return this;
        }

        // Check if an item is already embbeded
        const already = this.actor.items.find(i => i.sid === this.sid);
        if (already != null) {
            if (this.deleteExisting === true) {
                await this.actor.deleteEmbeddedDocuments('Item', [already.id]);
            } else if (this.alreadyEmbeddedError === true) {
                this.error("Error occurs during embedded item creation because actor item already embedded");
                return this;
            }
        }

        // Retrieve the word item
        const item = game.items.find(i => i.sid === this.sid);
        if (item == null) {
            this.error("Error occurs during embedded item creation because world item not found");
            return this;
        }

        // Build the embedded item data
        let raw = await NephilimItem.fromDropData({ uuid: "Item." + item.id });
        let data = raw.toObject();
        for (const [name, value] of this.data) {
            data.system[name] = value;
        }
        data = data instanceof Array ? data : [data];

        // Create the embedded item
        this.item = (await this.actor.createEmbeddedDocuments("Item", data))[0];

        // Remove optional data
        if (this.removeData != null) {
            await this.delete(this.removeData);
        }

        // Delete the items if necessary
        if (this.deleteAfter != null) {
            for (let item of this.deleteAfter) {
                await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
            }
        }

        return this;

    }

    /**
     * Delete the registered properties.
     * @returns the instance.
     */
    async delete() {
        if (this.item == null) {
            if (this.notCreatedError === true) {
                this.error("Error occurs during embedded item deletion because item not created");
            }
        } else {
            for (let i = 0; i < this.removeData.length; i++) {
                await this.item.update({ ['system.-=' + this.removeData[i]]: null });
            }
        }
        return this;
    }

    /**
     * Logs the specified error.
     * @param msg The error message to log.
     * @returns the instance.
     */
    error(msg) {
        console.error(msg);
        if (this.error != null) {
            console.error("Context: " + this.context)
        }
        console.error("Actor: " + this.actor.name);
        console.error("Id: " + this.sid);
        return this;
    }

}