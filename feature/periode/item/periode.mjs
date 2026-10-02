import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class PeriodeDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/periode.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            aube: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            contexte: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            actif: new foundry.data.fields.BooleanField
                            (
                                {
                                    required: false
                                }
                            ),
                            previous: new foundry.data.fields.StringField
                            (
                                {
                                    required: false,
                                    nullable: true,
                                    initial: null
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
        return VersionMigration.apply('periode', source);
    }

}