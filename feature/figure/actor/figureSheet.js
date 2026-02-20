import { NephilimActorSheet } from "../../../module/actor/nephilimActorSheet.js";
import { DocumentReferences } from "../../../module/document/documentReferences.js";

export class FigureSheet extends NephilimActorSheet {

    static #ID = 'figure';

    static DEFAULT_OPTIONS = {
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/actor/${this.#ID}Sheet.hbs`,
        },
    }

    static TABS = {
        primary: {
            tabs: [
                { 
                    id: "description",
                    template: `systems/neph5e/feature/${this.#ID}/actor/descriptionSheet.hbs`
                },
                {
                    id: "vecu",
                    template: `systems/neph5e/feature/${this.#ID}/actor/vecuSheet.hbs`
                }
            ],
            initial: "description"
        },
    }

    static tabs(g, groups) {
        const group = this.TABS[g];
        const tabs = group.tabs;
        tabs.forEach(t => {
            t.group = g;
            t.label = t.id;
            t.active = t.id === groups[g];
        });
        return tabs;
    }

    _onClickTab(event) {
        const button = event.target;
        const tab = button.dataset.tab;
        if (!tab || button.classList.contains("active") || (event.button !== 0)) return;
        const group = button.dataset.group;
        if (this._changeTab(tab, group)) {
            this.render();
        }
    }

    /**
     * Change the active tab within a tab group in this Application instance.
     * @param {string} tab        The name of the tab which should become active
     * @param {string} group      The name of the tab group which defines the set of tabs
     * @returns true if the a new tab has been selected.
     */
    _changeTab(tab, group) {

        // Retrieve the tab element which should become active
        if (!tab || !group) throw new Error("You must pass both the tab and tab group identifier");
        if ((this.tabGroups[group] === tab)) return false;
        const tabElement = this.form.querySelector(`nav [data-group="${group}"][data-tab="${tab}"]`);
        if (!tabElement) throw new Error(`No matching tab element found for group "${group}" and tab "${tab}"`);

        // Update tab navigation
        for (const t of this.form.querySelectorAll(`nav [data-group="${group}"]`)) {
            t.classList.toggle("active", t.dataset.tab === tab);
            if (t instanceof HTMLButtonElement) t.ariaPressed = `${t.dataset.tab === tab}`;
        }

        // Update tab contents
        for (const section of this.form.querySelectorAll(`.tab[data-group="${group}"]`)) {
            section.classList.toggle("active", section.dataset.tab === tab);
        }
        this.tabGroups[group] = tab;
        return true;

    }
   

/*  */

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            tabs: FigureSheet.tabs("primary", this.tabGroups),
            context: {
                vecus: new DocumentReferences('Item', 'vecu', this.document)
            }
        };
        return context;
    }




    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'description':
            case 'vecu':
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }


}