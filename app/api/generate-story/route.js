import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { animal, moral } = await request.json();
    
    if (!animal || !moral) {
      return NextResponse.json(
        { error: "Animal and moral are required" }, 
        { status: 400 }
      );
    }

    const token = process.env.FRIENDLI_TOKEN ?? "YOUR_FRIENDLI_TOKEN";

    const headers = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    };

    const body = {
      "model": "deptyoz513gndaw",
      "messages": [
        {
          "role": "system",
          "content": `You are PushkinAI, a storyteller inspired by the style of Alexander Pushkin's fairy tales in verse.

When given an animal and a moral, write an original short story in Pushkin's poetic style in Russian, then provide an English translation.

The story should be written in rhymed verse, suitable for children and adults alike.

Keep the tone whimsical, wise, and lyrical, and ensure the moral is subtly woven into the story.

IMPORTANT: You MUST respond with ONLY a valid JSON object in EXACTLY this format, with no additional text before or after:

{
    "russian": {
        "title": "Russian title here",
        "story": "Russian story here"
    },
    "english": {
        "title": "English title here",
        "story": "English story here"
    }
}

Do not include any markdown formatting, explanations, or additional text. The response must be a valid JSON object that can be parsed directly with JSON.parse(). Ensure there are no control characters or invalid escape sequences in the JSON.`
        },
        {
          "role": "user",
          "content": `Write a story about a ${animal} that teaches the moral: "${moral}".`
        }
      ],
      "max_tokens": 32768,
      "top_p": 0.8,
      "stream": false,
    };

    // Make the API request
    const response = await fetch("https://api.friendli.ai/dedicated/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.status}` }, 
        { status: response.status }
      );
    }

    // Parse the JSON response
    const data = await response.json();
    
    // Log the complete API response for debugging
    console.log('FriendliAI API Response:', JSON.stringify(data, null, 2));
    
    // Extract the content from the response
    let content = data.choices && data.choices[0] && data.choices[0].message 
      ? data.choices[0].message.content 
      : "Failed to generate story content";
    
    // Try to sanitize and parse the JSON to ensure it's valid
    try {
      // Remove any control characters that could cause parsing issues
      content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // Fix common JSON structural issues
      content = content.replace(/}},\s*"english":/g, '}, "english":'); // Fix extra closing brace
      content = content.replace(/}}}\s*$/g, '}}'); // Fix extra closing brace at end
      
      // Try to extract just the JSON object if there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      console.log('Sanitized content before parsing:', content);
      
      // Validate that it's parseable JSON
      const parsed = JSON.parse(content);
      
      // Ensure it has the expected structure
      if (!parsed.russian || !parsed.english) {
        console.warn('API response missing expected structure:', parsed);
      } else {
        // If valid, re-stringify to ensure clean JSON
        content = JSON.stringify(parsed);
      }
    } catch (parseError) {
      console.error('Error sanitizing API response:', parseError, '\nContent was:', content);
      // We'll still return the original content and let the frontend handle it
    }

    // Return the story content as JSON
    return NextResponse.json({ content });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: "Failed to generate story" }, 
      { status: 500 }
    );
  }
}
