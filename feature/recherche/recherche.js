import { AbstractDialog } from "../core/abstractDialog.js";

export class RechercheDialog extends AbstractDialog {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet"],
        position: {
            width: 1030,
            height: "auto"
        },
        window: {
            title: "Recherche occulte"
        }
    };

    static PARTS = {
        main: {
            template: "systems/neph5e/feature/recherche/recherche.hbs"
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