import { UUIDField } from "../../../module/field/UUIDField.js";

/**
 * Une période du monde. Elle est commune à toutes les versions de règles : aucun de ses champs
 * ne dépend des règles, et elle n'a donc pas de `versions`. Version.data la lit directement dans
 * `system`, et Version.path y écrit (`system.<champ>`) ; elle est compatible avec toutes les
 * versions (voir Version.compatible).
 *
 * La migration 1.0.9 ne la touche pas (elle n'est pas dans VersionMigration.CHAMPS) : les
 * champs d'un monde 1.7.0 sont déjà à la racine.
 */
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
            // La kabbale et l'alchimie sont-elles possibles à cette période ? Sinon, les
            // onglets correspondants des figures qui l'incarnent sont masqués (voir
            // FigureSheet). Possibles par défaut, et donc pour les périodes existantes.
            kabbaleAutorisee: new foundry.data.fields.BooleanField
            (
                {
                    initial: true
                }
            ),
            alchimieAutorisee: new foundry.data.fields.BooleanField
            (
                {
                    initial: true
                }
            )
        }
    }

}
