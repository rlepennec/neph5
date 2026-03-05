export class Incarnation {

    /**
     * @constructor
     * @param item The NephilimItem.
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
     * 
     * @param {*} actor The actor document.
     * @param {*} vecu  The vecu item which has be dropped.
     */
    static async create(actor, vecu) {

        const data = {
            name: vecu.name,
            type: "incarnation",
            system: {
                base : {
                    description: "",
                    previous: null,
                    vecu: {
                        reference: vecu.system.sid,
                    },
                    competences: []
                },
                versions: {
                    v1: {
                        vecu: {
                            sapience: 0,
                        },
                        competences: []
                    },
                    v5: {
                        vecu: {
                            sapience: 0,
                        },
                        competences: []
                    }
                }
            }
        };

        return await actor.createEmbeddedDocuments("Item", [data]);

    }





}