import { DocumentIdentifier } from "../../../module/documentIdentifier.js";
import { Incarnations } from "../../incarnation/item/incarnations.js";
import { NephilimActorSheet } from "../../../module/nephilimActorSheet.js";

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

    // The current edited incarnation document to set. If null, no current incarnation
    // in edition. The vecu sheet displays all sorted incarnations.
    incarnation = null;

    /**
     * @override
     */    
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            tabs: this._prepareTabs("primary"),
            context: {
                incarnation: this.incarnation,
                incarnations: new Incarnations(this.document).toArray()
            }
        }
    }

    /**
     * @override
     */
    async _onSelect(event, target) {

        let document = new DocumentIdentifier(target).toDocument();
        if (document.type = 'incarnation') {
            this.incarnation = document;
            this.render();
        }

    }

    /** 
     * @override
     */
    async _onDrop(event, document) {

        if (document.actor === this.document) {

            switch(document.type) {
                case 'incarnation': {
                    if (this.tabGroups['primary'] ==='vecu') {
                        await new Incarnations(this.document).move(event, document);
                    }
                    break;
                }
            }

        } else {

            switch(document.type) {
                case 'vecu': {
                    if (this.tabGroups['primary'] === 'vecu') {
                        await new Incarnations(this.document).add(event, document);
                    }
                    break;
                }
            }

        }

    }

    /**
     * @override
     */
    async _onExit(event, target) {
        switch (target.dataset.exit) {
            case 'incarnation':
                this.incarnation = null;
                this.render();
                break;
        }
    }

    /** 
     * @override
     */
    async _onDelete(event, target) {
        switch (target.dataset.delete) {
            case 'incarnation':
                await new Incarnations(this.document).delete(this.incarnation);
                this.incarnation = null;
                this.render();
                break;
        }
    }

}