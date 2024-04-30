import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class ArmeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return { types: {
            naturelle: "NEPH5E.armes.naturelle",
            melee:     "NEPH5E.armes.melee",
            trait:     "NEPH5E.armes.trait",
            feu:       "NEPH5E.armes.feu"
        }}
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 650,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/combat/item/arme.html`;
    }

    /**
     * @override
     */
     activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
    }

    /**
     * This function catches the drop on a weapon. The uuid of the dropped item is stored
     * as skill to use the weapon. The dropped item can be
     *   - a vecu
     *   - a competence
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop?.type === "vecu" || drop?.type === "competence") {
            const item = CustomHandlebarsHelpers.getItem(drop.sid);
            const system = foundry.utils.duplicate(this.item.system);
            system.competence = item.sid;
            await this.item.update({ ['system']: system });
            await this.render(true);
        }
    }

}