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

    /**
     * @override
     */
    _initializeApplicationOptions(options) {
        const merged = super._initializeApplicationOptions(options);
        if (game.user.isGM !== true) {
            merged.position = Object.assign({}, merged.position, { height: 310 });
        }
        return merged;
    }

}