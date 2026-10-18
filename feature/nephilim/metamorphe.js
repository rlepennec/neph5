
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { SimpleFeature } from "../core/simpleFeature.js";

/**
 * Le métamorphe d'un Nephilim.
 *
 * Il est lié par époque, comme une voie (voir Incarnations.voie et changerVoie) : au plus un
 * par incarnation ; celui qui fait foi est celui de l'incarnation courante, sinon de
 * l'antérieure la plus proche. Ses métamorphoses développées (`formed`) se transmettent avec
 * lui ; ses yeux (`visible`) sont propres à l'incarnation de l'exemplaire et ne se transmettent
 * pas : à une époque qui n'a pas son propre exemplaire, tous sont fermés. Développer une
 * métamorphose ou ouvrir un œil s'écrit dans l'incarnation courante (Incarnations.ecrire) ;
 * l'exemplaire qu'elle reçoit alors part les yeux fermés.
 */
export class Metamorphe extends SimpleFeature {

    /**
     * @returns ten closed eyes, or ten undeveloped metamorphoses.
     */
    static #aucun() {
        return [false, false, false, false, false, false, false, false, false, false];
    }

    /**
     * Le métamorphe déposé devient celui de l'incarnation courante, sans métamorphose
     * développée ; déjà celui qui fait foi, rien ne change.
     * @Override
     */
    async drop() {
        await new Incarnations(this.actor).changerVoie(this.sid, 'metamorphe', {
            valeurs: { formed: Metamorphe.#aucun(), visible: Metamorphe.#aucun() },
            sans: ['description', 'element', 'metamorphoses']
        });
    }

    /**
     * @param actor The actor object.
     * @returns les yeux du métamorphe à l'époque courante : ceux de l'exemplaire s'il est de
     *          l'incarnation courante, tous fermés sinon (ils ne se transmettent pas).
     */
    static #yeux(actor, embedded) {
        const incarnations = new Incarnations(actor);
        const propres = !incarnations.porte || incarnations.epoqueDe(embedded) === incarnations.courante;
        return propres ? (Version.data(embedded).visible ?? Metamorphe.#aucun()) : Metamorphe.#aucun();
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let id = null;
        let sid = null;
        let name = game.i18n.localize('NEPHILIM.metamorphe');
        let size = 0;
        let visibles = 0;
        let  metamorphoses = [];
        for (let i=0; i<10; i++) {
            metamorphoses.push({
                name: null,
                formed: false,
                visible: false
            })
        }

        // Retrieve data: the metamorphe which counts at the current incarnation
        const embedded = new Incarnations(actor).voie('metamorphe');
        if (embedded != null) {
            const original = game.items.find(i => i.sid === embedded.sid);
            if (original != null) {
                id = original.id;
                sid = original.sid;
                name = original.name;
                const formed = Version.data(embedded).formed ?? Metamorphe.#aucun();
                const visible = Metamorphe.#yeux(actor, embedded);
                size = formed.filter(v => v === true).length;
                for (let i=0; i<10; i++) {
                    metamorphoses[i] = {
                        name: Version.data(original).metamorphoses[i]?.name,
                        formed: formed[i],
                        visible: visible[i]
                    };
                    if (formed[i] === true && visible[i] == true) {
                        visibles = visibles + 1;
                    }
                }
            }
        }

        // Build product
        return {
            id: id,
            sid: sid,
            name: name,
            size: size,
            visibles: visibles,
            metamorphoses: metamorphoses
        }

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return Metamorphe.getAll(this.actor);
    }

    /**
     * Écrit l'état du métamorphe dans l'incarnation courante : sur son exemplaire, ou sur la
     * copie qu'elle reçoit de l'antérieure, qui part les yeux fermés.
     * @param changer Builds the changes from the formed and visible states seen at the current
     *                incarnation.
     * @returns the instance.
     */
    async #ecrire(changer) {
        const incarnations = new Incarnations(this.actor);
        const embedded = incarnations.voie('metamorphe');
        if (embedded == null) return this;
        const formed = foundry.utils.duplicate(Version.data(embedded).formed ?? Metamorphe.#aucun());
        const visible = foundry.utils.duplicate(Metamorphe.#yeux(this.actor, embedded));
        const changements = changer(formed, visible);
        // Les yeux d'une autre époque ne se transmettent pas : la copie part avec ceux vus ici
        if (changements.visible == null) changements.visible = visible;
        await incarnations.ecrire(embedded, changements);
        return this;
    }

    /**
     * Set the specified metamorphose to be formed or not, at the current incarnation.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleFormed(index) {
        return this.#ecrire(formed => {
            formed[index] = !formed[index];
            return { formed: formed };
        });
    }

    /**
     * Set the specified metamorphose to be visible or not, at the current incarnation.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleVisible(index) {
        return this.#ecrire((formed, visible) => {
            visible[index] = !visible[index];
            return { visible: visible };
        });
    }

}