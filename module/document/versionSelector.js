export class VersionSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: {
            width: 600,
            height: 600
        },
        window: {
            resizable: true,
            title: 'Nephilim form'
        },
        tag: "form",
        form: {
            handler: VersionSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }



    static PARTS = {
        form: {
            template: `systems/neph5e/templates/version-selector.hbs`,
        }
    }

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        //await game.settings.set("mon-module", "optionSelectionnee", formData.get("option"));
        console.log(formData);
        console.log(formData.get("version"));
    }

    /*
    get document() {
        return this.options.document
    }
        */

    /** 
     * @override
     */
    /*
    async _renderFrame(options) {
        console.log("_renderFrame");
    }
        */


    /** 
     * @override
     */
    /*
    async _onRender(context, options) {
        console.log("_onRender");
    }
        */


    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        return context;
    }

}