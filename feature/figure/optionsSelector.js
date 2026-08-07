import { ActorOptionsSelector } from "../core/actorOptionsSelector.js";

export class OptionsSelector extends ActorOptionsSelector {

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