export class AbstractDialog extends FormApplication {

    /**
     * Constructor.
     * @param actor The emiter of the dialog.
     */
    constructor(actor) {
        super(actor);
        this.data = null;
    }

    /**
     * @param title The title of the dialog panel.
     * @returns the instance.
     */
    withTitle(title) {
        this.options.title = title;
        return this;
    }

    /**
     * @param template The path of the template file used to create the dialog.
     * @returns the instance.
     */
    withTemplate(template) {
        this.options.template = template;
        return this;
    }

    /**
     * @param data The data used to create the content of the dialog.
     * @returns the instance.
     */
    withData(data) {
        this.data = data;
        return this;
    }

    /**
     * @param height The height of the dialog panel.
     * @returns the instance.
     */
    withHeight(height) {
        this.options.height = height;
        this.position.height = height;
        return this;
    }

    /**
     * @param width The width of the dialog panel.
     * @returns the instance.
     */
    withWidth(width) {
        this.options.width = width;
        this.position.width = width;
        return this;
    }

    /**
     * @returns the default options to manage the dialog.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {});
    }

    /**
     * @override
     */
    getData(options) {
        const data = foundry.utils.duplicate(this.data);
        data.owner =  this.object.id;
        data.opposed = false;
        return data;
    }

}