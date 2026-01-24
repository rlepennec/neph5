import { ChunkField } from "../../../module/common/ChunkField.js"
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
                                    required: true,
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
            ),
            actor: new ChunkField
            (
                {
                    base: new ChunkField
                    (
                        {
                            periode: new UUIDReferenceField
                            (
                                {
                                    required: false,
                                    collection: 'Item',
                                    type: 'periode',
                                }
                            ),
                            sapience: new foundry.data.fields.NumberField
                            (
                                {
                                    initial: 0
                                }
                            )
                        },
                        {
                            collection: 'Actor',
                            scope: 'base'
                        }
                    )
                },
                {
                    collection: 'Actor',
                    scope: 'root'
                }
            )
        }
    }

}
