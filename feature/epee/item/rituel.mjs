import { UUIDField } from "../../../module/field/UUIDField.js";

export class RituelDataModel extends foundry.abstract.TypeDataModel {

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
            cercle: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            degre: new foundry.data.fields.NumberField(
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
                    initial: "systems/neph5e/assets/vk/rituels/Rituel-Defaut.webp"
                }
            )
        }
    }

}
