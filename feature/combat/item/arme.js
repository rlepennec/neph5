import { NephilimItemSheet } from "../../../module/item/base.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class ArmeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.types = {
            naturelle: "NEPH5E.armes.naturelle",
            melee:     "NEPH5E.armes.melee",
            trait:     "NEPH5E.armes.trait",
            feu:       "NEPH5E.armes.feu"
        };
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
        return `systems/neph5e/feature/combat/item/arme.html`;
    }

    /**
     * @override
     */
     activateListeners(html) {
        super.activateListeners(html);
        html.find('.tbd').on("drop", this._onDrop.bind(this));
    }

    /**
     * This function catches the drop of vecu or competence to register the skill uuid.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop?.type === "vecu" || drop?.type === "competence") {
            const item = CustomHandlebarsHelpers.getItem(drop.sid);
            const system = duplicate(this.item.system);
            system.competence = item.sid;
            await this.item.update({ ['system']: system });
            await this.render(true);
        }
    }

}