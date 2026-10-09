import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Volume2,
  VolumeX,
  Eye,
  BookOpen,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface InteractiveTopic {
  id: string;
  category: string;
  tag: string;
  title: string;
  bookId: string;
  snippet: {
    language: string;
    code: string;
    marginNote: string;
    visualLabel: string;
  };
}

const TOPICS: InteractiveTopic[] = [
  {
    id: 'java',
    category: 'Java',
    tag: 'Java & OOPs',
    title: 'JVM Heap vs Stack & OOPs',
    bookId: 'book-java',
    snippet: {
      language: 'java',
      code: `// Stack holds reference, Heap stores object\nStudent student = new Student("Aarav");\nstudent.submitCode(); // Dynamic dispatch via V-Table`,
      marginNote: 'Reference is 64-bit on the thread stack pointing into JVM Young Gen.',
      visualLabel: 'JVM Memory Architecture Diagram (Pg. 19)'
    }
  },
  {
    id: 'cpp',
    category: 'C/C++',
    tag: 'C/C++ Master',
    title: 'Pointers & Memory Address',
    bookId: 'book-cpp',
    snippet: {
      language: 'cpp',
      code: `int val = 42;\nint* ptr = &val; // ptr stores address of val\n*ptr = 99;       // direct dereference mutation`,
      marginNote: 'Direct hardware memory manipulation without garbage collection overhead.',
      visualLabel: 'Byte-Address Pointer Grid (Pg. 64)'
    }
  }
];

export const Hero: React.FC = () => {
  const { setSelectedCategory, setSelectedProductForModal, products } = useStore();

  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [highlightActive, setHighlightActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTopic = TOPICS[activeTopicIndex] || TOPICS[0];
  const targetProduct = products.find((p) => p.id === currentTopic.bookId) || products[0];

  // Reliable high-definition coding / study desk ambient loops
  const VIDEO_SOURCES = [
    'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-41586-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-39908-large.mp4'
  ];

  // Ensure video is continuously playing and looping
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-[#071E38] text-white">
      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center opacity-35 scale-105 transition-opacity duration-1000"
          poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80"
        >
          <source src={VIDEO_SOURCES[0]} type="video/mp4" />
          <source src={VIDEO_SOURCES[1]} type="video/mp4" />
        </video>

        {/* Cinematic gradient overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071E38] via-[#071E38]/80 to-[#071E38]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#12A5B0]/20 via-transparent to-transparent" />
      </div>

      {/* Floating Audio Control (Video runs continuously, ongoing) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20 flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-105"
          title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          aria-label="Toggle audio"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#12A5B0]" />}
          <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
            {isMuted ? 'Muted' : 'Audio On'}
          </span>
        </button>
      </div>

      {/* 2. FOREGROUND CONTENT: MINIMAL WRITEUP & HIGHLY INTERACTIVE ELEMENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Clean Title & Quick Actions (Zero Fluff, Concise) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A0DBDF] tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#12A5B0]" />
              <span>Physical Handwritten Notes</span>
              <span className="text-white/40">·</span>
              <span className="text-[#FFD54A]">100 GSM Spiral</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12] font-heading">
              Code, written the way your brain{' '}
              <span className="text-[#12A5B0] inline-block">retains it.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#CED7DF] max-w-md leading-relaxed">
              Real printed notes with handwritten margin annotations, visual memory flowcharts, and zero screen fatigue.
            </p>

            {/* Quick Interactive Category Switcher (Without 'Python Simplified' box) */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] uppercase tracking-wider text-[#9DAEC0] font-semibold">
                Explore Handwritten Chapters
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map((topic, idx) => {
                  const isActive = activeTopicIndex === idx;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveTopicIndex(idx);
                        setIsFlipped(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                        isActive
                          ? 'bg-[#12A5B0] border-[#12A5B0] text-white shadow-lg shadow-[#12A5B0]/30 scale-[1.02]'
                          : 'bg-white/5 border-white/10 text-[#CED7DF] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="text-[10px] opacity-80 uppercase tracking-wider">{topic.category}</div>
                      <div className="truncate font-heading text-xs">{topic.title.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  if (targetProduct) setSelectedProductForModal(targetProduct);
                }}
                className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer text-sm font-heading hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" />
                <span>Inspect Sample Pages</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('All');
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-sm font-heading hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4 text-[#A0DBDF]" />
                <span>View All 13 Books</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Right Column: THE INTERACTIVE ELEMENT (Interactive Notebook Preview Simulator) */}
          <div className="lg:col-span-7">
            <div className="relative mx-auto max-w-xl bg-[#092340]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-left">
              
              {/* Binder Top Bar with Interactive Notebook Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFD54A]" />
                    <span className="w-3 h-3 rounded-full bg-[#12A5B0]" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-[#A0DBDF] pl-1 font-semibold">
                    {currentTopic.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHighlightActive(!highlightActive)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border ${
                      highlightActive
                        ? 'bg-[#FFD54A] text-[#071E38] border-[#FFD54A]'
                        : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'
                    }`}
                    title="Toggle highlighter pen effect"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Highlighter</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-white transition-colors cursor-pointer flex items-center gap-1"
                    title="Flip between Code & Memory Layout Diagram"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isFlipped ? 'Show Code' : 'Flip to Diagram'}</span>
                  </button>
                </div>
              </div>

              {/* Main Interactive Notebook Sheet (White Ruled Paper) */}
              <div className="mt-4 bg-[#FFFFFF] text-[#071E38] rounded-2xl p-5 sm:p-6 border border-[#CED7DF] shadow-inner relative overflow-hidden transition-all duration-300 min-h-[290px] flex flex-col justify-between">
                {/* Lined notebook paper texture */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_23px,#0B3561_24px)] opacity-[0.05] pointer-events-none [background-size:100%_24px]" />

                {/* Content Side A (Code & Margin Notes) or Side B (Visual Mental Diagram) */}
                {!isFlipped ? (
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0B3561]">
                      <span className="font-heading text-sm">{currentTopic.title}</span>
                      <span className="font-mono text-[#6D86A0] bg-[#F0F4F8] px-2 py-0.5 rounded">
                        Interactive Note Sheet
                      </span>
                    </div>

                    {/* Interactive Code Snippet Card */}
                    <div className="bg-[#071E38] text-white p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#0B3561] shadow-sm">
                      <pre className="text-[12px] leading-relaxed">
                        <code>{currentTopic.snippet.code}</code>
                      </pre>
                    </div>

                    {/* Handwritten Margin Note with Optional Highlighter Pen */}
                    <div
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        highlightActive
                          ? 'bg-[#FFD54A]/25 border-[#FFD54A] text-[#071E38]'
                          : 'bg-[#DDF3F4]/50 border-[#A0DBDF] text-[#0B3561]'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider text-[#12A5B0] mb-0.5">
                        Handwritten Margin Note:
                      </div>
                      <p className="font-medium italic leading-relaxed">
                        &ldquo;{currentTopic.snippet.marginNote}&rdquo;
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Visual Memory Diagram View */
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0B3561]">
                      <span className="font-heading text-sm">{currentTopic.snippet.visualLabel}</span>
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Visual Model
                      </span>
                    </div>

                    {/* Visual Diagram Representation */}
                    <div className="bg-[#DDF3F4]/70 border-2 border-dashed border-[#12A5B0] rounded-xl p-4 space-y-2 text-center">
                      <div className="text-xs font-mono font-bold text-[#0B3561]">
                        Visual Mental Layout Blueprint
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                        <div className="bg-white p-2 rounded-lg border border-[#CED7DF] shadow-2xs">
                          <div className="text-[#6D86A0] text-[9px]">STEP 1</div>
                          <div className="font-bold text-[#0B3561]">Push State</div>
                        </div>
                        <div className="bg-[#12A5B0] text-white p-2 rounded-lg shadow-2xs">
                          <div className="text-white/80 text-[9px]">STEP 2</div>
                          <div className="font-bold">Stack Trace</div>
                        </div>
                        <div className="bg-[#FFD54A] text-[#071E38] p-2 rounded-lg font-black shadow-2xs">
                          <div className="text-[#071E38]/70 text-[9px]">STEP 3</div>
                          <div>Aha! Base Return</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#3C5D81] pt-1 italic font-medium">
                        Every concept has dedicated hand-sketched flowcharts so you never memorize blindly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Bar inside Note */}
                <div className="relative z-10 pt-3 border-t border-[#E7EBEF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B3561] font-heading">{targetProduct.title}</span>
                    <span className="text-[#12A5B0] font-mono font-black">₹{targetProduct.salePrice}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProductForModal(targetProduct)}
                    className="text-[#12A5B0] hover:text-[#0B3561] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Inspect Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Interactive Selector Dots */}
              <div className="mt-4 flex items-center justify-between text-xs text-[#9DAEC0]">
                <div className="flex items-center gap-2">
                  <span>Topic:</span>
                  <div className="flex gap-1.5">
                    {TOPICS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveTopicIndex(i);
                          setIsFlipped(false);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeTopicIndex === i ? 'w-6 bg-[#12A5B0]' : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Jump to topic ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-[#A0DBDF]">
                  Click topics or Flip to preview actual book diagrams
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
