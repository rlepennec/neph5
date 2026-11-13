import { ActorOptionsSelector } from "../../../core/regles/v5/actorOptionsSelector.js";

export class OptionsSelector extends ActorOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: {
            width: 225,
            height: 320
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figurant/regles/v5/options.hbs`,
        }
    }

}