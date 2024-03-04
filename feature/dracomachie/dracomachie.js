import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Dracomachie extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de dracomachie";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.dracomachie';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withElement(this.element)
            .withBase('Passe', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle);

        switch (this.domaine) {
            case 'charmes':
                console.log("charmes !");
                return science.degre;
            case 'rites':
                console.log("rites !");
                return science.degre;
            case 'passes':
                console.log("passes !");
                return Math.max(0, science.degre - focus);
            default:
                console.log("error !");
                return 0;
        }

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a passe")
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

    /**
     * 
     */
    get domaine() {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        switch (science.item.system.key.replace("dracomachie@","")) {
            case 'charmes':
                return 'charmes';
            case 'rites':
                return 'rites';
            case 'passes':
                return 'passes';
            default:
                return 'error';
        }
    }

    /**
     * 
     */
    get element() {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        switch (science.item.system.key.replace("dracomachie@","")) {
            case 'charmes':
                return null;
            case 'rites':
                return null;;
            case 'passes':
                return 'choix';
            default:
                return null;;
        }
    }

}