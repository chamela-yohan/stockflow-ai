'use client';
import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-brand-accent rounded-2xl shadow-2xl flex flex-col h-[500px]">
      <div className="bg-brand-dark p-4 text-brand-bg font-bold">StockFlow AI Agent</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-brand-primary text-white' : 'bg-white border text-brand-dark'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-brand-muted animate-pulse">AI is checking the shelves...</div>}
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <input 
          className="w-full p-2 border rounded-lg focus:ring-brand-primary outline-none" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Do we need milk powder?"
        />
      </form>
    </div>
  );
}