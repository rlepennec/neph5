import { ActorOptionsSelector } from "../core/actorOptionsSelector.js";

export class OptionsSelector extends ActorOptionsSelector {

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