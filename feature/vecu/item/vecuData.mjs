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
            competences: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        required: true,
                        initial: null,
                        collection: 'Item',
                        type: 'competence',
                        droppable: true,
                        openable: true,
                    }
                )
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
