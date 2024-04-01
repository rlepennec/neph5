import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Divination extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Divination bohémienne";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.divination';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Divination', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa('brume');
        if (ka < 1) {
            return -113;
        }

        const savoir = this.actor.savoir("bohemien").degre;
        if (savoir < 1) {
            return -114;
        }

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        return savoir + ka - focus;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a divination")
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