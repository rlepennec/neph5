import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionField } from "../../../module/field/versionField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { Version } from "../../../module/common/version.js";

/**
 * Un groupe de compétences (voir Groupe).
 *
 * CE QUI RESTE À LA RACINE : ce qui ne dépend pas des règles. L'identifiant, l'illustration et
 * ses compétences (leurs sid), partagées par toutes les versions.
 *
 * CE QUI PASSE EN VERSION : `enabled`, qui dit si le groupe vaut pour cette version de règles
 * (ses compétences y sont alors actives, voir Groupe), et la base du groupe, une
 * caractéristique ou un calcul sur les caractéristiques, seulement enregistrée pour l'instant.
 * Les versions v2, v3 et eidolon ne portent encore que `enabled`.
 */
export class GroupeDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/competence.webp"
                }
            ),
            competences: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    initial: []
                }
            ),
            versions: new ChunkField
            (
                {
                    v2: new VersionField({}, { scope: 'v2' }),
                    v3: new VersionField({}, { scope: 'v3' }),
                    v5: new VersionField
                    (
                        {
                            base: new foundry.data.fields.StringField
                            (
                                {
                                    initial: ""
                                }
                            )
                        },
                        { scope: 'v5' }
                    ),
                    eidolon: new VersionField({}, { scope: 'eidolon' })
                },
                { scope: 'versions' }
            )
        }
    }

    /**
     * Les compatibilités d'un groupe d'avant VersionField (une liste de versions à la racine)
     * deviennent son `enabled` dans chaque version.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        if (Array.isArray(source?.compatibilites)) {
            source.versions ??= {};
            for (const version of Version.ALL) {
                source.versions[version] ??= {};
                source.versions[version].enabled = source.compatibilites.includes(version);
            }
            delete source.compatibilites;
        }
        return super.migrateData(source);
    }

}
