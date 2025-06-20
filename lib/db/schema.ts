import { pgTable, integer, boolean, text, uuid, timestamp } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),

    //basic info of file
    name: text("name").notNull(),
    path: text("path").notNull(),  // document/folder/file
    type: text("type").notNull(),  // file or folder
    size: integer("size").notNull(),

    //Storage info
    fileUrl: text("file_url").notNull(),  // url to access file
    thumbnailurl: text("thumbnail_url"),

    //Ownrship
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), // if parentId is at root then null

    //file or folder flags
    isFolder: boolean("is_folder").default(false).notNull(),
    isStared: boolean("is_stared").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    //timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("apdated_at").defaultNow().notNull()
});


export const filesRelation = relations(files, ({ one, many }) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id]
    }),

    children: many(files),
}));

export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;