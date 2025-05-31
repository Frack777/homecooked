"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ColourfulText from "@/components/ui/colourful-text";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";

export default function Home() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedMoral, setSelectedMoral] = useState("");
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState("english"); // Default to English
  const [storyData, setStoryData] = useState(null); // Store the parsed story data

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

  const loadingTexts = [
    "Once upon a time...",
    "In a magical forest...",
    "The words are forming...",
    "Crafting your tale...",
    "Weaving poetic magic...",
    "Channeling Pushkin's spirit...",
    "Creating in two languages...",
    "Your story is almost ready..."
  ];

  const generateStory = async () => {
    if (!selectedAnimal || !selectedMoral) {
      alert("Please select both an animal and a moral for your story.");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Start custom loading animation
      let loadingIndex = 0;
      setStory(loadingTexts[0]);
      
      const loadingInterval = setInterval(() => {
        loadingIndex = (loadingIndex + 1) % loadingTexts.length;
        setStory(loadingTexts[loadingIndex]);
      }, 2000);
      
      // Make API request
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
      
      // Clear the loading interval
      clearInterval(loadingInterval);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      // Set the story content
      if (data.content) {
        // Log the raw content for debugging
        console.log('Raw content from API:', data.content);
        
        try {
          // The API should have already sanitized the JSON, but let's be extra careful
          let parsedData;
          
          try {
            // First attempt: direct parsing (should work if API sanitization was successful)
            parsedData = JSON.parse(data.content);
            console.log('Successfully parsed JSON directly:', parsedData);
          } catch (directParseError) {
            console.warn('Direct JSON parsing failed, trying with cleanup:', directParseError);
            
            // Second attempt: clean the content and try again
            let cleanedContent = data.content
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/\\n/g, '\n') // Handle escaped newlines
              .replace(/\\r/g, '\r') // Handle escaped carriage returns
              .replace(/\\t/g, '\t'); // Handle escaped tabs

            // Fix specific structural issues we've seen
            cleanedContent = cleanedContent.replace(/}},\s*"english":/g, '}, "english":');
            cleanedContent = cleanedContent.replace(/}}}\s*$/g, '}}');
            
            console.log('Cleaned content:', cleanedContent);
            
            // Try to extract just the JSON object
            let jsonContent = cleanedContent;
            const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonContent = jsonMatch[0];
              console.log('Extracted JSON:', jsonContent);
            }
            
            // Try parsing the cleaned content
            parsedData = JSON.parse(jsonContent);
            console.log('Successfully parsed JSON after cleanup:', parsedData);
          }
          
          // Check if the parsed data has the expected structure and normalize it if needed
          if (parsedData) {
            // Handle nested structure if present (sometimes the API returns nested objects)
            if (parsedData.russian && typeof parsedData.russian === 'object' && parsedData.russian.title) {
              // Already in the correct format
            } else if (parsedData.english && typeof parsedData.english === 'object' && parsedData.english.title) {
              // Already in the correct format for English but might be missing Russian
            } else {
              // Try to find the structure in a different format
              console.log('Attempting to normalize JSON structure');
              
              // Look for nested structure
              const keys = Object.keys(parsedData);
              for (const key of keys) {
                if (parsedData[key] && typeof parsedData[key] === 'object') {
                  if (parsedData[key].russian && parsedData[key].english) {
                    parsedData = parsedData[key];
                    console.log('Found nested structure, normalized:', parsedData);
                    break;
                  }
                }
              }
            }
            
            // Store the parsed data for language switching
            setStoryData(parsedData);
            console.log('Final story data structure:', parsedData);
            
            // Set the initial story based on the default language
            if (parsedData[language] && parsedData[language].title && parsedData[language].story) {
              const currentLangData = parsedData[language];
              setStory(`# ${currentLangData.title}\n\n${currentLangData.story}`);
            } else {
              // Fallback if the selected language isn't available
              const availableLang = 
                (parsedData.english && parsedData.english.title) ? 'english' : 
                (parsedData.russian && parsedData.russian.title) ? 'russian' : null;
              
              if (availableLang) {
                setLanguage(availableLang);
                const fallbackData = parsedData[availableLang];
                setStory(`# ${fallbackData.title}\n\n${fallbackData.story}`);
              } else {
                // If we can't find a structured format, just display raw
                setStory(data.content);
              }
            }
          } else {
            // If the structure isn't as expected, just show the raw content
            console.warn('Parsed data missing expected structure:', parsedData);
            setStory(data.content);
          }
        } catch (parseError) {
          console.error('All JSON parsing attempts failed:', parseError);
          // Display raw content as fallback
          setStory(data.content);
        }
      } else {
        throw new Error('No story content received');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setStory("Sorry, there was an error generating your story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-blue-950 to-purple-950 dark:from-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Stars background */}
      <StarsBackground starDensity={0.0002} className="z-0" />
      <ShootingStars 
        minDelay={2000} 
        maxDelay={8000} 
        starColor="#ffffff" 
        trailColor="#9E00FF" 
        className="z-0" 
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <ColourfulText text="PushkinAI" />
          </h1>
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
              {storyData && storyData.russian && storyData.english && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className={`text-sm ${language === 'russian' ? 'font-bold' : ''}`}>Russian</span>
                  <Switch 
                    checked={language === 'english'}
                    onCheckedChange={(checked) => {
                      const newLanguage = checked ? 'english' : 'russian';
                      setLanguage(newLanguage);
                      if (storyData && storyData[newLanguage]) {
                        setStory(`# ${storyData[newLanguage].title}\n\n${storyData[newLanguage].story}`);
                      }
                    }}
                  />
                  <span className={`text-sm ${language === 'english' ? 'font-bold' : ''}`}>English</span>
                </div>
              )}
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
                  setStoryData(null);
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
