export class VecuDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField
            (
                {
                    required: true
                }
            ),
            element: new foundry.data.fields.StringField
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
            ),
            competences: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            mnemos: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField()
            )
        }
    }

}