import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "./version.js";
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
        this.incarnation = null;
    }

    /**
     * @param context The context to set.
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
     * Rattache l'item à une incarnation, par la façade des incarnations.
     *
     * Un item n'est embarqué qu'une fois : s'il l'est déjà, il n'est pas recréé, il doit
     * simplement quelque chose de plus à cette incarnation — sauf withDeleteExisting, qui le
     * « déplace » (focus, capacité : une seule période), en le détachant de toutes les autres.
     * @param periode The system identifier of the periode.
     * @param degre   The degre acquired during the periode, omitted if the item has none.
     * @returns the instance.
     */
    withIncarnation(periode, degre = null) {
        this.incarnation = { periode: periode, degre: degre };
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
        const already = this.actor.items.find(i => i.sid === this.sid && i.type !== 'incarnation');
        if (already != null) {
            if (this.deleteExisting === true) {
                if (this.incarnation != null) {
                    await new Incarnations(this.actor).oublier(this.sid);
                }
                await this.actor.deleteEmbeddedDocuments('Item', [already.id], { incarnations: false });
            } else if (this.incarnation != null) {
                // Déjà embarqué : il doit seulement quelque chose de plus à cette incarnation.
                this.item = already;
                await new Incarnations(this.actor).rattacher(this.sid, this.incarnation.periode, this.incarnation.degre);
                return this;
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
        // CLAUDE
        //let raw = await NephilimItem.fromDropData({ uuid: "Item." + item.id });
        //let data = raw.toObject();
        let data = item.toObject();
        // Chaque valeur va au chemin de la version : posée à plat, elle perdrait contre la
        // valeur que l'item du monde a déjà rangée dans sa version (la passerelle de
        // migrateData ne remplace pas une valeur déjà rangée).
        for (const [name, value] of this.data) {
            foundry.utils.setProperty(data, Version.path(item, name), value);
        }
        data = data instanceof Array ? data : [data];

        // Create the embedded item
        this.item = (await this.actor.createEmbeddedDocuments("Item", data))[0];

        // Attach it to its incarnation
        if (this.incarnation != null) {
            await new Incarnations(this.actor).rattacher(this.sid, this.incarnation.periode, this.incarnation.degre);
        }

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
            const update = {};
            for (const name of this.removeData) {
                update[Version.path(this.item, name)] = new foundry.data.operators.ForcedDeletion();
            }
            await this.item.update(update);
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