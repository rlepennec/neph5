import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class PeriodeData extends NephilimDataModel {

    static defineBase() {
        return {
            description: this.StringField(),
            epoque: this.StringField(),
            region: this.StringField(),
            vecus: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        collection: 'Item',
                        type: 'vecu',
                        droppable: true,
                        openable: true,
                        duplicable: false,
                    }
                )
            )
        }
    }

}
