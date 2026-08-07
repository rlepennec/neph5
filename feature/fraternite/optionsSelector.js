import { ActorOptionsSelector } from "../core/actorOptionsSelector.js";

export class OptionsSelector extends ActorOptionsSelector {

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