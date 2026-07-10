import { Constants } from "../../module/common/constants.js";

/**
 * Base commune des sélecteurs d'options d'acteur (figure/figurant/fraternité...).
 * Chaque sélecteur concret ne déclare que sa position et son template.
 */
export class AbstractOptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: {
            width: 300,
            height: 600
        },
        window: {
            resizable: true,
            title: 'Nephilim form'
        },
        tag: "form",
        form: {
            handler: AbstractOptionsSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }

    /**
     * Les name= du formulaire correspondent aux clés de system.options,
     * et setOptions (générique) écrit chaque champ → on passe formData.object tel quel.
     */
    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await this.sheet.setOptions(formData.object);
    }

    /**
     * @param sheet La fiche émettrice.
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
        const opts = this.sheet.document.system.options;
        Object.assign(context, opts);
        context.themes = {
            current: opts.theme,
            all: Constants.THEMES
        };
        return context;
    }

}