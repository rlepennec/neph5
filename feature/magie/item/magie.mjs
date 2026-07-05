import { UUIDField } from "../../../module/field/UUIDField.js";

export class MagieDataModel extends foundry.abstract.TypeDataModel {

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
            )
        }
    }

}
