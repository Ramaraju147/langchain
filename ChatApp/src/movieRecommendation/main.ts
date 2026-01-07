import {OpenAI} from 'openai';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI();

export async function generateEmbedding(text: string[]): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function loadJsonFile(filePath: string): Promise<any> {
 const path = join(__dirname, filePath);
  const data = readFileSync(path);
  return JSON.parse(data.toString());
}

export async function saveEmbeddingData(filePath: string, data: any): Promise<void> {
    const dataString = JSON.stringify(data, null, 2);
    await writeFileSync(filePath, Buffer.from(dataString));
    console.log(`Data saved to ${filePath}`);
} 

export async function main() {
  const data = await loadJsonFile('movieData.json');
  const dataWithEmbeddings: any[] = [];

  for (const item of data.movies) {
    const embedding = await generateEmbedding([item.title, item.description, item.genre]);
    dataWithEmbeddings.push({
      item,
      embedding,
    });
  }
    await saveEmbeddingData('movies_with_embeddings.json', dataWithEmbeddings);
}