export class CancellableDialog {

    /**
     * Constructor.
     * @param actor The actor for which to open the dialog.
     */
    constructor(actor) {
        this.actor = actor;
        this.title = null;
        this.template = null;
        this.data = null;
        this.callback = null;
    }

    /**
     * Sets the specified dialog title.
     * @param title The title to set.
     * @returns the instance.
     */
    withTitle(title) {
        this.title = title;
        return this;
    }

    /**
     * Sets the specified template used to create the dialog content.
     * @param template The path of the file template to set.
     * @returns the instance.
     */
    withTemplate(template) {
        this.template = template;
        return this;
    }

    /**
     * Sets the specified data used to create the dialog content.
     * @param data The data of the file template to set.
     * @returns the instance.
     */
     withData(data) {
        this.data = data;
        return this;
    }

    /**
     * Sets the specified callback used to create the dialog content.
     * @param callback The callback function to set.
     * @returns the instance.
     */
     withCallback(callback) {
        this.callback = callback;
        return this;
    }

    /**
     * Renders the dialog.
     */
    async render() {
        const actor = this.actor;
        const data = await renderTemplate(this.template, this.data);
        new Dialog({
            title: this.title,
            content: data,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Modifier"),
                    callback: this.callback
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => {}
                }
            },
            default: "roll",
            close: () => {
                actor.unlock()
            }
        }).render(true);
    }

}