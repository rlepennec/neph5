import { AbstractDialog } from "../core/abstractDialog.js";

export class ExperienceDialog extends AbstractDialog {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet"],
        position: {
            width: 1030,
            height: "auto"
        },
        window: {
            title: "Expérience"
        }
    };

    static PARTS = {
        main: {
            template: "systems/neph5e/feature/experience/experience.hbs"
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