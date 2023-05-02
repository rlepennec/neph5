import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Appel extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Conjuration';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.appel';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Appel', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;

        // Final result
        return science;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a appel")
            .withDeleteExisting()
            .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
            .withData("periode", this.periode)
            .withoutData('description', 'degre', 'appel', 'controle', 'visibilite', 'entropie', 'dommages', 'protection')
            .create();

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            cercles: Game.conjuration.cercles,
            appels: Game.conjuration.appels,
            difficulty: this.degre
        }
    }

}