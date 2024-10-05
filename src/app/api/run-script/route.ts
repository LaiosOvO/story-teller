import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import { NextRequest } from "next/server";
import g from "@/lib/gptScriptInstance";

const sciprt = "src/app/api/run-script/story-book.gpt";

export async function POST( request: NextRequest ) {

    console.log("api/run-script is invoked \n\n here is the ai agent logic");
    const { story,pages,path } = await request.json();

    const opts: RunOpts = {
        disableCache: true,
        input: `--story ${story} --pages ${pages} --path ${path}`,
    };

    try{
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try{
                    const run = await g.run(sciprt,opts);

                    run.on( RunEventType.Event , (data) => {
                        controller.enqueue(
                            encoder.encode(`event: ${JSON.stringify(data)} \n\n`)
                        );
                    });

                    await run.text();
                    controller.close();
                }catch(error){
                    controller.error(error);
                    console.log("error",error);
                }
            }
        });

        return new Response(stream , {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        })
    } catch(error){
        return new Response(JSON.stringify({ error: error }), {
            status: 500,
        })
    }

}
