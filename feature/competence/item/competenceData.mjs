import { UUIDField } from "../../../module/common/UUIDField.js"

export class CompetenceData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
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
