import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";

export class Fraternite {

    static DEFAULT_STATUS = "membres";

    /**
     * Constructor.
     * @param actor The actor which is the fraternite. 
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @returns all members sorted by status.
     */
    membres() {
        const membres = [];
        for (let status of this.status()) {
           const all = this.membresWithStatus(status);
           membres.push({
                'status': status,
                'size': all.length,
                'membres': all
           }); 
        }
        return membres;
    }

    /**
     * @param actor The actor object to watch.
     * @returns true if the actor is an active member of the fraternite.
     */
    isActiveMember(actor) {
        let active = null;
        for (let periode of new Incarnations(this.actor).ordonnees({ jusqua: new Incarnations(this.actor).courante })) {
            const found = Version.data(this.actor).effectif.find(m => m.periode === periode.sid && m.actor === actor.sid);
            if (found != null) {
                if (active === null) {
                    active = true;
                } else {
                    active = !active;
                }
            }
        }
        return active;
    }

    /**
     * @returns all status.
     */
    status() {
        const status = [];
        for (let s of Version.data(this.actor).effectif.map(e => e.status)) {
            if (status.includes(s) !== true) {
                status.push(s);
            }
        }
        return status;
    }

    /**
     * @param status The status of the membres to retrieve.
     * @returns the membres.
     */
    membresWithStatus(status) {
        let membres = [];
        for (let periode of new Incarnations(this.actor).ordonnees({ jusqua: new Incarnations(this.actor).courante })) {
            for (let membre of Version.data(this.actor).effectif.filter(m => m.status === status && m.periode === periode.sid)) {
                const actor = membres.find(m => m.sid === membre.actor);
                if (actor == null) {
                    membres.push(game.actors.find(a => a.sid === membre.actor));
                } else {
                    membres = membres.filter(m => m.sid != membre.actor)
                } 
            }
        }
        return membres;
    }

    /**
     * @param event   The event to process.
     * @param actor   The actor to add.
     * @param periode The system identifier of the periode.
     * @param status  The status of the actor to add.
     */
    async addMember(event, actor, periode, status) {

        // Check the actor is already a member
        const effectif = foundry.utils.duplicate(Version.data(this.actor).effectif);
        const found = effectif.find(m => m.actor === actor.sid && m.periode === periode);
        if (found != null) {
            return;
        }

        // Push the new actor
        effectif.push({
            status: status,
            periode: periode,
            actor: actor.sid
        });
        await this.actor.update({ [Version.path(this.actor, 'effectif')]: effectif });

    }

    /**
     * @param actor   The actor to delete.
     * @param periode The periode system identifier.
     */
    async deleteMember(actor, periode) {
        if (actor?.type === 'figure' || actor?.type === 'figurant') {
            const effectif = Version.data(this.actor).effectif.filter(m => m.actor !== actor.sid || m.periode !== periode);
            await this.actor.update({ [Version.path(this.actor, 'effectif')]: effectif });
        }
    }

    /**
     * @param periode The periode object to delete.
     */
    async onDeletePeriode(periode) {
        const effectif = Version.data(this.actor).effectif.filter(m => m.periode !== periode.sid);
        await this.actor.update({ [Version.path(this.actor, 'effectif')]: effectif });
    }

    /**
     * @param actor The actor object to delete.
     */
    async onDeleteActor(actor) {
        const effectif = Version.data(this.actor).effectif.filter(m => m.actor !== actor.sid);
        await this.actor.update({ [Version.path(this.actor, 'effectif')]: effectif });
    }

    /**
     * @param actor   The actor identifier.
     * @param periode The periode system identifier.
     * @returns true if new member for the periode (in), false is out
     */
    isNewMember(actor, periode) {
        const member = game.actors.get(actor);
        let move = null;
        for (let p of new Incarnations(this.actor).ordonnees({ jusqua: periode })) {
            if (Version.data(this.actor).effectif.find(m => m.actor === member.sid && m.periode === p.sid) != null) {
                if (move == null) {
                    move = true;
                } else {
                    move = !move;
                }
            }
        }
        return move;
    }

}