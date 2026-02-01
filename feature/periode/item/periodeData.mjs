import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class PeriodeData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            epoque: new TextField(),
            region: new TextField(),
            vecus: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        type: 'vecu',
                        duplicable: false,
                    }
                )
            )
        }
    }

}
