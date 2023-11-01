import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  heandler: text("id").notNull().unique(),
});

export const essays = sqliteTable("essays", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer", { length: 2500 }).notNull(),
  aiResponse: text("aiResponse", { mode: "json" }).$type<{
    taskTitle: string;
    result: string;
  }[]>(),
  dateSubmitted: integer("dateSubmitted", { mode: "timestamp" }).notNull()
});

export type essayType = typeof essays.$inferSelect