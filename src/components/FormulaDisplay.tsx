import React from 'react';

export const FormulaDisplay: React.FC = () => {
  return (
    <div className="space-y-6 font-mono">
      <div className="space-y-6 text-[11px]">
        <div>
          <p className="opacity-40 uppercase tracking-widest mb-1 font-sans font-bold text-editorial-ink">Manifold Distance (d)</p>
          <code className="text-editorial-ink font-bold text-sm block border-b border-editorial-ink/10 pb-1">d = √( Δx² + Δy² + Δz² )</code>
          <p className="text-[10px] text-editorial-ink/60 mt-2 italic font-serif leading-tight">Euclidean displacement in latent chemical space (Da/mol scale).</p>
        </div>

        <div>
           <p className="opacity-40 uppercase tracking-widest mb-1 font-sans font-bold text-editorial-ink">Transformation Vector (⃗N)</p>
          <code className="text-editorial-ink font-bold text-sm block border-b border-editorial-ink/10 pb-1">N⃗ = [Nx, Ny, Nz]</code>
          <p className="text-[10px] text-editorial-ink/60 mt-2 italic font-serif leading-tight">Directional vector of the transformation manifold path.</p>
        </div>

        <div>
           <p className="opacity-40 uppercase tracking-widest mb-1 font-sans font-bold text-editorial-ink">Topological Tortuosity</p>
          <code className="text-editorial-ink font-bold text-sm block border-b border-editorial-ink/10 pb-1">τ = Σ|dᵢ| / (d_start-end)</code>
          <p className="text-[10px] text-editorial-ink/60 mt-2 italic font-serif leading-tight">Topological deviation factor based on stereoelectronic angle θ.</p>
        </div>
      </div>
    </div>
  );
};
