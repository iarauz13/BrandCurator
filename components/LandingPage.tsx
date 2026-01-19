
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [titleText, setTitleText] = useState("");
  const [showSubtext, setShowSubtext] = useState(false);
  const fullTitle = "Brand Curator";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, i));
      i++;
      if (i > fullTitle.length) {
        clearInterval(interval);
        setTimeout(() => setShowSubtext(true), 600);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center 
        z-[100] text-white p-medium-lg overflow-hidden select-none"
      style={{ background: 'linear-gradient(to top, #09203f 0%, #537895 100%)' }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] 
          bg-blue-300 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] 
          bg-indigo-400 blur-[120px] rounded-full animate-pulse" 
          style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl w-full 
        py-extra-large">
        <h1 className="text-display-lg font-light italic tracking-tight 
          mb-medium-lg drop-shadow-sm min-h-[1.2em] leading-tight 
          font-display">
          {titleText}
          <span className={`inline-block w-1 h-[0.9em] bg-white ml-tight-sm 
            align-middle transition-opacity duration-300 
            ${titleText.length === fullTitle.length ? 'animate-pulse' : 'opacity-100'}`}
          ></span>
        </h1>

        <div className={`transition-all duration-1000 ease-out transform 
          ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-display-sm font-normal tracking-wide 
            text-blue-100/80 mb-large-lg max-w-md mx-auto leading-relaxed 
            font-display">
            The architect of your personal brand database. Organize, map, and 
            curate with precision.
          </p>

          <button 
            onClick={onEnter}
            className="group relative px-large-lg py-medium-lg bg-transparent 
              border border-white/30 rounded-full font-sans font-semibold 
              tracking-widest uppercase text-small overflow-hidden 
              transition-all hover:border-white active:scale-95 shadow-xl"
          >
            <span className="relative z-10 transition-colors 
              group-hover:text-blue-900">Enter Gallery</span>
            <div className="absolute inset-0 bg-white transform translate-y-full 
              transition-transform duration-300 ease-out 
              group-hover:translate-y-0"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-large-lg left-1/2 -translate-x-1/2 
        opacity-30 text-small uppercase tracking-[0.4em] font-sans 
        font-semibold">
        Established MMXXV
      </div>
    </div>
  );
};

export default LandingPage;
