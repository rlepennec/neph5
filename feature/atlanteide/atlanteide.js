import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Atlanteide extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Rituel Altlantéide";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfAtlanteide';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Rituel', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, Version.data(this.item).cercle).degre;
        if (science < 1) {
            return -120;
        }

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.ka;
        if (ka < 1) {
            return -105;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        // Final result
        return science + ka - focus;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a rituel altantéide")
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