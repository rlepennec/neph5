import { UUIDField } from "../../../module/field/UUIDField.js";

export class CapaciteDataModel extends foundry.abstract.TypeDataModel {

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
            degre: new foundry.data.fields.NumberField
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
            )
        }
    }

}