import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [joinUsHovered, setJoinUsHovered] = useState(false);
  const [shopHovered, setShopHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [catState, setCatState] = useState<'idle' | 'typing'>('idle');
  const catStateRef = useRef<'idle' | 'typing'>('idle');
  const [descriptionLines, setDescriptionLines] = useState<string[]>(['an archive for all our stuff']);
  const [currentTypingLine, setCurrentTypingLine] = useState('');
  const isTypingRef = useRef(false);
  const currentTextRef = useRef('');
  const currentCharIndexRef = useRef(0);
  const currentTypingLineRef = useRef('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const joinUsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectListRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);


  const projects = [
    { id: '001', name: 'TOMB OF YOUR LOVED ONES', description: 'You are a mosaic of everyone you have ever loved' },
    { id: '002', name: 'BULLYING BRODY', description: 'Fame don\'t unlame you' },
    { id: '003', name: '', description: 'click the button' },
    { id: '004', name: 'PROJECT NEBULA', description: 'Exploring the depths of digital consciousness through interactive media.' },
    { id: '005', name: 'PROJECT WHISPER', description: 'A haunting journey into the silence between sounds.' },
    { id: '006', name: 'PROJECT MIRROR', description: 'Reflections of reality distorted through algorithmic perception.' },
    { id: '007', name: 'PROJECT ECHO', description: 'Reverberations of forgotten memories in digital space.' },
    { id: '008', name: 'PROJECT FLUX', description: 'Constant transformation through generative art systems.' },
    { id: '009', name: 'PROJECT VOID', description: 'Embracing emptiness as a canvas for infinite possibility.' },
    { id: '010', name: 'PROJECT PULSE', description: 'Rhythmic patterns that synchronize with human heartbeats.' },
    { id: '011', name: 'PROJECT DRIFT', description: 'Wandering through landscapes of procedural generation.' },
    { id: '012', name: 'PROJECT BLOOM', description: 'Organic growth patterns emerging from digital soil.' },
    { id: '013', name: 'PROJECT STORM', description: 'Chaotic beauty captured in real-time weather simulations.' },
    { id: '014', name: 'PROJECT CRYSTAL', description: 'Geometric perfection meets organic imperfection.' },
    { id: '015', name: 'PROJECT SHADOW', description: 'Light and darkness dancing in perpetual motion.' },
    { id: '016', name: 'PROJECT WAVE', description: 'Fluid dynamics translated into visual poetry.' },
    { id: '017', name: 'PROJECT SPARK', description: 'Moments of inspiration captured in interactive installations.' },
    { id: '018', name: 'PROJECT MAZE', description: 'Lost pathways leading to unexpected discoveries.' },
    { id: '019', name: 'PROJECT FROST', description: 'Crystalline structures forming in digital winter.' },
    { id: '020', name: 'PROJECT EMBER', description: 'Dying flames that refuse to be extinguished.' },
    { id: '021', name: 'PROJECT TIDE', description: 'Oceanic movements controlled by lunar algorithms.' },
    { id: '022', name: 'PROJECT PRISM', description: 'Light refracted through computational geometry.' },
    { id: '023', name: 'PROJECT DUST', description: 'Particles of memory scattered across virtual landscapes.' },
    { id: '024', name: 'PROJECT WIND', description: 'Invisible forces made visible through motion graphics.' },
    { id: '025', name: 'PROJECT STONE', description: 'Ancient wisdom encoded in modern interfaces.' },
    { id: '026', name: 'PROJECT FLAME', description: 'Passionate expressions burning through digital mediums.' },
    { id: '027', name: 'PROJECT MIST', description: 'Ethereal atmospheres that blur reality and fiction.' },
    { id: '028', name: 'PROJECT THORN', description: 'Beautiful dangers hidden in interactive experiences.' },
    { id: '029', name: 'PROJECT SILK', description: 'Delicate threads weaving complex narrative structures.' },
    { id: '030', name: 'PROJECT RUST', description: 'Decay and renewal in perpetual digital cycles.' },
    { id: '031', name: 'PROJECT GLASS', description: 'Transparent barriers between observer and observed.' },
    { id: '032', name: 'PROJECT CLAY', description: 'Malleable forms shaped by user interaction.' },
    { id: '033', name: 'PROJECT SMOKE', description: 'Ephemeral traces of digital presence.' },
    { id: '034', name: 'PROJECT PEARL', description: 'Hidden treasures discovered through exploration.' },
    { id: '035', name: 'PROJECT THORN', description: 'Sharp contrasts in soft digital environments.' },
    { id: '036', name: 'PROJECT MOSS', description: 'Slow growth patterns in accelerated time.' },
    { id: '037', name: 'PROJECT STEEL', description: 'Industrial strength meets artistic sensitivity.' },
    { id: '038', name: 'PROJECT HONEY', description: 'Sweet interactions that stick in memory.' },
    { id: '039', name: 'PROJECT STORM', description: 'Turbulent emotions visualized through data.' },
    { id: '040', name: 'PROJECT DAWN', description: 'New beginnings emerging from digital darkness.' },
  ];


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || !projectListRef.current) return;

    const handleScroll = () => {
      if (!projectListRef.current) return;

      // Mark that user has scrolled
      if (!hasScrolledRef.current) {
        hasScrolledRef.current = true;
      }

      const container = projectListRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestProject = null;
      let closestDistance = Infinity;

      projectRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const projectCenter = rect.top + rect.height / 2;
          const distance = Math.abs(projectCenter - containerCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestProject = index;
          }
        }
      });

      if (closestProject !== null && closestProject !== activeProject) {
        setActiveProject(closestProject);

        // Trigger typing animation on mobile
        const description = projects[closestProject].description;
        startTyping(description);

        // Handle JOIN US hover state
        if (closestProject === 2) {
          setJoinUsHovered(true);
          setHoveredProject(closestProject);
        } else {
          setJoinUsHovered(false);
          setHoveredProject(null);
        }
      }
    };

    const container = projectListRef.current;
    container.addEventListener('scroll', handleScroll);

    // Don't call handleScroll on mount - wait for user to scroll

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobile, activeProject]);

  useEffect(() => {
    let scrollTarget = 0;
    let animationFrame: number | null = null;

    const smoothScroll = () => {
      if (!projectListRef.current) return;

      const current = projectListRef.current.scrollTop;
      const diff = scrollTarget - current;

      // Smoother easing with 8% interpolation
      if (Math.abs(diff) > 0.1) {
        projectListRef.current.scrollTop = current + diff * 0.08;
        animationFrame = requestAnimationFrame(smoothScroll);
      } else {
        projectListRef.current.scrollTop = scrollTarget;
        animationFrame = null;
      }
    };

    const handleGlobalScroll = (e: WheelEvent) => {
      e.preventDefault();

      if (projectListRef.current) {
        // Update target scroll position - slower multiplier
        scrollTarget += e.deltaY * 0.4;

        // Clamp to valid scroll range
        const maxScroll = projectListRef.current.scrollHeight - projectListRef.current.clientHeight;
        scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));

        // Start smooth scrolling if not already running
        if (animationFrame === null) {
          animationFrame = requestAnimationFrame(smoothScroll);
        }
      }
    };

    // Initialize scroll target
    if (projectListRef.current) {
      scrollTarget = projectListRef.current.scrollTop;
    }

    // Add wheel event listener to the entire document
    document.addEventListener('wheel', handleGlobalScroll, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleGlobalScroll);
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (joinUsHoverTimeoutRef.current) {
        clearTimeout(joinUsHoverTimeoutRef.current);
      }
    };
  }, []);

  const handleProjectClick = (projectId: string, projectName: string) => {
    const slug = projectName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/${projectId}-${slug}`;
  };

  const transitionToTyping = () => {
    if (catStateRef.current === 'idle') {
      setCatState('typing');
      catStateRef.current = 'typing';
    }
  };

  const transitionToIdle = () => {
    if (catStateRef.current === 'typing') {
      setCatState('idle');
      catStateRef.current = 'idle';
    }
  };

  const typeNextCharacter = () => {
    const MAX_LINE_WIDTH = 45;

    if (currentCharIndexRef.current >= currentTextRef.current.length) {
      // Finished typing - just stop, leave the last line where it is
      isTypingRef.current = false;
      transitionToIdle();
      return;
    }

    const prevLine = currentTypingLineRef.current;
    const isFirstWord = prevLine === '' && currentCharIndexRef.current === 0;

    if (isFirstWord) {
      // Type entire first word at once
      const firstSpaceIndex = currentTextRef.current.indexOf(' ');
      const firstWord = firstSpaceIndex > -1
        ? currentTextRef.current.substring(0, firstSpaceIndex + 1)
        : currentTextRef.current;

      currentCharIndexRef.current = firstWord.length;
      currentTypingLineRef.current = firstWord;
      setCurrentTypingLine(firstWord);

      transitionToTyping();

      // Schedule next character
      typingTimeoutRef.current = setTimeout(typeNextCharacter, 15);
      return;
    }

    // Skip leading spaces after a line wrap
    if (prevLine === '' && currentTextRef.current[currentCharIndexRef.current] === ' ') {
      currentCharIndexRef.current++;
      typingTimeoutRef.current = setTimeout(typeNextCharacter, 15);
      return;
    }

    const currentChar = currentTextRef.current[currentCharIndexRef.current];

    // CRITICAL: Always check if the next word will fit BEFORE typing anything
    // Don't skip this check - we need it every time!
    if (prevLine.trim() !== '') {
      // Find the next word (skip any immediate spaces first)
      let lookAheadIndex = currentCharIndexRef.current;

      // Skip spaces to find the next word
      while (lookAheadIndex < currentTextRef.current.length && currentTextRef.current[lookAheadIndex] === ' ') {
        lookAheadIndex++;
      }

      // Now find the end of that word
      let wordEndIndex = lookAheadIndex;
      while (wordEndIndex < currentTextRef.current.length && currentTextRef.current[wordEndIndex] !== ' ') {
        wordEndIndex++;
      }

      // If there's a word ahead, check if it would fit on the current line
      if (lookAheadIndex < currentTextRef.current.length) {
        const upcomingWord = currentTextRef.current.substring(lookAheadIndex, wordEndIndex);

        // Calculate what the line would look like with the space(s) + word
        const spacesBeforeWord = currentTextRef.current.substring(currentCharIndexRef.current, lookAheadIndex);
        const lineWithSpacesAndWord = prevLine + spacesBeforeWord + upcomingWord;

        // If adding this word (with its preceding space) would exceed the limit, wrap NOW
        if (lineWithSpacesAndWord.length > MAX_LINE_WIDTH) {
          setDescriptionLines(lines => [...lines, prevLine.trim()]);
          currentTypingLineRef.current = '';
          setCurrentTypingLine('');

          // Don't consume a character, just schedule the next call
          typingTimeoutRef.current = setTimeout(typeNextCharacter, 15);
          return;
        }
      }
    }

    // Type next character
    currentCharIndexRef.current++;
    const newChar = currentTextRef.current[currentCharIndexRef.current - 1];
    const newLine = prevLine + newChar;

    currentTypingLineRef.current = newLine;
    setCurrentTypingLine(newLine);

    // Schedule next character
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 15);
  };

  const startTyping = (text: string) => {
    // Stop current typing if any
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Press enter on current line if it exists (save the current value before clearing)
    const lineToSave = currentTypingLineRef.current;
    if (lineToSave) {
      setDescriptionLines(prev => [...prev, lineToSave]);
    }

    // Start new text
    currentTypingLineRef.current = '';
    setCurrentTypingLine('');
    isTypingRef.current = true;
    currentTextRef.current = text;
    currentCharIndexRef.current = 0;

    typeNextCharacter();
  };

  const handleProjectHover = (index: number) => {
    setActiveProject(index);

    const description = projects[index].description;

    // Start typing new description
    startTyping(description);

    if (index === 2) {
      if (joinUsHoverTimeoutRef.current) {
        clearTimeout(joinUsHoverTimeoutRef.current);
      }
      setJoinUsHovered(true);
      setHoveredProject(index);
    }
  };

  const handleProjectLeave = (index: number) => {
    if (index === 2) {
      // Add a small delay before hiding JOIN US to prevent blinking
      if (joinUsHoverTimeoutRef.current) {
        clearTimeout(joinUsHoverTimeoutRef.current);
      }
      joinUsHoverTimeoutRef.current = setTimeout(() => {
        setJoinUsHovered(false);
        setHoveredProject(null);
      }, 100);
    }
  };


  const handleJoinUsClick = () => {
    setShowEmailForm(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    console.log('Email submitted:', email);
    setShowEmailForm(false);
    setEmail('');
  };



  return (
    <div className="h-screen bg-white font-mono overflow-hidden">
      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg max-w-sm sm:max-w-md w-full mx-4">
            <h2 className="text-lg sm:text-xl font-mono mb-4">JOIN US</h2>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded mb-4 font-mono text-sm sm:text-base"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white p-2 sm:p-3 rounded font-mono hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  SUBMIT
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 border border-gray-300 p-2 sm:p-3 rounded font-mono hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="h-full flex items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none z-20">
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b from-white via-white/95 via-white/80 via-white/60 via-white/40 via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-white via-white/95 via-white/80 via-white/60 via-white/40 via-white/20 to-transparent"></div>
        </div>

        {/* Description container - centered left of project list on desktop, centered on mobile */}
        <div className="fixed left-[5%] sm:left-1/2 bottom-[55%] z-10 w-[180px] sm:w-[240px] h-[60vh] overflow-hidden sm:translate-x-[-280px]">
          <div className="flex flex-col items-start justify-end h-full" style={{ lineHeight: '1.5' }}>
            {descriptionLines.map((line, index) => (
              <div
                key={`${index}-${line}`}
                className="text-black text-xs sm:text-base text-left font-jetbrains-mono"
              >
                {line}
              </div>
            ))}
            {currentTypingLine && (
              <div
                className="text-black text-xs sm:text-base text-left font-jetbrains-mono"
              >
                {currentTypingLine}
              </div>
            )}
          </div>
        </div>

        {/* Shop button - horizontal on mobile, vertical on desktop */}
        <div className="fixed left-[5%] top-[45%] z-10 w-[160px] sm:hidden mt-1">
          <button className="w-full border border-gray-300 text-black py-2 font-jetbrains-mono text-xs hover:border-gray-400 transition-colors">
            SHOP
          </button>
        </div>

        {/* Shop button - thin vertical bar on desktop with pull tab */}
        <div className="hidden sm:block fixed left-0 top-0 h-screen z-30">
          <button
            onMouseEnter={() => setShopHovered(true)}
            onMouseLeave={() => setShopHovered(false)}
            className="h-full w-2 hover:w-3 transition-all relative"
            style={{
              backgroundColor: '#2414ff',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              className="absolute left-full top-1/2 -translate-y-1/2 bg-[#2414ff] text-white text-2xl px-2.5 py-3 rounded-r"
              style={{ fontFamily: 'Futura, sans-serif', letterSpacing: '0.1em' }}
            >
              <span className="flex flex-col gap-0">
                <span>S</span>
                <span>H</span>
                <span>O</span>
                <span>P</span>
              </span>
            </div>
          </button>
        </div>

        <div className="absolute left-1/2 transform translate-x-0 pl-3 sm:pl-4 md:pl-5 pr-8 sm:pr-0">
          <div className="w-44 sm:w-60 md:w-80 lg:w-96 xl:w-[500px]">
            <div
              ref={projectListRef}
              className="h-screen overflow-y-scroll scrollbar-hide relative z-10 pointer-events-none"
              style={{ paddingTop: '65vh' }}
            >
              <div className="space-y-1 sm:space-y-2 pb-[32rem] md:pb-[32rem] lg:pb-[40rem] xl:pb-[48rem] 2xl:pb-[56rem]">
                {projects.map((project, index) => (
                  <div className="flex items-start" key={project.id}>
                    <div
                      className="w-8 sm:w-10 md:w-12 xl:w-16 flex-shrink-0 text-black text-sm sm:text-base md:text-lg xl:text-xl leading-tight font-jetbrains-mono pt-1.5 sm:pt-2.5 pointer-events-none"
                      style={{ WebkitTextStroke: '1px black' }}
                    >
                      {project.id}
                    </div>
                    
                    <div
                      ref={el => projectRefs.current[index] = el}
                      className="cursor-pointer flex-1 pointer-events-auto"
                      onClick={() => index === 2 ? handleJoinUsClick() : handleProjectClick(project.id, project.name)}
                      onMouseEnter={() => handleProjectHover(index)}
                      onMouseLeave={() => handleProjectLeave(index)}
                    >
                      <div className="text-sm sm:text-base md:text-lg xl:text-xl leading-tight font-roboto-mono break-words pointer-events-none pt-1 sm:pt-2">
                        {index !== 2 ? (
                          <span
                            className={`inline-block px-1 py-0.5 ${
                              activeProject === index
                                ? 'bg-[#2414ff] text-white font-bold'
                                : 'text-black'
                            }`}
                          >
                            {project.name}
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-1 py-0.5 ${
                              activeProject === index
                                ? 'bg-[#2414ff] text-white font-bold'
                                : 'text-black'
                            }`}
                          >
                            {joinUsHovered && hoveredProject === index ? 'JOIN US' : '---'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed z-30 left-[5%] sm:left-[24%] md:left-[26%] lg:left-[28%] xl:left-[30%] 2xl:left-[32%]"
          style={{ top: 'calc(60% + 56px)' }}>
          <div className="relative w-[60vw] h-[60vw] sm:w-52 sm:h-52 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80"
            style={{ maxWidth: 'min(300px, calc(50vw - 5%))', maxHeight: 'min(300px, calc(50vw - 5%))' }}>
            <img
              src={shopHovered ? '/shop.gif' : `/${catState}.gif`}
              alt="Cat animation"
              className="w-full h-full object-contain scale-150"
              style={{ transformOrigin: 'center center' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;