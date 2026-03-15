import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/field/textField.js"
import { UUIDReferenceField } from "../../../module/field/UUIDReferenceField.js"

export class FigureData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            incarnations: new foundry.data.fields.SetField(
                new UUIDReferenceField(
                    {
                        type: 'incarnation',
                        key: 'id',
                        droppable: true,
                        openable: false,
                        duplicable: false,
                    }
                )

                /*
                (
                    new DocumentIdField()
                )
                */

            )
        }
    }

}