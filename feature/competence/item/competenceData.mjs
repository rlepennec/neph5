import { ChunkField } from "../../../module/common/ChunkField.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class CompetenceData extends foundry.abstract.TypeDataModel {

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
