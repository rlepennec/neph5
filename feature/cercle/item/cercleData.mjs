import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"

export class CercleData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField()
        }
    }

}
