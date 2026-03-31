import { DocumentIdentifier } from "../../../module/documentIdentifier.js"

export class Incarnation {

    /**
     * @constructor
     * @param item The embedded NephilimItem.
     */
    constructor(item) {
        this.item = item;
    }

    /**
     * @returns the vecu item referenced by this instance.
     */
    get vecu() {
        return game.items.find(i => i.type === "vecu" && i.system.sid === this.item.system.base.vecu.reference);
    }

    /**
     * @returns the periode item referenced by this instance.
     */    
    get periode() {
        return  game.items.find(i => i.type === "periode" && i.system.sid === this.vecu.system.base.periode);
    }

    /**
     * @returns the name of the incarnation which is the name of the vecu.
     */
    get name() {
        return this.vecu.name;
    }

    /**
     * @returns the id of the incarnation.
     */
    get id() {
        return this.item.id;
    }

    /**
     * @returns the fsid of the incarnation.
     */
    get fsid() {
        return new DocumentIdentifier(this.item).fsid
    }

    /**
     * @returns the array of competences.
     */
    get competences() {
        const version = game.settings.get("neph5e", "system-version");
        let array = [];
        const v = this.item.system.versions[version];
        for (let c of v.competences) {
            const citem = game.items.find(i => i.system.sid === c.reference);
            if (citem != null) {
                const cid = new DocumentIdentifier(citem);
                array.push({
                    name: cid.name,
                    reference: c.reference,
                    sapience: c.sapience
                })
            }
        }
        return array;
    }


    /**
     * Create a new incarnation which will be embedded to the actor.
     * @param {*} actor The actor document in which the incarnation is embedded.
     * @param {*} vecu  The vecu item which has be dropped to create an incarnation.
     */
    static async create(actor, vecu) {

        const data = {
            name: vecu.name,
            type: "incarnation",
            system: {
                base : {
                    description: "",
                    vecu: {
                        reference: vecu.system.sid,
                    },
                    cercle: [],
                    competences: vecu.system.base.competences
                },
                versions: {
                    v1: {
                        vecu: {
                            sapience: 0,
                        },
                        cercles: [],
                        competences: this.defineCompetences(vecu)
                    },
                    v5: {
                        vecu: {
                            sapience: 0,
                        },
                        cercles: [],
                        competences: this.defineCompetences(vecu)
                    }
                }
            }
        }

        return await actor.createEmbeddedDocuments("Item", [data]);

    }

    static defineCompetences(vecu) {
        const competences = []; 
        for (const r of vecu.system.base.competences) {
            competences.push({
                reference: r,
                sapience: 0
            })
        }
        return competences;
    }

}