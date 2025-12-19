export class Templates {

    static register() {
        foundry.applications.handlebars.loadTemplates([
            `systems/neph5e/templates/item-description.hbs`,
            `systems/neph5e/templates/item-header.hbs`,
            `systems/neph5e/templates/item-input.hbs`,
            `systems/neph5e/templates/item-label.hbs`,
            `systems/neph5e/templates/item-references.hbs`,
            `systems/neph5e/templates/item-select.hbs`,
        ]);
    }

}