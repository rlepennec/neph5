import { Constants } from "../../../module/common/constants.js";
import { Illustration } from "../../../module/common/illustration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class FormuleDataModel extends foundry.abstract.TypeDataModel {

    /**
     * The illustration of a formule follows its substance.
     *
     * ATTENTION — file names still to be confirmed. The three tables written so
     * far never matched their key (chokmah -> Hokmah, tiphereth -> Tipheret,
     * grandSecret -> Grand-Oeuvre), so these five are a placeholder built on the
     * kabbale convention, not verified against the real directory.
     */
    static ILLUSTRATION = new Illustration({
        root: "systems/neph5e/assets/vk/formules/",
        field: 'substance',
        fallback: 'ambre',
        files: {
            ambre:   "Ambre.webp",
            liqueur: "Liqueur.webp",
            metal:   "Metal.webp",
            poudre:  "Poudre.webp",
            vapeur:  "Vapeur.webp"
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
            elements: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS.concat(Constants.ELEMENTS_GRAND_OEUVRE)
                },
                {
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
                    categories: ["IMAGE"],
                    initial: () => FormuleDataModel.ILLUSTRATION.of()
                }
            ),
        }
    }

}