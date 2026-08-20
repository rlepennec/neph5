import { Constants } from "../../../module/common/constants.js";
import { Illustration } from "../../../module/common/illustration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class SortDataModel extends foundry.abstract.TypeDataModel {

    /**
     * The illustration of a sort follows its cercle. The table is explicit
     * rather than derived from the key: grandSecret is illustrated by
     * Grand-Oeuvre.webp, whose name does not match the cercle it stands for.
     */
    static ILLUSTRATION = new Illustration({
        root: "systems/neph5e/assets/vk/magie/",
        field: 'cercle',
        fallback: 'basseMagie',
        files: {
            basseMagie:  "Basse-Magie.webp",
            hauteMagie:  "Haute-Magie.webp",
            grandSecret: "Grand-Oeuvre.webp"
        }
    });

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            cercle: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            element: new foundry.data.fields.StringField
            (
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS_MAGIE
                }
            ),
            degre: new foundry.data.fields.NumberField
            (
                {
                    required: false
                }
            ),
            portee: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            voies: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            incantation: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            syntaxe: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField
            (
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: () => SortDataModel.ILLUSTRATION.of()
                }
            )
        }
    }

}