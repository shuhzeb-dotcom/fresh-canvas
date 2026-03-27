import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [shopHovered, setShopHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [catState, setCatState] = useState<'idle' | 'typing'>('idle');
  const catStateRef = useRef<'idle' | 'typing'>('idle');
  const [descriptionLines, setDescriptionLines] = useState<string[]>(['this is a portfolio']);
  const [currentTypingLine, setCurrentTypingLine] = useState('');
  const isTypingRef = useRef(false);
  const currentTextRef = useRef('');
  const currentCharIndexRef = useRef(0);
  const currentTypingLineRef = useRef('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectListRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);
  const joinUsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const portfolioItems = [
    { name: 'about', description: 'Creative developer exploring art and technology.' },
    { name: 'work', description: 'Projects spanning installations and interfaces.' },
    { name: 'contact', description: 'Reach out to collaborate on new ideas.' },
  ];

  const poems = [
    { name: 'dream', poem: 'Pixels dance in moonlight whispers.' },
    { name: 'flow', poem: 'Rhythm pulses through the interface.' },
    { name: 'echo', poem: 'Your input creates ripples across the surface.' },
    { name: 'void', poem: 'In the darkness, possibilities gather.' },
    { name: 'storm', poem: 'Chaos beautiful and terrible.' },
  ];

  const projects = [...portfolioItems, ...poems];


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
        const text = closestProject < 3
          ? projects[closestProject].description
          : projects[closestProject].poem;
        startTyping(text);
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


  const handleProjectClick = (index: number, projectName: string) => {
    if (index < 3) {
      const slug = projectName.toLowerCase().replace(/\s+/g, '-');
      window.location.href = `/${slug}`;
    }
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

    const text = index < 3
      ? projects[index].description
      : projects[index].poem;

    startTyping(text);
  };

  const handleProjectLeave = (index: number) => {
  };


  return (
    <div className="h-screen bg-white font-mono overflow-hidden">

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
                  <div key={project.name}>
                    {index === 3 && (
                      <div className="my-6 sm:my-8 text-black text-4xl sm:text-5xl">★</div>
                    )}
                    <div className="flex items-start">
                      <div
                        ref={el => projectRefs.current[index] = el}
                        className="cursor-pointer flex-1 pointer-events-auto"
                        onClick={() => handleProjectClick(index, project.name)}
                        onMouseEnter={() => handleProjectHover(index)}
                        onMouseLeave={() => handleProjectLeave(index)}
                      >
                        <div className="text-sm sm:text-base md:text-lg xl:text-xl leading-tight font-roboto-mono break-words pointer-events-none pt-1 sm:pt-2">
                          <span
                            className={`inline-block px-1 py-0.5 ${
                              activeProject === index
                                ? 'bg-[#2414ff] text-white font-bold'
                                : 'text-black'
                            }`}
                          >
                            {project.name}
                          </span>
                        </div>
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