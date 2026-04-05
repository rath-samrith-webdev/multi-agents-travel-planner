import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, DollarSign, Info, Map as MapIcon, MessageSquare, ShieldCheck, Zap, ChevronRight, Users as UsersIcon, Sparkles } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import ChatInterface from '../components/ChatInterface';
import GroupChat from '../components/GroupChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Itinerary() {
  const location = useLocation();
  const [plan, setPlan] = useState(location.state?.plan);

  if (!plan) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <MapIcon size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700">No Itinerary Found</h2>
        <p className="text-gray-500 mt-2 max-w-sm">Start your journey by generating a new trip based on your preferences!</p>
        <Link to="/">
          <Button className="mt-6 px-8 py-6 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl transition-all">
            Generate New Trip
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto space-y-8">
      {/* Header & Meta */}
      <Card className="overflow-hidden border-none shadow-2xl ring-1 ring-gray-100">
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Trip to {plan.destination}</h1>
              <div className="flex items-center gap-3 opacity-90">
                 <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1">{plan.days} Days</Badge>
                 <span className="text-lg font-medium">Full Multi-Agent Experience</span>
              </div>
            </div>
            <div className="hidden md:flex gap-4">
              <Badge className="bg-green-500/20 text-green-100 border-green-500/30 flex items-center gap-1.5 px-4 py-2 rounded-xl backdrop-blur-md">
                <ShieldCheck size={16} /> {plan.metadata?.budget_checked ? 'Budget Safe' : 'Optimizing'}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-100 border-amber-500/30 flex items-center gap-1.5 px-4 py-2 rounded-xl backdrop-blur-md">
                <Zap size={16} /> {plan.metadata?.expert_curated ? 'Expert Curated' : 'Standard'}
              </Badge>
            </div>
          </div>
        </div>

        {/* XAI Reasoning Trace */}
        <div className="p-6 bg-blue-50/30 border-b border-blue-100/50">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Info size={16} />
             </div>
             <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest">
               Explainable AI (XAI) Insight
             </h3>
          </div>
          <p className="text-blue-900/80 text-sm leading-relaxed italic font-medium">
            "{plan.metadata?.xai_reasoning || "The multi-agent system collaborated to create a balanced itinerary. The Planner agent drafted the initial route, the Budget agent optimized costs, and the Expert agent added unique local spots."}"
          </p>
          {plan.metadata?.mem_context && (
            <div className="mt-4 p-4 bg-white rounded-2xl border border-blue-200/50 text-xs text-blue-700 shadow-sm flex items-start gap-2">
              <div className="mt-0.5">🧠</div>
              <div><strong>Past Memory context applied:</strong> {plan.metadata.mem_context}</div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itinerary Column */}
        <div className="lg:col-span-2 space-y-6">
          <Accordion type="multiple" defaultValue={["day-1"]} className="space-y-4">
            {plan.itinerary?.map((dayPlan, idx) => (
              <AccordionItem key={idx} value={`day-${dayPlan.day}`} className="border-none shadow-md rounded-2xl bg-white overflow-hidden ring-1 ring-gray-100">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-all [&[data-state=open]>div>svg]:rotate-90">
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {dayPlan.day}
                       </div>
                       <h4 className="text-xl font-bold text-gray-800">Day {dayPlan.day}</h4>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  {dayPlan.activities?.map((activity, a_idx) => (
                    <div key={a_idx} className="relative pl-8 border-l-2 border-blue-100 last:border-0 pb-8 last:pb-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[10px] font-bold text-blue-600 uppercase border-blue-200 px-2 flex items-center w-fit gap-1">
                            <Clock size={10} /> {activity.time}
                          </Badge>
                          <h5 className="text-lg font-extrabold text-gray-900">{activity.name}</h5>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 font-bold text-sm flex items-center gap-1 shrink-0">
                          <DollarSign size={14} /> {activity.cost}
                        </Badge>
                      </div>
                      {activity.notes && (
                        <div className="text-gray-600 text-sm bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                          <span className="text-blue-500 shrink-0">💡</span>
                          <p className="italic leading-relaxed">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Sidebar: Map and Chat */}
        <div className="space-y-8">
          <div className="sticky top-8 space-y-8">
            <Card className="shadow-lg border-none ring-1 ring-gray-100 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MapIcon className="text-blue-600" size={24} /> Interactive Map
                </CardTitle>
                <CardDescription>Visualizing your AI-generated route</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent destination={plan.destination} activities={plan.itinerary} />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none ring-1 ring-gray-100 overflow-hidden bg-slate-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UsersIcon className="text-blue-600" size={24} /> Group Members
                </CardTitle>
                <CardDescription>Collaborating on this trip</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white border-none py-1.5 px-3 rounded-full flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px]">A</div>
                    Alice (You)
                  </Badge>
                  <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 py-1.5 px-3 rounded-full flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">B</div>
                    Bob
                  </Badge>
                  <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 py-1.5 px-3 rounded-full flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">C</div>
                    Charlie
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <GroupChat tripId={plan.id} currentUserId={1} username="alice_explorer" />

            <Card className="shadow-lg border-none ring-1 ring-gray-100 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={24} /> AI Agent Chat
                </CardTitle>
                <CardDescription>Ask agents to adjust your plan</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ChatInterface tripId={plan.id} onUpdate={(newItinerary) => setPlan({...plan, itinerary: newItinerary})} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
