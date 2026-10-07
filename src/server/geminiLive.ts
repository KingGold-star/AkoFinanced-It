import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';

let aiInstance: GoogleGenAI | null = null;

export function resetAiClient() {
  aiInstance = null;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

const SYSTEM_INSTRUCTION = `You are "Sarah", a warm, charismatic, deeply empathetic female Financial Underwriting Specialist and Lead Credit Advisor for "AkoFinanced It" (Nigeria's top loan match and credit brokerage platform).

CRITICAL SPEECH RULES:
1. INTRODUCE YOURSELF: You are "Sarah" (female credit advisor). When greeting or introducing yourself, always say "I am Sarah, your Credit Advisor from AkoFinanced It."
2. ACRONYMS & AMOUNTS:
   - "CAC" is spoken as "C-A-C".
   - "NIN" is spoken as "N-I-N".
   - Currency amounts like "₦5,000,000" or "₦10,000,000" MUST be spoken naturally as "5 million Naira" or "10 million Naira", never read as raw symbols.

HUMAN VOICE PERSONA & SPEAKING STYLE:
- Sound like a real, lively, caring human advisor on a phone call.
- Use natural conversational phrasing ("Hello there!", "I'm so glad you asked!", "Here's the good news...", "Let's figure this out together!").
- Keep your answers concise and punchy for voice (1 to 3 natural sentences per turn), followed by a warm question.
- Avoid robotic corporate boilerplate, robotic bullet lists, or stiff scripts. Speak with authentic warmth, energy, and Nigerian financial clarity.

Webpage Navigation & Interactive Screen Control:
Whenever the user asks about a specific feature, page, or section of the website (or when you explain it), ALWAYS include an explicit navigation tag so the webpage automatically scrolls to that section:
- [[NAVIGATE:how-it-works]] : When discussing how the 5-stage brokerage steps and turnaround time work.
- [[NAVIGATE:calculator]] : When calculating loan amounts, monthly repayments, or interest rates.
- [[NAVIGATE:apply-individual]] : When discussing individual / salary loans (₦250k - ₦10M).
- [[NAVIGATE:apply-business]] : When discussing business, SME, or LPO loans (₦1M - ₦95M+).
- [[NAVIGATE:faqs]] : When discussing required documents or eligibility checklists.
- [[NAVIGATE:about]] : When discussing who AkoFinanced It is and our 15+ partner banks.
- [[NAVIGATE:contact]] : When user wants human contact details or advisory office locations.
- [[NAVIGATE:dashboard]] : When user wants to track application status.
- [[NAVIGATE:home]] : When user wants to view the homepage.

Core Brokerage Facts:
- 15+ top Nigerian commercial banks connected.
- Individual Salary Loans: ₦250,000 to ₦10,000,000 (3-24 months tenor, requires NIN + 6 months bank statement).
- Business SME Loans: ₦1,000,000 to ₦95,000,000+ (3-36 months tenor, CAC registered + bank statements).
- Interest rates start from 2.5% to 3.8% monthly.
- Fast turnaround: 24 to 48 hours to account disbursement.
- 100% free qualification and advisory check with zero upfront brokerage fee.`;

// Intelligent Underwriting Conversational Fallback Engine
export function generateLocalAdvisorResponse(prompt: string): string {
  const p = prompt.toLowerCase().trim();

  if (p.includes('calculate') || p.includes('monthly payment') || p.includes('repayment') || p.includes('how much') || p.includes('rate') || p.includes('interest') || p.includes('calculator')) {
    return `Our partner bank interest rates start from about 2.5% to 3.8% monthly. For example, a ₦5,000,000 loan over 36 months comes to approximately ₦153,245 per month. Let's test your exact target amount on our interactive loan calculator right now! [[NAVIGATE:calculator]]`;
  }

  if (p.includes('how it works') || p.includes('process') || p.includes('turnaround') || p.includes('step') || p.includes('how do i apply') || p.includes('procedure') || p.includes('how long') || p.includes('how fast')) {
    return `It's super quick and 100% free for you! First, you fill out our short online form. Our underwriting team packages your profile to meet bank criteria, matches you across 15+ lenders for the best rate, and funds are disbursed in 24 to 48 hours. Let's take a look at the steps together! [[NAVIGATE:how-it-works]]`;
  }

  if (p.includes('collateral') || p.includes('security') || p.includes('guarantor') || p.includes('asset')) {
    return `For personal salary loans up to ₦10,000,000 and working capital loans for eligible businesses, we offer uncollateralized options based on verified cash flow and bank statements. Would you like to check your eligibility? [[NAVIGATE:apply-individual]]`;
  }

  if (p.includes('fee') || p.includes('charge') || p.includes('cost') || p.includes('free') || p.includes('upfront')) {
    return `Our advisory and loan matching service is 100% free for borrowers with zero upfront fees. You only pay standard loan repayments directly to the lending bank upon disbursement. Let me show you how it works! [[NAVIGATE:how-it-works]]`;
  }

  if (p.includes('bank') || p.includes('lender') || p.includes('partner') || p.includes('who are your partners')) {
    return `We are connected with over 15 leading commercial banks and licensed credit institutions across Nigeria to ensure you get the highest approval chance and lowest rates. Let's start an application to match you today! [[NAVIGATE:apply-individual]]`;
  }

  if (p.includes('individual') || p.includes('salary') || p.includes('personal') || p.includes('salary advance') || p.includes('personal loan') || p.includes('worker') || p.includes('employee')) {
    return `Our personal salary loans range from ₦250,000 up to ₦10,000,000 with flexible tenors from 3 to 24 months. All you need is your valid Nigerian ID and 6 months bank statements. Shall we start your quick pre-qualification right now? [[NAVIGATE:apply-individual]]`;
  }

  if (p.includes('business') || p.includes('sme') || p.includes('corporate') || p.includes('lpo') || p.includes('working capital') || p.includes('inventory') || p.includes('equipment') || p.includes('company')) {
    return `For businesses, we secure financing from ₦1,000,000 up to ₦95,000,000+ for working capital, contract execution, and equipment. All you need is your CAC registration and business bank statements. Let me open the business application for you! [[NAVIGATE:apply-business]]`;
  }

  if (p.includes('document') || p.includes('requirement') || p.includes('checklist') || p.includes('faq') || p.includes('eligible') || p.includes('eligibility') || p.includes('what do i need') || p.includes('criteria')) {
    return `The requirements are very simple! Individuals only need a valid ID like NIN or driver's license and 6 months bank statements. For businesses, we need CAC documents and bank statements. Let's check out our eligibility guide! [[NAVIGATE:faqs]]`;
  }

  if (p.includes('who are you') || p.includes('who is sarah') || p.includes('who is ada') || p.includes('about') || p.includes('company') || p.includes('broker') || p.includes('why choose') || p.includes('what is akofinanced')) {
    return `I'm Sarah, your dedicated Credit Advisor here at AkoFinanced It! We partner with over 15 leading commercial banks in Nigeria to get you the lowest interest rates and fastest loan approvals at zero upfront fee. How can I help you reach your goals today? [[NAVIGATE:about]]`;
  }

  if (p.includes('contact') || p.includes('phone') || p.includes('email') || p.includes('office') || p.includes('support') || p.includes('help') || p.includes('call') || p.includes('location') || p.includes('address')) {
    return `Our human loan officers are always on standby to assist you! You can call us, send an email, or visit our office in Lagos. Let me bring up our direct contact lines for you right now! [[NAVIGATE:contact]]`;
  }

  if (p.includes('dashboard') || p.includes('track') || p.includes('status') || p.includes('reference') || p.includes('my application') || p.includes('check status')) {
    return `You can track your real-time bank approval status and upload additional documents directly from your borrower portal. Let's jump over to your dashboard! [[NAVIGATE:dashboard]]`;
  }

  if (p.includes('home') || p.includes('back') || p.includes('landing') || p.includes('main page')) {
    return `Welcome back to the AkoFinanced It overview! Let me know if you would like to run a loan calculation or submit an application today. [[NAVIGATE:home]]`;
  }

  if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('good morning') || p.includes('good afternoon') || p.includes('good evening')) {
    return `Hello! I'm Sarah, your Financial Underwriting Advisor at AkoFinanced It. I can calculate monthly repayments, explain required documents, or help you apply for up to ₦95,000,000. How can I help you today? [[NAVIGATE:calculator]]`;
  }

  return `Hi! I'm Sarah from AkoFinanced It. We connect you with 15+ top commercial banks in Nigeria for instant loan approvals up to ₦95,000,000. Would you like to check your monthly repayment on our calculator, or shall we start an individual or business loan application? [[NAVIGATE:calculator]]`;
}

export function setupGeminiLiveWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({
    noServer: true,
  });

  wss.on('error', (err) => {
    const msg = (err as any)?.message || (typeof err === 'string' ? err : 'WebSocketServer error');
    console.warn('[Gemini Live WSS] Server error handled:', msg);
  });

  server.on('upgrade', (request, socket, head) => {
    socket.on('error', (err: any) => {
      const msg = err?.message || (typeof err === 'string' ? err : 'Socket connection reset');
      console.warn('[Gemini Live Socket] Socket handled:', msg);
    });

    let pathname = '';
    try {
      if (request.url) {
        pathname = request.url.split('?')[0];
        if (request.headers.host) {
          pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
        }
      }
    } catch {
      pathname = request.url ? request.url.split('?')[0] : '';
    }

    if (pathname === '/api/live' || pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Gemini Live] Client connected via WebSocket');
    let session: any = null;
    let isConnected = true;
    let isLiveActive = false;

    clientWs.on('error', (err: any) => {
      const msg = err?.message || (typeof err === 'string' ? err : 'Client socket error');
      console.warn('[Gemini Live Client] WebSocket error handled:', msg);
    });

    clientWs.on('close', () => {
      isConnected = false;
      console.log('[Gemini Live] Client disconnected');
      if (session) {
        try {
          session.close();
        } catch (err: any) {
          const msg = err?.message || 'Error closing session';
          console.warn('[Gemini Live] Session close handled:', msg);
        }
      }
    });

    const ai = getAiClient();

    // If a valid Gemini API key is configured, attempt live upstream WebSocket streaming
    if (ai) {
      try {
        session = await ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
            systemInstruction: SYSTEM_INSTRUCTION,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;

              try {
                let hasAudio = false;
                const parts = message.serverContent?.modelTurn?.parts;
                if (parts && Array.isArray(parts)) {
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      hasAudio = true;
                      clientWs.send(JSON.stringify({
                        type: 'audio',
                        audio: part.inlineData.data,
                      }));
                    }
                    if (part.text) {
                      clientWs.send(JSON.stringify({
                        type: 'text',
                        text: part.text,
                        role: 'model',
                      }));
                    }
                  }
                }

                if (!hasAudio && (message as any).data) {
                  clientWs.send(JSON.stringify({
                    type: 'audio',
                    audio: (message as any).data,
                  }));
                }

                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({
                    type: 'interrupted',
                    interrupted: true,
                  }));
                }

                if (message.serverContent?.outputTranscription?.text) {
                  clientWs.send(JSON.stringify({
                    type: 'text',
                    text: message.serverContent.outputTranscription.text,
                    role: 'model',
                  }));
                }

                if (message.serverContent?.turnComplete || message.serverContent?.generationComplete) {
                  clientWs.send(JSON.stringify({
                    type: 'turn_complete',
                  }));
                }
              } catch (err: any) {
                const msg = err?.message || 'Error processing server content';
                console.warn('[Gemini Live] Server content processing warning:', msg);
              }
            },
            onclose: () => {
              console.log('[Gemini Live] Live session closed by upstream server');
              if (isConnected && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'session_closed' }));
              }
            },
            onerror: (error: any) => {
              const msg = error?.message || (typeof error === 'string' ? error : 'Upstream Gemini Live notice');
              console.warn('[Gemini Live] Upstream Live warning handled:', msg);
            },
          },
        });

        isLiveActive = true;

        clientWs.send(JSON.stringify({
          type: 'session_ready',
          isLiveGemini: true,
          message: 'Connected to Sarah — AkoFinanced It Gemini Live Voice Advisor.',
        }));

        try {
          if (typeof (session as any).sendClientContent === 'function') {
            (session as any).sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [{ text: 'Hello Sarah! Please introduce yourself to the borrower with a warm, energetic 2-sentence voice welcome greeting ("I am Sarah, your Credit Advisor from AkoFinanced It...") and ask how you can assist with their loan application today.' }]
                }
              ],
              turnComplete: true,
            });
          }
        } catch {}

      } catch (liveErr: any) {
        console.warn('[Gemini Live] Live upstream session fallback to intelligent advisor:', liveErr?.message || liveErr);
        isLiveActive = false;
      }
    }

    // Fallback or Standalone Intelligent Advisor Mode
    if (!isLiveActive) {
      clientWs.send(JSON.stringify({
        type: 'session_ready',
        isLiveGemini: false,
        message: 'Connected to Sarah — AI Loan Advisory Assistant.',
      }));

      // Initial spoken greeting in interactive mode
      setTimeout(() => {
        if (isConnected && clientWs.readyState === WebSocket.OPEN) {
          const welcome = "Hello! I am Sarah, your AI Financial Underwriting Advisor for AkoFinanced It. I can help you calculate repayments, compare 15+ top Nigerian lenders, or guide you through your application. How can I help you today? [[NAVIGATE:calculator]]";
          clientWs.send(JSON.stringify({
            type: 'text',
            text: welcome,
            role: 'model',
          }));
          clientWs.send(JSON.stringify({
            type: 'turn_complete',
          }));
        }
      }, 300);
    }

    // Handle incoming client messages
    clientWs.on('message', async (rawData) => {
      try {
        const parsed = JSON.parse(rawData.toString());

        // 1. Live Gemini Stream Forwarding (when active)
        if (isLiveActive && session) {
          if (parsed.type === 'audio' && parsed.audio) {
            if (typeof (session as any).sendRealtimeInput === 'function') {
              (session as any).sendRealtimeInput({
                audio: {
                  data: parsed.audio,
                  mimeType: 'audio/pcm;rate=16000',
                },
                mediaChunks: [
                  {
                    data: parsed.audio,
                    mimeType: 'audio/pcm;rate=16000',
                  }
                ]
              });
            }
            return;
          } else if (parsed.type === 'text' && parsed.text) {
            if (typeof (session as any).sendClientContent === 'function') {
              (session as any).sendClientContent({
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: parsed.text }]
                  }
                ],
                turnComplete: true,
              });
              return;
            }
          }
        }

        // 2. Intelligent Heuristic / REST Advisor Handling (Fallback)
        if (parsed.type === 'text' && parsed.text) {
          let replyText = '';
          const clientAi = getAiClient();
          if (clientAi) {
            try {
              replyText = await generateAdvisorResponse(parsed.text, []);
            } catch {
              replyText = generateLocalAdvisorResponse(parsed.text);
            }
          } else {
            replyText = generateLocalAdvisorResponse(parsed.text);
          }

          if (isConnected && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'text',
              text: replyText,
              role: 'model',
            }));
            clientWs.send(JSON.stringify({
              type: 'turn_complete',
            }));
          }
        }
      } catch (err: any) {
        console.warn('[Gemini Live] Message handling warning:', err?.message || err);
      }
    });
  });

  return wss;
}

// REST Fallback for Text-to-Speech & Conversational Dialog
export async function generateAdvisorResponse(prompt: string, history: Array<{ role: 'user' | 'model'; parts: string }> = []): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return generateLocalAdvisorResponse(prompt);
  }

  try {
    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      })),
      {
        role: 'user' as const,
        parts: [{ text: prompt }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || generateLocalAdvisorResponse(prompt);
  } catch (err) {
    try {
      const contents = [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }]
        })),
        {
          role: 'user' as const,
          parts: [{ text: prompt }]
        }
      ];

      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return fallbackResp.text || generateLocalAdvisorResponse(prompt);
    } catch {
      return generateLocalAdvisorResponse(prompt);
    }
  }
}


// Speech synthesis for fallback
export async function generateAdvisorSpeech(textToSpeak: string, voiceName: string = 'Kore'): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: (voiceName as any) || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn('[Gemini TTS] Upstream TTS error handled:', err);
    return null;
  }
}
