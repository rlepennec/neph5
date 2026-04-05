import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";
import { Mnemos } from "./mnemos.js";

export class VecuSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/periode/item/vecu.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.pentacle.elements
        }
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.add-mnemos').click(this._onAddMnemos.bind(this));
        html.find('.edit-mnemos').click(this._onEditMnemos.bind(this));
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
        const system = foundry.utils.duplicate(this.item.system);
        system.mnemos.splice(id, 1);
        await this.item.update({ ['system']: system });
        this.item.sheet.render(true);
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
     * This function catches the addiition of mnemos. 
     */
    async _onAddMnemos(event) {
        return new Mnemos(this.actor, this.item).render(true);;
    }

    /**
     * This function catches the edition of mnemos. 
     */
    async _onEditMnemos(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest('.item');
        const id = li.data("item-id");
        return new Mnemos(this.actor, this.item, id).render(true);;
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update competences
        let size = this.document.system.competences.length;
        const competences = [];
        for (let index = 0; index < size; index++) {
            const name = "system.competences.[" + index + "]";
            competences.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object["system.competences"] = competences;

        // Update mnemos
        if (this.document.system.mnemos != null) {
            size = this.document.system.mnemos.length;
            const mnemos = [];
            for (let index = 0; index < size; index++) {
                const key = "system.mnemos.[" + index + "].";
                mnemos.push({
                    name: formData.object[key + "name"],
                    degre: formData.object[key + "degre"],
                    description: formData.object[key + "description"],
                });
                delete formData.object[key + "name"];
                delete formData.object[key + "degre"];
                delete formData.object[key + "description"];
            }
            formData.object["system.mnemos"] = mnemos;
        }

        // Update object
        await this.document.update(formData.object);
    }

}