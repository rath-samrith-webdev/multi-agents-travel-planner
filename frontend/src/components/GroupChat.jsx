import React, { useState, useEffect, useRef } from 'react';
import { Send, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { getMessages, sendMessage } from '../services/api';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export default function GroupChat({ tripId, currentUserId, username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(tripId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [tripId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await sendMessage(tripId, currentUserId, newMessage);
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] border-blue-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-blue-600 text-white p-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare size={20} />
            Group Discussion
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/20 text-white border-blue-400">
            {messages.length} messages
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isMe = msg.user_id === currentUserId;
          return (
            <div key={msg.id || idx} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  {isMe ? "You" : msg.username}
                </span>
              </div>
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm transition-all duration-300",
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none hover:shadow-blue-200"
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none hover:shadow-gray-200"
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
            <MessageSquare size={48} strokeWidth={1} />
            <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        )}
      </CardContent>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          className="bg-gray-50 border-none focus-visible:ring-blue-600 focus-visible:ring-offset-0 h-10 shadow-inner"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Send size={18} />
        </Button>
      </form>
    </Card>
  );
}
