export class UserError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UserInputError extends UserError {
    constructor(params: string) {
        super("Invalid Input");
        this.params = params;
    }

    public readonly params: string;
}
