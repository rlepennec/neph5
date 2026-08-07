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
        ui.notifications.info(game.i18n.format("NEPHILIM.copyIdEffecutee", { id: id }));
    }

    withSheet(sheet) {
        this.sheet = sheet;
        return this;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.debug = game.user.isGM && game.settings.get('neph5e', 'debug');
        return context;
    }

}