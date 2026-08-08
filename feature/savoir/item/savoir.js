import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class SavoirSheet extends NephilimItemSheet {

    /**
     * Le savoir n'est pas éditable lorsqu'il est ouvert depuis un acteur.
     * @override
     */
    get editableFromActor() {
        return false;
    }

    static DEFAULT_OPTIONS = {
        classes: ["vk-savoir"],
        position: {
            width: 900,
            height: 750
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/savoir/item/savoir.html`,
        }
    }

}