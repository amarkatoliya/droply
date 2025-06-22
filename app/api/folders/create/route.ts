import { files } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default async function POST(requst: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        const body = await requst.json();
        const { name, userId: bodyUserId, parentId = null } = body;

        if (userId !== bodyUserId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 400 })
        }

        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json(
                { error: "Plese Enter Name first" },
                { status: 401 })
        }

        // Check if parent folder exists if parentId is provided
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.isFolder, true),
                        eq(files.userId, userId)
                    )
                )

            if (!parentFolder) {
                return NextResponse.json(
                    { error: "Plese Enter Name first" },
                    { status: 401 })
            }
        }

        const FolderData = {
            id: uuidv4(),
            name: name.trim(),
            path: `/folders/${userId}/${uuidv4()}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId,
            parentId,
            isFolder: true,
            isStarred: false,
            isTrash: false,
        }

        const [newFolder] = await db.insert(files).values(FolderData).returning();

        return NextResponse.json({
            success: true,
            message: "Folder is created succesfully",
            folder: newFolder
        })

    } catch (error) {
        console.error("Error creating folder:", error);
        return NextResponse.json(
            { error: "Failed to create folder" },
            { status: 500 }
        );
    }
}
