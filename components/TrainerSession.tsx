
import React, { useState, useEffect, useRef } from 'react';
import { WeekData } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_PROMPT_TEMPLATE } from '../constants';

// Helper functions for Audio Encoding/Decoding (Manual implementation for compliance)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const cleanText = (text: string) => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/##+/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .trim();
};

type TaskType = 'reading' | 'writing' | 'speaking' | 'listening' | 'general';

interface TrainerSessionProps {
  week: WeekData;
  phaseId: number;
  onExit: () => void;
  onComplete: () => void;
}

export const TrainerSession: React.FC<TrainerSessionProps> = ({ week, phaseId, onExit, onComplete }) => {
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Welcome to Phase ${phaseId}, Week ${week.id}: ${week.title}. Let's focus on ${week.objective}. I'm ready to begin the training whenever you are.` }
  ]);
  const [input, setInput] = useState('');
  const [writingInput, setWritingInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const taskType: TaskType = (() => {
    const title = week.title.toLowerCase();
    const obj = week.objective.toLowerCase();
    if (title.includes('reading') || obj.includes('reading')) return 'reading';
    if (title.includes('writing') || obj.includes('writing')) return 'writing';
    if (title.includes('speaking') || obj.includes('speaking')) return 'speaking';
    if (title.includes('listening') || obj.includes('listening')) return 'listening';
    return 'general';
  })();

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (customMsg?: string) => {
    const msgToSend = customMsg || input;
    if (!msgToSend.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: msgToSend }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT_TEMPLATE(week.title, week.objective),
        },
      });

      const rawText = response.text || "I'm processing that...";
      setMessages(prev => [...prev, { role: 'ai', text: cleanText(rawText) }]);
      if (messages.length > 2) onComplete();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceSession = async () => {
    try {
      // 1. Initialize Contexts immediately on user interaction
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // CRITICAL: Ensure contexts are active
      await inputCtx.resume();
      await outputCtx.resume();
      
      audioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. New instance per connection
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              const pcmBlob = { 
                data: encode(new Uint8Array(int16.buffer)), 
                mimeType: 'audio/pcm;rate=16000' 
              };
              // Only send if session exists and is resolved
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Data
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const currentOutputCtx = audioContextRef.current;
              if (!currentOutputCtx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentOutputCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio), 
                currentOutputCtx, 
                24000, 
                1
              );
              
              const source = currentOutputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(currentOutputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              
              onComplete();
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsVoiceActive(false);
            stopVoiceSession();
          },
          onerror: (e) => {
            console.error('Voice Session Error:', e);
            setIsVoiceActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
            } 
          },
          systemInstruction: SYSTEM_PROMPT_TEMPLATE(week.title, week.objective),
        },
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err) {
      console.error("Failed to start voice session:", err);
      alert("Microphone access and a valid connection are required.");
    }
  };

  const stopVoiceSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsVoiceActive(false);
  };

  const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full gap-4 max-w-[1600px] mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Exit Session
          </button>
          <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
               taskType === 'reading' ? 'bg-emerald-100 text-emerald-700' :
               taskType === 'writing' ? 'bg-amber-100 text-amber-700' :
               taskType === 'speaking' ? 'bg-rose-100 text-rose-700' :
               taskType === 'listening' ? 'bg-indigo-100 text-indigo-700' :
               'bg-slate-100 text-slate-600'
             }`}>
               {taskType} Mode
             </div>
             <span className="text-sm font-bold text-slate-400">Week {week.id}</span>
          </div>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-2xl">
          <button 
            onClick={() => { stopVoiceSession(); setMode('chat'); }}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'chat' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            TEXT COACH
          </button>
          <button 
            onClick={() => setMode('voice')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'voice' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            VOICE TRAINER
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        
        {/* TASK AREA (Left Side) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
          
          <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {taskType === 'reading' && (
              <div className="flex-1 flex flex-col">
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">Academic Passage Simulator</h3>
                  <div className="flex gap-4">
                    <span className="text-xs font-bold text-slate-400">Source: iBT 2026 Archive</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 prose prose-slate max-w-none">
                  <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-xs">Read the following passage and analyze the structure with your trainer:</p>
                  <h2 className="text-3xl font-black text-slate-900 mb-6">The Evolutionary Biology of Deep-Sea Hydrothermal Vents</h2>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    In the late 1970s, oceanographers discovered entire ecosystems thriving in the complete absence of sunlight near volcanic fissures on the ocean floor. These "hydrothermal vents" emit superheated water enriched with minerals, supporting life through chemosynthesis rather than photosynthesis. The primary producers here are bacteria that oxidize hydrogen sulfide, providing the energy for complex organisms like giant tube worms (Riftia pachyptila) and specialized crustaceans.
                  </p>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    The biological diversity found at these vents has profound implications for our understanding of evolutionary biology. Unlike terrestrial ecosystems, vent communities are transient; as volcanic activity shifts, vents can close, forcing species to colonize new locations hundreds of miles away. This creates a fascinating model for studying "island biogeography" in the deep ocean, where dispersal mechanisms and genetic connectivity determine the survival of entire lineages.
                  </p>
                  <div className="mt-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 italic text-emerald-800 font-medium">
                    Note: Use the chat to ask the trainer to explain the "Inference" or "Rhetorical Purpose" of the second paragraph.
                  </div>
                </div>
              </div>
            )}

            {taskType === 'writing' && (
              <div className="flex-1 flex flex-col">
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">Academic Discussion Board</h3>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Words</div>
                      <div className="text-lg font-black text-blue-600">{getWordCount(writingInput)}</div>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timer</div>
                      <div className="text-lg font-black text-slate-900">09:54</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-8 gap-6">
                  <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                    <h4 className="font-black text-amber-900 mb-2">PROMPT:</h4>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      Your professor is asking for your opinion on whether governments should prioritize funding for space exploration or environmental protection on Earth. Write a response of at least 100 words.
                    </p>
                  </div>
                  <textarea 
                    value={writingInput}
                    onChange={(e) => setWritingInput(e.target.value)}
                    placeholder="Type your academic response here..."
                    className="flex-1 w-full bg-slate-50 rounded-3xl p-8 text-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium border-2 border-transparent focus:border-blue-500/30 resize-none"
                  />
                  <button 
                    onClick={() => handleSendMessage(`MY WRITING DRAFT:\n\n${writingInput}\n\nPlease evaluate this response.`)}
                    className="bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl active:scale-95"
                  >
                    Submit for AI Evaluation
                  </button>
                </div>
              </div>
            )}

            {(taskType === 'speaking' || taskType === 'listening' || taskType === 'general') && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                {mode === 'voice' ? (
                  <div className="space-y-8 flex flex-col items-center">
                    <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${isVoiceActive ? 'bg-blue-50 shadow-[0_0_100px_rgba(37,99,235,0.2)] scale-110' : 'bg-slate-100'}`}>
                      <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isVoiceActive ? 'bg-blue-600 shadow-xl' : 'bg-slate-300'}`}>
                        {isVoiceActive ? <WaveIcon /> : <MicIcon />}
                      </div>
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isVoiceActive ? "Listening to you..." : "Voice Training Mode"}
                      </h3>
                      <p className="text-slate-500 mt-4 leading-relaxed font-medium text-lg">
                        {isVoiceActive 
                          ? "Speak naturally. I'm analyzing your fluency and structure in real-time."
                          : "Ready to practice? Connect to start a live session focusing on " + week.title}
                      </p>
                    </div>
                    {!isVoiceActive ? (
                      <button onClick={startVoiceSession} className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95">
                        Start Interaction
                      </button>
                    ) : (
                      <button onClick={stopVoiceSession} className="bg-red-50 text-red-600 border-2 border-red-200 px-12 py-5 rounded-[2rem] font-black hover:bg-red-100 transition-all active:scale-95">
                        End Voice Mode
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="max-w-2xl w-full">
                    <div className="mb-10 text-left">
                      <h3 className="text-4xl font-black text-slate-900 mb-2">Cognitive Core</h3>
                      <p className="text-slate-400 font-bold text-lg">Mental mapping for Week {week.id}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                            <FocusIcon />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mb-2">Pivotal Focus</h4>
                          <p className="text-slate-500 font-medium leading-relaxed">{week.internalFocus}</p>
                       </div>
                       <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                            <BookIcon />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mb-2">Key Objectives</h4>
                          <p className="text-slate-500 font-medium leading-relaxed">{week.objective}</p>
                       </div>
                    </div>
                    <div className="mt-12 p-8 bg-blue-600 rounded-[2.5rem] text-white flex items-center justify-between">
                       <div className="text-left">
                          <h4 className="text-xl font-black">Begin Strategy Chat</h4>
                          <p className="text-blue-100 font-medium text-sm">Use the panel to the right to interact.</p>
                       </div>
                       <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center animate-pulse">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" /></svg>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CHAT PANEL (Right Side) */}
        <div className={`w-full lg:w-96 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${mode === 'voice' ? 'opacity-30 pointer-events-none blur-[2px]' : ''}`}>
           <div className="p-6 border-b flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
             <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Personal Coach</h3>
           </div>
           
           <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] px-5 py-3.5 rounded-3xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-5 py-3 rounded-3xl rounded-tl-none flex gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
           </div>

           <div className="p-4 border-t bg-white flex gap-3">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-black transition shadow-xl disabled:opacity-50"
              >
                <SendIcon />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

// Icons
const FocusIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const WaveIcon = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-14 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-10 bg-white rounded-full animate-bounce"></div>
  </div>
);
