import { ClientEvents } from "discord.js";

interface EventsOptions<Event extends keyof ClientEvents> {
  name: Event;
  once?: boolean;
  run: (...args: ClientEvents[Event]) => Promise<any>;
}

export default class Event<Event extends keyof ClientEvents> {
  constructor(options: EventsOptions<Event>) {
    this.name = options.name;
    this.once = options.once;
    this.run = options.run;
  }

  public readonly name: Event;
  public readonly once?: boolean;
  public readonly run: (...args: ClientEvents[Event]) => Promise<any>;
}
