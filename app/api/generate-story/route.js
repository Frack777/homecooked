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
          "content": "You are PushkinAI, a storyteller inspired by the style of Alexander Pushkin's fairy tales in verse.\n\nWhen given an animal and a moral, write an original short story in Pushkin's poetic style in Russian, then provide an English translation.\n\nThe story should be written in rhymed verse, suitable for children and adults alike.\n\nKeep the tone whimsical, wise, and lyrical, and ensure the moral is subtly woven into the story.\n\nAlways provide both the original Russian poem and its English translation, clearly labeled."
        },
        {
          "role": "user",
          "content": `Write a story about a ${animal} that teaches the moral: "${moral}".`
        }
      ],
      "max_tokens": 32768,
      "top_p": 0.8,
      "stream": true,
      "stream_options": {
        "include_usage": true
      }
    };

    // Create a new ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch("https://api.friendli.ai/dedicated/v1/chat/completions", {
            method: "POST",
            headers,
            body: JSON.stringify(body)
          });

          if (!response.ok) {
            const errorText = await response.text();
            controller.error(new Error(`API request failed: ${response.status} ${errorText}`));
            return;
          }

          // Get the response as a readable stream
          const reader = response.body.getReader();
          
          // Process the stream chunks
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            
            // Process each line in the chunk (each line is a separate SSE event)
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6);
                
                // Skip [DONE] message
                if (data === '[DONE]') continue;
                
                try {
                  // Parse the JSON data
                  const parsedData = JSON.parse(data);
                  
                  // Extract the content delta if it exists
                  if (parsedData.choices && 
                      parsedData.choices[0] && 
                      parsedData.choices[0].delta && 
                      parsedData.choices[0].delta.content) {
                    // Send the content delta to the client
                    controller.enqueue(new TextEncoder().encode(parsedData.choices[0].delta.content));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      }
    });

    // Return the stream as a streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: "Failed to generate story" }, 
      { status: 500 }
    );
  }
}
