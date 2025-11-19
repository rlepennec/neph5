import { Constants } from "../../../module/common/constants.js";
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class VecuData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true,
                }
            ),
            element: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ), 
            periode: new UUIDReferenceField(
                {
                    required: false,
                    collection: 'Item',
                    type: 'periode',
                    droppable: true,
                    openable: true,
                }
            ),
            competences: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        required: false,
                        collection: 'Item',
                        type: 'competence',
                        droppable: true,
                        openable: true,
                    }
                )
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            )
        }
    }

}
