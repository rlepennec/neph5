export class Incarnation {

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