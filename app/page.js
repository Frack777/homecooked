"use client";

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
  useEffect(() => { //comment
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
    </div>
  );
}
