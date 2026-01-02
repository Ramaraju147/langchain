import { get } from "node:http";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {encoding_for_model} from "tiktoken";

const openai = new OpenAI();

const maxTokens = 500;

const encoding = encoding_for_model("gpt-4o");

const context: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." }
];

async function chatWithBot(message: string) {
    context.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: context,
    });

    context.push({ role: "assistant", content: response.choices[0].message?.content || "" });

    if(response.usage && response.usage.total_tokens > maxTokens) {
        deleteTokens();
    }

    return response.choices[0].message?.content;
}

process.stdin.on("data", async (input) => {
  const userInput = input.toString().trim();

  chatWithBot(userInput).then((response) => {
    console.log("Bot:", response);
    process.stdout.write("You: ");
  });
});

async function deleteTokens() {
let contextLength = getTokenLength();
while(contextLength > maxTokens) {
    for(let i = 1; i < context.length; i++) {
        if(context[i].role === "user") {
            context.splice(i, 1); // Remove the user message
            if(i < context.length && context[i].role === "assistant") {
                context.splice(i, 1); // Remove the corresponding assistant message
            }
            contextLength = getTokenLength();
            break;
        }
    }
} 
}

function getTokenLength() {
    let totalTokens = 0;
    context.forEach((message) => {
        if(typeof(message.content) === "string") {
            totalTokens += encoding.encode(message.content || "").length;
        }
        else if(Array.isArray(message.content)) {
            message.content.forEach((part) => {
                if(typeof(part) === "string"){
                    totalTokens += encoding.encode(part || "").length;
                }
            });
        }
    });
    return totalTokens;
}

process.stdout.write("You: ");