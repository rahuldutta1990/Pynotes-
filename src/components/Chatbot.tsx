import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        }),
      });
      const data = await response.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'model', text: data.response }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <MessageCircle />
        </button>
      ) : (
        <div className="bg-white border rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-700">Chat Support</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
                {m.text}
              </div>
            ))}
            {isLoading && <div className="text-sm text-gray-500 italic">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border rounded-lg p-2 text-sm"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
