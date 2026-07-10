import { AbstractOptionsSelector } from "../core/abstractOptionsSelector.js";

export class OptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: {
            width: 200,
            height: 270
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figurant/options.hbs`,
        }
    }

}