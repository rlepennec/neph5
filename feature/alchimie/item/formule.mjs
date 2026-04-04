export class FormuleDataModel extends foundry.abstract.TypeDataModel {

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
            degre: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            cercle: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            substance: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            enonce: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            aire: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            elements: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
                
            ),
            catalyseurs: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            variantes: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            echec: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            maladresse: new foundry.data.fields.StringField(
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
            quantite: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            transporte: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
        }
    }

}
