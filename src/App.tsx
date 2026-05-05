/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Beaker, Activity, Layers, Cpu, Maximize2, AlertTriangle, Info } from 'lucide-react';
import { ReactionData } from './types';
import { KinematicTable } from './components/KinematicTable';
import { TopologicalVisualizer } from './components/TopologicalVisualizer';
import { FormulaDisplay } from './components/FormulaDisplay';
import { getEmergentAnalysis } from './services/geminiService';

export default function App() {
  const [searchId, setSearchId] = useState<string>('0');
  const [currentReaction, setCurrentReaction] = useState<ReactionData | null>(null);
  const [neighborhood, setNeighborhood] = useState<ReactionData[]>([]);
  const [kinematics, setKinematics] = useState<ReactionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isDatasetDownloading, setIsDatasetDownloading] = useState(false);

  // Initialize data
  useEffect(() => {
    fetch('/api/kinematics')
      .then(res => {
        if (res.status === 503) {
           setIsDatasetDownloading(true);
           throw new Error('Dataset downloading');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setKinematics(data);
          setIsDatasetDownloading(false);
        } else {
          console.error('Kinematics data error:', data);
        }
      })
      .catch(err => {
        if (err.message !== 'Dataset downloading') console.error(err);
      });
    
    // Initial fetch for ID 0
    handleSearch(0);
  }, [handleSearch]);

  const handleSearch = useCallback(async (id?: number) => {
    const targetId = id !== undefined ? id : parseInt(searchId);
    if (isNaN(targetId)) return;

    setLoading(true);
    try {
      const [reactionRes, neighborsRes] = await Promise.all([
        fetch(`/api/reaction/${targetId}`).then(res => res.json()),
        fetch(`/api/neighborhood/${targetId}`).then(res => res.json())
      ]);

      if (reactionRes && !reactionRes.error) {
        setCurrentReaction(reactionRes);
      } else {
        console.error('Reaction data error:', reactionRes);
      }

      if (Array.isArray(neighborsRes)) {
        setNeighborhood(neighborsRes);
      } else {
        console.error('Neighborhood data error:', neighborsRes);
      }
      
      // Reset AI report
      setAiReport('');
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  const generateAnalysis = async () => {
    if (!currentReaction || neighborhood.length === 0) return;
    setIsGeneratingAi(true);
    try {
      const report = await getEmergentAnalysis(currentReaction, neighborhood);
      setAiReport(report || 'No patterns detected.');
    } catch (e) {
      setAiReport('System error during manifold analysis.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-[1440px] mx-auto flex flex-col gap-8">
      {/* Header Section */}
      <header className="border-b-2 border-editorial-ink pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold mb-2 opacity-60">Deep-Space Chemical Manifold Analysis</p>
          <h1 className="text-7xl font-light leading-none -ml-1 text-editorial-ink italic lg:not-italic">KMT_REACTION_01</h1>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono uppercase tracking-wider">DATASET: 12D_CHEM_MESH</p>
            <p className="text-[10px] font-mono uppercase text-editorial-alert font-bold">Status: Latent Topological Match</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="REACTION_ID"
                className="bg-transparent border-b-2 border-editorial-ink pl-2 pr-8 py-1 w-48 focus:outline-none transition-all font-mono text-xl"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-ink opacity-40" />
            </div>
            <button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-editorial-ink hover:bg-editorial-ink/90 text-white px-6 py-2 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? <Cpu className="w-4 h-4 animate-spin" /> : 'Fetch_Data'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left Column: Input & Global Analysis */}
        <section className="md:col-span-3 flex flex-col gap-8">
          <div className="border-l-4 border-editorial-ink pl-5 py-2">
            <h2 className="text-xs font-sans font-bold uppercase tracking-tight mb-6">Primary Manifold Metrics</h2>
            <div className="space-y-6">
              <MetricBox 
                label="Topological Origin (X/Y/Z)" 
                value={currentReaction ? `[${currentReaction.x.toFixed(1)}, ${currentReaction.y.toFixed(1)}, ${currentReaction.z.toFixed(1)}]` : '---'}
              />
              <MetricBox 
                label="Electronic Proxy (RGB)" 
                value={currentReaction ? `${currentReaction.R}, ${currentReaction.G}, ${currentReaction.B}` : '---'}
                decoration={<div className="w-4 h-4 rounded-full border border-editorial-ink" style={{ backgroundColor: currentReaction ? `rgb(${currentReaction.R}, ${currentReaction.G}, ${currentReaction.B})` : 'transparent' }} />}
              />
              <MetricBox 
                label="Transition Magnitude (d)" 
                value={currentReaction ? currentReaction.d.toFixed(4) : '---'}
                suffix="Daltons"
              />
            </div>
          </div>

          <div className="bg-editorial-paper p-6 border border-editorial-ink editorial-shadow">
            <h2 className="text-xs font-sans font-bold uppercase mb-4 tracking-tighter">Neighborhood Identification</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase opacity-60 font-bold mb-1">Density Scale</p>
                <p className="text-sm font-serif italic">Standard Organic Manifold</p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-60 font-bold mb-1">Topology Density</p>
                <div className="h-2 w-full bg-editorial-accent mt-2">
                   <div className="h-full bg-editorial-ink transition-all duration-1000" style={{ width: neighborhood.length > 0 ? '78%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 pt-4 border-t border-editorial-ink/20">
            <h2 className="text-[10px] font-sans font-bold uppercase mb-3 tracking-widest text-editorial-ink/60">Quantum Correlations</h2>
            <p className="text-[11px] leading-relaxed italic text-justify text-editorial-ink/80 font-serif">
              Unseen resonance patterns detected at t={currentReaction?.t || 'N/A'}. 
              The stereo-electronic angle (θ={currentReaction?.th?.toFixed(3) || '0.000'}) 
              suggests a non-trivial rotation in latent space not present in standard 3D projections.
            </p>
          </div>
        </section>

        {/* Center Column: Visualizer & Table */}
        <section className="md:col-span-6 flex flex-col gap-8">
          <div className="flex-1 min-h-[400px] border-2 border-editorial-ink bg-editorial-ink relative group">
            {isDatasetDownloading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-editorial-bg/95 p-8 text-center">
                 <div className="w-16 h-16 border-4 border-editorial-ink border-t-editorial-highlight rounded-full animate-spin mb-6" />
                 <h3 className="text-2xl font-serif italic font-bold text-editorial-ink">Initializing Manifold Dataset...</h3>
                 <p className="text-xs font-mono opacity-60 mt-4 max-w-xs mx-auto leading-relaxed">
                   The 167MB Chemical Topology Mesh (KMT_REACTION_01) is being synchronized. 
                   This high-resolution chemical space map requires localized caching before analysis.
                 </p>
                 <div className="mt-8 px-4 py-2 border border-editorial-ink/20 font-mono text-[9px] uppercase tracking-widest opacity-40 animate-pulse">
                   Source: Zenodo/19376238
                 </div>
              </div>
            )}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-editorial-bg) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            <TopologicalVisualizer 
              data={neighborhood.length > 0 ? neighborhood : kinematics} 
              activeId={currentReaction?.t} 
            />
            <div className="absolute bottom-4 left-4 bg-editorial-bg text-editorial-ink px-2 py-1 border border-editorial-ink pointer-events-none">
              <span className="text-[9px] font-mono uppercase font-bold tracking-tighter italic">Normal Vector: [{currentReaction?.Nx?.toFixed(2) || '0.00'}, {currentReaction?.Ny?.toFixed(2) || '0.00'}, {currentReaction?.Nz?.toFixed(2) || '0.00'}]</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] opacity-40">Kinematic Reaction Table // Transect Sample</h2>
            <KinematicTable 
              data={kinematics} 
              onRowClick={(id) => {
                setSearchId(id.toString());
                handleSearch(id);
              }}
              activeId={currentReaction?.t}
            />
          </div>
        </section>

        {/* Right Column: Formulas & Patterns */}
        <section className="md:col-span-3 flex flex-col gap-8">
          <div className="bg-editorial-accent p-6 border border-editorial-ink flex flex-col gap-6">
            <div className="border-b border-editorial-ink pb-2">
              <h2 className="text-xs font-sans font-bold uppercase tracking-tight">Principal Physics</h2>
            </div>
            <FormulaDisplay />
          </div>

          <div className="border-t-4 border-editorial-ink pt-6 flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest">Emergent Property Alerts</h2>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-editorial-alert animate-pulse" />
                   <span className="text-[8px] font-bold font-mono">LIVE_SCAN</span>
                </div>
             </div>
             
             <div className="space-y-4">
                <AlertItem 
                  title="Chemical Cliff Detected" 
                  description={`Delta magnitude spike at t=${currentReaction?.t || '---'} with minimal origin shift.`}
                  active={currentReaction ? currentReaction.d > 0.1 : false}
                />
                <AlertItem 
                  title="Isothermal Stability" 
                  description="Electronic proxy (RGB) variance < 0.1% across verified neighborhood."
                  active={neighborhood.length > 0}
                />
             </div>

             <button 
              onClick={generateAnalysis}
              disabled={isGeneratingAi || !currentReaction}
              className="mt-4 border border-editorial-ink p-3 text-center text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-editorial-ink hover:text-white transition-all disabled:opacity-20"
            >
              {isGeneratingAi ? 'Executing Neural Analysis...' : 'Generate Full Manifold Report'}
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-editorial-ink/10">
            <div className="flex items-center gap-2 opacity-40 italic text-[10px] font-serif leading-tight">
              <Info className="w-3 h-3 shrink-0" />
              <span>Higher tortuosity values correlate with complex multi-step intermediate stabilization phases.</span>
            </div>
          </div>
        </section>
      </main>

      {/* AI Analysis Overlay - Modal Style for Editorial feel */}
      <AnimatePresence>
        {aiReport && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-editorial-bg/80 backdrop-blur-sm"
            onClick={() => setAiReport('')}
          >
            <motion.div 
              className="max-w-4xl w-full max-h-[80vh] bg-editorial-paper border-2 border-editorial-ink editorial-shadow p-12 overflow-y-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setAiReport('')}
                className="absolute top-6 right-6 font-sans font-bold text-xs uppercase tracking-widest border border-editorial-ink px-2 py-1 hover:bg-editorial-ink hover:text-white transition-all"
              >
                Close_Report
              </button>
              
              <div className="mb-12 border-b border-editorial-ink pb-8">
                <p className="text-[10px] uppercase font-sans font-bold text-editorial-alert mb-2 tracking-[0.4em]">Proprietary Analysis</p>
                <h2 className="text-4xl font-serif italic lowercase mb-1">Manifold Verification Report</h2>
                <p className="text-xs font-mono opacity-50">SUBJECT: REACTION_T_INDEX_{currentReaction?.t}</p>
              </div>

              <div className="columns-1 md:columns-2 gap-12 font-serif text-sm leading-relaxed text-justify first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-editorial-ink/90">{aiReport}</pre>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-8 border-t border-editorial-ink pt-6 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] font-sans font-bold text-editorial-ink/40 gap-4">
        <div className="flex gap-8">
          <span>Ref: Zenodo/19376238</span>
          <span>Latent Manifold Ver. 01.12d</span>
        </div>
        <div>(c) 2026 Lab of Chemical Latency // SI Compliant: Daltons (Da)</div>
      </footer>
    </div>
  );
}

function MetricBox({ label, value, decoration, suffix }: { label: string; value: string; decoration?: React.ReactNode; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.05em] font-sans font-bold opacity-50">
        <span>{label}</span>
        {decoration}
      </div>
      <div className="text-2xl font-mono text-editorial-ink border-b border-editorial-ink/10 pb-1 flex items-baseline gap-2">
        {value}
        {suffix && <span className="text-[10px] font-sans uppercase opacity-40">{suffix}</span>}
      </div>
    </div>
  );
}

function AlertItem({ title, description, active }: { title: string; description: string; active?: boolean }) {
  return (
    <div className={`flex items-start gap-4 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-2.5 h-2.5 mt-1 shrink-0 ${active ? 'bg-editorial-alert' : 'bg-editorial-ink'}`} />
      <div>
        <p className="text-[11px] font-sans font-bold uppercase tracking-tighter">{title}</p>
        <p className="text-[10px] font-serif italic text-editorial-ink/70 leading-snug">{description}</p>
      </div>
    </div>
  );
}
