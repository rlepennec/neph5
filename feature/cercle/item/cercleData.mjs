import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"

export class CercleData extends NephilimDataModel {

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

}
