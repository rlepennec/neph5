import { ChunkField } from "../../../module/common/chunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class PeriodeData extends NephilimDataModel {

    static defineBase() {
        return {
            epoque: new foundry.data.fields.StringField(),
            region: new foundry.data.fields.StringField(),
            vecus: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        required: false,
                        collection: 'Item',
                        type: 'vecu',
                        droppable: true,
                        openable: true,
                        duplicable: false,
                    }
                )
            ),
            description: new foundry.data.fields.StringField()
        }
    }

}
