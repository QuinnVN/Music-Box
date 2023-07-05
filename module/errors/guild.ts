import { UserError } from "./base.js";

export class NoPermission extends UserError {
    constructor() {
        super("You Don't Have Permission To Execute This Command");
    }
}

export class BotNoPermission extends UserError {
    constructor() {
        super("I Don't Have Permission To Execute This Command");
    }
}
