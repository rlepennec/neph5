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
    console.log(this.form);
    const button = event.target;
    const tab = button.dataset.tab;
    if ( !tab || button.classList.contains("active") || (event.button !== 0) ) return;
    const group = button.dataset.group;
    const navElement = button.closest(".tabs");
    console.log("_onClickTab");
    this.changeTab(tab, group, {event, navElement});
    
  }

  /**
   * Change the active tab within a tab group in this Application instance.
   * @param {string} tab        The name of the tab which should become active
   * @param {string} group      The name of the tab group which defines the set of tabs
   * @param {object} [options]  Additional options which affect tab navigation
   * @param {Event} [options.event]                 An interaction event which caused the tab change, if any
   * @param {HTMLElement} [options.navElement]      An explicit navigation element being modified
   * @param {boolean} [options.force=false]         Force changing the tab even if the new tab is already active
   * @param {boolean} [options.updatePosition=true] Update application position after changing the tab?
   */

  
  changeTab(tab, group, {event, navElement, force=false, updatePosition=true}={}) {

    const content = this.form;

    if ( !tab || !group ) throw new Error("You must pass both the tab and tab group identifier");
    if ( (this.tabGroups[group] === tab) && !force ) return;  // No change necessary
    const tabElement = content.querySelector(`nav [data-group="${group}"][data-tab="${tab}"]`);
    if ( !tabElement ) throw new Error(`No matching tab element found for group "${group}" and tab "${tab}"`);

    // Update tab navigation
    for ( const t of content.querySelectorAll(`nav [data-group="${group}"]`) ) {
      t.classList.toggle("active", t.dataset.tab === tab);
      if ( t instanceof HTMLButtonElement ) t.ariaPressed = `${t.dataset.tab === tab}`;
    }

    // Update tab contents
    for ( const section of content.querySelectorAll(`.tab[data-group="${group}"]`) ) {
      section.classList.toggle("active", section.dataset.tab === tab);
    }
    this.tabGroups[group] = tab;

    // Update automatic width or height
    if ( !updatePosition ) return;
    const positionUpdate = {};
    if ( this.options.position.width === "auto" ) positionUpdate.width = "auto";
    if ( this.options.position.height === "auto" ) positionUpdate.height = "auto";
    if ( !foundry.utils.isEmpty(positionUpdate) ) this.setPosition(positionUpdate);

    this.render();
  }
   
  

/*   changeTab(tab, group, {event, navElement, force=false, updatePosition=true}={}) {
    super.changeTab(tab, {event, navElement, force, updatePosition});
    this.render();
  } */





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