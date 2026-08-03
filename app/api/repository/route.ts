import { NextResponse } from "next/server";


export async function POST(req: Request){

    const { repositoryUrl } = await req.json();


    const urlParts = repositoryUrl.split("/");

    const owner = urlParts[3];
    const repo = urlParts[4];


    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
    );


    if(!response.ok){
        return NextResponse.json(
            {
                error:"Repository not found"
            },
            {
                status:404
            }
        );
    }


    const data = await response.json();


    return NextResponse.json({
        name:data.name,
        owner:data.owner.login,
        description:data.description,
        stars:data.stargazers_count,
        forks:data.forks_count,
        language:data.language,
        visibility:data.visibility,
        created:data.created_at,
        updated:data.updated_at,
        url:data.html_url
    });

}