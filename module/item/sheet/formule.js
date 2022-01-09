import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { updateItemRefs } from "../../common/tools.js";
import { deleteItemRefs } from "../../common/tools.js";
import { Game } from "../../common/game.js";

export class FormuleSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.pentacle.elements;
        data.cercles = Game.alchimie.cercles;
        data.substances = Game.alchimie.substances;
        return data;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="description"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="description"] .item-delete').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on an formule.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
        if (drop.data.type === "formule") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.variantes, "data.variantes", false);
        }
        if (drop.data.type === "catalyseur") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.catalyseurs, "data.catalyseurs", false);
        }
    }

    /**
     * This function catches the deletion of a catalyseur or a variante.
     */
    async _onDelete(event) {

        // Retrieve the id of the reference to delete
        const li = $(event.currentTarget).closest(".item");
        const type = li.data("item-type");
        const id = li.data("item-id");

        if (type == "catalyseur") {
            await deleteItemRefs(this.item, event, this.item.data.data.catalyseurs, "data.catalyseurs");
        }

        if (type == "variante") {
            await deleteItemRefs(this.item, event, this.item.data.data.variantes, "data.variantes");
        }

    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update elements
        const elements = [];
        const fst = formData["data.elements.[0]"];
        const snd = formData["data.elements.[1]"];
        elements.push(fst);
        delete formData["data.elements.[0]"];
        if (formData["data.cercle"] === "oeuvreAuBlanc") {
            elements.push(snd);
            delete formData["data.elements.[1]"];
        }
        formData["data.elements"] = elements;

        // Update catalyseurs
        let size = this.item.data.data.catalyseurs.length;
        const catalyseurs = [];
        for (let index = 0; index < size; index++) {
            const name = "data.catalyseurs.[" + index + "]";
            catalyseurs.push({ refid: formData[name + ".refid"] });
            delete formData[name + ".refid"];
        }
        formData["data.catalyseurs"] = catalyseurs;

        // Update variantes
        size = this.item.data.data.variantes.length;
        const variantes = [];
        for (let index = 0; index < size; index++) {
            const name = "data.variantes.[" + index + "]";
            variantes.push({ refid: formData[name + ".refid"] });
            delete formData[name + ".refid"];
        }
        formData["data.variantes"] = variantes;

        // Update object
        super._updateObject(event, formData);
    }

}