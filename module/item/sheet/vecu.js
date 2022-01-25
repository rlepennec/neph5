import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { updateItemRefs } from "../../common/tools.js";
import { deleteItemRefs } from "../../common/tools.js";
import { Game } from "../../common/game.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class VecuSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
        data.elements = Game.pentacle.elements;
        return data;
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.tbd').on("drop", this._onDrop.bind(this));
        html.find('.add-mnemos').click(this._onEditMnemos.bind(this));
        html.find('.edit-competence').click(this.onEdit.bind(this));
        html.find('.edit-periode').click(this.onEditPeriode.bind(this));
        html.find('.delete-competence').click(this._onDelete.bind(this));
        html.find('.delete-mnemos').click(this._onDeleteMnemos.bind(this));
    }

    /**
     * This function catches the drop on a competence.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
        if (drop?.data?.type === "competence") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.competences, "data.competences", false);
        } else if (drop?.data?.type === "periode") {
            await this.item.update({ ['data.periode']: drop.data.data.id });
        }
    }

    /**
     * This function catches the deletion of a competence from the list of competences.
     */
    async _onDelete(event) {
        await deleteItemRefs(this.item, event, this.item.data.data.competences, "data.competences");
    }

    /**
     * This function catches the deletion of a competence from the list of competences.
     */
     async _onDeleteMnemos(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest('.item');
        const id = li.data("item-id");
        const data = duplicate(this.item.data.data);
        data.mnemos.splice(id, 1);
        await this.item.update({ ['data']: data });
    }

    /**
     * Edits the specified referenced item.
     */
     async onEditPeriode(event) {
        event.preventDefault();
        const item = CustomHandlebarsHelpers.getItem(this.item.data.data.periode);
        item.sheet.render(true);
    }

    /**
     * This function catches the edition of mnemos. 
     */
    async _onEditMnemos(event) {

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/dialog/basic/basic-mnemos.html", {});

        // Display the action panel
        await new Dialog({
            title: "Effet Mnemos",
            content: html,
            buttons: {
                add: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("NEPH5E.ajouter"),
                    callback: async (html) => {
                        const content = html.find("#content").val();
                        const data = duplicate(this.item.data.data);
                        data.mnemos.push(content);
                        await this.item.update({ ['data']: data });
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("NEPH5E.annuler"),
                    callback: () => {},
                },
            },
            default: "add",
            close: () => {}

        }).render(true);

    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update competences
        let size = this.item.data.data.competences.length;
        const competences = [];
        for (let index = 0; index < size; index++) {
            const name = "data.competences.[" + index + "]";
            competences.push({ refid: formData[name + ".refid"] });
            delete formData[name + ".refid"];
        }
        formData["data.competences"] = competences;

        // Update object
        super._updateObject(event, formData);
    }

}