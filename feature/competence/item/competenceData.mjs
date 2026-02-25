import { Constants } from "../../../module/constants.js";
import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/field/textField.js"

export class CompetenceData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            element: new foundry.data.fields.StringField(
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            )
        }
    }

}
