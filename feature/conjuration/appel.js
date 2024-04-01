import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
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
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a appel")
            .withDeleteExisting()
            .withData("status", (previous == null ? Constants.CONNU : previous.system.status))
            .withData("periode", this.periode)
            .withoutData('description', 'degre', 'appel', 'controle', 'visibilite', 'entropie', 'dommages', 'protection')
            .create();

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: this.degre
        }
    }

    /**
     * @return -100 if uncastable, the value otherwise
     */
    get rawDegre() {

        if (this.embedded == null) {
            return -100;
        }

        if (this.embedded.system.status === 'connu') {
            return -101;
        }

        if (this.embedded.system.focus !== true && this.embedded.system.status === 'dechiffre') {
            return -102;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;
        if (science === 0) {
            return -103;
        }

        return science;

    }

}