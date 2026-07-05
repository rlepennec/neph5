import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class OrdonnanceDataModel extends foundry.abstract.TypeDataModel {

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
            monde: new foundry.data.fields.StringField(
                {
                    initial: 'sohar',
                    choices: Constants.MONDES
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            )
        }
    }

}
