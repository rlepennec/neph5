export class InvocationDataModel extends foundry.abstract.TypeDataModel {

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
            sephirah: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            monde: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            element: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            degre: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            portee: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            visibilite: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            pacte: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            )
        }
    }

}
