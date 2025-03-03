// lib/openai-assistant.ts
import { OpenAI } from 'openai';

export interface AssistantOptions {
  name?: string;
  instructions?: string;
  model?: string;
  tools?: Array<{ type: string, [key: string]: any }>;
  fileIds?: string[];
  metadata?: Record<string, any>;
}

export class OpenAIAssistantManager {
  private openai: OpenAI;
  private assistantOptions: AssistantOptions;
  public assistantId: string | null = null;
  
  constructor(apiKey: string, assistantOptions: AssistantOptions = {}) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    
    // Default assistant options
    this.assistantOptions = {
      name: "FitMaster-AI",
      instructions: "You are a helpful assistant that provides accurate and concise information.",
      model: "gpt-4-turbo-preview",
      ...assistantOptions
    };
  }
  
  /**
   * Initialize the assistant - either create a new one or fetch existing
   */
  async initializeAssistant(existingAssistantId: string | null = null) {
    try {
      if (existingAssistantId) {
        // Fetch existing assistant
        console.log(`Fetching existing assistant with ID: ${existingAssistantId}`);
        const assistant = await this.openai.beta.assistants.retrieve(existingAssistantId);
        this.assistantId = assistant.id;
        return assistant;
      } else {
        // Check if assistant already exists by name
        const assistants = await this.openai.beta.assistants.list({
          limit: 100,
        });
        
        const existingAssistant = assistants.data.find(
          assistant => assistant.name === this.assistantOptions.name
        );
        
        if (existingAssistant) {
          console.log(`Assistant "${this.assistantOptions.name}" already exists, fetching it...`);
          this.assistantId = existingAssistant.id;
          return existingAssistant;
        } else {
          // Create new assistant
          console.log(`Creating new assistant "${this.assistantOptions.name}"...`);
          const newAssistant = await this.openai.beta.assistants.create(this.assistantOptions);
          this.assistantId = newAssistant.id;
          return newAssistant;
        }
      }
    } catch (error) {
      console.error('Error initializing assistant:', error);
      throw error;
    }
  }
  
  /**
   * Create a new thread for conversation
   */
  async createThread() {
    try {
      const thread = await this.openai.beta.threads.create();
      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }
  
  /**
   * Add a message to the thread
   */
  async addMessage(threadId: string, content: string, role: 'user' = 'user') {
    try {
      const message = await this.openai.beta.threads.messages.create(threadId, {
        role: role,
        content: content,
      });
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  
  /**
   * Run the assistant on a thread
   */
  async runAssistant(threadId: string) {
    try {
      if (!this.assistantId) {
        throw new Error('Assistant not initialized. Call initializeAssistant() first.');
      }
      
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });
      
      return run;
    } catch (error) {
      console.error('Error running assistant:', error);
      throw error;
    }
  }
  
  /**
   * Check the status of a run
   */
  async getRunStatus(threadId: string, runId: string) {
    try {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      return run;
    } catch (error) {
      console.error('Error checking run status:', error);
      throw error;
    }
  }
  
  /**
   * Wait for a run to complete
   */
  async waitForRunCompletion(threadId: string, runId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let runStatus = await this.getRunStatus(threadId, runId);
        
        // Poll every 1 second until run is completed
        const intervalId = setInterval(async () => {
          runStatus = await this.getRunStatus(threadId, runId);
          
          if (runStatus.status === 'completed') {
            clearInterval(intervalId);
            resolve(runStatus);
          } else if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
            clearInterval(intervalId);
            reject(new Error(`Run ${runId} ${runStatus.status}: ${runStatus.last_error?.message || 'No error message'}`));
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Get messages from a thread
   */
  async getMessages(threadId: string) {
    try {
      const messages = await this.openai.beta.threads.messages.list(threadId);
      return messages.data.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
  
  /**
   * Delete an assistant
   */
  async deleteAssistant() {
    try {
      if (!this.assistantId) {
        throw new Error('No assistant to delete. Call initializeAssistant() first.');
      }
      
      const response = await this.openai.beta.assistants.del(this.assistantId);
      this.assistantId = null;
      return response;
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error;
    }
  }
}