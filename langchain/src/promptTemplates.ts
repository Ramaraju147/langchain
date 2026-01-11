import { ChatPromptTemplate } from  '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
});

const prompt = ChatPromptTemplate.fromTemplate(
  "Explain in simple terms. {additional_info}"
);

const chain = prompt.pipe(model);

async function generateResponse(additionalInfo: string) {
  const response = await chain.invoke({
    additional_info: additionalInfo,
  });
  console.log(response.content);
}

generateResponse("the theory of relativity.");

