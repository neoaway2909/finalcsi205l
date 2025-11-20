import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import './AIChatModal.css';

export const AIChatModal = ({ isOpen, onClose, lang }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: lang === 'th'
        ? 'สวัสดีครับ! ผมคือ AI Assistant ที่พร้อมช่วยเหลือคุณเกี่ยวกับเรื่องสุขภาพ มีอะไรให้ช่วยไหมครับ?'
        : 'Hello! I am an AI Assistant ready to help you with health-related questions. How can I help you?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call Google Gemini API with conversation history
      const API_KEY = '';

      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || msg.content) // Filter out empty messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: conversationHistory,
            systemInstruction: {
              parts: [{
                text: `You are a helpful medical AI assistant for a healthcare appointment system. Answer in ${lang === 'th' ? 'Thai' : 'English'}. Keep responses brief (2-3 sentences).`
              }]
            },
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 300,
            }
          })
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error.message || 'API Error');
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'th'
          ? 'ขอโทษครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงานเพื่อขอความช่วยเหลือครับ'
          : 'Sorry, there was an error connecting to the AI. Please try again or contact support for assistance.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-modal-overlay" onClick={onClose}>
      <div className="ai-chat-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-chat-modal-header">
          <div className="ai-chat-header-content">
            <div className="ai-chat-avatar">
              <FaRobot size={24} />
            </div>
            <div>
              <h3>{lang === 'th' ? 'AI Assistant' : 'AI Assistant'}</h3>
              <span className="ai-status">{lang === 'th' ? 'พร้อมให้บริการ' : 'Ready to help'}</span>
            </div>
          </div>
          <button className="ai-chat-close-btn" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="ai-message-avatar">
                  <FaRobot size={20} />
                </div>
              )}
              <div className="ai-message-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="ai-message assistant">
              <div className="ai-message-avatar">
                <FaRobot size={20} />
              </div>
              <div className="ai-message-bubble">
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input-container">
          <textarea
            className="ai-chat-input"
            placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="ai-chat-send-btn"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
