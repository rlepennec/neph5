import { UUIDField } from "../../module/field/UUIDField.js";

export class FraterniteDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    nullable: true,
                    initial: null
                }
            ),
            effectif: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.SchemaField
                (
                    {
                        status: new foundry.data.fields.StringField(),
                        periode: new foundry.data.fields.StringField(),
                        actor: new foundry.data.fields.StringField()
                    }
                )
            ),
            description: new foundry.data.fields.StringField(
                {
                    initial: ""
                }
            ),
            options: new foundry.data.fields.SchemaField
            (
                {
                    active: new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    chronologieDescendante: new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    incarnationsOuvertes: new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    theme: new foundry.data.fields.StringField(
                        {
                            initial: "soleil"
                        }
                    ),
                    locked: new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    )
                }
            )
        }
    }

}