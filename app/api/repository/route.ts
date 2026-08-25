import { NextResponse } from "next/server";
import { ApiError, previewRepository } from "@/lib/api";


export async function POST(req: Request){

    const { repositoryUrl } = await req.json();

    try {
        const preview = await previewRepository(repositoryUrl);

        return NextResponse.json({
            name: preview.repository.name,
            owner: preview.repository.owner,
            description: preview.repository.description ?? "",
            stars: preview.repository.stars,
            forks: preview.repository.forks,
            language: preview.repository.language ?? "",
            visibility: preview.repository.visibility,
            created: "",
            updated: preview.repository.updatedAt,
            url: preview.repositoryUrl,
        });

    } catch (error) {
        const status = error instanceof ApiError ? error.statusCode : 404;
        const message =
            error instanceof Error ? error.message : "Repository not found";

        return NextResponse.json(
            {
                error: message
            },
            {
                status
            }
        );
    }

}
