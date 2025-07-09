import "server-only";

import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { chat } from "./schema";
import { User, UserApiKey, User as users } from "@/lib/algo-schema";
import { externalDb } from "@/lib/algo-db";

// Your current database for chat and reservation data
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
export const db = drizzle(client);




// ============ EXTERNAL USER AUTHENTICATION FUNCTIONS ============
// These functions interact with your external database using Drizzle

export async function authenticateUser(email: string, password: string) {
  try {
    const usersFound = await externalDb
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (usersFound.length === 0) {
      return null;
    }
    
    const user = usersFound[0];
    
    // Compare password with hashed password
    const isValidPassword = compareSync(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Failed to authenticate user from external database");
    throw error;
  }
}

export async function getExternalUser(userEmail: string) {
  try {
    const usersFound = await externalDb
      .select({
        password: users.password,
        username: users.username,
        email: users.email,
        id: users.id
      })
      .from(users)
      .where(eq(users.email, userEmail));


    return usersFound.length > 0 ? usersFound[0] : null;
  } catch (error) {
    console.error("Failed to get user from external database: ", error);
    throw error;
  }
}

export async function getExternalUserByEmail(email: string) {
  try {
    const usersFound = await externalDb
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return usersFound.length > 0 ? usersFound[0] : null;
  } catch (error) {
    console.error("Failed to get user by email from external database");
    throw error;
  }
}


// ============ CHAT FUNCTIONS (LOCAL DATABASE) ============

export async function saveChat({
  id,
  messages,
  externalUserId,
  userEmail,
}: {
  id: string;
  messages: any;
  externalUserId: string;
  userEmail?: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      externalUserId,
      userEmail,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByExternalUserId({ externalUserId }: { externalUserId: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.externalUserId, externalUserId))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by external user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}
