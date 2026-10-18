import { AbstractFeature } from "../core/abstractFeature.js";
import { Version } from "../../module/common/version.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Ordonnance extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
        this.periode = null;
    }

    /**
     * The system identifier of the periode to registrer.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
    }

    /**
     * @Override
     */
    async drop() {

        // Une figure ne reçoit les ordonnances que d'un seul monde de kabbale.
        const monde = Version.data(AbstractFeature.original(this.sid)).monde;
        const autres = this.actor.items.filter(i => i.type === 'ordonnance' && i.sid !== this.sid);
        const mondes = new Set(autres.map(i => Version.data(AbstractFeature.original(i.sid)).monde).filter(m => m != null));
        if (mondes.size > 0 && !mondes.has(monde)) {
            ui.notifications.warn(`${this.actor.name} a déjà des ordonnances du monde ${[...mondes].map(m => game.i18n.localize('NEPHILIM.' + m)).join(', ')} : une ordonnance d'un autre monde de kabbale est refusée.`);
            return;
        }
        const premiere = autres.length === 0 && this.actor.items.find(i => i.sid === this.sid) == null;

        // Un exemplaire par incarnation, comme les focus (voir deposerParEpoque)
        if (!(await this.deposerParEpoque())) {
            return;
        }

        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of an ordonnance")
            .withIncarnation(this.periode)
            .withoutData('description', 'monde')
            .create();

        // À sa première ordonnance, la figure ne garde que les pactes de son monde de kabbale.
        if (premiere) {
            await Ordonnance.perdrePactes(this.actor, monde);
        }
    }

    /**
     * Retire les pactes noués avec les créatures d'un autre monde de kabbale, « tous » compris.
     * @param actor  The actor object.
     * @param monde  Le monde de kabbale de l'ordonnance.
     */
    static async perdrePactes(actor, monde) {
        const perdus = [];
        for (const invocation of actor.items.filter(i => i.type === 'invocation' && Version.data(i).pacte === true)) {
            const original = AbstractFeature.original(invocation.sid);
            if (Version.data(original).monde !== monde) {
                await invocation.update({ [Version.path(invocation, 'pacte')]: false });
                perdus.push(original?.name ?? invocation.name);
            }
        }
        if (perdus.length > 0) {
            ui.notifications.info(`${actor.name} ne garde que les pactes du monde ${game.i18n.localize('NEPHILIM.' + monde)} et perd : ${perdus.join(', ')}.`);
        }
    }

    /**
     * @param actor The actor object.
     * @returns le monde de kabbale des ordonnances de l'acteur, null s'il n'en a aucune. Une
     *          ordonnance vaut pour son époque et les suivantes : seules comptent celles des
     *          époques actives, jusqu'à l'époque courante.
     */
    static mondeOf(actor) {
        const ordonnance = actor?.items?.find(i => i.type === 'ordonnance' && AbstractFeature.isActive(actor, i));
        return ordonnance == null ? null : (Version.data(AbstractFeature.original(ordonnance.sid)).monde ?? null);
    }

    /**
     * @param actor      The actor object.
     * @param invocation L'invocation du monde (ou ses données) : la créature.
     * @returns true si un pacte définitif est possible avec la créature : sans ordonnance, ou
     *          si elle est du monde de kabbale de l'ordonnance (« tous » n'en est pas un).
     */
    static pacteDefinitif(actor, invocation) {
        const monde = Ordonnance.mondeOf(actor);
        return monde == null || Version.data(invocation).monde === monde;
    }

    /**
     * @returns the number of ordonnances.
     */
    get ordonnances() {
        return this.actor.items.filter(i => i.type === 'ordonnance').length;
    }

    /**
     * @returns the monde of kabbale.
     */
    get monde() {
        return Version.data(this.actor.items.find(i => i.type === 'ordonnance')).monde;
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            readOnly: true
        }
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let size = 0;
        let monde = null;
        let items = [];

        // For each ordonnance
        for (let item of actor.items.filter(o => o.type === 'ordonnance' && AbstractFeature.isActive(actor, o))) {
            const original = AbstractFeature.original(item.sid);
            size++;
            monde = game.i18n.localize('NEPHILIM.' + Version.data(original).monde);
            items.push({
                original: {
                    id: original.id,
                    name: original.name,
                    description: Version.data(original).description
                },
                embedded: {
                    id: item.id
                }
            });
        }

        // Build product
        return {
            size: size,
            monde: monde,
            items: items
        }

    }

}