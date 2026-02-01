import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"

export class CompetenceData extends NephilimDataModel {

    static defineBase() {
        return {
            description: this.StringField()
        }
    }

}
