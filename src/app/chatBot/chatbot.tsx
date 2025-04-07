import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/FirebaseContext';


interface Message {
    role: 'user' | 'assistant';
    content: string;
    isFormatted?: boolean;
}

const ChatbotInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [success, setSuccess] = useState<boolean>(false)
    const [parsedResponse, setParseResponse] = useState<object[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const email = user?.email || "";

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
                    // console.log('Assistant initialized:', data);

                    // Add welcome message
                    setMessages([
                        {
                            role: 'assistant',
                            content: 'Hello! I am FitMaster-AI. How can I help you today?'
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


    useEffect(() => {
        const handleFollowPlanClick = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                const { key, response } = customEvent.detail;
                log_user_preference(key, response, email);
            }
        };
    
        document.addEventListener('followPlanClick', handleFollowPlanClick);
    
        setTimeout(() => {
            document.querySelectorAll('.follow-plan-btn').forEach(btn => {
                const button = btn as HTMLButtonElement;
                if (!button.disabled) {
                    button.addEventListener("click", () => {
                        const customEvent = new CustomEvent('followPlanClick', {
                            detail: {
                                key: button.dataset.key,
                                response: button.dataset.response
                            }
                        });
                        document.dispatchEvent(customEvent);
                    });
                }
            });
        }, 100); // wait for DOM to fully render
    
        return () => {
            document.removeEventListener('followPlanClick', handleFollowPlanClick);
        };
    }, []);
    

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        console.log(parsedResponse)
    }, [parsedResponse]);

    // Format Plans
    function formatNutritionPlan(response: string): string {
        let formattedHTML: string = "";
        try {
            const json = JSON.parse(response);
            const keys = Object.keys(json);
    
            formattedHTML = `<div class="w-full overflow-hidden">`;
    
            if (keys[0] === "response") {
                formattedHTML += `<p>${Object.values(json)}</p></div>`;
                return formattedHTML;
            }
    
            keys.forEach((key, index) => {
                if (key === "nutrition_plan" || key === "workout_plan") {
                    const buttonId = `follow-btn-${key}-${Date.now()}`;
    
                    formattedHTML += `
                    <div class="${index > 0 ? 'mt-6' : ''}">
                        <h3 class="text-base font-bold mb-2">${key.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</h3>
                        <div class="overflow-x-auto max-w-full">
                            <table class="w-full text-left border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="border border-gray-300 p-1">Day</th>
                                        <th class="border border-gray-300 p-1">${key === "nutrition_plan" ? "Food" : "Exercise"}</th>
                                        ${key === "nutrition_plan"
                        ? '<th class="border border-gray-300 p-1">Cal/100g</th>'
                        : '<th class="border border-gray-300 p-1">Sets</th>'}
                                        ${key === "workout_plan" ? '<th class="border border-gray-300 p-1">Reps</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody>`;
    
                    formattedHTML += json[key].map((item: any) => `
                                <tr>
                                    <td class="border border-gray-300 p-1">${item.day}</td>
                                    <td class="border border-gray-300 p-1 max-w-[120px] break-words">${key === "nutrition_plan" ? item.food : item.exercise}</td>
                                    ${key === "nutrition_plan"
                            ? `<td class="border border-gray-300 p-1">${item.calories_per_100g}</td>`
                            : `<td class="border border-gray-300 p-1">${item.sets}</td>`}
                                    ${key === "workout_plan" ? `<td class="border border-gray-300 p-1">${item.reps}</td>` : ''}
                                </tr>`).join("");
    
                    formattedHTML += `
                                </tbody>
                            </table>
                        </div>
    
                        <button 
                            id="${buttonId}" 
                            data-key="${key}" 
                            data-response='${JSON.stringify(json[key])}' 
                            class="follow-plan-btn bg-purple-500 hover:bg-purple-600 w-full p-2 mt-2 text-white font-bold rounded text-sm transition-colors duration-200">
                            <strong>Follow ${key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1)} ${key.split("_")[1]}</strong>
                        </button>
                    </div>`;
                }
            });
    
            formattedHTML += `</div>`;
        } catch (e) {
            console.log("Error parsing JSON: ", e);
            formattedHTML = `<div class="w-full overflow-hidden break-words">
                                <p>Unable to parse response</p>
                            </div>`;
        }
    
        return formattedHTML;
    }
    const log_user_preference = async (key: string, response: string, Email: string) => {
        let data_base_name = key === "nutrition_plan" ? "diet_plan" : "workout_plan";
    
        try {
            const json = JSON.parse(response);
            const postRef = doc(db, data_base_name, Email);
            await setDoc(postRef, { data_base_name: json });
    
            console.log("Document successfully written!");
    
            // Change button style and disable it
            const buttonSelector = `.follow-plan-btn[data-key="${key}"]`;
            const allButtons = document.querySelectorAll(buttonSelector);
    
            allButtons.forEach((btn) => {
                const button = btn as HTMLButtonElement;
                button.disabled = true;
                button.classList.remove("bg-purple-500", "hover:bg-purple-600");
                button.classList.add("bg-green-500");
                button.innerHTML = `<strong>Following ${key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1)} ${key.split("_")[1]}</strong>`;
            });
    
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    };
    
    
    
    // Add event delegation for button clicks
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const button = target.closest('.follow-plan-btn') as HTMLButtonElement;

            if (button) {
                const key = button.getAttribute('data-key') || '';
                const response = button.getAttribute('data-response') || '';
                log_user_preference(key, response, email);
            }
        };

        // Add click listener to the chat container
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('click', handleClick);
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('click', handleClick);
            }
        };
    }, [email]);

    // Send Message
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

            if (data.success) {
                const formattedData = formatNutritionPlan(data.response.content[0]?.text?.value);
                const assistantContent = formattedData || 'Sorry, I couldn\'t generate a response';
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: assistantContent, isFormatted: true }
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
            {email && <div
                className={`fixed bg-white rounded-lg shadow-xl transition-all duration-500 ease-in-out z-40 flex flex-col ${isOpen
                        ? `opacity-100 scale-100 ${isExpanded ? 'bottom-6 right-6 w-3/4 md:w-1/2 max-h-3/4 h-3/4' : 'bottom-24 right-6 w-80 md:w-96 max-h-96'}`
                        : 'opacity-0 scale-95 pointer-events-none bottom-24 right-6 w-80 md:w-96 max-h-96'
                    }`}
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
                    <div className="flex items-center">
                        {/* Expand/Collapse Button */}
                        <button
                            onClick={toggleExpand}
                            className="text-white mr-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                            aria-label={isExpanded ? "Collapse chatbot" : "Expand chatbot"}
                        >
                            {isExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6L13 11M9 21H3m0 0v-6m0 6l8-8" />
                                </svg>
                            )}
                        </button>
                        {/* Close Button */}
                        <button onClick={toggleChat} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                        <h1 className="text-2xl font-bold text-center mb-2">FitMaster-AI</h1>
                        <p className="text-center text-gray-700">Ask me anything about Nutrition or Workout</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50" ref={chatContainerRef}>
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
            }

            {/* Enhanced Floating Chat Icon */}
            {email && <div
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 ${isExpanded && isOpen ? 'opacity-0' : 'opacity-100'} shadow-lg cursor-pointer z-50 transition-all duration-500 ease-in-out flex items-center hover:scale-110 active:scale-95`}
            >
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{
                        background: 'linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%)',
                    }}
                >
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
                {/* Message notification counter */}
                {!isOpen && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {messages.length}
                    </span>
                )}
                {/* Expand icon hint visible on hover */}
                <div className="absolute left-0 transform -translate-x-full -translate-y-1/2 top-1/2 mr-2 bg-white text-purple-600 px-3 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6L13 11M9 21H3m0 0v-6m0 6l8-8" />
                    </svg>
                    <span className="text-sm font-medium">Expand Chat</span>
                </div>
            </div>
            }
        </>
    );
};

export default ChatbotInterface;