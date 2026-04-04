export class FraterniteDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            effectif: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.SchemaField
                (
                    {
                        status: new foundry.data.fields.StringField(),
                        periode: new foundry.data.fields.StringField(),
                        actor: new foundry.data.fields.StringField(),
                    }
                )
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            options: new foundry.data.fields.SchemaField
            (
                {
                    active: new foundry.data.fields.BooleanField(),
                    chronologieDescendante: new foundry.data.fields.BooleanField(),
                    incarnationsOuvertes: new foundry.data.fields.BooleanField(),
                    theme: new foundry.data.fields.StringField(),
                    locked: new foundry.data.fields.BooleanField(),
                }
            )
        }
    }

}