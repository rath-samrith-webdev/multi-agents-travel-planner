import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { modifyPlanChat } from '../services/api';

export default function ChatInterface({ tripId, onUpdate }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await modifyPlanChat(tripId, message);
      if (response.status === 'success') {
        onUpdate(response.itinerary);
        setMessage('');
      }
    } catch (err) {
      console.error("Chat failed:", err);
      alert("Failed to update itinerary. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
        <Sparkles size={20} />
        <h3 className="font-bold">Adjust Your Trip</h3>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          Ask the AI to add a museum, find a cheaper lunch, or change the pace of your day.
        </p>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Add more culture to day 2..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
