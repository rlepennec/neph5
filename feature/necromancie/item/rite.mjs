import { Constants } from "../../../module/common/constants.js";

export class RiteDataModel extends foundry.abstract.TypeDataModel {

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
            cercle: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            desmos: new foundry.data.fields.StringField(
                {
                    initial: 'spiritisme',
                    choices: Constants.DESMOS
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            )
        }
    }

}
