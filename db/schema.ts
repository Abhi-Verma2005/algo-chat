import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
} from "drizzle-orm/pg-core";


export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  // Store external user ID as string to match external system
  externalUserId: varchar("external_user_id", { length: 255 }).notNull(),
  // Optionally store user email for easier querying (denormalized)
  userEmail: varchar("user_email", { length: 255 }),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

