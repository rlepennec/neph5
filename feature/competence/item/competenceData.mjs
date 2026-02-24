import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"

export class CompetenceData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField()
        }
    }

}
