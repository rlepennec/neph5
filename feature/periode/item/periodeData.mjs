import { UUIDField } from "../../../module/common/UUIDField.js"

export class PeriodeData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            epoque: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            ),
            region: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            )
        }
    }

}
