import {OpenAI} from 'openai';
import {createReadStream, writeFileSync} from 'fs';

const openAi = new OpenAI();

async function imageGeneration(params: { prompt: string, n?: number }) {

    const response = await openAi.images.generate({
        model: "gpt-image-1",
        prompt: params.prompt,
        n: params.n || 1,
        size: "1024x1024",
        quality: "high"
    });
    if(response.data && response.data[0].b64_json ) {
        const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
        writeFileSync('generated_image.png', imageBuffer);
    }
}

async function imageVariationGeneration() {

    const response = await openAi.images.createVariation({
        image: createReadStream('generated_image.png'),
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
    });
    if(response.data && response.data[0].b64_json ) {
        const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
        writeFileSync('generated_image1.png', imageBuffer);
    }
}

// imageGeneration({ prompt: "A beautiful landscape with mountains and a lake" });
imageVariationGeneration();