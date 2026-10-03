import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Habitus extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet d'Habitus";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfSort';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Habitus', this.degre)
            .withBlessures('magique')
            .withMetamorphe(this.actor.metamorphe.visibles)
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, Version.data(this.item).domaine).degre;
        if (science < 1) {
            return -121;
        }

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa(Version.data(this.item).element === "luneNoire" ? "noyau" : Version.data(this.item).element);
        if (ka < 1) {
            return -105;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        // Final result
        return science + ka - focus + 1;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of an habitus")
            .withDeleteExisting()
            .withIncarnation(this.periode)
            .withoutData('description', 'domaine', 'element', 'voies', 'degre', 'incantation', 'portee', 'duree')
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