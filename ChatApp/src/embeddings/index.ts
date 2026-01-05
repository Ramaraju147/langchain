import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {OpenAI} from 'openai';

const openAi = new OpenAI();

async function generateEmbeddings(input: string[]) {

    const response = await openAi.embeddings.create({
        model: 'text-embedding-3-small',
        input: input
    });

    console.log(response);
    return response;
}

function loadJsonData() {
    const path = join(__dirname, 'data.json');
    const data = readFileSync(path);
    return JSON.parse(data.toString());
}

function saveDataToJson(data: any, filename: string) {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString);
    const path = join(__dirname, filename);
    writeFileSync(path, dataBuffer);
    console.log(`Data saved to ${filename}`);
}

async function main(){
    const data = loadJsonData();
    const embeddings = await generateEmbeddings(data);
    const dataWithEmbeddings: any[] = [];
    data.forEach(async (item: any, index: number) => {
        dataWithEmbeddings.push({
            item,
            embedding: embeddings.data[index].embedding
        });
    });
    saveDataToJson(dataWithEmbeddings, 'data_with_embeddings.json');
}

main();