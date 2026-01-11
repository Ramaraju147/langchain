import {ChatOpenAI} from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
});

async function generateResponse(prompt: string) {
//   const response = await model.invoke(prompt);
const response = await model.stream(prompt);
for await (const chunk of response) {
    process.stdout.write(chunk.text);
  }     
}

generateResponse("Explain the theory of relativity in simple terms.");