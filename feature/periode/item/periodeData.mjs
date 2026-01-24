import { ChunkField } from "../../../module/common/ChunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class PeriodeData extends NephilimDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
            item: new ChunkField
            (
                {
                    base: new ChunkField
                    (
                        {
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
                        },
                        {
                            collection: 'Item',
                            scope: 'base'
                        }
                    )
                },
                {
                    collection: 'Item',
                    scope: 'root'
                }
            )




        }
    }

}
