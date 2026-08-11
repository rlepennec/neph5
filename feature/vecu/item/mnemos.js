import { LockableMixin } from "../../../module/common/lockableMixin.js";

export class Mnemos extends LockableMixin(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)) {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param data   The vecu item.
     * @param mnemos The index of the mnemos to update, null if a new one.
     * @param options ApplicationV2 options.
     */
    constructor(actor, data, mnemos, options = {}) {
        super(options);
        this.actor = actor;
        this.data = data;
        this.mnemos = mnemos;
    }

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet", "item"],
        position: {
            width: 500,
            height: 450
        },
        window: {
            title: "Mnémos",
            resizable: true
        },
        tag: "form",
        form: {
            handler: Mnemos.#onSubmit,
            closeOnSubmit: false,
            submitOnChange: true
        }
    }

    static PARTS = {
        form: {
            template: "systems/neph5e/feature/vecu/actor/mnemos.html"
        }
    }

    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const style = game.settings.get('neph5e', 'styleItemSheet');
        parts.form.template = parts.form.template.replace(/\.html$/, `-${style}.html`);
        return parts;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.add('item-vecu');
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.system = this.data.system;

        let name, degre, description;
        if (this.mnemos == null) {
            name = this.data.name;
            degre = 0;
            description = "";
        } else {
            const m = this.data.system.mnemos[this.mnemos];
            name = m.name;
            degre = m.degre;
            description = m.description;
        }

        context.name = name;
        context.degre = degre;
        context.description = description;
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            description ?? "",
            { secrets: true, relativeTo: this.data }
        );
        
        return context;
    }

    /**
     * Sauvegarde le mnémos (création ou mise à jour) dans le vécu.
     */
    static async #onSubmit(event, form, formData) {
        const system = foundry.utils.duplicate(this.data.system);
        // Le <prose-mirror> n'est pas capté par formData ici : on lit sa valeur directement.
        const description = form.querySelector('prose-mirror[name="description"]')?.value ?? "";
        const entry = {
            name: formData.object.name,
            degre: formData.object.degre,
            description: description
        };
        if (this.mnemos == null) {
            this.mnemos = system.mnemos.length;
            system.mnemos.push(entry);
        } else {
            system.mnemos[this.mnemos] = entry;
        }
        await this.data.update({ system: system });
        this.data.sheet.render(true);
    }

}