import { UUIDField } from "../../../module/field/UUIDField.js";

export class PeriodeDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            aube: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            contexte: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            actif: new foundry.data.fields.BooleanField
            (
                {
                    required: false
                }
            ),
            previous: new foundry.data.fields.StringField
            (
                {
                    required: false,
                    nullable: true,
                    initial: null
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/periode-defaut.webp"
                }
            )
        }
    }

}