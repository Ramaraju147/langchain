import {ChatOpenAI} from "@langchain/openai";
import {MemoryVectorStore} from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import {StringOutputParser} from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
});

const loader = new CheerioWebBaseLoader("https://docs.langchain.com/");

const question = "What all languages does Langchain support?";

async function main(){

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = new MemoryVectorStore(embeddings);

const data = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const splitDocs = await splitter.splitDocuments(data);

await vectorStore.addDocuments(splitDocs);

vectorStore.similaritySearch(question, 2).then(async(res)=>{
    const context = res.map((doc) => doc.pageContent).join('\n');

    const promptTemplate = PromptTemplate.fromTemplate(`Answer the question based on the context below:\n\nContext: {context}\n\nQuestion: {question}`);

    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(model).pipe(outputParser);

    const response = await chain.invoke({ question, context });
    console.log(response);
});
}

main();

