import { AbstractOptionsSelector } from "../core/abstractOptionsSelector.js";

export class OptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: {
            width: 250,
            height: 340
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/fraternite/options.hbs`,
        }
    }

}