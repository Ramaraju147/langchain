import {OpenAI} from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

const openAi = new OpenAI();

function getCurrentDateTime() {
    const now = new Date();
    return now.toString();
}

function orderStatusTool(orderId: string) {

    // Mock order status data
    const orderStatuses: {[key: string]: string} = {
        "123": "Order 123 is being processed and will be shipped soon.",
        "456": "Order 456 has been shipped and is expected to be delivered tomorrow.",
        "789": "Order 789 was delivered yesterday."
    };

    return orderStatuses[orderId] || `No information found for order ID ${orderId}.`;
}

async function chatWithBot() {

    const context: ChatCompletionMessageParam[] = [
        { role: "system", content: "You are a helpful assistant answers about the day and order status." },
        { role: "user", content: 'What is the current day and time and status of order 456?' }
    ];
    const response = await openAi.chat.completions.create({
        model: "gpt-4o",
        messages: context,
        tools:[
            {
                type: "function",
                function: {
                    name: "get_current_datetime",
                    description: "Get the current date and time",
                }
            },
            {
                type: "function",
                function: {
                    name: "get_order_status",
                    description: "Get the status of an order by order ID",
                    parameters: {
                        type: "object",
                        properties: {
                            orderId: {
                                type: "string",
                                description: "The ID of the order to check the status for"
                            }
                        },
                        required: ["orderId"]
                    }
                }
            }
        ],
        tool_choice: 'auto'
    });

    const invokeTool = response.choices[0].finish_reason == 'tool_calls';
    const toolCalls = response.choices[0].message?.tool_calls;

    if(invokeTool && toolCalls && toolCalls.length > 0) {
        // Push the assistant message with tool calls once
        context.push(response.choices[0].message!);
        
        // Process all tool calls
        for (const toolCall of toolCalls) {
            if ('function' in toolCall) {
                const toolName = toolCall.function.name;
                
                if(toolName === "get_current_datetime") {
                    const dateTime = getCurrentDateTime();
                    context.push({role: "tool", content: dateTime, tool_call_id: toolCall.id, name: "get_current_datetime"} as ChatCompletionMessageParam);
                }
                else if(toolName === "get_order_status") {
                    const orderId = JSON.parse(toolCall.function.arguments || "{}").orderId;
                    const orderStatus = orderStatusTool(orderId);
                    context.push({role: "tool", content: orderStatus, tool_call_id: toolCall.id, name: "get_order_status"} as ChatCompletionMessageParam);
                }
            }
        }
        
        console.log("Context before final call:", JSON.stringify(context, null, 2));

        const finalResponse = await openAi.chat.completions.create({
            model: "gpt-4o",
            messages: context,
        });

        console.log(finalResponse.choices[0].message?.content);  
        return;
    }


    console.log(response.choices[0].message?.content);      
    
}

chatWithBot();