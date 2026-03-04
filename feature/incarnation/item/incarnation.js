export class Incarnation {

    /**
     * @constructor
     * @param item The NephilimItem.
     */
    constructor(item) {
        this.item = item;
    }

    vecu() {
        return game.items.find(i => i.type === "vecu" && i.system.sid === this.item.system.base.vecu.reference);
    }

    periode() {
        const vecuItem = this.vecu();
        return  game.items.find(i => i.type === "periode" && i.system.sid === vecuItem.system.base.periode);
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