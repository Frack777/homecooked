"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedMoral, setSelectedMoral] = useState("");
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const animalEmojis = [
    { emoji: "🐶", name: "Dog" },
    { emoji: "🐱", name: "Cat" },
    { emoji: "🐭", name: "Mouse" },
    { emoji: "🐰", name: "Rabbit" },
    { emoji: "🦊", name: "Fox" },
    { emoji: "🐻", name: "Bear" },
    { emoji: "🐼", name: "Panda" },
    { emoji: "🐨", name: "Koala" },
    { emoji: "🦁", name: "Lion" },
    { emoji: "🐯", name: "Tiger" },
    { emoji: "🐮", name: "Cow" },
    { emoji: "🐷", name: "Pig" }
  ];

  const morals = [
    "Honesty is the best policy",
    "Slow and steady wins the race",
    "Don't judge a book by its cover",
    "Unity is strength",
    "Pride comes before a fall",
    "One good turn deserves another",
    "Fortune favors the brave",
    "Actions speak louder than words"
  ];

  const generateStory = async () => {
    if (!selectedAnimal || !selectedMoral) {
      alert("Please select both an animal and a moral for your story.");
      return;
    }
    
    try {
      setIsGenerating(true);
      setStory("Once upon a time...");
      
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal: selectedAnimal.name,
          moral: selectedMoral
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the response as a readable stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let storyText = "Once upon a time...";
      
      // Process the stream chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and append to the story
        const chunk = decoder.decode(value, { stream: true });
        storyText += chunk;
        setStory(storyText);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setStory("Sorry, there was an error generating your story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 dark:text-purple-300 mb-2">PushkinAI</h1>
          <p className="text-gray-600 dark:text-gray-300">Create magical stories with animal characters and moral lessons</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Choose Your Animal Character</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {animalEmojis.map((animal) => (
                <button
                  key={animal.name}
                  onClick={() => setSelectedAnimal(animal)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${selectedAnimal?.name === animal.name ? 'bg-purple-100 dark:bg-purple-900 ring-2 ring-purple-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <span className="text-4xl mb-2">{animal.emoji}</span>
                  <span className="text-xs text-center">{animal.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Select a Moral for Your Story</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedMoral} value={selectedMoral}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a moral lesson" />
              </SelectTrigger>
              <SelectContent>
                {morals.map((moral) => (
                  <SelectItem key={moral} value={moral}>
                    {moral}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-8">
          <Button 
            onClick={generateStory} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            disabled={!selectedAnimal || !selectedMoral || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Your Story"}
          </Button>
        </div>

        {story && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Magical Story</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-inner overflow-auto max-h-[500px]">
                <p className="text-lg whitespace-pre-wrap">{story}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedAnimal(null);
                  setSelectedMoral("");
                  setStory("");
                }}
              >
                Create Another Story
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
