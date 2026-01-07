import { generateEmbeddings, loadJsonData } from ".";

async function dotProduct(vecA: number[], vecB: number[]): Promise<number> {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length for dot product calculation.');
    }

    let product = 0;
    for (let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i];
    }
    return product;
}

async function computeCosineSimilarity(vecA: number[], vecB: number[]): Promise<number> {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }

    const dotProductValue = await dotProduct(vecA, vecB);
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }

    return dotProductValue / (magnitudeA * magnitudeB);
}

export async function findMostSimilarEmbedding(){
    const input = "animal";
    const embeddingsData = loadJsonData('data_with_embeddings.json');
    const embedding = await generateEmbeddings([input]);

    const similarity: {item: any, score: number}[] = [];

    for(const data of embeddingsData){
        const score = await computeCosineSimilarity(embedding.data[0].embedding, data.embedding);
        similarity.push({item: data.item, score});
    }

    const sortedSimilarities = similarity.sort((a, b) => b.score - a.score);

    sortedSimilarities.forEach(sim => {
        console.log(`Score: ${sim.score.toFixed(4)} - Item: ${JSON.stringify(sim.item)}`);
    });    
}

findMostSimilarEmbedding();