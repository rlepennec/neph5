import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionField } from "../../../module/field/versionField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { IncarnationField } from "../../../module/field/incarnationField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";

/**
 * [V14] Porté aux versions de règles.
 *
 * À la racine, ce qui ne dépend pas des règles : l'identifiant, par lequel passent toutes
 * les références, l'illustration, que le système pose lui-même, et la clé de l'incarnation
 * d'un exemplaire lié. Le reste — la
 * description, le degré et la période — décrit ce que vaut l'objet sous une édition donnée,
 * et appartient donc à sa version.
 */
export class ArcaneDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField
            (
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
                    initial: "systems/neph5e/assets/vk/items/arcane.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v5: new VersionField
                    (
                        {
                            // Le degré acquis pendant l'incarnation de cet exemplaire (vide pour l'item du monde).
                            degre: new foundry.data.fields.NumberField
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
        return VersionMigration.apply('arcane', source);
    }

}
