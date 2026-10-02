import { ChunkField } from "../../module/field/chunkField.js";
import { VersionMigration } from "../../module/migration/versionMigration.js";
import { UUIDField } from "../../module/field/UUIDField.js";

export class FraterniteDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
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
                                    )
                                }
                            )
                        },
                        { scope: 'v5' }
                    )
                },
                { scope: 'versions' }
            )
        }
    }

    /**
     * Le crochet que Foundry appelle avant d'élaguer les champs hors schéma — le seul
     * endroit d'où l'ancienne forme est encore lisible. Ce qu'il déplace est décrit dans
     * VersionMigration, avec les migrations.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return VersionMigration.apply('fraternite', source);
    }

}