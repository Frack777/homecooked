export async function POST(request) {
  try {
    const { animal, moral } = await request.json();
    
    if (!animal || !moral) {
      return new Response(JSON.stringify({ error: 'Animal and moral are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = process.env.FRIENDLI_TOKEN;
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
          "content": `${animal}, ${moral}`
        }
      ],
      "max_tokens": 32768,
      "top_p": 0.8,
      "stream": true,
      "stream_options": {
        "include_usage": true
      }
    };

    // Create a TransformStream to handle the streaming response
    const { readable, writable } = new TransformStream();
    
    // Process the FriendliAI response in the background
    fetch("https://api.friendli.ai/dedicated/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    }).then(async response => {
      if (!response.ok) {
        const writer = writable.getWriter();
        writer.write(new TextEncoder().encode(`Error from FriendliAI API: ${response.status} ${response.statusText}`));
        writer.close();
        return;
      }

      // Get the reader from the response body
      const reader = response.body.getReader();
      const writer = writable.getWriter();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process the buffer line by line
          let newBuffer = '';
          const lines = buffer.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (i === lines.length - 1) {
              // This might be an incomplete line, keep it in the buffer
              newBuffer = line;
              continue;
            }
            
            if (line.startsWith('data:')) {
              try {
                const jsonStr = line.slice(5).trim();
                if (jsonStr === '[DONE]') continue;
                
                const json = JSON.parse(jsonStr);
                if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                  // Extract just the content from the delta
                  const content = json.choices[0].delta.content;
                  await writer.write(new TextEncoder().encode(content));
                }
              } catch (e) {
                console.error('Error parsing JSON:', e, line);
              }
            }
          }
          
          buffer = newBuffer;
        }
      } catch (error) {
        console.error('Error processing stream:', error);
      } finally {
        writer.close();
      }
    }).catch(error => {
      console.error('Error calling FriendliAI API:', error);
      const writer = writable.getWriter();
      writer.write(new TextEncoder().encode(`Error calling FriendliAI API: ${error.message}`));
      writer.close();
    });

    // Return the readable stream to the client
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
