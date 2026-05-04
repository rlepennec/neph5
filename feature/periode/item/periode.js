import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PeriodeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/periode/item/periode.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                vecus: this._getVecus(this.document.system.id)
            }
        }
    }

    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a vecu
     * @param event The drop event.
     */
	async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "vecu":
                await document.update({ ['system.periode']: this.document.sid });
                await this.render(true);
                break;

        }
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        switch (document.type) {
            case 'vecu':
                await document.update({ ['system.periode']: "" });
                await this.render(true);
                break;
        }
    }

    /**
     * Gets the vecus of the specified periode.
     * @param periode The uuid of the periode.
     * @return the array of the uuid od the vecus.
     */
    _getVecus(periode) {
        const vecus = [];
        for (let vecu of game.items.filter(i => i.type === 'vecu' && i.system.periode === periode)) {
            vecus.push(vecu.sid);
        }
        return vecus;
    }

}