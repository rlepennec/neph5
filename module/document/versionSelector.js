export class VersionSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/templates/version-selector.hbs`,
        }
    }

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