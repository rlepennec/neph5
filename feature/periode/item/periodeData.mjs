import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class PeriodeData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            epoque: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            region: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            vecus: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        required: false,
                        collection: 'Item',
                        type: 'vecu',
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
