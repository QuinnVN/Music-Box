export class UserError extends Error {
    constructor(message) {
        super(message);
    }
}
export class UserInputError extends UserError {
    constructor(params) {
        super("Invalid Input");
        this.params = params;
    }
    params;
}
