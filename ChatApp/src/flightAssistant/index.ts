import {OpenAI} from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions';
import { encoding_for_model, get_encoding } from 'tiktoken';

const openAi = new OpenAI();

const context: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a flight assistant that helps users find and book flights." }
];

let encoding: ReturnType<typeof encoding_for_model> | ReturnType<typeof get_encoding>;
try {
    encoding = encoding_for_model('gpt-4o');
} catch (e) {
    encoding = get_encoding('cl100k_base');
}

function countTokensForMessages(messages: ChatCompletionMessageParam[]) {
    let total = 0;
    for (const m of messages) {
        const parts = [m.role ?? '', (m as any).name ?? '', typeof m.content === 'string' ? m.content : JSON.stringify(m.content), (m as any).tool_call_id ?? ''];
        total += encoding.encode(parts.join('\n')).length;
    }
    return total;
}

function trimContextToTokenLimit(limit: number) {
    // never remove the system message at index 0
    while (context.length > 1 && countTokensForMessages(context) > limit) {
        context.splice(1, 1);
    }
}

function findFlights(departure: string, arrival: string, date: string) {
    // Mock flight data
    const flights = [
        { flightNumber: "AB123", departure: "New York", arrival: "London", date: "2023-10-01", time: "10:00 AM" },
        { flightNumber: "CD456", departure: "New York", arrival: "India", date: "2023-10-01", time: "04:00 PM" },
        { flightNumber: "EF789", departure: "New York", arrival: "Dubai", date: "2023-10-02", time: "09:00 AM" }
    ];

    return flights.filter(flight => 
        flight.departure === departure && 
        flight.arrival === arrival && 
        flight.date === date
    );
}

function bookFlight(flightNumber: string) {
    // Mock booking confirmation with e-ticket generation
    return `Flight ${flightNumber} has been successfully booked. Your e-ticket number is ETK${Math.floor(Math.random() * 1000000)}.`;
}


async function chatWithBot(input: string) {

    // preserve previous conversation in `context`
    context.push({ role: "user", content: input });
    // trim context to stay within token budget
    trimContextToTokenLimit(500);

    const response = await openAi.chat.completions.create({
        model: "gpt-4o",
        messages: context,
        tools:[
            {
                type: "function",
                function: {
                    name: "find_flights",
                    description: "Find available flights between two cities on a specific date",
                    parameters: {
                        type: "object",
                        properties: {
                            departure: {
                                type: "string",
                                description: "The departure city"
                            },
                            arrival: {
                                type: "string",
                                description: "The arrival city"
                            },
                            date: {
                                type: "string",
                                description: "The date of the flight in YYYY-MM-DD format"
                            }
                        },
                        required: ["departure", "arrival", "date"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "book_flight",
                    description: "Book a flight given its flight number",
                    parameters: {
                        type: "object",
                        properties: {
                            flightNumber: {
                                type: "string",
                                description: "The flight number to book"
                            }
                        },
                        required: ["flightNumber"]
                    }
                }
            }
        ],
        tool_choice: 'auto'
    });

    console.log(response.choices[0].message);

    const invokeTool = response.choices[0].finish_reason == 'tool_calls';
    const toolCalls = response.choices[0].message?.tool_calls;

    if(invokeTool && toolCalls && toolCalls.length > 0) {
        // Push the assistant message that contains the tool_calls before adding tool responses
        context.push(response.choices[0].message!);
        // ensure we still fit in the token budget after assistant message
        trimContextToTokenLimit(500);

        for (const toolCall of toolCalls) {
            if ('function' in toolCall) {
                const toolName = toolCall.function.name;
                
                if(toolName === "find_flights") {
                    const args = JSON.parse(toolCall.function.arguments || "{}") as {departure: string, arrival: string, date: string};
                    const {departure, arrival, date} = args;
                    const flights = findFlights(departure, arrival, date);
                    const flightInfo = flights.length > 0 ? JSON.stringify(flights) : "No flights found.";
                    context.push({role: "tool", content: flightInfo, tool_call_id: toolCall.id, name: "find_flights"} as ChatCompletionMessageParam);
                    trimContextToTokenLimit(500);
                }
                else if(toolName === "book_flight") {
                    const args = JSON.parse(toolCall.function.arguments || "{}") as {flightNumber: string};
                    const {flightNumber} = args;
                    const bookingConfirmation = bookFlight(flightNumber);
                    context.push({role: "tool", content: bookingConfirmation, tool_call_id: toolCall.id, name: "book_flight"} as ChatCompletionMessageParam);
                    trimContextToTokenLimit(500);
                }
            }
        }

        console.log("Context before final call:", JSON.stringify(context, null, 2));

        const finalResponse = await openAi.chat.completions.create({
            model: "gpt-4o",
            messages: context,
        });

        // append assistant reply to context
        context.push(finalResponse.choices[0].message!);
        trimContextToTokenLimit(500);

        console.log("Bot:", finalResponse.choices[0].message?.content);
    } else {
        // assistant responded directly; append to context
        context.push(response.choices[0].message!);
        trimContextToTokenLimit(500);
        console.log("Bot:", response.choices[0].message?.content);
    }       
}

process.stdin.on("data", async (input) => {
    const userInput = input.toString().trim();
    chatWithBot(userInput).then(() => {
        process.stdout.write("You: ");
    });
});

process.stdout.write("You: ");