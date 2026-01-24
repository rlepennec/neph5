import { ChunkField } from "../../../module/common/chunkField.js"
import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDField } from "../../../module/common/UUIDField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class VecuData extends NephilimDataModel {

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
                            element: new foundry.data.fields.StringField
                            (
                                {
                                    //required: true,
                                    initial: 'air',
                                    choices: Constants.ELEMENTS
                                }
                            ),
                            periode: new UUIDReferenceField
                            (
                                {
                                    //required: false,
                                    collection: 'Item',
                                    type: 'periode',
                                    droppable: true,
                                    openable: true,
                                    duplicable: false,
                                }
                            ),
                            competences: new foundry.data.fields.SetField
                            (
                                new UUIDReferenceField(
                                    {
                                        //required: false,
                                        collection: 'Item',
                                        type: 'competence',
                                        droppable: true,
                                        openable: true,
                                        duplicable: true,
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
