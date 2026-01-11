import { ChatPromptTemplate } from  '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import {StringOutputParser} from '@langchain/core/output_parsers'
import { StructuredOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
});

const outputParser = StructuredOutputParser.fromNamesAndDescriptions(
    {
        name: "The name of the concept",
        description: "A brief explanation of the concept"
    }
);

const prompt = ChatPromptTemplate.fromTemplate(
  "Explain in simple terms. {additional_info}\n{format_instructions}"
);

const chain = prompt.pipe(model).pipe(outputParser);

async function generateResponse(additionalInfo: string) {
  const response = await chain.invoke({
    additional_info: additionalInfo,
    format_instructions: outputParser.getFormatInstructions(),
  });
  console.log(response);
}

generateResponse("the theory of relativity.");

