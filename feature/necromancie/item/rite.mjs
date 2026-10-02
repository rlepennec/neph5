import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class RiteDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/rite.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            cercle: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            desmos: new foundry.data.fields.StringField(
                                {
                                    initial: 'spiritisme',
                                    choices: Constants.DESMOS
                                }
                            ),
                            status: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            periode: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            focus: new foundry.data.fields.BooleanField(
                                {
                                    required: false
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
        return VersionMigration.apply('rite', source);
    }

}
