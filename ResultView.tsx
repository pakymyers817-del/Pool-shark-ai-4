import React, { useState, useEffect } from 'react';
import { ShotAnalysis } from './types';
import { ArrowLeft, Target, RefreshCw, ThumbsUp, ThumbsDown, Crosshair, Info } from 'lucide-react';
import { Button } from './Button';

interface ResultViewProps {
  imageSrc: string;
  analysis: ShotAnalysis;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ imageSrc, analysis, onReset }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Helper to calculate SVG line coords based on percentages
  const getLineCoords = () => {
    if (!analysis.cueBallPosition || !analysis.targetBallPosition) return null;
    
    return {
      x1: `${analysis.cueBallPosition.x}%`,
      y1: `${analysis.cueBallPosition.y}%`,
      x2: `${analysis.targetBallPosition.x}%`,
      y2: `${analysis.targetBallPosition.y}%`
    };
  };
  
  const getPocketLineCoords = () => {
      if (!analysis.targetBallPosition || !analysis.targetPocketPosition) return null;
       return {
      x1: `${analysis.targetBallPosition.x}%`,
      y1: `${analysis.targetBallPosition.y}%`,
      x2: `${analysis.targetPocketPosition.x}%`,
      y2: `${analysis.targetPocketPosition.y}%`
    };
  };

  const coords = getLineCoords();
  const pocketCoords = getPocketLineCoords();

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    console.log(`Feedback submitted: ${type}`);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'Medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'Hard': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'Expert': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Image & Overlay Section */}
      <div className="w-full lg:w-2/3 flex flex-col space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
          <img 
            src={imageSrc} 
            alt="Analyzed Pool Table" 
            className="w-full h-auto object-contain max-h-[70vh]" 
          />
          
          {/* Overlay Layer */}
          {showOverlay && (coords || pocketCoords) && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}>
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
                </marker>
                 <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
                   <circle cx="2" cy="2" r="2" fill="white" />
                 </marker>
              </defs>
              
              {/* Cue to Target Ball */}
              {coords && (
                <>
                  <line 
                    x1={coords.x1} y1={coords.y1} 
                    x2={coords.x2} y2={coords.y2} 
                    stroke="white" 
                    strokeWidth="3" 
                    strokeDasharray="8 4"
                    strokeLinecap="round"
                    markerStart="url(#dot)"
                  />
                  {/* Highlight Cue Ball */}
                  <circle cx={coords.x1} cy={coords.y1} r="1.5%" fill="rgba(255, 255, 255, 0.3)" stroke="white" strokeWidth="2" />
                </>
              )}

              {/* Target Ball to Pocket */}
              {pocketCoords && (
                <>
                   <line 
                    x1={pocketCoords.x1} y1={pocketCoords.y1} 
                    x2={pocketCoords.x2} y2={pocketCoords.y2} 
                    stroke="#10b981" 
                    strokeWidth="4" 
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Highlight Target Ball */}
                  <circle cx={pocketCoords.x1} cy={pocketCoords.y1} r="1.5%" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="2" />
                </>
              )}
            </svg>
          )}

          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              onClick={() => setShowOverlay(!showOverlay)}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              title="Toggle Overlay"
            >
              {showOverlay ? <Target size={20} /> : <Crosshair size={20} />}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 flex items-center justify-center">
            <Info size={14} className="mr-1" /> 
            Trajectory lines are AI-estimated and may not be pixel-perfect.
        </p>
      </div>

      {/* Analysis Panel */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 sticky top-6">
          <div className="flex justify-between items-start mb-4">
             <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getDifficultyColor(analysis.difficulty)}`}>
               {analysis.difficulty} Shot
             </div>
             <div className="text-slate-500 text-xs font-mono">
               Confidence: {Math.round(analysis.confidenceScore * 100)}%
             </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
            {analysis.recommendedShot}
          </h2>
          
          <div className="prose prose-invert prose-sm text-slate-300 mb-6">
            <p>{analysis.reasoning}</p>
          </div>

          <div className="h-px bg-slate-700 my-6" />

          <div className="space-y-4">
             <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Was this helpful?</h4>
             <div className="flex space-x-3">
               <button 
                onClick={() => handleFeedback('up')}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all
                  ${feedbackGiven === 'up' 
                    ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
               >
                 <ThumbsUp size={18} />
                 <span>Yes</span>
               </button>
               <button 
                onClick={() => handleFeedback('down')}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all
                  ${feedbackGiven === 'down' 
                    ? 'bg-red-900/40 border-red-500 text-red-400' 
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
               >
                 <ThumbsDown size={18} />
                 <span>No</span>
               </button>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
             <Button variant="outline" onClick={onReset} className="w-full">
               <RefreshCw size={18} className="mr-2" />
               Analyze New Table
             </Button>
          </div>
        </div>
      </div>

    </div>
  );
};