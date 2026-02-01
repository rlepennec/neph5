import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class VecuData extends NephilimDataModel {

    static defineBase() {
        return {
            competences: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        type: 'competence'
                    }
                )
            ),
            description: new TextField(),
            element: new foundry.data.fields.StringField(
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            periode: new UUIDReferenceField(
                {
                    type: 'periode',
                    duplicable: false
                }
            )
        }
    }

}
