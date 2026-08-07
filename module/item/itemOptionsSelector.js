/**
 * Fenêtre de configuration des fiches d'item.
 * Permet de choisir le style de fiche d'item (réglage 'styleItemSheet') et de le sauver.
 * Ouverte depuis l'engrenage de la barre de titre (logique partagée dans le mixin).
 */
export class ItemOptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: {
            width: 300,
            height: 200
        },
        window: {
            resizable: true,
            title: 'NEPHILIM.setup'
        },
        tag: "form",
        form: {
            handler: ItemOptionsSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        }
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/templates/item/options.hbs`,
        }
    }

    /**
     * Sauve le style de fiche d'item choisi. Le onChange du réglage re-render
     * automatiquement les fiches d'item ouvertes.
     */
    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await game.settings.set('neph5e', 'styleItemSheet', formData.object.style);
    }

    /**
     * @param sheet La fiche émettrice (requis par la logique partagée d'ouverture).
     * @returns l'instance (chaînable).
     */
    withSheet(sheet) {
        this.sheet = sheet;
        return this;
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.style = {
            current: game.settings.get('neph5e', 'styleItemSheet'),
            all: ['classique', 'ashbury']
        };
        return context;
    }

}