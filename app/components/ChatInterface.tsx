'use client';
import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white border border-brand-accent/30 border-amber-500 rounded-2xl shadow-2xl flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-brand-dark p-4 text-brand-bg font-bold flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-accent text-amber-500" />
              <span className='text-amber-500'>StockFlow AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/10">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <p className="text-sm text-brand-muted font-medium">How can I help with the inventory today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-brand-primary text-white rounded-br-none' 
                  : 'bg-white border border-brand-muted/30 border-amber-500 text-brand-dark rounded-bl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-brand-primary animate-pulse font-bold uppercase">AI is checking stock...</div>}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-amber-500 border-t border-brand-accent/10">
            <div className="relative">
              <input 
                className="w-full p-3 pr-10 bg-brand-bg rounded-xl border border-amber-500 border-brand-accent/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stock levels..."
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-primary hover:text-brand-dark transition-colors">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={` p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-amber-600 text-white' : 'bg-amber-600  text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}