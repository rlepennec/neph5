import { Constants } from "../../../module/common/constants.js";

export class OrdonnanceDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
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
