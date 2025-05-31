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

Always provide your response in **this JSON format**:

{
    "russian": {
        "title": "Russian title here",
        "story": "Russian story here"
    },
    "english": {
        "title": "English title here",
        "story": "English story here"
    }
}`
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
    
    // Extract the content from the response
    const content = data.choices && data.choices[0] && data.choices[0].message 
      ? data.choices[0].message.content 
      : "Failed to generate story content";

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
