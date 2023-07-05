export default class Command {
    constructor(options) {
        this.data = options.data;
        this.devsOnly = options.devsOnly;
        this.run = options.run;
        this.autocomplete = options.autocomplete;
    }
    data;
    devsOnly;
    run;
    autocomplete;
}
