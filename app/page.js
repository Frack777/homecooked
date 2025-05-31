"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import Image from "next/image";
import { ShootingStars } from "@/components/ui/shooting-stars";
import ColourfulText from "@/components/ui/colourful-text";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [selectedMoral, setSelectedMoral] = useState("");
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [streamingStory, setStreamingStory] = useState("");
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-academia');
    } else {
      document.body.classList.remove('dark-academia');
    }
  }, [darkMode]);
  
  // Animal options with emojis
  const animals = [
    { emoji: "🐱", name: "cat" },
    { emoji: "🐶", name: "dog" },
    { emoji: "🐰", name: "rabbit" },
    { emoji: "🦊", name: "fox" },
    { emoji: "🐻", name: "bear" },
    { emoji: "🦁", name: "lion" },
    { emoji: "🐭", name: "mouse" },
    { emoji: "🦉", name: "owl" },
    { emoji: "🐸", name: "frog" },
    { emoji: "🦢", name: "swan" },
    { emoji: "🐺", name: "wolf" },
    { emoji: "🦅", name: "eagle" },
  ];
  
  // Moral options
  const morals = [
    "Slow and steady wins the race",
    "Don't judge a book by its cover",
    "Unity is strength",
    "Honesty is the best policy",
    "Pride comes before a fall",
    "One good turn deserves another",
    "The grass is always greener on the other side",
    "Actions speak louder than words",
    "All that glitters is not gold",
    "A friend in need is a friend indeed",
    "Curiosity killed the cat",
    "Look before you leap"
  ];

  const handleGenerateStory = async () => {
    if (!selectedAnimal || !selectedMoral) return;
    
    setIsGenerating(true);
    setStreamingStory("");
    setStory("");
    
    try {
      // Call our API route which handles the FriendliAI token from the server side
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animal: selectedAnimal,
          moral: selectedMoral
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let fullStory = "";
      
      // Add the markers for Russian and English sections if they don't come from the API
      fullStory = "**Russian:**\n";
      setStreamingStory(fullStory);
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value);
          fullStory += chunk;
          setStreamingStory(fullStory);
          
          // If we don't have an English section yet and we've received enough content,
          // check if we need to add the English marker
          if (!fullStory.includes("**English:**") && fullStory.length > 500) {
            // Look for patterns that might indicate a transition to English
            const lines = fullStory.split('\n');
            const emptyLineIndex = lines.findIndex((line, i) => 
              i > 5 && line.trim() === '' && lines[i+1] && lines[i+1].trim() !== '');
            
            if (emptyLineIndex > 0 && !fullStory.includes("**English:**")) {
              // Insert the English marker at the empty line
              lines.splice(emptyLineIndex + 1, 0, "**English:**");
              fullStory = lines.join('\n');
              setStreamingStory(fullStory);
            }
          }
        }
      }
      
      // If we still don't have an English section, try to detect where to split
      if (!fullStory.includes("**English:**")) {
        const lines = fullStory.split('\n');
        const midPoint = Math.floor(lines.length / 2);
        
        // Look for an empty line in the middle section to use as a divider
        let splitIndex = lines.findIndex((line, i) => 
          i > midPoint - 5 && i < midPoint + 5 && line.trim() === '');
          
        if (splitIndex === -1) {
          // If no empty line found, just use the midpoint
          splitIndex = midPoint;
        }
        
        lines.splice(splitIndex + 1, 0, "**English:**");
        fullStory = lines.join('\n');
      }
      
      setStory(fullStory);
    } catch (error) {
      console.error("Error generating story:", error);
      setStreamingStory("Sorry, there was an error generating your story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn(
      "relative min-h-screen overflow-hidden transition-colors duration-300",
      darkMode 
        ? "bg-gradient-to-b from-gray-900 to-amber-950" 
        : "bg-gradient-to-b from-blue-50 to-purple-50"
    )}>
      <ShootingStars 
        starColor={darkMode ? "#E6C973" : "#9E7BFF"}
        trailColor={darkMode ? "#8B4513" : "#FFB6C1"}
        minDelay={2000} 
        maxDelay={6000}
      />
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className={cn(
          "absolute top-4 right-4 p-2 rounded-full z-10 transition-colors",
          darkMode 
            ? "bg-amber-800 text-amber-100 hover:bg-amber-700" 
            : "bg-purple-100 text-purple-800 hover:bg-purple-200"
        )}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>
      
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/next.svg" 
              alt="PushkinAI Logo" 
              width={50} 
              height={50} 
              className={cn(
                "rounded-full p-2 transition-colors",
                darkMode ? "bg-amber-800" : "bg-purple-100"
              )}
            />
          </div>
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-2 transition-colors",
            darkMode ? "text-amber-200" : "text-purple-800"
          )}>
            <span className="inline-flex">
              <ColourfulText text="PushkinAI" />
            </span>
          </h1>
          <p className={cn(
            "text-lg max-w-md mx-auto transition-colors",
            darkMode ? "text-amber-300" : "text-purple-600"
          )}>
            Turn your ideas into magical bedtime stories with the help of AI
          </p>
        </header>
        
        <Card className={cn(
          "w-full max-w-2xl backdrop-blur-sm shadow-lg transition-colors",
          darkMode 
            ? "bg-amber-950/80 border-amber-800/50 text-amber-100" 
            : "bg-white/80 border-purple-100"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "text-2xl transition-colors",
              darkMode ? "text-amber-200" : "text-purple-800"
            )}>Create Your Story</CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              darkMode ? "text-amber-300/80" : "text-purple-600"
            )}>
              Enter a prompt and let our AI create a beautiful bedtime story
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3 transition-colors",
                  darkMode ? "text-amber-200" : "text-purple-700"
                )}>
                  Choose an Animal Character
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {animals.map((animal) => (
                    <button
                      key={animal.name}
                      onClick={() => setSelectedAnimal(animal.name)}
                      className={cn(
                        "p-3 rounded-lg text-2xl transition-all flex flex-col items-center",
                        selectedAnimal === animal.name
                          ? darkMode
                            ? "bg-amber-700 ring-2 ring-amber-400"
                            : "bg-purple-200 ring-2 ring-purple-400"
                          : darkMode
                            ? "bg-amber-900/50 hover:bg-amber-800/70"
                            : "bg-white/70 hover:bg-purple-100"
                      )}
                    >
                      <span className="text-2xl mb-1">{animal.emoji}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        darkMode ? "text-amber-200" : "text-purple-700"
                      )}>
                        {animal.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2 transition-colors",
                  darkMode ? "text-amber-200" : "text-purple-700"
                )}>
                  Choose a Moral for Your Story
                </label>
                <select
                  value={selectedMoral}
                  onChange={(e) => setSelectedMoral(e.target.value)}
                  className={cn(
                    "w-full p-3 rounded-lg outline-none transition-all",
                    darkMode 
                      ? "bg-amber-900/70 border border-amber-700 text-amber-100 focus:ring-2 focus:ring-amber-600 focus:border-amber-600" 
                      : "bg-white/70 border border-purple-200 focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                  )}
                >
                  <option value="" disabled>Select a moral...</option>
                  {morals.map((moral) => (
                    <option key={moral} value={moral}>
                      {moral}
                    </option>
                  ))}
                </select>
              </div>
            </div>
              
            {(streamingStory || story) && (
                <div className={cn(
                  "mt-6 p-4 rounded-lg transition-colors overflow-auto max-h-[500px]",
                  darkMode 
                    ? "bg-amber-900/30 border border-amber-800/50" 
                    : "bg-purple-50 border border-purple-100"
                )}>
                  <h3 className={cn(
                    "text-lg font-medium mb-4 transition-colors",
                    darkMode ? "text-amber-200" : "text-purple-800"
                  )}>Your Pushkin-Style Bedtime Story</h3>
                  <div className={cn(
                    "prose max-w-none",
                    darkMode ? "prose-invert prose-amber" : "prose-purple"
                  )}>
                    {(() => {
                      const content = story || streamingStory;
                      const russianPart = content.includes('**Russian:**') ? 
                        content.split('**Russian:**')[1].split('**English:**')[0] : 
                        null;
                      const englishPart = content.includes('**English:**') ? 
                        content.split('**English:**')[1] : 
                        null;
                      
                      if (russianPart && englishPart) {
                        return (
                          <>
                            <div className={cn(
                              "mb-6 p-4 rounded-lg",
                              darkMode ? "bg-amber-950/50" : "bg-purple-100/70"
                            )}>
                              <h4 className={cn(
                                "font-bold mb-3",
                                darkMode ? "text-amber-200" : "text-purple-800"
                              )}>Russian</h4>
                              <div className="whitespace-pre-wrap font-serif">
                                {russianPart}
                              </div>
                            </div>
                            
                            <div className={cn(
                              "p-4 rounded-lg",
                              darkMode ? "bg-amber-950/50" : "bg-purple-100/70"
                            )}>
                              <h4 className={cn(
                                "font-bold mb-3",
                                darkMode ? "text-amber-200" : "text-purple-800"
                              )}>English</h4>
                              <div className="whitespace-pre-wrap font-serif">
                                {englishPart}
                              </div>
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <div className="whitespace-pre-wrap font-serif">
                            {content}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleGenerateStory} 
              disabled={isGenerating || !selectedAnimal || !selectedMoral}
              className={cn(
                "text-white transition-colors",
                darkMode 
                  ? "bg-amber-700 hover:bg-amber-600" 
                  : "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {isGenerating ? "Creating Pushkin Story..." : "Generate Pushkin Story"}
            </Button>
          </CardFooter>
        </Card>
        
        <footer className={cn(
          "mt-12 text-center text-sm transition-colors",
          darkMode ? "text-amber-400/70" : "text-purple-600"
        )}>
          <p>© 2025 PushkinAI - Magical Bedtime Stories</p>
        </footer>
      </div>
=======
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsTyping(true);
    
    // This is where you'll integrate with your Alexander Pushkin AI
    // For now, we'll simulate a response
    setTimeout(() => {
      setResponse(`Ah, you seek wisdom in verse, much like the great Pushkin himself might offer. While I am but a humble digital scribe, I shall endeavor to respond in kind to your query: "${message}"`);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navigation */}
      <header className="border-b border-amber-200 sticky top-0 z-50 w-full bg-amber-50/80 backdrop-blur supports-[backdrop-filter]:bg-amber-50/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-cursive text-amber-900">PushkinAI</h1>
            <nav className="hidden md:flex gap-8">
              <a href="#" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">Home</a>
              <a href="#" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">Poems</a>
              <a href="#" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">Stories</a>
              <a href="#" className="text-amber-800 hover:text-amber-600 transition-colors font-medium">About</a>
            </nav>
            <Button variant="outline" className="border-amber-800 text-amber-800 hover:bg-amber-100">Sign In</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-600 mb-4 font-cursive text-xl">In the style of the great Russian poet</p>
            <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 font-cursive">Alexander Pushkin AI</h1>
            <p className="text-amber-800 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the romanticism and wit of Russia's greatest poet, reimagined through artificial intelligence.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me to write a poem about..." 
                  className="flex-1 bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-300 text-amber-900"
                />
                <Button type="submit" className="bg-amber-800 hover:bg-amber-700 text-white">
                  {isTyping ? 'Composing...' : 'Compose'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Response Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="border-l-4 border-amber-400 pl-6 py-2 mb-8">
              <h2 className="text-3xl font-bold text-amber-900 font-cursive">The Poet's Response</h2>
              <p className="text-amber-600">Your AI-generated Pushkin-style creation</p>
            </div>
            
            {isTyping ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                <div className="inline-block animate-pulse">
                  <svg className="w-12 h-12 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-amber-700 italic">The quill dances across the page, composing your response...</p>
                </div>
              </div>
            ) : response ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
                <div className="prose prose-amber max-w-none">
                  <p className="text-amber-900 text-lg leading-relaxed">
                    {response}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-amber-200 flex justify-between items-center">
                  <span className="text-sm text-amber-600">— Alexander Pushkin AI</span>
                  <Button variant="ghost" className="text-amber-700 hover:bg-amber-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-lg p-12 text-center">
                <svg className="w-12 h-12 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-amber-800 mb-2">No composition yet</h3>
                <p className="text-amber-600 max-w-md mx-auto">Ask me to write a poem, a story, or answer a question in Pushkin's romantic style.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-4 font-cursive">Features</h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Experience the elegance of Pushkin's poetry and prose, reimagined through AI
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-amber-200 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <CardTitle className="text-amber-900 font-cursive text-2xl">Poetic Verses</CardTitle>
                <CardDescription className="text-amber-700">Classic Russian poetry in Pushkin's signature style</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">
                  Generate beautiful poems with the romanticism and depth of Pushkin's greatest works, perfect for any occasion or sentiment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <CardTitle className="text-amber-900 font-cursive text-2xl">Literary Analysis</CardTitle>
                <CardDescription className="text-amber-700">Deep insights into Pushkin's works</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">
                  Gain new perspectives on Pushkin's literature with AI-powered analysis of themes, symbols, and historical context.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle className="text-amber-900 font-cursive text-2xl">Creative Writing</CardTitle>
                <CardDescription className="text-amber-700">Stories inspired by Pushkin's genius</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">
                  Create your own stories with the narrative style and character depth that made Pushkin a literary legend.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-amber-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-amber-900 mb-6 font-cursive">Ready to explore Russian literature?</h2>
          <p className="text-amber-800 text-xl max-w-2xl mx-auto mb-8">
            Join thousands of literature enthusiasts discovering the beauty of Pushkin's world through AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-6 text-lg">
              Start Creating
            </Button>
            <Button variant="outline" className="border-amber-800 text-amber-800 hover:bg-amber-50 px-8 py-6 text-lg">
              Read Examples
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-cursive mb-4">PushkinAI</h3>
              <p className="text-amber-300 text-sm">
                Bringing the genius of Alexander Pushkin to the digital age through artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Poems</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Stories</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Biography</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Literary Analysis</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-800 mt-12 pt-8 text-center text-sm text-amber-400">
            © {new Date().getFullYear()} PushkinAI. All rights reserved.
          </div>
        </div>
      </footer>
>>>>>>> 3aa6851 (Redesigned UI with classic literary theme and Pushkin AI integration)
    </div>
  );
}
