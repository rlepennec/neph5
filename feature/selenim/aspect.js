import { AbstractFeature } from "../core/abstractFeature.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { SimpleFeature } from "../core/simpleFeature.js";

/**
 * Un aspect de l'imago d'un Selenim.
 *
 * C'est une possession (voir Incarnations.POSSESSIONS) : il se transmet d'une incarnation à
 * l'autre, et peut se gagner, se perdre et se regagner ; une incarnation en a au plus un
 * exemplaire. Son état actif est propre à chaque époque, comme les valeurs d'un focus : le
 * changer l'écrit dans l'incarnation courante (Incarnations.ecrire).
 */
export class Aspect extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor, item) {
        super(actor);
    }

    /**
     * L'aspect déposé est acquis à l'époque courante, inactif (voir Incarnations.acquerir).
     * @Override
     */
    async drop() {
        await new Incarnations(this.actor).acquerir(this.sid, {
            valeurs: { active: false },
            sans: ['description', 'degre', 'activation', 'duree']
        });
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: 0
        }
    }

    /**
     * Les aspects possédés à l'époque courante (voir Incarnations.possessions), et le total de
     * l'imago : la somme de leurs degrés.
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let size = 0;
        let aspects = [];

        // For each aspect possessed at the current incarnation
        for (let embedded of new Incarnations(actor).possessions('aspect')) {

            const original = AbstractFeature.original(embedded.sid);
            if (original == null) continue;

            // Update the number of points of the imago.
            size = size + parseInt(Version.data(original).degre);

            // Add the aspect
            aspects.push({
                original: {
                    id: original.id,
                    sid: original.sid,
                    name: original.name
                },
                embedded: {
                    id: embedded.id,
                    active: Version.data(embedded).active
                }
            });

        }

        // Build product
        return {
            size: size,
            aspects: aspects
        }

    }

    /**
     * Bascule l'état actif de l'aspect, à l'époque courante : sur l'exemplaire qui fait foi,
     * copié dans l'incarnation courante s'il vient d'une antérieure.
     * @returns the instance.
     */
    async toggleActive() {
        const incarnations = new Incarnations(this.actor);
        const embedded = incarnations.exemplaireEffectif(this.sid);
        if (embedded == null) return this;
        await incarnations.ecrire(embedded, { active: !Version.data(embedded).active });
        return this;
    }

}