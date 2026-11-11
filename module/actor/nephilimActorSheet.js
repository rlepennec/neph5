import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Version } from "../../module/common/version.js";
import { DocumentIdentifier } from "../common/documentIdentifier.js";
import { NephilimActor } from "./nephilimActor.js"
import { NephilimItem } from "../item/nephilimItem.js"
import { NephilimMixinSheet } from "../common/nephilimSheetMixin.js";

/**
 * La fiche d'acteur commune : ce qui ne dépend d'aucune règle. Les fiches d'une version en
 * héritent (pour la v5, par FicheActeurV5).
 */
export class NephilimActorSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimActor;
    }

    /**
     * La version que montre une fiche propre à des règles, null pour une fiche commune : le
     * bouton de version y affiche alors « version non décrite » pour les autres.
     */
    static VERSION = null;

    static DEFAULT_OPTIONS = {
        classes: ["actor"],
        position: {
            width: 1000,
            height: 800
        },
        actions: {
            deleteItem: NephilimActorSheet._onDeleteEmbeddedItem
        }
    }

    /**
     * @override
     * Une version que le modèle ne décrit pas encore n'a aucun champ : la fiche rend alors
     * une page qui garde l'image et le nom, et annonce qu'il n'y a rien à montrer — comme
     * la fiche d'item, pour les trois types d'acteur à la fois. De même pour une version
     * qu'une fiche propre à d'autres règles ne sait pas montrer (VERSION).
     */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const propre = this.constructor.VERSION;
        if (!Version.decrite(this.document, this.version) || (propre != null && this.version !== propre)) {
            parts.main.template = `systems/neph5e/templates/version-vide-acteur.html`;
        }
        return parts;
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.owner = this.document.isOwner;
        return context;
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // The system uuid
        if (formData.object['system.id'] == null || formData.object['system.id'] === "") {
            formData.object['system.id'] = CustomHandlebarsHelpers.UUID();
        }

        // Update every embedded items
        // Input name must be defined as follow:
        // items.NephilimIdentifier.system.propertyName 
        for (const [key, value] of Object.entries(formData.object)) {
            if (key.startsWith("items.")) {
                const data = key.replace(/^items\./, "").split(".system");
                await new DocumentIdentifier(data[0]).toDocument().update({["system" + data[1]]: value});
            }
        }

        // Update the actor
        await this.document.update(formData.object);

    }

    async setOptions(options) {
        const update = {};
        for (const [key, value] of Object.entries(options)) {
            update[Version.path(this.document, 'options', this.version) + '.' + key] = value;
        }
        await this.document.update(update);
    }

    static async _onDeleteItem(event, document) {
        event.preventDefault();
        await this.document.deleteEmbeddedItem(document);
    }

    static async _onDropItem(event, document) {
        event.preventDefault();
        const data = document.toObject();
        NephilimItem.initializeEmbedded(data);
        await this.document.createEmbeddedDocuments("Item", [data]);
    }

    /** Supprime un item embarqué (materia, catalyseur, vécu, ...) via son id Foundry. */
    static async _onDeleteEmbeddedItem(event, target) {
        if (this.locked) return;
        const id = target.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        await this.document.deleteEmbeddedItem(item);
    }

}