import { AbstractDialog } from "../../core/abstractDialog.js";

export class Mnemos extends AbstractDialog {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param data   The vecu item.
     * @param mnemos The index of the mnemos to update, null if a new one
     */
    constructor(actor, data, mnemos) {
        super(actor);
        this.actor = actor;
        this.data = data;
        this.mnemos = mnemos;
    }

    /**
     * @returns the default options to manage the dialog.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["nephilim", "sheet", "item"],
            template: "systems/neph5e/feature/periode/actor/mnemos.hbs",
            width: 500,
            height: 450,
            choices: {},
            allowCustom: true,
            minimum: 0,
            maximum: null,
            closeOnSubmit: false,
            submitOnChange: true
        });
    }

    /**
     * @override
     */
    getData(options) {

        const data = super.getData(options);

        if (this.mnemos == null) {
            data.name = this.data.name;
            data.degre = 0;
            data.description = "";
        } else {
            data.name = data.system.mnemos[this.mnemos].name;
            data.degre = data.system.mnemos[this.mnemos].degre;
            data.description = data.system.mnemos[this.mnemos].description;
        }

        return data;
    }

    /**
     * @override
     */
    async _updateObject(event, formData) {

        event.preventDefault();
        const system = duplicate(this.data.system);

        // Create a new mnemos
        if (this.mnemos == null) {
            this.mnemos = system.mnemos.length;
            system.mnemos.push({
                name: formData.name,
                degre: formData.degre,
                description: formData.description
            });

        // Update the current mnemos
        } else {
            system.mnemos[this.mnemos].name = formData.name;
            system.mnemos[this.mnemos].degre = formData.degre;
            system.mnemos[this.mnemos].description = formData.description == null ? system.mnemos[this.mnemos].description : formData.description;
        }

        await this.data.update({ ['system']: system });
        this.data.sheet.render(true);
        this.render(true);

    }

}