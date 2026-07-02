import { Constants } from "../../module/common/constants.js"

export class OptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: {
            width: 250,
            height: 340
        },
        window: {
            resizable: true,
            title: 'Nephilim form'
        },
        tag: "form",
        form: {
            handler: OptionsSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/fraternite/options.hbs`,
        }
    }

    /**
     * @param {*} event    The event to handle.
     * @param {*} form     The form to use.
     * @param {*} formData 
     */
    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await this.sheet.setOptions({
            theme: formData.object.theme,
            chronologieDescendante: formData.object.chronologieDescendante,
            active: formData.object.active,
            incarnationsOuvertes: formData.object.incarnationsOuvertes
        });
    }

    /**
     * @param {*} sheet The sheet to register. 
     * @returns the instance.
     */
    withSheet(sheet) {
        this.sheet = sheet;
        return this;
    }

    /** 
     * @override
     * @protected
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