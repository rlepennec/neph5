import { NephilimItem } from "./nephilimItem.js"
import { NephilimMixinSheet } from "../common/nephilimSheetMixin.js";
import { ItemOptionsSelector } from "../../feature/core/itemOptionsSelector.js";

import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Science } from "../../feature/science/science.js";

export class NephilimItemSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimItem;
    }

    static DEFAULT_OPTIONS = {
        classes: ["item"],
    }

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.embeddedData = {};
    }

    /**
     * Fenêtre de configuration des fiches d'item (choix du style). Sa présence
     * fait apparaître l'engrenage dans la barre de titre (via setupable du mixin).
     * @override
     */
    get optionsSelector() {
        return ItemOptionsSelector;
    }

    /**
     * Réinitialise le contexte embarqué à la fermeture. Foundry met en cache une
     * seule fiche par document ; sans ce reset, embeddedData resterait "collé" d'une
     * ouverture à l'autre et fausserait la détection openedFromActor.
     * @override
     */
    async _onClose(options) {
        await super._onClose(options);
        this.embeddedData = {};
    }

    /**
     * Realigns an illustration left behind by the field which drives it, before
     * the context is built so that the sheet shows the right one from its first
     * paint. Concerns the types listed in NephilimItem.illustrations only.
     *
     * render: false is essential — the update happens during a render, and
     * letting it queue another one would loop. It is harmless here: the context
     * is built after this call and therefore reads the corrected value.
     */
    async alignIllustration() {

        const document = this.document;
        const illustration = document.illustration;
        if (illustration == null) {
            return;
        }

        // Nothing to write on a locked compendium or without update permission:
        // a player simply consulting the sheet must not trigger a failed update.
        if (document.pack != null && game.packs.get(document.pack)?.locked === true) {
            return;
        }
        if (document.canUserModify(game.user, 'update') === false) {
            return;
        }

        const outdated = illustration.outdated(
            document.system[illustration.field],
            document.system.illustration);

        if (outdated == null) {
            return;
        }

        await document.update({ 'system.illustration': outdated }, { render: false });

    }

    /**
     * @override
     */
    async _prepareContext(options) {
        await this.alignIllustration();
        const context = await super._prepareContext(options);
        context.id = null;
        foundry.utils.mergeObject(context, this.embeddedData);
        foundry.utils.mergeObject(context, this.getOriginalData());
        return context;
    }

    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const style = game.settings.get('neph5e', 'styleItemSheet');
        // remplace le suffixe du template par le style choisi
        parts.main.template = parts.main.template.replace(/\.html$/, `-${style}.html`);
        return parts;
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.add(`item-${this.document.type}`);
    }

    cerclesOf(science) {
        const cercles = {}
        for (let cercle of Science.cerclesOf(science)) {
            if (cercle.includes('@')) {
                const item = game.items.find(i => i.system.key === cercle);
                cercles[cercle] = item != null ? item.name : cercle.split('@')[1];
            } else {
                cercles[cercle] = cercle;
            }
        };
        return cercles;
    }

    /**
     * @returns the data from the original item.
     */
    getOriginalData() {
        return {}; 
    }

    /**
     * @param data The data of the embedded item to set.
     * @returns the instance.
     */
    withEmbeddedData(data) {
        this.embeddedData = data; 
        return this;
    }

    /**
     * Retrieves the dropped item informations as follow:
     *  { 
     *    from: "compendium", "data" or "world",
     *    data: the item data
     *  }
     * @param {*} event The event to 
     */
    static async droppedItem(event) {

        // Retrieve the dropped data id and type from the event
        let data = null;
        if (event.dataTransfer != null) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return null;
            }
        }
        if (data == null || data.type !== "Item") {
            return null;
        };

        let dataType = "";
        let originalData = {};
        // Case 1 - Import from a Compendium pack
        if (data.pack) {
            dataType = "compendium";
            const pack = game.packs.find(p => p.collection === data.pack);
            const packItem = await pack.getEntity(data.id);
            if (packItem != null) originalData = packItem.data;
            return { from: dataType, data: originalData };

        // Case 2 - Data explicitly provided
        } else if (data.system) {
            /*
            let sameActor = data.actorId === actor._id;
            if (sameActor && actor.isToken) sameActor = data.tokenId === actor.token.id;
            if (sameActor) return this._onSortItem(event, data.system); // Sort existing items

            dataType = "data";
            originalData = data.system;
            */
            return { from: dataType, data: originalData };
        }

        // Case 3 - Import from World entity
        else {
            return await fromUuid(data.uuid);       
        }

    }

}