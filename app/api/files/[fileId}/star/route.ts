import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    requset: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        const { fileId } = await props.params;

        if (!fileId) {
            return NextResponse.json(
                { error: "fileId is required" },
                { status: 401 })
        }

        const [file] = await db
            .select()
            .from(files)
            .where(
                and(
                    eq(files.userId, userId),
                    eq(files.id, fileId)
                )
            );

        if (!file) {
            return NextResponse.json(
                { error: "No file is found" },
                { status: 401 })
        }

        const updatedFiles = await db
            .update(files)
            .set({
                isStared: !files.isStared
            })
            .where(
                and(
                    eq(files.userId, userId),
                    eq(files.id, fileId)
                )
            )
            .returning()

        //just for check purpose
        console.log(updatedFiles);
        const updatedFile = updatedFiles[0];
        return NextResponse.json(updatedFile);

    } catch (error) {
        return NextResponse.json(
            { error: "failed to update the file" },
            { status: 400 })
    }
}