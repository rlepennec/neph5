import { AbstractOptionsSelector } from "./abstractOptionsSelector.js";
import { Version } from "../../module/common/version.js";
import { Constants } from "../../module/common/constants.js";

export class ActorOptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        form: { handler: ActorOptionsSelector.#onSubmit }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        // Les cases de version d'abord : elles ne sont pas des options de la fiche
        await this.enregistrerVersions(formData.object);
        await this.sheet.setOptions(formData.object);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const opts = Version.data(this.sheet.document).options;
        Object.assign(context, opts);
        context.themes = { current: opts.theme, all: Constants.THEMES };
        return context;
    }

}