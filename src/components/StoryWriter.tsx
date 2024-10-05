"use client"

import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectValue,SelectTrigger,SelectItem } from "./ui/select"
import { Button } from "./ui/button"
import { useState } from "react"
import {Frame} from "@gptscript-ai/gptscript"
import renderEventMessage from "@/lib/renderEventMessage"

const storiesPath = "public/stories";

function StoryWriter() {
    const [story , setStory] = useState("");
    const [pages,setPages] = useState<number>();
    const [progress,setProgress] = useState<string>("");
    const [runStarted,setRunStarted] = useState<boolean>(false);
    const [runFinished,setRunFinished] = useState<boolean | null>(null);
    const [currentTool,setCurrentTool] = useState<string>("");
    const [events,setEvents] = useState<Frame[]>();

    async function runScript() {
        setRunStarted(true);
        setRunFinished(false);

        const response = await fetch( "/api/run-script" , {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ story , pages, path: storiesPath })
        })

        if(response.ok && response.body){
            console.log("streaming started");
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            handleStream(reader,decoder);
        }else{
            setRunStarted(false);
            setRunFinished(true);
            console.error("failed to start streaming");
        }

    }

    async function handleStream(reader: ReadableStreamDefaultReader<Uint8Array> , decoder: TextDecoder) {
        while(true){
            const { done ,value } = await reader.read();
            if(done) break;
            
            const chunk = decoder.decode(value , {stream: true});
            
            const eventData = chunk
            .split("\n\n")
            .filter( (line) => line.startsWith("event: ") )
            .map((line) => line.replace(/^event: /,""));
            
            eventData.forEach( data => {
                try{
                    const parseData = JSON.parse(data);
                    console.log(parseData);
                    if( parseData.type === "callProgress" ){
                        setProgress( parseData.output[parseData.output.length -1].content )
                    }
                }catch(error){

                }
            })
        }
    }

  return (
    <div className="flex flex-col container">
        <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
            <Textarea
                value={story}
                onChange={ (e) => {
                    setStory(e.target.value)
                } }
                className="flex-1 text-black"
                placeholder="Write a story about a robot and a human who become friends..." />

            <Select onValueChange={value => setPages(parseInt(value))}>
                <SelectTrigger>
                    <SelectValue placeholder="How many pages should the story be" />
                </SelectTrigger>

                <SelectContent className="w-full">
                    { Array.from( {length:10} , (_,i) => (
                        <SelectItem key={i} value={String(i+1)}>
                            {i+1} pages
                        </SelectItem>
                        )) 
                    }
                </SelectContent>
            </Select>

            <Button disabled={!story || !pages} className="w-ull" size="lg" onClick={runScript}>
                Generate Story
            </Button>
        </section>



        <section className="flex-1 pb-5 mt-5">
            <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md 
                text-gray-200 font-mono p-10 h-96 overflow-y-scroll">
                <div>
                    { runFinished === null && (
                        <>
                            <p className="animate-pulse mr-5">waitting for you to generate a story above...</p>
                        </>
                    ) }

                    <span className="mr-5">{">>"}</span>
                    {progress}
                </div>

                {/* current tool */}
                { currentTool && (
                    <div className="py-10">
                        <span className="mr-5">{" -- [current tool] ---"}</span>
                    </div>
                )}
                {/* render events */}
                <div className="space-y-5">
                    {events?.map( (event,index) => (
                        <div key={index}>
                            <span className="mr-5">{">>"}</span>
                            {renderEventMessage(event)}
                        </div>
                    )) }
                </div>

                {runStarted && (
                    <div>
                        <span className="mr-5 animate-in">
                            {"--- [ai storyteller has started] ---"}
                        </span>
                    </div>
                )}
            </div>
        </section>
    </div>
  )
}

export default StoryWriter
