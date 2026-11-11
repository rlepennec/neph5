import { Incarnations } from "../../../../feature/incarnation/incarnations.js";
import { NephilimActorSheet } from "../../nephilimActorSheet.js";

/**
 * La fiche d'acteur d'eidolon, volontairement pauvre en attendant les règles : l'image, le nom, la
 * description et, pour une figure ou une fraternité, la chronologie de ses incarnations. Elle ne
 * s'appuie que sur le commun : ni jet, ni quête, ni combat (voir Regles).
 */
export class FicheActeurEidolon extends NephilimActorSheet {

    static VERSION = 'eidolon';

    static DEFAULT_OPTIONS = {
        classes: ["eidolon"],
        actions: {
            currentPeriode: FicheActeurEidolon._onCurrentPeriode
        },
        dropHandlers: {
            periode: FicheActeurEidolon._onDropPeriode
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/module/actor/regles/eidolon/acteur.hbs`,
        }
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const incarnations = new Incarnations(this.document);
        context.porte = incarnations.porte;
        context.incarnations = incarnations.ordonnees().map(i => ({
            sid: i.sid,
            name: i.name,
            courante: i.sid === incarnations.courante
        }));
        return context;
    }

    /**
     * Une période déposée crée une incarnation, en queue de la chronologie.
     */
    static async _onDropPeriode(event, document) {
        const incarnations = new Incarnations(this.document);
        if (!incarnations.porte) return;
        await incarnations.ajouter(document.sid);
    }

    /**
     * Fait d'une incarnation la courante.
     */
    static async _onCurrentPeriode(event, target) {
        if (this.locked) return;
        await this.document.setCurrentPeriode(target.closest('.item').dataset.sid);
    }

}
