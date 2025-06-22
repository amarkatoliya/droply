import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(requst: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        // parse data from body
        const body = await requst.json();
        const { imagekit, userId: bodyUserId } = body;

        // Verify the user is uploading to their own account
        if (userId !== bodyUserId) {
            return NextResponse.json(
                { error: "Unauthorized user access" },
                { status: 401 })
        }

        //validate ImageKit responce
        if (!imagekit || !imagekit.url) {
            return NextResponse.json(
                { error: "file/folder invalid" },
                { status: 401 })
        }

        const fileData = {
            name: imagekit.name || "Untitled",
            path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
            size: imagekit.size || 0,
            type: imagekit.fileType || "image",
            fileUrl: imagekit.url,
            thumbnailUrl: imagekit.thumbnailUrl || null,
            userId: userId,
            parentId: null, // Root level by default
            isFolder: false,
            isStarred: false,
            isTrash: false,
        }

        const [newFile] = await db.insert(files).values(fileData).returning();

        return NextResponse.json(newFile)

    } catch (error) {
        return NextResponse.json(
            { error: "failed to send data to database" },
            { status: 500 })
    }
}