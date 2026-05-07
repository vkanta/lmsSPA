const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORT = 3001;
const LM_API = 'http://localhost:1234';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

// Tool definitions sent to the model
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the internet for current information, news, weather, stock prices, etc.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get the current date and time',
      parameters: {
        type: 'object',
        properties: {
          timezone: { type: 'string', description: 'Timezone (default: UTC)', default: 'UTC' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculator',
      description: 'Evaluate a mathematical expression',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression to evaluate (e.g., "2+2", "sqrt(16)")' }
        },
        required: ['expression']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch the content of a URL and return the text content',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List files in a directory on the local system',
      parameters: {
        type: 'object',
        properties: {
          directory: { type: 'string', description: 'Directory path to list (default: current working directory)' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file on the local system',
      parameters: {
        type: 'object',
        properties: {
          filepath: { type: 'string', description: 'Path to the file to read' }
        },
        required: ['filepath']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file on the local system. Creates the file if it does not exist, or overwrites it if it does.',
      parameters: {
        type: 'object',
        properties: {
          filepath: { type: 'string', description: 'Path to the file to write' },
          content: { type: 'string', description: 'Content to write to the file' }
        },
        required: ['filepath', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Execute a shell command on the local system. Use with caution - only safe commands should be run.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The shell command to execute' },
          timeout: { type: 'number', description: 'Timeout in milliseconds (default: 30000)', default: 30000 }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name, zip code, or coordinates (e.g., "London", "90210", "40.7128,-74.0060")' },
          units: { type: 'string', description: 'Units: "metric" (Celsius) or "imperial" (Fahrenheit). Default: metric', enum: ['metric', 'imperial'] }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'text_to_speech_info',
      description: 'Get information about available text-to-speech models and capabilities',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'Action to perform: "list_models", "get_info"', enum: ['list_models', 'get_info'] }
        },
        required: ['action']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'summarize_text',
      description: 'Summarize a long piece of text to a shorter version',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to summarize' },
          max_length: { type: 'number', description: 'Maximum length of summary in words (default: 100)', default: 100 }
        },
        required: ['text']
      }
    }
  }
];

// Tool implementations
const toolImplementations = {
  async search_web({ query }) {
    try {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await response.text();
      const results = [];
      const regex = /<a href="([^"]+)"[^>]*><[^>]*class="result__a"[^>]*>([^<]+)<\/a>[^<]*<a[^>]*><[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      while ((match = regex.exec(html)) !== null && results.length < 8) {
        const snippet = match[3]
          .replace(/<[^>]+>/g, '')
          .replace(/&#9200;/g, '•')
          .trim();
        results.push({
          title: match[2].trim(),
          url: match[1],
          snippet: snippet.substring(0, 200)
        });
      }
      if (results.length === 0) {
        const simpleRegex = /<a[^>]*class="result__a"[^>]*>([^<]+)<\/a>/g;
        while ((match = simpleRegex.exec(html)) !== null && results.length < 8) {
          results.push({ title: match[1].trim(), url: 'N/A', snippet: 'No snippet available' });
        }
      }
      return { query, results, count: results.length };
    } catch (err) {
      return { error: `Search failed: ${err.message}` };
    }
  },

  async get_current_time({ timezone = 'UTC' }) {
    try {
      const now = new Date();
      const options = { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' };
      return {
        datetime: now.toISOString(),
        formatted: now.toLocaleString('en-US', options),
        timezone: timezone
      };
    } catch (err) {
      return { error: `Time lookup failed: ${err.message}` };
    }
  },

  async calculator({ expression }) {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().,%^sqrtSincoslogEPIw ]/g, '');
      const expanded = sanitized
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
        .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
        .replace(/log\(([^)]+)\)/g, 'Math.log($1)')
        .replace(/pi/gi, 'Math.PI')
        .replace(/(?<![a-z])e(?![a-z])/gi, 'Math.E')
        .replace(/\^/g, '**');
      const result = new Function('return ' + expanded)();
      return { expression, result: Number.isFinite(result) ? result : 'Error: invalid result' };
    } catch (err) {
      return { error: `Calculation failed: ${err.message}`, expression };
    }
  },

  async fetch_url({ url }) {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(10000)
      });
      const html = await response.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000);
      return { url, title: response.headers.get('title') || 'Page content', content: text, length: text.length };
    } catch (err) {
      return { error: `Fetch failed: ${err.message}`, url };
    }
  },

  async list_files({ directory = process.cwd() }) {
    try {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      return {
        directory,
        files: items.map(i => ({
          name: i.name,
          type: i.isDirectory() ? 'directory' : 'file'
        })),
        count: items.length
      };
    } catch (err) {
      return { error: `Failed to list directory: ${err.message}`, directory };
    }
  },

  async read_file({ filepath }) {
    try {
      const resolved = path.resolve(filepath);
      const stats = fs.statSync(resolved);
      if (stats.size > 1024 * 1024) {
        return { error: 'File too large (max 1MB)', filepath };
      }
      const content = fs.readFileSync(resolved, 'utf-8');
      return {
        filepath: resolved,
        size: stats.size,
        content: content.substring(0, 50000),
        truncated: stats.size > 50000
      };
    } catch (err) {
      return { error: `Failed to read file: ${err.message}`, filepath };
    }
  },

  async write_file({ filepath, content }) {
    try {
      const resolved = path.resolve(filepath);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, content, 'utf-8');
      return {
        filepath: resolved,
        size: Buffer.byteLength(content, 'utf-8'),
        success: true
      };
    } catch (err) {
      return { error: `Failed to write file: ${err.message}`, filepath };
    }
  },

  async run_command({ command, timeout = 30000 }) {
    try {
      const blocked = ['format', 'mkfs', 'rm -rf', ':(){:|:|}', 'dd if=', 'shutdown', 'reboot', 'fdisk'];
      if (blocked.some(b => command.toLowerCase().includes(b))) {
        return { error: 'Command blocked for safety', command };
      }
      const { stdout, stderr } = await execAsync(command, { timeout });
      return {
        command,
        stdout: stdout.substring(0, 10000),
        stderr: stderr ? stderr.substring(0, 5000) : '',
        truncated: stdout.length > 10000
      };
    } catch (err) {
      return {
        error: err.message,
        command,
        stdout: err.stdout ? err.stdout.substring(0, 5000) : '',
        stderr: err.stderr ? err.stderr.substring(0, 5000) : ''
      };
    }
  },

  async get_weather({ location, units = 'metric' }) {
    try {
      const apiKey = process.env.WEATHER_API_KEY || '';
      if (apiKey) {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${units}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        return {
          location: `${data.name}, ${data.sys.country}`,
          temperature: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          description: data.weather[0].description,
          units: units === 'metric' ? '°C' : '°F'
        };
      }
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      const current = data.current_condition[0];
      return {
        location: `${data.nearest_area[0].areaName[0].value}, ${data.nearest_area[0].country[0].iso_code}`,
        temperature: parseInt(current.temp_C) || parseInt(current.temp_F),
        feels_like: parseInt(current.FeelsLikeC) || parseInt(current.FeelsLikeF),
        humidity: parseInt(current.humidity),
        wind_speed: parseInt(current.windspeedKmph) || parseInt(current.windspeedMiles),
        description: current.weatherDesc[0].value,
        units: units === 'metric' ? '°C' : '°F'
      };
    } catch (err) {
      return { error: `Weather lookup failed: ${err.message}`, location };
    }
  },

  async text_to_speech_info({ action }) {
    try {
      const res = await fetch(`${LM_API}/v1/models`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const ttsModels = data.data.filter(m => m.id.includes('tts') || m.id.includes('audio'));
      if (action === 'list_models') {
        return {
          tts_models: ttsModels.map(m => m.id),
          available: ttsModels.length > 0
        };
      }
      return {
        info: 'Text-to-speech capabilities depend on loaded models',
        available_models: ttsModels.map(m => m.id),
        endpoint: `${LM_API}/v1/audio/speech`
      };
    } catch (err) {
      return { error: `Failed to query TTS info: ${err.message}` };
    }
  },

  async summarize_text({ text, max_length = 100 }) {
    try {
      const words = text.split(/\s+/);
      if (words.length <= max_length) {
        return { summary: text, original_length: words.length, summary_length: words.length };
      }
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let summary = '';
      let count = 0;
      for (const sentence of sentences) {
        const sWords = sentence.split(/\s+/).length;
        if (count + sWords > max_length) break;
        summary += sentence.trim() + ' ';
        count += sWords;
      }
      return {
        summary: summary.trim(),
        original_length: words.length,
        summary_length: count,
        reduction: `${Math.round((1 - count / words.length) * 100)}%`
      };
    } catch (err) {
      return { error: `Summarization failed: ${err.message}` };
    }
  }
};

function handleCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function proxyToLmStudio(req, res) {
  handleCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    let requestBody = {};
    if (req.method !== 'GET') {
      const bodyParts = [];
      for await (const chunk of req) {
        bodyParts.push(chunk);
      }
      const body = Buffer.concat(bodyParts).toString();
      if (body) {
        requestBody = JSON.parse(body);
      }
    }

    // Inject tools into the request
    if (requestBody.messages && !requestBody.tools) {
      requestBody.tools = TOOLS;
      requestBody.tool_choice = 'auto';
    }

    // Handle tool calling loop
    let allToolCalls = [];
    let allToolResults = [];

    const lmUrl = LM_API + req.url;
    const fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (req.method !== 'GET') {
      fetchOptions.body = JSON.stringify(requestBody);
    }
    let lmRes = await fetch(lmUrl, fetchOptions);

    if (requestBody.stream) {
      res.writeHead(lmRes.status, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const reader = lmRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalMessage = null;
      let hasToolCalls = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') {
            // Check if model wants to call tools
            if (finalMessage && finalMessage.tool_calls && finalMessage.tool_calls.length > 0) {
              hasToolCalls = true;
              // Send tool call events to client
              for (const tc of finalMessage.tool_calls) {
                res.write(`data: ${JSON.stringify({
                  type: 'tool_call',
                  tool_call: tc
                })}\n\n`);
              }
            }
            res.write('data: [DONE]\n\n');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!finalMessage) {
                  finalMessage = { content: '', tool_calls: [] };
                }
                if (!finalMessage.tool_calls[tc.index]) {
                  finalMessage.tool_calls[tc.index] = {
                    id: tc.id || '',
                    type: 'function',
                    function: { name: '', arguments: '' }
                  };
                }
                if (tc.id) finalMessage.tool_calls[tc.index].id = tc.id;
                if (tc.function?.name) finalMessage.tool_calls[tc.index].function.name = tc.function.name;
                if (tc.function?.arguments) finalMessage.tool_calls[tc.index].function.arguments += tc.function.arguments;
              }
            }
            if (delta?.content) {
              if (!finalMessage) finalMessage = { content: '', tool_calls: [] };
              finalMessage.content += delta.content;
            }
            if (delta?.reasoning_content) {
              if (!finalMessage) finalMessage = { content: '', tool_calls: [] };
              finalMessage.reasoning_content = (finalMessage.reasoning_content || '') + delta.reasoning_content;
            }
          } catch (e) { /* skip */ }

          // Forward original stream data to client
          res.write(line + '\n');
        }
      }

      // If model wants to call tools, execute them and continue
      if (hasToolCalls && finalMessage) {
        const toolCalls = finalMessage.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }));

        allToolCalls.push({ role: 'assistant', content: finalMessage.content, tool_calls: toolCalls });

        // Send user message for tool calls
        res.write(`data: ${JSON.stringify({ type: 'tool_calls_start', count: toolCalls.length })}\n\n`);

        for (const tc of toolCalls) {
          const args = JSON.parse(tc.function.arguments || '{}');
          const toolFn = toolImplementations[tc.function.name];

          // Send tool start event
          res.write(`data: ${JSON.stringify({
            type: 'tool_start',
            tool_name: tc.function.name,
            tool_args: args
          })}\n\n`);

          const result = toolFn ? await toolFn(args) : { error: `Unknown tool: ${tc.function.name}` };

          // Send tool result event
          res.write(`data: ${JSON.stringify({
            type: 'tool_result',
            tool_call_id: tc.id,
            tool_name: tc.function.name,
            result: result
          })}\n\n`);

          allToolResults.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }

        // Continue conversation with tool results
        requestBody.messages = [
          ...requestBody.messages.filter(m => m.role === 'system'),
          ...allToolCalls,
          ...allToolResults
        ];
        delete requestBody.stream; // Use non-streaming for tool rounds

        // Make up to 5 tool calling rounds
        for (let round = 0; round < 5; round++) {
          lmRes = await fetch(lmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          const result = await lmRes.json();
          const msg = result.choices?.[0]?.message;

          if (msg?.tool_calls && msg.tool_calls.length > 0) {
            allToolCalls.push(msg);
            res.write(`data: ${JSON.stringify({ type: 'tool_calls_start', count: msg.tool_calls.length })}\n\n`);

            for (const tc of msg.tool_calls) {
              const args = JSON.parse(tc.function.arguments || '{}');
              const toolFn = toolImplementations[tc.function.name];
              res.write(`data: ${JSON.stringify({ type: 'tool_start', tool_name: tc.function.name, tool_args: args })}\n\n`);
              const result2 = toolFn ? await toolFn(args) : { error: `Unknown tool: ${tc.function.name}` };
              res.write(`data: ${JSON.stringify({ type: 'tool_result', tool_call_id: tc.id, tool_name: tc.function.name, result: result2 })}\n\n`);
              allToolResults.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result2) });
            }

            requestBody.messages = [
              ...requestBody.messages.filter(m => m.role === 'system'),
              ...allToolCalls,
              ...allToolResults
            ];
          } else {
            // Final response - send in chunks with delays to not block UI
            if (msg?.reasoning_content) {
              res.write(`data: ${JSON.stringify({
                choices: [{
                  delta: { reasoning_content: msg.reasoning_content }
                }]
              })}\n\n`);
              await new Promise(r => setTimeout(r, 20));
            }
            if (msg?.content) {
              const sentences = msg.content.match(/[^.!?]+[.!?]+/g) || [msg.content];
              for (const sentence of sentences) {
                res.write(`data: ${JSON.stringify({
                  choices: [{
                    delta: { content: sentence }
                  }]
                })}\n\n`);
                await new Promise(r => setTimeout(r, 30));
              }
            }
            break;
          }
        }

        res.write('data: [DONE]\n\n');
      }

      res.end();
    } else {
      // Non-streaming response with tool calling loop
      let result = await lmRes.json();
      let msg = result.choices?.[0]?.message;

      // Tool calling loop
      for (let round = 0; round < 5 && msg?.tool_calls?.length > 0; round++) {
        requestBody.messages.push(msg);
        for (const tc of msg.tool_calls) {
          const args = JSON.parse(tc.function.arguments || '{}');
          const toolFn = toolImplementations[tc.function.name];
          const toolResult = toolFn ? await toolFn(args) : { error: `Unknown tool: ${tc.function.name}` };
          requestBody.messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult)
          });
        }
        lmRes = await fetch(lmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        result = await lmRes.json();
        msg = result.choices?.[0]?.message;
      }

      res.writeHead(lmRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
  }
}

const server = http.createServer((req, res) => {
  handleCors(res);

  if (req.url.startsWith('/v1/')) {
    return proxyToLmStudio(req, res);
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`LM Studio Chat proxy running at http://localhost:${PORT}`);
  console.log(`Proxying API requests to ${LM_API}`);
  console.log(`Available tools: ${TOOLS.map(t => t.function.name).join(', ')}`);
});
