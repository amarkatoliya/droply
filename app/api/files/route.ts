import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { files } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams;
        const queryUserId = searchParams.get("userId");
        const parentId = searchParams.get("parentId");

        if (!queryUserId || queryUserId !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 })
        }

        //fetch user userFiles
        let userFiles;

        if (parentId) {
            //fetch specific file 
            userFiles = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        eq(files.parentId, parentId)
                    )
                )
        } else {
            userFiles = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        isNull(files.parentId)
                    )
                )
        }

        return NextResponse.json(userFiles);

    } catch (error) {
        console.error("Error fetching files :", error);
        return NextResponse.json(
            { error: "error in file structure" },
            { status: 500 }
        );
    }
}
