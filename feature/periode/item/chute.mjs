export class ChuteDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField
            (
                {
                    required: true
                }
            ),
            key: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            degre: new foundry.data.fields.NumberField
            (
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            )
        }
    }

}