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

        switch (this.domaine) {

            case 'charmes':
                console.log("charmes !");
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withBase('Passe', this.degre)
                    .withBlessures('magique')
                    .export();

            case 'rites':
                console.log("rites !");
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withBase('Passe', this.degre)
                    .withBlessures('magique')
                    .export();

            case 'passes':
                console.log("passes !");
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withOpposition()
                    .withBase('Passe', this.degre)
                    .withBlessures('magique')
                    .withNote(this.contraint(5))
                    .export();

        }

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
                 return science.degre;
            case 'rites':
                return science.degre;
            case 'passes':
                return science.degre - focus;
            default:
                return 0;
        }

    }

    /**
     * @Override
     */
    note(parameters) {
        return this.contraint(parameters?.opposition);
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
     * @Override
     */
    modifier(parameters) {
        const ka = parameters == null ? this.actor.getKa('air') : parameters.ka;
        const menace = parameters?.opposition == null ? 50 : parameters.opposition * 10;
        return ka - menace;
    }

    /**
     * 
     */
    get domaine() {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        return science.item.system.key.replace("dracomachie@","");
    }

    /**
     * 
     */
    get element() {
        switch (this.domaine) {
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

    contraint(menace) {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        const contraint = menace <= this.actor.ka && menace <= science.degre;
        return contraint ? "L'effet dragon est contraint" : "L'effet dragon n'est pas contraint";
    }

}