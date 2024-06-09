import Logger from "./Logger.js";
export default class ExceptionHandler {
  static init() {
    process.on("uncaughtException", (err) => {
      Logger.error("[UncaughtException] " + err.stack ? err.stack : err);
    });

    process.on("unhandledRejection", (err) => {
      if (err instanceof Error)
        Logger.error("[UnhandledRejection] " + err.stack ? err.stack : err);
      else Logger.error("[UnhandledRejection] " + err);
    });
  }
}
