import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class VecuData extends NephilimDataModel {

    static defineBase() {
        return {
            competences: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        collection: 'Item',
                        type: 'competence',
                        droppable: true,
                        openable: true,
                        duplicable: true,
                    }
                )
            ),
            description: this.StringField(),
            element: new foundry.data.fields.StringField(
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            periode: new UUIDReferenceField(
                {
                    collection: 'Item',
                    type: 'periode',
                    droppable: true,
                    openable: true,
                    duplicable: false,
                }
            )
        }
    }

}
