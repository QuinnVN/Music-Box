export default class Event {
    constructor(options) {
        this.name = options.name;
        this.once = options.once;
        this.run = options.run;
    }
    name;
    once;
    run;
}
