import { ChunkField } from "./chunkField.js";

/**
 * Une version de règles d'un objet : les champs qui n'existent que sous ces règles, et
 * `enabled`, à plat avec eux, qui dit si l'objet est défini pour cette version. Il l'est par
 * défaut ; le MJ le désactive dans la configuration de l'objet (voir ItemOptionsSelector).
 * Un objet désactivé reste dans le monde : il n'est masqué que si le réglage `filtreObjets`
 * le demande (voir Version.visible).
 *
 * Ex. : `v5: new VersionField({ description, element }, { scope: 'v5' })` porte `enabled`,
 * `description` et `element`.
 */
export class VersionField extends ChunkField {

    /**
     * @param fields  Les champs propres à cette version de règles.
     * @param options Les options du champ, dont la portée (le nom de la version).
     */
    constructor(fields = {}, options = {}) {
        super({ enabled: new foundry.data.fields.BooleanField({ initial: true }), ...fields }, options);
    }

}
