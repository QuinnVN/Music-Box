import { QuickDB, SqliteDriver } from "quick.db";

const driver = new SqliteDriver("./Data/db.sqlite");

export default new QuickDB({ driver });
