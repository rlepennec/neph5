import { ChunkField } from "../../../module/common/chunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDField } from "../../../module/common/UUIDField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class CercleData extends NephilimDataModel {

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
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    initial: ''
                                }
                            )
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
