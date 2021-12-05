import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class NephilimItemSheet extends ItemSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
    }

    /**
     * @return the path of the specified item sheet.
     */
    get template() {
        const path = 'systems/neph5e/templates/item';
        return `${path}/${this.item.data.type}.html`;
    }

    /** 
     * @override
     */
    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item: baseData.item,
            data: baseData.item.data.data
        }
        return sheetData;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

    /**
     * Edits the specified referenced item.
     */
    async onEdit(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        item.sheet.render(true);
    }

}