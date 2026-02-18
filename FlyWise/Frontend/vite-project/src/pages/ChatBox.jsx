import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';
import {ArrowLeft} from 'lucide-react';
const Send = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22,2 15,22 11,13 2,9"></polygon>
    </svg>
);

const Upload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7,10 12,15 17,10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const FileText = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
);

const CheckCircle = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
);

const Camera = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const Sparkles = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
        <path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5L19 4z"></path>
        <path d="M5 20l.5 1.5L7 22l-1.5.5L5 24l-.5-1.5L3 22l1.5-.5L5 20z"></path>
    </svg>
);

const TrendingUp = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
        <polyline points="17,6 23,6 23,12"></polyline>
    </svg>
);

const Receipt = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
        <path d="M12 6V4"></path>
        <path d="M12 20v-2"></path>
    </svg>
);

const ChatBox = ({ setCurrentPage }) => {
    // console.log('setCurrentPage in ChatBox:', setCurrentPage);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { 
            sender: 'system', 
            text: 'Welcome! Upload your prescription or bank statement to extract transaction data automatically. ✨',
            timestamp: new Date()
        }
    ]);
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { 
            sender: 'user', 
            text: input, 
            timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_input: input }),
            });

            const data = await res.json();
            
            setTimeout(() => {
                const botMessage = { 
                    sender: 'bot', 
                    text: data.reply,
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);
            }, 1000);
        } catch (err) {
            console.error('Error:', err);
            setIsTyping(false);
            const errorMessage = { 
                sender: 'bot', 
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

        setInput('');
    };

    const sendImage = async () => {
        if (!image) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', image);

        try {
            const userMessage = { 
                sender: 'user', 
                text: `📄 Uploaded: ${image.name}`,
                timestamp: new Date(),
                isFile: true
            };
            setMessages((prev) => [...prev, userMessage]);

            const processingMessage = { 
                sender: 'system', 
                text: '🔍 Analyzing document... Extracting transaction data...',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, processingMessage]);

            // Step 1: Extract text using OCR
            const res1 = await fetch('http://localhost:8000/extract_text/', {
                method: 'POST',
                body: formData,
            });

            const { extracted_text } = await res1.json();

            // Step 2: Send text to Gemini for transaction extraction
            const res2 = await fetch('http://localhost:8000/return_transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: extracted_text }),
            });
            
            let data2 = await res2.json();
            
            if (typeof data2 === "string") {
                data2 = data2.replace(/```json|```/g, "").trim();
            }

            const parsedTransactions = JSON.parse(data2);

            // Step 3: Insert in db
            const res3 = await fetch('http://localhost:8000/upload_transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedTransactions),
                credentials: 'include'
            });
            
            const data3 = await res3.json();

            setTimeout(() => {
                const botMessage = {
                    sender: 'bot',
                    text: `✅ Successfully processed ${data3.inserted_count} transaction(s)!\n\n` +
                    data3.inserted_transactions.map((tx, i) => {
                        const tofrom = tx.to_from == "credited" ? "from" : "to";
                        return `💰 ${tx.credited_debited.toUpperCase()} ₹${tx.amount} on ${tx.date} ${tofrom} ${tx.to_from} (Ref: ${tx.reference_number})`;
                    }).join('\n'),
                    timestamp: new Date(),
                    isSuccess: true
                };
                setMessages((prev) => [...prev, botMessage]);
            }, 2000);

        } catch (err) {
            console.error('Image upload error:', err);
            const errorMessage = { 
                sender: 'bot', 
                text: '❌ Failed to process the document. Please try again with a clearer image.',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

        setImage(null);
        setIsUploading(false);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
                <div className="header-content">
                    <div className="header-icon">
                        <TrendingUp />
                        <div className="sparkle-icon">
                            <Sparkles />
                        </div>
                    </div>
                    <h1 className="header-title">Transaction Wizard</h1>
                </div>
                <p className="header-subtitle">
                    AI-powered financial document processing
                </p>
            </div>

            {/* Messages Container */}
            <div className="messages-wrapper">
                <div className="messages-container">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.sender}`}>
                            <div className={`message-bubble ${msg.sender} ${msg.isSuccess ? 'success' : ''}`}>
                                {msg.sender === 'user' && msg.isFile && (
                                    <div className="file-indicator">
                                        <FileText />
                                        <span>Document</span>
                                    </div>
                                )}
                                {msg.isSuccess && (
                                    <div className="success-indicator">
                                        <CheckCircle />
                                        <span>Processing Complete</span>
                                    </div>
                                )}
                                <div className="message-text">
                                    {msg.text}
                                </div>
                                <div className="message-time">
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {(isTyping || isUploading) && (
                        <div className="message-row bot">
                            <div className="message-bubble bot typing">
                                <div className="typing-indicator">
                                    <div className="typing-dots">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                    <span className="typing-text">
                                        {isUploading ? 'Processing document...' : 'AI is thinking...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="input-area">
                {/* File Upload Status */}
                {image && (
                    <div className="file-status">
                        <div className="file-info">
                            <Receipt />
                            <span className="file-name">{image.name}</span>
                        </div>
                        <button 
                            onClick={() => setImage(null)}
                            className="remove-file"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Input Row */}
                <div className="input-row">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask me about transactions or upload a document..."
                            className="message-input"
                        />
                    </div>
                    
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="send-button"
                    >
                        <Send />
                    </button>
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="file-input"
                    />
                    
                    <button
                        onClick={triggerFileUpload}
                        className="file-button"
                    >
                        <Camera />
                        <span>Choose Document</span>
                    </button>
                    
                    <button
                        onClick={sendImage}
                        disabled={!image || isUploading}
                        className="upload-button"
                    >
                        <Upload />
                        <span>
                            {isUploading ? 'Processing...' : 'Upload & Process'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;