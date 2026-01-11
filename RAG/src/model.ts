import {ChatOpenAI} from "@langchain/openai";
import {MemoryVectorStore} from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import {StringOutputParser} from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
});

const data = [
    'I am Rohan',
    'I am an AI developer',
    'I love to build applications using Langchain',
    'I Love stock market investing',
    'I love to play Badminton',
];

const question = "What are my hobbies?";

async function main(){

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(data.map((text) => new Document({ pageContent: text })));

vectorStore.similaritySearch(question, 2).then(async(res)=>{
    const context = res.map((doc) => doc.pageContent).join('\n');

    const promptTemplate = PromptTemplate.fromTemplate(`Answer the question based on the context below:\n\nContext: ${context}\n\nQuestion: {question}`);

    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(model).pipe(outputParser);

    const response = await chain.invoke({ question });
    console.log(response);
});
}

main();

