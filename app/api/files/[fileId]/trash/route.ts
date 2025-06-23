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

        const [updatedFile] = await db
            .update(files)
            .set({
                isTrash: !files.isTrash
            })
            .where(
                and(
                    eq(files.userId, userId),
                    eq(files.id, fileId)
                )
            )
            .returning()

        //just for check purpose
        // console.log(updatedFiles);
        const action = updatedFile.isTrash ? "moved to trash" : "restore";
        return NextResponse.json({
            ...updatedFile,
            message: `File ${action} succesfully`
        });

    } catch (error) {
        return NextResponse.json(
            { error: "failed to update  status of trash  file" },
            { status: 500 })
    }
}