import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Formule extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Formule';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfFormule';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Formule', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    async finalize(result) {

        if (Version.data(this.actor).options.gestionLaboratoire !== true) {
            return;
        }

        // If success, produce 1 dose
        if (result.success === true) {
            const quantite = Version.data(this.embedded).quantite + 1;
            await this.embedded.update({ [Version.path(this.embedded, 'quantite')]: quantite });

            // If not critical, spend materiae primae
            if (result.critical === false) {
                for (let element of Version.data(this.item).elements) {
                    const quantite = Math.max(0, Version.data(this.actor).alchimie.primae[element].quantite - Version.data(this.item).degre);
                    await this.actor.update({ [Version.path(this.actor, 'alchimie') + '.primae.' + element + ".quantite"]: quantite });
                }
            }

        }

    }

    /**
     * @Override
     */
    modifier(parameters) {
        if (Version.data(this.item).elements[0] === 'quintuple') {
            const substance = Version.data(this.item).substance;
            const construct = this.actor.getConstruct(substance);
            if (parameters == null || parameters.elt == null) {
                if (Version.data(this.actor).alchimie.primae.air.quantite > 4) {
                    return construct['air'] * 10;
                } else if (Version.data(this.actor).alchimie.primae.eau.quantite > 4) {
                    return construct['eau'] * 10;
                } else if (Version.data(this.actor).alchimie.primae.feu.quantite > 4) {
                    return construct['feu'] * 10;
                } else if (Version.data(this.actor).alchimie.primae.lune.quantite > 4) {
                    return construct['lune'] * 10;
                } else if (Version.data(this.actor).alchimie.primae.terre.quantite > 4) {
                    return construct['terre'] * 10;
                } else {
                    return 0;
                }
            } else {
                return construct[parameters.elt] * 10;
            }
        } else {
            return 0;
        }
    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : Version.data(previous).focus))
            .withData("status", (previous == null ? Constants.CONNU : Version.data(previous).status))
            .withData("quantite", 0)
            .withData("transporte", 0)
            .withData("periode", this.periode)
            .withoutData('description', 'degre', 'cercle', 'enonce', 'substance', 'aire', 'duree')
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
     * @returns the owner actor of the used laboratory.
     */
    getOwner() {
        if (this.actor.type === 'figure') {
            const sid = Version.data(this.actor).alchimie.courant;
            return sid == null ? this.actor : game.actors.find(i => i.sid === sid);
        } else {
            return null;
        }
    }

    /**
     * @return -100 if uncastable, the value otherwise
     */
    get rawDegre() {

        if (this.embedded == null) {
            return -100;
        }

        if (Version.data(this.embedded).status === 'connu') {
            return -101;
        }

        if (Version.data(this.embedded).focus !== true && Version.data(this.embedded).status === 'dechiffre') {
            return -102;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, Version.data(this.item).cercle).degre;
        if (science === 0) {
            return -107;
        }

        const owner = this.getOwner();
        const construct = owner == null ? null : owner.getConstruct(Version.data(this.item).substance);

        // Construct inactif
        if (construct?.active !== true) {
            return -108;
        }

        // Construct pas au niveau requis
        if (construct.degre === "oeuvreAuNoir" && (Version.data(this.item).cercle === "oeuvreAuBlanc" || Version.data(this.item).cercle === "oeuvreAuRouge")) {
            return -109;
        }

        // Construct pas au niveau requis
        if (construct.degre === "oeuvreAuBlanc" && Version.data(this.item).cercle === "oeuvreAuRouge") {
            return -109;
        }

        // Vous ne possédez pas les materiae primae necessaires
        for (let element of Version.data(this.item).elements) {

            switch (element) {
                case 'air':
                case 'eau':
                case 'feu':
                case 'lune':
                case 'terre':
                    if (Version.data(this.actor).alchimie.primae[element].quantite < Version.data(this.item).degre) {
                        return -110;
                    }
                    break;

                case 'quintuple':
                    if (Version.data(this.actor).alchimie.primae['air'].quantite < 5 &&
                        Version.data(this.actor).alchimie.primae['eau'].quantite < 5 &&
                        Version.data(this.actor).alchimie.primae['feu'].quantite < 5 &&
                        Version.data(this.actor).alchimie.primae['lune'].quantite < 5 &&
                        Version.data(this.actor).alchimie.primae['terre'].quantite < 5) {
                        return -110;
                    }
                    break;

                case 'quintessence':
                    if (Version.data(this.actor).alchimie.primae['air'].quantite < 1 ||
                        Version.data(this.actor).alchimie.primae['eau'].quantite < 1 ||
                        Version.data(this.actor).alchimie.primae['feu'].quantite < 1 ||
                        Version.data(this.actor).alchimie.primae['lune'].quantite < 1 ||
                        Version.data(this.actor).alchimie.primae['terre'].quantite < 1) {
                        return -110;
                    }
                    break;

            }

        }

        // Retrieve all elements used to cast the focus
        // All elements must be owned by the construct
        let ka = 0;
        switch (Version.data(this.item).cercle) {
            case 'oeuvreAuNoir':
                ka = construct[Version.data(this.item).elements[0]] ?? 0
                if (ka < 1) {
                    return -111;
                }
                break;
            case 'oeuvreAuBlanc':
                ka = Math.min(construct[Version.data(this.item).elements[0]] ?? 0, construct[Version.data(this.item).elements[1]] ?? 0);
                if (ka < 1) {
                    return -111;
                }
                break;
            case 'oeuvreAuRouge':
                switch (Version.data(this.item).elements[0]) {
                    case 'quintessence':
                        ka = Math.min(construct['air'], construct['eau'], construct['feu'], construct['lune'], construct['terre']);
                        if (ka < 1) {
                            return -111;
                        }
                        break;
                    case 'quintuple':
                        ka = 0;
                        break;
                }
                break;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        // Final result
        return science + ka - focus;




    }

}