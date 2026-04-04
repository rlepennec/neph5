export class MateriaeDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            element: new foundry.data.fields.StringField(
                {
                    required: false
                }
            )
        }
    }

}
