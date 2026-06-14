import { Constants } from "../../module/common/constants.js"

export class OptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
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
            handler: OptionsSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figure/options.hbs`,
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
            nephilim: formData.object.nephilim,
            magie: formData.object.magie,
            analogie: formData.object.analogie,
            kabbale: formData.object.kabbale,
            alchimie: formData.object.alchimie,
            dracomachie: formData.object.dracomachie,
            selenim: formData.object.selenim,
            necromancie: formData.object.necromancie,
            conjuration: formData.object.conjuration,
            luneNoire: formData.object.luneNoire,
            baton: formData.object.baton,
            coupe: formData.object.coupe,
            denier: formData.object.denier,
            epee: formData.object.epee,
            gestionLaboratoire: formData.object.gestionLaboratoire,
            daath: formData.object.daath,
            degatAutomatique: formData.object.degatAutomatique,
            defenseMJ: formData.object.defenseMJ,
            vecus: formData.object.vecus,
            incarnations: formData.object.incarnations,
            combat: formData.object.combat,
            capacites: formData.object.capacites,
            simulacre: formData.object.simulacre,
            soleil: formData.object.soleil,
            akasha: formData.object.akasha,
            fraternites: formData.object.fraternites,
            atlanteide: formData.object.atlanteide,
            bohemien: formData.object.bohemien,
            chronologieDescendante: formData.object.chronologieDescendante,
            degreGauche: formData.object.degreGauche,
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