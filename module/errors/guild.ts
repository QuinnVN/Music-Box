import { UserError } from "./base.js";

export class NoPermission extends UserError {
    constructor() {
        super("You don't have permission to use this command");
    }
}

export class BotNoPermission extends UserError {
    constructor() {
        super("I don't have permission to execute this command");
    }
}

export class NotInGuild extends UserError {
    constructor() {
        super("You must be in a guild to use this command!");
    }
}
