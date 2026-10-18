import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { IncarnationField } from "../../../module/field/incarnationField.js";

export class AspectDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            // La clé de l'incarnation de cet exemplaire lié, commune à toutes les versions.
            incarnation: new IncarnationField(),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/aspect.webp"
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
                            degre: new foundry.data.fields.NumberField(
                                {
                                    required: false
                                }
                            ),
                            activation: new foundry.data.fields.NumberField(
                                {
                                    required: false
                                }
                            ),
                            duree: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            // L'état de l'aspect à l'époque de cet exemplaire, propre au personnage.
                            active: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            // La possession à l'époque de cet exemplaire : un aspect se gagne, se perd et se
                            // regagne d'une incarnation à l'autre (voir Incarnations.possessions).
                            possede: new foundry.data.fields.BooleanField
                            (
                                {
                                    initial: true
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
        return VersionMigration.apply('aspect', source);
    }

}
