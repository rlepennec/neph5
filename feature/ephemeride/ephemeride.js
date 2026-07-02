import { AbstractDialog } from "../core/abstractDialog.js";

export class EphemerideDialog extends AbstractDialog {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet"],
        position: {
            width: 600,
            height: "auto"
        },
        window: {
            title: "Ephéméride"
        }
    };

    static PARTS = {
        main: {
            template: "systems/neph5e/feature/ephemeride/ephemeride.hbs"
        }
    };

    constructor() {
        super(null);
    }

    async _prepareContext(options) {
        return {
            isGM: game.user.isGM
        };
    }

}