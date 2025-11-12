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
                    required: true,
                    initial: null
                }
            ),
            region: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            ),
            vecus: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        required: true,
                        initial: null,
                        collection: 'Item',
                        type: 'vecu',
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
