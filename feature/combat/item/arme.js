import { Version } from "../../../module/common/version.js";
import { Groupe } from "../../groupe/groupe.js";
import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArmeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-arme"]
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
                types: Constants.ARMES,
                // Une compétence inactive n'apparaît pas (voir Groupe)
                competence: Groupe.reference(Version.data(this.document, this.version).competence)
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