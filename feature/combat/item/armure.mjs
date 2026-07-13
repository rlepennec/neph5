import { UUIDField } from "../../../module/field/UUIDField.js";

export class ArmureDataModel extends foundry.abstract.TypeDataModel {

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
            used: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            physique: new foundry.data.fields.NumberField(
                {
                    initial: 0,
                    required: false
                }
            ),
            magique: new foundry.data.fields.NumberField(
                {
                    initial: 0,
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/armure-defaut.webp"
                }
            )
        }
    }

}
