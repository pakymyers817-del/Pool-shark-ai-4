import React, { useState } from 'react';
import { AppState, ShotAnalysis, PlayerTarget } from './types';
import { analyzePoolShot } from './geminiService';
import { FileUpload } from './FileUpload';
import { ResultView } from './ResultView';
import { Button } from './Button';
import { Compass, Github, ShieldCheck, Target, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    file: null,
    imagePreview: null,
    isAnalyzing: false,
    result: null,
    error: null,
    showFeedback: false,
    playerTarget: null,
  });

  const handleFileSelect = (file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Do not analyze yet, waiting for target selection
    setState(prev => ({
      ...prev,
      file,
      imagePreview: previewUrl,
      isAnalyzing: false,
      result: null,
      error: null,
      playerTarget: null
    }));
  };

  const handleTargetSelect = async (target: PlayerTarget) => {
    if (!state.file) return;

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      playerTarget: target,
      error: null
    }));

    try {
      const analysis = await analyzePoolShot(state.file, target);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result: analysis
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || "An unexpected error occurred."
      }));
    }
  };

  const handleReset = () => {
    if (state.imagePreview) {
      URL.revokeObjectURL(state.imagePreview);
    }
    setState({
      file: null,
      imagePreview: null,
      isAnalyzing: false,
      result: null,
      error: null,
      showFeedback: false,
      playerTarget: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReset}>
             <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Compass className="text-slate-900 w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-white">Pool<span className="text-emerald-500">Shark</span> AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
             <a href="#" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">How it Works</a>
             <a href="#" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">About</a>
             <div className="h-4 w-px bg-slate-700"></div>
             <a href="https://github.com/google/generative-ai-js" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
               <Github className="w-5 h-5" />
             </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {state.isAnalyzing ? (
          /* Loading State */
          <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-6 animate-fade-in">
             <div className="relative">
               <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Compass className="w-8 h-8 text-emerald-500 animate-pulse" />
               </div>
             </div>
             <div className="text-center space-y-2">
               <h2 className="text-2xl font-semibold text-white">Calculating Perfect Shot...</h2>
               <p className="text-slate-400 max-w-md">Analyzing angles for {state.playerTarget === 'solids' ? 'Solids' : 'Stripes'}.</p>
             </div>
          </div>
        ) : state.result && state.imagePreview ? (
          /* Result State */
          <div className="flex-grow p-4 sm:p-8 animate-fade-in">
            <ResultView 
              imageSrc={state.imagePreview} 
              analysis={state.result} 
              onReset={handleReset} 
            />
          </div>
        ) : state.file && state.imagePreview ? (
          /* Target Selection State */
          <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
             <div className="max-w-4xl w-full mx-auto text-center space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Which balls are you targeting?</h2>
                  <p className="text-slate-400">Select your group so the AI can find the legal shots.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                   
                   {/* Solids Button */}
                   <button 
                     onClick={() => handleTargetSelect('solids')}
                     className="group relative flex flex-col items-center p-8 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 hover:bg-slate-750 transition-all duration-300 overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-xl mb-6 flex items-center justify-center relative z-10">
                        <span className="font-bold text-2xl text-white">3</span>
                        <div className="absolute top-3 left-3 w-6 h-6 bg-white opacity-20 rounded-full blur-[2px]" />
                     </div>
                     
                     <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Solids</h3>
                     <p className="text-sm text-slate-400 relative z-10">Balls 1 through 7</p>
                     <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all text-emerald-400 text-sm font-bold flex items-center">
                       Select Solids <ArrowRight className="w-4 h-4 ml-1" />
                     </div>
                   </button>

                   {/* Stripes Button */}
                   <button 
                     onClick={() => handleTargetSelect('stripes')}
                     className="group relative flex flex-col items-center p-8 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 hover:bg-slate-750 transition-all duration-300 overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     <div className="w-20 h-20 rounded-full bg-slate-100 shadow-xl mb-6 flex items-center justify-center relative overflow-hidden z-10">
                        <div className="absolute top-0 bottom-0 left-4 right-4 bg-blue-600 transform -skew-x-12" />
                        <span className="font-bold text-2xl text-slate-900 relative z-10">10</span>
                        <div className="absolute top-3 left-4 w-6 h-6 bg-white opacity-40 rounded-full blur-[2px] z-20" />
                     </div>
                     
                     <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Stripes</h3>
                     <p className="text-sm text-slate-400 relative z-10">Balls 9 through 15</p>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all text-emerald-400 text-sm font-bold flex items-center">
                       Select Stripes <ArrowRight className="w-4 h-4 ml-1" />
                     </div>
                   </button>

                </div>
                
                <button 
                  onClick={handleReset} 
                  className="text-slate-500 hover:text-slate-300 text-sm underline underline-offset-4"
                >
                  Upload a different image
                </button>
             </div>
          </div>
        ) : (
          /* Upload State (Hero) */
          <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden animate-fade-in">
             
             {/* Background Decoration */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse-slow"></div>
               <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
             </div>

             <div className="z-10 text-center max-w-2xl mx-auto space-y-8 mb-12">
               <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                   Master the Table with <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">AI Precision</span>
                 </h2>
                 <p className="text-lg text-slate-400 max-w-xl mx-auto">
                   Upload a photo of your current game. Get instant, pro-level shot recommendations tailored to the table layout.
                 </p>
               </div>
               
               <FileUpload onFileSelect={handleFileSelect} />

               {state.error && (
                 <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto flex items-start space-x-3 text-left">
                   <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="text-red-200 font-medium">Analysis Failed</p>
                     <p className="text-sm text-red-300/80">{state.error}</p>
                     <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="text-xs text-red-400 underline mt-1 hover:text-red-300">Dismiss</button>
                   </div>
                 </div>
               )}
             </div>

             {/* Features Grid */}
             <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-4">
               <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/60 transition-colors">
                  <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <Compass size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Smart Analysis</h3>
                  <p className="text-sm text-slate-400">Identifies open shots, clusters, and pockets automatically.</p>
               </div>
               <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/60 transition-colors">
                  <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-400">
                    <Target size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Visual Guides</h3>
                  <p className="text-sm text-slate-400">See the optimal path overlay directly on your table image.</p>
               </div>
               <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/60 transition-colors">
                  <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 text-purple-400">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Physics Engine</h3>
                  <p className="text-sm text-slate-400">Considers cut angles and cue ball scratch risks.</p>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-900 text-center">
        <p className="text-slate-500 text-sm">
          Powered by Google Gemini • Built for Demo Purposes
        </p>
      </footer>
    </div>
  );
};

export default App;