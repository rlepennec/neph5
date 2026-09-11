import { AbstractFeature } from "../../feature/core/abstractFeature.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { DocumentIdentifier } from "../common/documentIdentifier.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { NephilimActor } from "./nephilimActor.js"
import { NephilimItem } from "../item/nephilimItem.js"
import { NephilimMixinSheet } from "../common/nephilimSheetMixin.js";

export class NephilimActorSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimActor;
    }

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

    /**
     * @override
     * Ouvre la fiche d'un document référencé. Pour un item embarqué dans cet acteur,
     * on passe par sa feature plutôt que par sheet.render() : c'est elle qui fournit
     * les données du contexte acteur (chronologie des périodes, degré, readOnly).
     * Sans cela, la fiche s'ouvre sans ces informations.
     */
    async _onOpenLink(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        if (document?.isEmbedded === true && document.parent === this.document) {
            const feature = new FeatureBuilder(this.document)
                .withScope("actor")
                .withEmbeddedItem(identifier.id)
                .withOriginalItem(identifier.sid)
                .create();
            return await feature.editEmbeddedItem();
        }
        await super._onOpenLink(event, target);
    }

    async setOptions(options) {
        const update = {};
        for (const [key, value] of Object.entries(options)) {
            update[`system.options.${key}`] = value;
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
        const created = await this.document.createEmbeddedDocuments("Item", [data]);
    }

    /** Supprime un item embarqué (materia, catalyseur, vécu, ...) via son id Foundry. */
    static async _onDeleteEmbeddedItem(event, target) {
        if (this.locked) return;
        const id = target.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        await this.document.deleteEmbeddedItem(item);
    }

}