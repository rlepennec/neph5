import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Science } from "../../feature/science/science.js";

export class NephilimItemSheet extends ItemSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
        this.embeddedData = {};
    }

    /**
     * @return the path of the specified item sheet.
     */
    get template() {
        const path = 'systems/neph5e/templates/item';
        return `${path}/${this.item.type}.html`;
    }


    /**
     * @param science The name of the science.
     * @returns the dictionnary of the cercles.
     */
    cerclesOf(science) {
        const cercles = {}
        for (let cercle of Science.cerclesOf(science)) {
            if (cercle.includes('@')) {
                const item = game.items.find(i => i.system.key === cercle);
                cercles[cercle] = item != null ? item.name : cercle.split('@')[1];
            } else {
                cercles[cercle] = game.i18n.localize('NEPH5E.' + cercle);
            }
        };
        return cercles;
    }

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        foundry.utils.mergeObject(data, {
            system: data.item.system,
            isGM: game.user.isGM,
            debug: game.settings.get('neph5e', 'debug')
        })
        foundry.utils.mergeObject(data, this.getOriginalData());
        foundry.utils.mergeObject(data, this.embeddedData);
        this.embeddedData = {};
        return data;
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
     * @override
     */
	static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ["nephilim", "sheet", "item"],
            resizable: true
      });
    }

    /**
     * Edits the specified referenced item.
     */
    async onEdit(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        item.sheet.render(true);
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