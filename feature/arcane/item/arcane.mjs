import { ChunkField } from "../../../module/field/chunkField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";

/**
 * [V14] Porté aux versions de règles.
 *
 * À la racine, ce qui ne dépend pas des règles : l'identifiant, par lequel passent toutes
 * les références, et l'illustration, que le système pose lui-même. Le reste — la
 * description, le degré et la période — décrit ce que vaut l'objet sous une édition donnée,
 * et appartient donc à sa version.
 *
 * Le chunk v1 est vide tant que la première édition n'est pas décrite : une fiche ouverte
 * dessus n'affiche que son en-tête et son image.
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
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
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
