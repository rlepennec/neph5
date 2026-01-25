import { UUIDField } from ".//UUIDField.js"

export class NephilimDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            )
        }
    }

}