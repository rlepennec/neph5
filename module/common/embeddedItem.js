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
     * Lie l'item à une incarnation : il y reçoit son propre exemplaire, qui porte la clé de
     * l'incarnation (IncarnationField) et le degré acquis pendant elle. Si l'incarnation en a
     * déjà un, il n'est pas recréé ; les exemplaires des autres incarnations restent.
     * @param periode The key of the incarnation.
     * @param degre   The degre acquired during the incarnation, omitted if the item has none.
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

        // Un item lié à une incarnation : un exemplaire par incarnation, qui porte sa clé et le
        // degré acquis pendant elle. Seul compte celui de CETTE incarnation ; ceux des autres
        // restent. Voir la façade Incarnations.
        const monde = game.items.find(i => i.sid === this.sid);
        if (this.incarnation != null && Incarnations.LIES.includes(monde?.type)) {
            const exemplaire = new Incarnations(this.actor).exemplaireDans(this.sid, this.incarnation.periode);
            if (exemplaire != null) {
                this.item = exemplaire;
                return this;
            }
            // La clé est commune à toutes les versions : posée à la racine (voir #creer)
            this.cleEpoque = this.incarnation.periode;
            if (this.incarnation.degre != null) {
                this.data.set("degre", this.incarnation.degre);
            }
            return await this.#creer(monde);
        }

        // Check if an item is already embbeded
        const already = this.actor.items.find(i => i.sid === this.sid && i.type !== 'incarnation');
        if (already != null) {
            if (this.deleteExisting === true) {
                await this.actor.deleteEmbeddedDocuments('Item', [already.id], { incarnations: false });
            } else if (this.alreadyEmbeddedError === true) {
                this.error("Error occurs during embedded item creation because actor item already embedded");
                return this;
            }
        }

        // Retrieve the word item
        return await this.#creer(game.items.find(i => i.sid === this.sid));

    }

    /**
     * Crée l'item embarqué depuis l'item du monde, avec les valeurs enregistrées, et la clé de
     * son incarnation s'il est lié.
     * @param item The world item.
     * @returns the instance.
     */
    async #creer(item) {

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
        if (this.cleEpoque != null) {
            foundry.utils.setProperty(data, 'system.incarnation', this.cleEpoque);
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