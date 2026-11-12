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

        // Le MJ active l'objet ou non pour chaque version de règles compatible avec son type
        const document = this.versionsModifiables ? this.sheet.document : null;
        if (document != null) {
            const update = {};
            for (const version of this.versions) {
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
        return game.user.isGM && document != null && !document.isEmbedded && this.versions.length > 0;
    }

    /**
     * @returns les versions dont l'objet a une case : compatibles avec son type (fixé dans le
     *          code, voir Version.compatible) et portées par son modèle.
     */
    get versions() {
        const document = this.sheet?.document;
        if (document == null) return [];
        const portees = Version.of(document);
        return Version.compatibles(document.type, document.documentName).filter(v => portees.includes(v));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.style = {
            current: game.settings.get('neph5e', 'styleItemSheet'),
            all: ['classique', 'ashbury']
        };
        // Une case par version de règles compatible avec le type, pour le MJ
        context.versions = this.versionsModifiables
            ? this.versions.map(version => ({
                version: version,
                enabled: Version.data(this.sheet.document, version).enabled !== false
            }))
            : [];
        return context;
    }

}