import { ChunkField } from "../../../module/common/chunkField.js"
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"

export class FigureData extends foundry.abstract.TypeDataModel {

    static defineBase() {
        return {
            description: new foundry.data.fields.StringField
            (
                {
                    initial: ''
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