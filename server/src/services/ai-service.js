/**
 * CECUREUS — Local AI Wellness Engine (Powered by Microsoft Phi-3 via Ollama)
 *
 * Implements:
 * - Dynamic, empathetic, intelligent conversational therapy companion "Ally"
 * - Full conversation context & multi-turn memory
 * - Crisis detection (self-harm, acute emergency helpline guidance)
 * - Fast local inference via Ollama HTTP API (http://127.0.0.1:11434)
 * - Safe fallback in case Ollama is busy
 */

const http = require('http');
const logger = require('../config/logger');

const OLLAMA_HOST = process.env.OLLAMA_HOST || '127.0.0.1';
const OLLAMA_PORT = parseInt(process.env.OLLAMA_PORT || '11434', 10);
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3';

const ALLY_SYSTEM_PROMPT = `You are Ally, a warm, empathetic, and confidential AI mental wellness companion from CecureUs.
Your purpose:
1. Listen actively, validate emotions without judgment, and offer supportive psychological grounding and wellness guidance.
2. Ask thoughtful, gentle follow-up questions to help the user reflect and unpack their feelings.
3. Suggest evidence-based coping tools when appropriate (e.g. 4-7-8 breathing, box breathing, 5-4-3-2-1 sensory grounding, cognitive reframing, sleep hygiene).
4. Maintain a warm, comforting, calm, and human tone. Keep responses natural, concise (2-4 paragraphs max), and easy to read on mobile.
5. CRISIS PROTOCOL: If the user expresses active intent of self-harm, suicide, or severe violence, express immediate compassion and urge them to reach out to emergency resources (National Tele-Mental Health Helpline: 14416 / 1800-891-4416 or local emergency services 112) while reminding them CecureUs human counsellors are also available in the app.`;

/**
 * Call Ollama Chat API
 */
async function callOllamaChat(messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: ALLY_SYSTEM_PROMPT },
        ...messages,
      ],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 250,
      },
    });

    const req = http.request(
      {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 45000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const parsed = JSON.parse(data);
              const responseText = parsed.message?.content?.trim();
              if (responseText) {
                resolve(responseText);
              } else {
                reject(new Error('Empty response from Ollama Phi-3'));
              }
            } else {
              reject(new Error(`Ollama returned status ${res.statusCode}: ${data}`));
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama Phi-3 request timed out after 15s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Fallback empathetic generator if Ollama is unreachable
 */
function getEmpatheticFallback(topic, userMessage) {
  const msg = (userMessage || '').toLowerCase();
  if (msg.includes('die') || msg.includes('suicide') || msg.includes('kill myself') || msg.includes('hurt myself')) {
    return "I hear how much pain you are carrying right now, and I care deeply about your safety. You don't have to go through this alone. Please reach out right now to the National Mental Health Helpline at 14416 (available 24/7 toll-free) or connect with one of our licensed CecureUs counsellors in the Counsellor tab. There is help, and you are not alone.";
  }
  if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('burnout')) {
    return "I hear how much pressure you're under right now. When everything piles up, it helps to pause for just 30 seconds and take a slow breath. What is the single biggest thing weighing on your shoulders today?";
  }
  if (msg.includes('anxi') || msg.includes('panic') || msg.includes('scared') || msg.includes('fear')) {
    return "It sounds like anxiety is feeling really intense for you right now. Let's do a quick grounding check: feel your feet flat on the floor, and take a long, slow exhale. Would you like to tell me more about what triggered this feeling?";
  }
  return `Thank you for sharing that with me. I'm here to listen and support you through this. Can you tell me a little more about how this has been affecting you today?`;
}

/**
 * Main function to generate intelligent Ally response
 * @param {Array<{role: string, content: string}>} history - Previous messages
 * @param {string} currentMessage - Latest user message
 * @param {string} topic - Conversation topic
 */
async function generateAllyResponse(history = [], currentMessage = '', topic = 'General Check-in') {
  try {
    // Format history for Ollama chat format
    const formattedMessages = history
      .slice(-6) // Keep last 6 messages for prompt efficiency and fast response
      .map((m) => ({
        role: m.role === 'ally' ? 'assistant' : 'user',
        content: m.content,
      }));

    // Append latest user message if not already present
    if (currentMessage && (!formattedMessages.length || formattedMessages[formattedMessages.length - 1].content !== currentMessage)) {
      formattedMessages.push({ role: 'user', content: currentMessage });
    }

    logger.info('Generating response with Ollama Phi-3...', {
      model: OLLAMA_MODEL,
      messageCount: formattedMessages.length,
      topic,
    });

    const aiResponse = await callOllamaChat(formattedMessages);
    logger.info('Ollama Phi-3 response generated successfully');
    return aiResponse;
  } catch (error) {
    logger.warn('Ollama Phi-3 call failed, using graceful empathetic fallback', {
      error: error.message,
    });
    return getEmpatheticFallback(topic, currentMessage);
  }
}

module.exports = {
  generateAllyResponse,
  callOllamaChat,
};
