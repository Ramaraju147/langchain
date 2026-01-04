import {OpenAI} from 'openai';
import fs from 'fs';

const openAi = new OpenAI();

async function audioTranscription() {

    const response = await openAi.audio.transcriptions.create({
        file: fs.createReadStream('sample-0.mp3'),
        model: 'whisper-1',
        response_format: 'text',
        language:'fr'
    });

    console.log(response);
}

async function speechGeneration() {

    const response = await openAi.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: 'Bonjour! Comment puis-je vous aider aujourd\'hui?'
    });
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync('generated_speech.mp3', audioBuffer);
}

speechGeneration();

audioTranscription();