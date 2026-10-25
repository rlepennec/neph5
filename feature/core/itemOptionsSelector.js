import { AbstractOptionsSelector } from "./abstractOptionsSelector.js";
import { Version } from "../../module/common/version.js";

export class ItemOptionsSelector extends AbstractOptionsSelector {

    static DEFAULT_OPTIONS = {
        position: { width: 300, height: 'auto' },
        form: { handler: ItemOptionsSelector.#onSubmit }
    }

    static PARTS = {
        form: { template: `systems/neph5e/templates/item/options.hbs` }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await game.settings.set('neph5e', 'styleItemSheet', formData.object.style);

        // Le MJ active l'objet ou non pour chaque version de règles que son type déclare
        const document = this.versionsModifiables ? this.sheet.document : null;
        if (document != null) {
            const update = {};
            for (const version of Version.of(document)) {
                const valeur = formData.object['enabled.' + version];
                if (typeof valeur === 'boolean') update[Version.path(document, 'enabled', version)] = valeur;
            }
            if (Object.keys(update).length > 0) await document.update(update);
        }
    }

    /**
     * @returns true si les versions de l'objet se règlent ici : par le MJ, sur un objet du monde
     *          ou d'un compendium (pas sur une copie embarquée, qui ne compte pas).
     */
    get versionsModifiables() {
        const document = this.sheet?.document;
        return game.user.isGM && document != null && !document.isEmbedded && Version.of(document).length > 0;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.style = {
            current: game.settings.get('neph5e', 'styleItemSheet'),
            all: ['classique', 'ashbury']
        };
        // Une case par version de règles déclarée par le type, pour le MJ
        context.versions = this.versionsModifiables
            ? Version.of(this.sheet.document).map(version => ({
                version: version,
                enabled: Version.data(this.sheet.document, version).enabled !== false
            }))
            : [];
        return context;
    }

}