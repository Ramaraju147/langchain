import {ChromaClient} from 'chromadb';
import {OpenAIEmbeddingFunction} from '@chroma-core/openai'

const chromaClient = new ChromaClient({
  host: 'localhost',
  port: 8000
});

const openAIEmbeddingFunction = new OpenAIEmbeddingFunction({
  apiKey: process.env.OPENAI_API_KEY || '',
  modelName: 'text-embedding-3-small',
});

async function addCollectionIfNotExists(collectionName: string) {
    try {
        await chromaClient.deleteCollection({ name: collectionName });
        console.log(`Deleted existing collection '${collectionName}'.`);
    } catch (e) {
        console.log(`Collection '${collectionName}' does not exist yet.`);
    }
    
    const response = await chromaClient.createCollection({ 
        name: collectionName,
        embeddingFunction: openAIEmbeddingFunction 
    });
    console.log(`Collection '${collectionName}' is ready.`, response);
}

async function addData() {
    await addCollectionIfNotExists('data_collection');
    
    const collection = await chromaClient.getCollection({ name: 'data_collection', embeddingFunction: openAIEmbeddingFunction });
    const items = [
        { id: '1', document: 'Sample document 1' },
        { id: '2', document: 'Sample document 2' },
    ];

    for (const item of items) {
        const response = await collection.add({
            ids: [item.id], 
            documents: [item.document]
        });
        console.log(`Added item with ID: ${item.id}`, response);
    }
}

addData();

// addCollectionIfNotExists('data_collection3');