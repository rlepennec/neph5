import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class DracomachieSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = CustomHandlebarsHelpers.cerclesOf('dracomachie', true);
        return data;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".article-body", initial: "description"}]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/dracomachie/item/dracomachie.html`;
    }

}