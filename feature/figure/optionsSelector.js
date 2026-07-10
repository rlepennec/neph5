import { AbstractOptionsSelector } from "../core/abstractOptionsSelector.js";

export class OptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: {
            width: 300,
            height: 600
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figure/options.hbs`,
        }
    }

}