import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { Settings, MapPin, History, User, Star, PlusCircle, Compass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile(1); // Demo User ID
        setProfile(data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 space-y-10">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <User size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{profile?.username || 'Explorer'}</h1>
            <p className="opacity-80 text-lg">Unlocking the world, one agent at a time.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-xl font-bold gap-2">
            <Settings size={18} /> Settings
          </Button>
          <Link to="/">
            <Button className="bg-white text-blue-700 hover:bg-gray-100 rounded-xl font-bold gap-2 shadow-lg">
              <PlusCircle size={18} /> New Trip
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Preferences */}
        <Card className="lg:col-span-1 shadow-lg border-none ring-1 ring-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} /> Preferences
            </CardTitle>
            <CardDescription>Your saved travel DNA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile?.preferences || {}).map(([key, value]) => (
                 value && (
                  <Badge key={key} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-lg text-sm font-medium capitalize">
                    {key}
                  </Badge>
                )
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-blue-600 font-bold hover:bg-blue-50 rounded-xl">
              Edit Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Main: Trip History */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="recent" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <History className="text-blue-600" size={24} /> Journey Logs
              </h2>
              <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                <TabsTrigger value="recent" className="rounded-lg px-4 font-bold">Recent</TabsTrigger>
                <TabsTrigger value="all" className="rounded-lg px-4 font-bold">All Trips</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recent" className="space-y-4">
              {profile?.recent_trips?.length > 0 ? (
                profile.recent_trips.map(trip => (
                  <Card key={trip.id} className="group hover:shadow-xl transition-all border-none ring-1 ring-gray-100 overflow-hidden cursor-pointer">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="sm:w-32 bg-gray-50 flex items-center justify-center p-6 sm:border-r border-gray-100 group-hover:bg-blue-50 transition-colors">
                        <MapPin size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="p-6 flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{trip.destination}</h4>
                          <p className="text-gray-500 font-medium">{new Date(trip.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" className="rounded-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                          View Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Compass size={32} className="text-gray-300" />
                  </div>
                  <CardTitle className="text-gray-400">No journeys logged yet</CardTitle>
                  <CardDescription className="mb-6">Start your first adventure today!</CardDescription>
                  <Link to="/">
                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Create First Trip</Button>
                  </Link>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
