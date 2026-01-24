import { ChunkField } from "../../../module/common/ChunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class FigureData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
            actor: new ChunkField
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

    /*
    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
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
        */

}