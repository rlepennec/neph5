import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class SortSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/sort.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.elements,
            cercles: super.cerclesOf('magie')
        }
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.delete-voie').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a sort. The dropped item can be
     *   - une voie magique
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop.type === "magie") {
            await this.document.updateItemRefs(drop.system, this.document.system.voies, "system.voies");
        }
    }

    /**
     * This function catches the deletion of a voie from the list of voies.
     */
    async _onDelete(event) {
        await this.document.deleteItemRefs(event, this.document.system.voies, "system.voies");
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update voies
        if (formData.object["system.cercle"] === "basseMagie") {
            formData.object["system.voies"] = [];
        } else {
            let size = this.document.system.voies == null ? 0 : this.document.system.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = "system.voies.[" + index + "]";
                voies.push(formData.object[name]);
                delete formData.object[name];
            }
            formData.object["system.voies"] = voies;
        }

        // Update syntaxe & incantation
        if (formData.object["system.cercle"] !== "grandSecret") {
            formData.object['system.syntaxe'] = new foundry.data.operators.ForcedDeletion();
            formData.object['system.incantation'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);
    }

}