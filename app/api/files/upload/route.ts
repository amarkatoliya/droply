
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";



const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(request: NextRequest) {

    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        const formData = await request.formData();
        const file = formData.get("file") as File
        const formUserId = formData.get("userId") as string
        const parentId = (formData.get("parentId") as string) || null

        //verifying if user is uploading file
        if (formUserId !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        // check if there exists
        if (!file) {
            return NextResponse.json(
                { error: "No file found" },
                { status: 401 })
        }

        //if parentId present
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        eq(files.parentId, parentId),
                        eq(files.isFolder, true)
                    )
                )
        }

        // option method for if parent id is not found

        // else {
        //     return  NextResponse.json(
        //         { error: "parentId not found" },
        //         { status: 400 })
        // }


        if (!parentId) {
            return NextResponse.json(
                { error: "parentId not found" },
                { status: 400 })
        }

        if (!file.type.startsWith("image/") && file.type !== "aplication/pdf") {
            return NextResponse.json(
                { error: " plaese select valid credintials for file" },
                { status: 400 })
        }

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`

        const originalFilename = file.name;
        const fileExtension = originalFilename.split(".").pop() || "";
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        if (fileExtension === "") {
            return NextResponse.json(
                { error: "file extension is not found" },
                { status: 400 })
        }

        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFilename,
            folder: folderPath,
            useUniqueFileName: false,
        })

        const fileData = {
            name: originalFilename,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId: userId,
            parentId: parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false,
        }

        const [newFile] = await db.insert(files).values(fileData).returning();

        return NextResponse.json(newFile)

    } catch (error: any) {
        console.error("error in uploading file in folder", error)
        return NextResponse.json(
            { error: " internal server issue" },
            { status: 500 })
    }

}