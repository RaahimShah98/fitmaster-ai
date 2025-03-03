// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIAssistantManager } from '../../chatBot/fetchAssistant';


// Initialize the assistant manager
const assistantManager = new OpenAIAssistantManager(
  process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
  {
    name: "FitMaster-AI",
    instructions: "You are a helpful assistant for Next.js developers.",
    model: "gpt-4o-mini",
    tools: [{ type: "code_interpreter" }]
  }
);


// Global variable to store the thread ID for the session
// Note: In a production app, you'd want to store this in a database
// or session store associated with the user
let currentThreadId: string | null = null;

export async function GET() {
    console.log("GET /api/assistant");
  try {
    // Initialize the assistant if not already done
    if (!assistantManager.assistantId) {
      const assistant = await assistantManager.initializeAssistant();

      // Create a new thread for the conversation
      const thread = await assistantManager.createThread();
      currentThreadId = thread.id;
      
      return NextResponse.json({
        success: true,
        assistantId: assistant.id,
        threadId: thread.id,
        message: "Assistant initialized and thread created"
      });
    }
    
    return NextResponse.json({
      success: true,
      assistantId: assistantManager.assistantId,
      threadId: currentThreadId,
      message: "Assistant already initialized"
    });
  } catch (error: any) {
    console.error("Error in GET /api/assistant:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }
    
    // Initialize assistant if needed
    if (!assistantManager.assistantId) {
      await assistantManager.initializeAssistant();
    }
    
    // Create a thread if none exists
    if (!currentThreadId) {
      const thread = await assistantManager.createThread();
      currentThreadId = thread.id;
    }
    
    // Add the user message to the thread
    await assistantManager.addMessage(currentThreadId, message);
    
    // Run the assistant
    const run = await assistantManager.runAssistant(currentThreadId);
    
    // Wait for the run to complete
    await assistantManager.waitForRunCompletion(currentThreadId, run.id);
    
    // Get the messages from the thread
    const messages = await assistantManager.getMessages(currentThreadId);
    
    // Extract the assistant's response
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    return NextResponse.json({
      success: true,
      response: latestAssistantMessage,
      threadId: currentThreadId
    });
  } catch (error: any) {
    console.error("Error in POST /api/assistant:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}