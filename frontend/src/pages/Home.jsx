import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateTrip } from '../services/api';
import { MapPin, Calendar, DollarSign, Heart, Sparkles, PlaneTakeoff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PREFERENCE_OPTIONS = [
  "Culture", "Food", "Nature", "Luxury", "Budget", "History", "Adventure", "Relaxation"
];

export default function Home() {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(1000);
  const [days, setDays] = useState(3);
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePreference = (pref) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const tripData = {
        user_id: 1,
        destination,
        days: parseInt(days),
        budget: parseFloat(budget),
        preferences
      };

      const responsePlan = await generateTrip(tripData);
      navigate('/itinerary', { state: { plan: responsePlan } });
    } catch (error) {
      console.error("Failed to generate trip:", error);
      alert(`API Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6 shadow-sm border border-blue-100">
           <PlaneTakeoff size={16} /> Multi-Agent AI Travel Planner
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Where to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Next?</span>
        </h1>
        <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
          Our specialized team of AI agents—Planner, Budget, and Local Expert—collaborate to draft your perfect adventure.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-2xl border-none ring-1 ring-gray-200/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Trip Details</CardTitle>
          <CardDescription>Enter your preferences and our AI agents will handle the rest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" /> Destination
                </label>
                <Input
                  required
                  placeholder="e.g. Kyoto, Japan"
                  className="rounded-xl h-12 bg-gray-50/50"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-500" /> Budget ($)
                </label>
                <Input
                  type="number"
                  className="rounded-xl h-12 bg-gray-50/50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" /> Duration (Days)
                </label>
                <Input
                  type="number"
                  className="rounded-xl h-12 bg-gray-50/50"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Heart size={16} className="text-pink-500" /> Your Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map(pref => (
                  <Badge
                    key={pref}
                    variant={preferences.includes(pref) ? "default" : "secondary"}
                    className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                      preferences.includes(pref) ? 'bg-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => togglePreference(pref)}
                  >
                    {pref}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !destination}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-blue-600 to-indigo-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="animate-pulse" /> AI Agents Collaborating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles size={20} /> Generate My Adventure
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
