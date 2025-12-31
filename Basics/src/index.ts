import {OpenAI} from 'openai';
import {encoding_for_model} from 'tiktoken';

const openai = new OpenAI();

async function main(){
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {role: "user", content: "Translate the following English text to Hindi: 'Hello, how are you?'"},
        ],
        seed: 42,
    });

    console.log(response.choices[0].message.content);   
}

function encodeFormatter(){
    const prompt = "How many tokens are there in this sentence?";
    const encoder = encoding_for_model("gpt-3.5-turbo");
    const tokenized = encoder.encode(prompt);
    console.log("Number of tokens:", tokenized.length, "Tokens:", tokenized);
}
encodeFormatter();
main();