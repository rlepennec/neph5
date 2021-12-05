export class Messages {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the messages.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial messages combatant property.
     */
    static create() {
        return [];
    }

    /** 
     * Indicates if the specified message is registered.
     * @param event The message event to check.
     * @return true if the message is registered.
     */
    includes(event) {
        return this.combatant.data.flags.world.combat.messages.includes(event);
    }

    /**
     * Pushes the specified message event.
     * @param event The event to push.
     * @returns the instance.
     */
    async push(event) {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.messages.push(event);
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Deletes the specified message.
     * @param event The message event to remove.
     * @returns the instance.
     */
    async delete(event) {
        const flags = duplicate(this.combatant.data.flags);
        if (flags.world !== undefined && flags.world.combat.messages.includes(event)) {
            const pos = flags.world.combat.messages.indexOf(event.id);
            flags.world.combat.messages.splice(pos, 1);
            await this.combatant.update({['flags']: flags});
        }        
        return this;
    }

}