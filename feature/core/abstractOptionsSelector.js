import { Version } from "../../module/common/version.js";

/**
 * Base commune des fenêtres de configuration (options d'acteur, style d'item...).
 * Fournit la liaison à la fiche émettrice (withSheet) et l'action partagée "copy"
 * qui copie l'UUID système du document dans le presse-papier.
 */
export class AbstractOptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: { width: 300, height: 600 },
        window: { resizable: true, title: 'Nephilim form' },
        tag: "form",
        form: { closeOnSubmit: true, submitOnChange: false },
        actions: { copy: AbstractOptionsSelector.#onCopy },
        document: null,
    }

    static async #onCopy(event, target) {
        const id = this.sheet?.document?.system?.id;
        if (id == null) {
            ui.notifications.warn(game.i18n.localize("NEPHILIM.copyIdVide"));
            return;
        }
        game.clipboard.copyPlainText(id);
        ui.notifications.info(game.i18n.format("NEPHILIM.copyIdEffectuee", { id: id }));
    }

    withSheet(sheet) {
        this.sheet = sheet;
        return this;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.isGM = game.user.isGM;
        context.debug = context.isGM && game.settings.get('neph5e', 'debug');
        // Une case par version de règles compatible avec le type, pour le MJ
        context.versions = this.versionsModifiables
            ? this.versions.map(version => ({
                version: version,
                enabled: Version.data(this.sheet.document, version).enabled !== false
            }))
            : [];
        return context;
    }

    /**
     * @returns les versions dont le document a une case : compatibles avec son type (fixé dans
     *          le code, voir Version.compatible) et portées par son modèle.
     */
    get versions() {
        const document = this.sheet?.document;
        if (document == null) return [];
        const portees = Version.of(document);
        return Version.compatibles(document.type, document.documentName).filter(v => portees.includes(v));
    }

    /**
     * @returns true si les versions du document se règlent ici : par le MJ, sur un document du
     *          monde ou d'un compendium (pas sur une copie embarquée, qui ne compte pas).
     */
    get versionsModifiables() {
        const document = this.sheet?.document;
        return game.user.isGM && document != null && !document.isEmbedded && this.versions.length > 0;
    }

    /**
     * Enregistre les cases de version du formulaire, et les retire des données.
     * @param donnees Les données à plat du formulaire (formData.object), modifiées.
     */
    async enregistrerVersions(donnees) {
        const document = this.versionsModifiables ? this.sheet.document : null;
        const update = {};
        for (const version of Version.ALL) {
            const valeur = donnees['enabled.' + version];
            delete donnees['enabled.' + version];
            if (document != null && this.versions.includes(version) && typeof valeur === 'boolean') {
                update[Version.path(document, 'enabled', version)] = valeur;
            }
        }
        if (Object.keys(update).length === 0) return;
        await document.update(update);
        // Les copies embarquées et les répertoires suivent les cases (voir Version.appartient) :
        // les fiches d'acteurs ouvertes sont réaffichées
        for (const app of foundry.applications.instances.values()) {
            if (app.document?.documentName === 'Actor' && app.rendered) app.render();
        }
        ui.items?.render();
        ui.actors?.render();
    }

}