import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArmeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-orichalque"],
        position: {
            width: 730,
            height: 800
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/combat/item/arme.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                types: Constants.ARMES
            }
        }
    }

    /**
     * This function catches the drop on a weapon. The uuid of the dropped item is stored
     * as skill to use the weapon. The dropped item can be
     *   - a vecu
     *   - a competence
     * @param event    The drop event.
     * @param document The document identifier which has been dropped.
     */
	async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "competence":
            case "vecu":
                await this.document.updateItemRef('competence', document.sid);
                break;
        }
    }

}