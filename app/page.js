"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ColourfulText from "@/components/ui/colourful-text";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedMoral, setSelectedMoral] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState("");
  const [language, setLanguage] = useState("english"); // Default to English
  const [storyData, setStoryData] = useState(null); // Store the parsed story data
  const [dialogOpen, setDialogOpen] = useState(false); // Control dialog visibility
  const [loadingMessage, setLoadingMessage] = useState(""); // Store current loading message

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
    { emoji: "🐷", name: "Pig" },
    { emoji: "🐺", name: "Wolf" },
    { emoji: "🦝", name: "Raccoon" },
    { emoji: "🦄", name: "Unicorn" },
    { emoji: "🦓", name: "Zebra" },
    { emoji: "🦒", name: "Giraffe" },
    { emoji: "🐘", name: "Elephant" },
    { emoji: "🦔", name: "Hedgehog" },
    { emoji: "🦇", name: "Bat" },
    { emoji: "🐿️", name: "Squirrel" },
    { emoji: "🦅", name: "Eagle" },
    { emoji: "🦉", name: "Owl" },
    { emoji: "🐢", name: "Turtle" },
    { emoji: "🐍", name: "Snake" },
    { emoji: "🐸", name: "Frog" },
    { emoji: "🦋", name: "Butterfly" },
    { emoji: "🐝", name: "Bee" }
  ];

  const morals = [
    "Honesty is the best policy",
    "Slow and steady wins the race",
    "Don't judge a book by its cover",
    "Pride comes before a fall",
    "Actions speak louder than words",
    "United we stand, divided we fall",
    "A friend in need is a friend indeed",
    "Fortune favors the brave",
    "Knowledge is power",
    "Appearances can be deceiving",
    "Kindness costs nothing but means everything",
    "The journey is more important than the destination",
    "True beauty comes from within",
    "Patience is a virtue",
    "Greed leads to downfall",
    "Every cloud has a silver lining",
    "The wise learn from others' mistakes",
    "One good turn deserves another",
    "Love conquers all",
    "The truth will always be revealed",
    "Unity is strength",
    "Courage is facing your fears",
    "The pen is mightier than the sword",
    "All that glitters is not gold",
    "A stitch in time saves nine",
    "Curiosity killed the cat, but satisfaction brought it back",
    "Two wrongs don't make a right",
    "The early bird catches the worm",
    "Where there's a will, there's a way",
    "You can't judge a book by its cover"
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
    if (!selectedAnimal || !selectedMoral) return;
    
    // Reset states and show loading UI
    setIsGenerating(true);
    setStory("");
    setLoadingMessage(loadingTexts[0]);
    
    // Show loading dialog with spinner
    setDialogOpen(true);
    
    // Variable to store the loading interval reference
    let loadingInterval;
    
    try {
      // Start custom loading animation
      let loadingIndex = 0;
      
      loadingInterval = setInterval(() => {
        loadingIndex = (loadingIndex + 1) % loadingTexts.length;
        setLoadingMessage(loadingTexts[loadingIndex]);
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Raw API response:", data);
      
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
            cleanedContent = cleanedContent.replace(/,\s*}/g, '}'); // Fix trailing commas
            cleanedContent = cleanedContent.replace(/,\s*,/g, ','); // Fix double commas
            cleanedContent = cleanedContent.replace(/:\s*,/g, ': null,'); // Fix missing values
            cleanedContent = cleanedContent.replace(/"\s*"/g, '" "'); // Fix empty strings
            
            // Remove any markdown code block formatting
            cleanedContent = cleanedContent.replace(/```json\s*/g, '');
            cleanedContent = cleanedContent.replace(/```\s*$/g, '');
            
            console.log('Cleaned content:', cleanedContent);
            
            // Try to extract just the JSON object
            let jsonContent = cleanedContent;
            const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonContent = jsonMatch[0];
              console.log('Extracted JSON:', jsonContent);
            }
            
            try {
              // Try parsing the cleaned content
              parsedData = JSON.parse(jsonContent);
              console.log('Successfully parsed JSON after cleanup:', parsedData);
            } catch (jsonSyntaxError) {
              console.error('JSON syntax error:', jsonSyntaxError);
              
              // Get error position from the error message
              const positionMatch = jsonSyntaxError.message.match(/position (\d+)/);
              if (positionMatch && positionMatch[1]) {
                const errorPosition = parseInt(positionMatch[1]);
                console.log(`Error at position ${errorPosition}`);
                
                // Extract the problematic part of the JSON (10 chars before and after)
                const start = Math.max(0, errorPosition - 10);
                const end = Math.min(jsonContent.length, errorPosition + 10);
                const problematicPart = jsonContent.substring(start, end);
                console.log(`Problematic part: "${problematicPart}"`);
                
                // Try to fix common issues at specific positions
                let fixedContent = jsonContent;
                
                // Fix for trailing commas before closing braces
                if (problematicPart.includes(',}') || problematicPart.includes(', }')) {
                  fixedContent = jsonContent.substring(0, errorPosition) + 
                                 jsonContent.substring(errorPosition).replace(/,\s*}/g, '}');
                }
                
                // Fix for missing values after colons
                if (problematicPart.includes(':,') || problematicPart.includes(': ,')) {
                  fixedContent = jsonContent.substring(0, errorPosition) + 
                                 jsonContent.substring(errorPosition).replace(/:\s*,/g, ': null,');
                }
                
                // Fix for missing commas between properties
                if (/"\s*"/.test(problematicPart)) {
                  fixedContent = jsonContent.substring(0, errorPosition) + 
                                 jsonContent.substring(errorPosition).replace(/"\s*"/g, '", "');
                }
                
                console.log('Attempting to parse fixed content');
                parsedData = JSON.parse(fixedContent);
              } else {
                // Last resort: try a more aggressive approach - rebuild the JSON
                console.log('Attempting aggressive JSON reconstruction');
                
                // Extract all key-value pairs using regex
                const keyValuePairs = jsonContent.match(/"[^"]+"\s*:\s*"[^"]*"|"[^"]+"\s*:\s*\{[^}]*\}/g);
                if (keyValuePairs) {
                  // Rebuild a clean JSON object
                  const reconstructedJson = `{${keyValuePairs.join(',')}}`.replace(/,,/g, ',');
                  parsedData = JSON.parse(reconstructedJson);
                } else {
                  throw jsonSyntaxError; // Re-throw if we can't fix it
                }
              }
            }
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
            
            // Open the dialog when story is ready
            setDialogOpen(true);
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
      setStory('Sorry, there was an error generating your story. Please try again.');
    } finally {
      // Always clear the loading interval and state
      if (loadingInterval) {
        clearInterval(loadingInterval);
      }
      setLoadingMessage(""); // Clear loading message
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg flex items-center gap-2"
            disabled={!selectedAnimal || !selectedMoral || isGenerating}
          >
            {isGenerating && <Spinner size="sm" className="border-white" />}
            {isGenerating ? "Generating..." : "Generate Your Story"}
          </Button>
        </div>

        {/* Story Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          // Only allow closing if not generating
          if (!isGenerating) setDialogOpen(open);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {isGenerating ? (
                  "Creating Your Magical Story"
                ) : (
                  storyData && storyData[language] && storyData[language].title
                )}
              </DialogTitle>
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
            </DialogHeader>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-inner overflow-auto max-h-[60vh]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner size="xl" className="mb-6" />
                  <p className="text-lg text-center animate-pulse">
                    {loadingMessage}
                  </p>
                </div>
              ) : (
                <p className="text-lg whitespace-pre-wrap">{story}</p>
              )}
            </div>
            <DialogFooter className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedAnimal(null);
                  setSelectedMoral("");
                  setStory("");
                  setStoryData(null);
                }}
              >
                Create Another Story
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
