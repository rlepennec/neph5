import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"

export class FigureData extends NephilimDataModel {

    static defineIncarnation() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            periode: new UUIDReferenceField(
                {
                    collection: 'Item',
                    type: 'periode',
                    droppable: true,
                    openable: true,
                    duplicable: false,
                }
            ),
            vecus: new foundry.data.fields.SetField(


                
                new UUIDReferenceField(
                    {
                        collection: 'Item',
                        type: 'competence',
                        droppable: true,
                        openable: true,
                        duplicable: true,
                    }
                )
            )
        }
    }

    static defineBase() {
        return {
            description: new TextField()
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