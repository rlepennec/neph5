import { ChunkField } from "../../../module/common/chunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"

export class CompetenceData extends NephilimDataModel {

    static defineSchema() {
        return {
            ...NephilimDataModel.defineSchema(),
            item: new ChunkField
            (
                {
                    base: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    required: true,
                                    initial: null
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
