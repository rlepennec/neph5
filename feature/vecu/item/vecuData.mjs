import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/common/UUIDField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class VecuData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true,
                }
            ),
            element: new foundry.data.fields.StringField
            (
                {
                    required: true,
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            periode: new UUIDReferenceField
            (
                {
                    required: false,
                    collection: 'Item',
                    type: 'periode',
                    droppable: true,
                    openable: true,
                    duplicable: false,
                }
            ),
            competences: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        required: false,
                        collection: 'Item',
                        type: 'competence',
                        droppable: true,
                        openable: true,
                        duplicable: true,
                    }
                )
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
