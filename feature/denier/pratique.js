import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Pratique extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Pratique Synarque";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.pratique';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Pratique', this.degre)
            .withBlessures('magique')
            .withAide("participants")
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.ka;

        return Math.max(0, this.actor.savoir("denier").degre + ka - focus);

    }

    /**
     * @Override
     */
    modifier(parameters) {
        return parameters?.aide == null ? 0 : parameters.aide * 10;
    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a pratique")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'degre')
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

}