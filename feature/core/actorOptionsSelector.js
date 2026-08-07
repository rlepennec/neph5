import { AbstractOptionsSelector } from "./abstractOptionsSelector.js";
import { Constants } from "../../module/common/constants.js";

export class ActorOptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        form: { handler: ActorOptionsSelector.#onSubmit }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await this.sheet.setOptions(formData.object);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const opts = this.sheet.document.system.options;
        Object.assign(context, opts);
        context.themes = { current: opts.theme, all: Constants.THEMES };
        return context;
    }

}