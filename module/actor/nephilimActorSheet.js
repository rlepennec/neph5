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

    /**
     * Activate listeners about the combat panel used by figure and figurant actors.
     * @param html The html content to listen
     */
    activateCombatListeners(html) {
        html.find('div[data-tab="combat"] .etat input').click(this._onEffect.bind(this));
        html.find('div[data-tab="combat"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.onAddMacro(event), false);
        });
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

    /** Supprime un item embarqué (materia, catalyseur, ...) via son id Foundry. */
    static async _onDeleteEmbeddedItem(event, target) {
        if (this.locked) return;
        const id = target.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        await this.document.deleteEmbeddedItem(item);
    }

    
    /** Supprime un item embarqué (materia, catalyseur, vécu, ...) via son id Foundry. */
    static async _onDeleteEmbeddedItem(event, target) {
        if (this.locked) return;
        const id = target.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        await this.document.deleteEmbeddedItem(item);
    }

    /**
     * Create the specified feature.
     * @param purpose The purpose 
     *   - arcane
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param event The click event.
     * @returns the instance.
     */
    createFeature(purpose, event) {
        switch (purpose) {
            case '.roll-ka': {
                const noeud = event.currentTarget.closest(purpose);
                const element = noeud?.dataset.element;
                const scope = noeud?.dataset.scope;
                return new FeatureBuilder(this.document).withKa(element).withScope(scope).create();
            }
            case '.roll-science': {
                const key = event.currentTarget.closest(".roll")?.dataset.item;
                const item = game.items.find(i => i.type === 'science' && i?.system?.key === key);
                const builder = new FeatureBuilder(this.document).withOriginalItem(item.sid);
                return builder.create();
            }
            case '.roll-noyau': {
                const builder = new FeatureBuilder(this.document).withNoyau();
                return builder.create();
            }
            case '.roll-pavane': {
                const builder = new FeatureBuilder(this.document).withPavane();
                return builder.create();
            }
            default: {
                const noeud = event.currentTarget.closest(purpose);
                const id = noeud?.dataset.id;
                const scope = noeud?.dataset.scope;

                if (scope == null) {
                    const item = game.items.get(id);
                    const builder = new FeatureBuilder(this.document).withOriginalItem(item.sid);
                    return builder.create();
                } else {
                    const item = AbstractFeature.actor(this.document,scope).items.get(id);
                    const builder = new FeatureBuilder(this.document).withEmbeddedItem(item.id);
                    builder.withScope(scope);
                    return builder.create();
                }
            }
        }
    }

    /**
     * @param event 
     * @returns the dropped actor.
     */
    static async droppedActor(event) {

        // Retrieve the dropped data id and type from the event
        let data = null;
        if (event.dataTransfer !== undefined) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return null;
            }
        }
        if (data === null || data.type !== "Actor") {
            return null;
        };
    
        let dataType = "";
        if (data.type === "Actor") {
            let actorData = {};
            // Case 1 - Import from a Compendium pack
            if (data.pack) {
                dataType = "compendium";
                const pack = game.packs.find(p => p.collection === data.pack);
                const packActor = await pack.getEntity(data.id);
                if (packActor != null) actorData = packActor.data;
            }
    
            // Case 3 - Import from World entity
            else {
                return await fromUuid(data.uuid);
            }
    
            return { from: dataType, data: actorData };
    
        } else {
    
            return null;
        }
    
    }

    // Used by refactoring
    // --------------------------------------------------

    /**
     * Add the specified macro. It can be used to:
     *   - wrestle
     *   - attack with a weapon
     * @param event 
     */
    onAddMacro(event) {

        // Retrieve basic data
        this._onDragStart(event);
        const node = event.currentTarget;

        let data = {
            process: "macro",
            type: node.dataset.macro
        };

        switch (data.type) {

            // A macro which used an original item
            case 'item':
                data.sid = node.dataset.sid;
                break;

            // A macro about vecu item
            case 'vecu':
                data.sid = node.dataset.sid;
                data.id = node.dataset.id;
                break;

            // A combat macro used to wrestle
            case 'wrestle':
                break;

            case 'weapon':
                data.actor = node.dataset.actor;
                data.id = node.dataset.id;
                break;

            // A ka macro
            case 'ka':
                data.id = node.dataset.id;
                break;

            default:
                return;

        }

        // Add the macro
        event.dataTransfer.setData('text/plain', JSON.stringify(data));

    }



    /**
     * Create the specified feature item.
     * @param event The click event.
     * @returns the new feature.
     */
    _createFeature(event) {
        event.preventDefault();
        const node = event.currentTarget.closest('.item');
        const id = node?.dataset.id;
        const sid = node?.dataset.sid;
        let scope = node?.dataset.scope;
        scope = scope == null ? "actor" : scope;
        return new FeatureBuilder(this.document).withScope(scope).withEmbeddedItem(id).withOriginalItem(sid).create();
    }

    /**
     * Open the specified embedded item.
     * @param event The click event.
     * @returns the instance.
     */
    async _onOpenItem(event) {
        const feature = this._createFeature(event);
        await feature.editEmbeddedItem();
        return this;
    }

}