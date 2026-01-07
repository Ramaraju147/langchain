import { generateEmbedding, loadJsonFile } from "./main";

process.stdout.write("Starting Movie Recommendation User Interface...\n");

let movies: any = {};

async function loadMovies() {
    return await loadJsonFile('movieData.json');
}

export function listMovies() {
    console.log("Available Movies:");
    movies.movies.forEach((movie: any, index: number) => {
        console.log(`${index + 1}. ${movie.title} - ${movie.genre}`);
    });
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

loadMovies().then(moviesData => {
    movies = moviesData;
    console.log("Movies data loaded successfully.", movies);
    
    listMovies();
    
    process.stdout.write("Enter your preferences: \n");

    process.stdin.on('data', async (data) => {
        const input = data.toString().trim().toLowerCase();
        const inputEmbedding = await generateEmbedding([input]);
        const movieEmbeddings = await loadJsonFile('movies_with_embeddings.json');
        const similarity: any[] = [];

        movieEmbeddings.forEach((movieData: any) => {
            const sim = cosineSimilarity(inputEmbedding, movieData.embedding);
            similarity.push({ movie: movieData.item, score: sim });
        });

        similarity.sort((a, b) => b.score - a.score);
        console.log("Recommended Movies:");
        similarity.slice(0, 5).forEach((item) => {
            console.log(`${item.movie.title} - Score: ${item.score.toFixed(4)}`);
        });

        process.stdout.write("Enter your preferences: \n");
    });
});