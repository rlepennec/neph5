import { ChunkField } from "../../../module/field/chunkField.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";

/**
 * [V14] Porté aux versions de règles.
 *
 * À la racine, ce qui ne dépend pas des règles : l'identifiant, par lequel passent toutes
 * les références, et l'illustration, que le système pose lui-même. Tout le reste décrit ce
 * que vaut le vécu sous une édition donnée — son élément, son degré, sa période, les
 * compétences qu'il ouvre et ses effets mnémos — et appartient donc à sa version.
 *
 * Le chunk v1 est vide tant que la première édition n'est pas décrite.
 */
export class VecuDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/vecu.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            element: new foundry.data.fields.StringField
                            (
                                {
                                    initial: 'air',
                                    choices: Constants.ELEMENTS
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
                                    required: false,
                                    nullable: true,
                                    initial: null
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
                                new foundry.data.fields.SchemaField
                                (
                                    {
                                        name: new foundry.data.fields.StringField(),
                                        degre: new foundry.data.fields.NumberField(
                                            { initial: 0 }
                                        ),
                                        description: new foundry.data.fields.StringField()
                                    }
                                )
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
     * Un vécu embarqué sur un acteur part d'un degré nul : c'est l'acteur qui le fait
     * monter, pas l'item du monde dont il est la copie.
     *
     * Le degré vit désormais dans la version, et on l'y écrit directement plutôt que de
     * compter sur la passerelle pour le rattraper — elle a vocation à disparaître.
     */
    static initializeEmbedded(data) {
        data.system.versions ??= {};
        data.system.versions.v5 ??= {};
        data.system.versions.v5.degre = 0;
    }

    /**
     * Le crochet que Foundry appelle avant d'élaguer les champs hors schéma — le seul
     * endroit d'où l'ancienne forme est encore lisible. Ce qu'il déplace est décrit dans
     * VersionMigration, avec les migrations.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return VersionMigration.apply('vecu', source);
    }

}
