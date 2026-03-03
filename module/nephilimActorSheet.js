import { NephilimActor } from "./nephilimActor.js"
import { NephilimMixinSheet } from "./nephilimSheetMixin.js"

export class NephilimActorSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimActor;
    }

    static DEFAULT_OPTIONS = {
        classes: ["actor"]
    }

    /** 
     * @override
     */
	async drop(document) {
        console.log(document);

        const data = document.toObject();
        console.log(data);

        if (data.type === 'vecu') {

console.log(data.system.sid)


            const itemData = {
                name: data.name,
                type: "incarnation",
                system: {
                    base : {
                        description: "Default description",
                        vecu: {
                            reference: data.system.sid,
                            sapience: 0
                        },
                        competences: []
                    }
                }
            };
            
            const created = await this.document.createEmbeddedDocuments("Item", [itemData]);
            console.log("Created embedded item:", created);
            

        }
        
        
        


        //let item = (await this.document.createEmbeddedDocuments("Item", [data]))[0];


        //await new DocumentReference(this.document).removeFromRegister(document);
        //await new DocumentReference(document).addTo(this.document);
        //await new DocumentReference(this.document).addTo(document);


	}

}