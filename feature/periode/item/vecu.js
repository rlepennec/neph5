import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class VecuSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
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
    get template() {
        return `systems/neph5e/feature/periode/item/vecu.html`;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.add-mnemos').click(this._onEditMnemos.bind(this));
        html.find('.edit-competence').click(this.onEdit.bind(this));
        html.find('.edit-periode').click(this.onEditPeriode.bind(this));
        html.find('.delete-competence').click(this._onDelete.bind(this));
        html.find('.delete-mnemos').click(this._onDeleteMnemos.bind(this));
    }

    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a periode
     *   - a competence
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop?.type === "competence") {
            await this.item.updateItemRefs(drop.system, this.item.system.competences, "system.competences");
        } else if (drop?.type === "periode") {
            await this.item.update({ ['system.periode']: drop.sid });
        }
    }

    /**
     * This function catches the deletion of a competence from the list of competences.
     */
    async _onDelete(event) {
        await this.item.deleteItemRefs(event, this.item.system.competences, "system.competences");
    }

    /**
     * This function catches the deletion of a competence from the list of competences.
     */
     async _onDeleteMnemos(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest('.item');
        const id = li.data("item-id");
        const system = duplicate(this.item.system);
        system.mnemos.splice(id, 1);
        await this.item.update({ ['system']: system });
    }

    /**
     * Edits the specified referenced item.
     */
     async onEditPeriode(event) {
        event.preventDefault();
        const item = CustomHandlebarsHelpers.getItem(this.item.system.periode);
        item.sheet.render(true);
    }

    /**
     * This function catches the edition of mnemos. 
     */
    async _onEditMnemos(event) {

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/feature/periode/actor/mnemos.hbs", {});

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
                        const system = duplicate(this.item.system);
                        system.mnemos.push(content);
                        await this.item.update({ ['system']: system });
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
        let size = this.item.system.competences.length;
        const competences = [];
        for (let index = 0; index < size; index++) {
            const name = "system.competences.[" + index + "]";
            competences.push(formData[name]);
            delete formData[name];
        }
        formData["system.competences"] = competences;

        // Update mnemos
        if (this.item.system.mnemos != null) {
            size = this.item.system.mnemos.length;
            const mnemos = [];
            for (let index = 0; index < size; index++) {
                const name = "system.mnemos.[" + index + "]";
                mnemos.push(formData[name]);
                delete formData[name];
            }
            formData["system.mnemos"] = mnemos;
        }

        // Update object
        super._updateObject(event, formData);
    }

}