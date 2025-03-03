import React, { useState, useEffect, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}


const ChatbotInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };
    // Initialize the assistant when the component mounts
    useEffect(() => {
        const initializeAssistant = async () => {
            console.log('Initializing assistant...');
            try {
                setIsLoading(true);
                const response = await fetch('/api/assistant');
                console.log(response)
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setIsInitialized(true);
                    console.log('Assistant initialized:', data);

                    // Add welcome message
                    setMessages([
                        {
                            role: 'assistant',
                            content: 'Hello! I am your FitMaster-AI assistant. How can I help you today?'
                        }
                    ]);
                } else {
                    console.error('Failed to initialize assistant:', data.error);
                }
            } catch (error) {
                console.error('Error initializing assistant:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAssistant();
    }, []);

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    //Format the output given by the assistant
    function formatNutritionPlan(response: string): string {
        const lines: string[] = response.split('\n');
        let formattedHtml: string = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>";
        let currentCategory: string = "";

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.includes('**')) {
                // It's a category header
                currentCategory = line.replace(/\*\*/g, '');
                formattedHtml += `<h2 style='color:rgb(8, 8, 8); border-bottom: 2px solid #ddd; padding-bottom: 5px;'><strong>${currentCategory}</strong></h2>`;
            } else if (line.includes(':')) {
                // It's a food item with calories
                let [item, calories] = line.split(':');
                formattedHtml += `<p><strong>${item.trim()}</strong>: ${calories.trim()}</p>`;
            }
        });

        formattedHtml += "</div>";
        return formattedHtml;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        // Add user message to the chat
        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            console.log("data", data.response.content[0]?.text?.value)
            if (data.success) {
                // Process the assistant response
                // The response will have content in a different format than our simple Message type
                // We need to extract just the text content
                const formattedData = formatNutritionPlan(data.response.content[0]?.text?.value);
                // const assistantContent = data.response.content[0]?.text?.value || 'Sorry, I couldn\'t generate a response';
                const assistantContent = formattedData || 'Sorry, I couldn\'t generate a response';
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: assistantContent , isFormatted: true }
                ]);
            } else {
                console.error('Failed to get response:', data.error);
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
                ]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, there was an error connecting to the assistant.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Interface */}
            <div
                className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out z-40 flex flex-col max-h-96 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ transform: isOpen ? 'translateY(0)' : 'translateY(20px)' }}
            >
                {/* Chat Header */}
                <div className="p-4 rounded-t-lg flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%)' }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <circle cx="12" cy="12" r="7" fillOpacity="0" />
                                <path d="M6 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S8.33 13 7.5 13 6 12.33 6 11.5zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM8 15h8c0 1.1-1.79 3-4 3s-4-1.9-4-3z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium">FitMaster-AI</h3>
                    </div>
                    <button onClick={toggleChat} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                        <h1 className="text-2xl font-bold text-center mb-2">FitMaster-AI Assistant</h1>
                        <p className="text-center text-gray-700">Ask me anything about Nutrition or Workout</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg ${message.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {message.isFormatted ? (
                                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="text-left">
                                <div className="inline-block p-3 rounded-lg bg-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef}></div>
                    </div>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!isInitialized || isLoading}
                        placeholder={isInitialized ? "Type your message..." : "Initializing assistant..."}
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={!isInitialized || isLoading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Floating Chat Icon */}
            <div
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 z-50"
                style={{
                    background: 'linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%)',
                }}
            >
                <div className="flex items-center justify-center h-full text-white">
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-7 h-7"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                            />
                            <circle cx="12" cy="12" r="7" fillOpacity="0" />
                            <path
                                d="M6 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S8.33 13 7.5 13 6 12.33 6 11.5zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM8 15h8c0 1.1-1.79 3-4 3s-4-1.9-4-3z"
                            />
                        </svg>
                    )}
                </div>
                {!isOpen && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {messages.length}
                    </span>
                )}
            </div>
        </>
    );
};

export default ChatbotInterface;