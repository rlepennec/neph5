import { ActorOptionsSelector } from "../core/actorOptionsSelector.js";

export class OptionsSelector extends ActorOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: {
            width: 225,
            height: 320
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figurant/options.hbs`,
        }
    }

}