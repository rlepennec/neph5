import { Constants } from "../../../module/common/constants.js";
import { Illustration } from "../../../module/common/illustration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class FormuleDataModel extends foundry.abstract.TypeDataModel {

    /**
     * The illustration of a formule follows its substance. Each substance is
     * represented by the alchemical vessel that holds it, hence file names that
     * have nothing in common with the key they illustrate.
     */
    static ILLUSTRATION = new Illustration({
        root: "systems/neph5e/assets/vk/formules/",
        field: 'substance',
        fallback: 'ambre',
        files: {
            ambre:   "Cornue.webm",
            liqueur: "Alambic.webm",
            metal:   "Creuset.webm",
            poudre:  "Athanor.webm",
            vapeur:  "Aludel.webm"
        }
    });

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            degre: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            cercle: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            substance: new foundry.data.fields.StringField(
                {
                    initial: 'ambre',
                    choices: Constants.SUBSTANCES
                }
            ),
            enonce: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            aire: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            // Signature : ArrayField(element, options, context).
            // Les trois arguments étaient mal répartis. Vérifié en console Foundry :
            //   - un choices posé sur l'ArrayField est SANS EFFET ; posé sur le
            //     StringField, il rejette bien les valeurs hors liste ;
            //   - min et max placés en 3e position (le contexte) ressortaient
            //     undefined ; en 2e position ils sont bien lus ;
            //   - initial: 'air' sur l'ArrayField produisait la chaîne "air",
            //     pas ['air'] — _cast ne s'applique pas à la valeur initiale.
            // Conséquence corrigée : les valeurs sont désormais validées, la
            // cardinalité 1-2 est effective, et une formule neuve démarre avec
            // un vrai tableau d'un élément.
            elements: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(
                    {
                        initial: 'air',
                        choices: Constants.ELEMENTS.concat(Constants.ELEMENTS_GRAND_OEUVRE)
                    }
                ),
                {
                    initial: ['air'],
                    min: 1,
                    max: 2
                }
            ),
            catalyseurs: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            variantes: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            echec: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            maladresse: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            quantite: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            transporte: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    // VIDEO is required: unlike the other types, whose illustration
                    // is an image and whose video is hard coded in the template,
                    // the illustration of a formule is itself a .webm. Without it
                    // saving fails on "does not have a valid file extension".
                    categories: ["VIDEO"],
                    initial: () => FormuleDataModel.ILLUSTRATION.of()
                }
            ),
        }
    }

}