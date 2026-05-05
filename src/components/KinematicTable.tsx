import React from 'react';
import { ReactionData } from '../types';

interface Props {
  data: ReactionData[];
  onRowClick?: (id: number) => void;
  activeId?: number;
}

export const KinematicTable: React.FC<Props> = ({ data, onRowClick, activeId }) => {
  return (
    <div className="overflow-x-auto border border-editorial-ink/20 rounded-none bg-white">
      <table className="w-full text-left font-mono text-[10px] border-collapse">
        <thead className="bg-[#F4F1EA] text-editorial-ink/60 uppercase tracking-widest border-b border-editorial-ink">
          <tr>
            <th className="px-4 py-2 font-bold italic font-serif">t index</th>
            <th className="px-4 py-2">Coordinates (x,y,z)</th>
            <th className="px-4 py-2 text-center">Electronic Proxy (rgb)</th>
            <th className="px-4 py-2">Delta Magnitude (d)</th>
            <th className="px-4 py-2 italic font-serif lowercase tracking-normal">Normal [Nx,Ny,Nz]</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-editorial-accent">
          {data.map((r) => (
            <tr 
              key={r.t} 
              onClick={() => onRowClick?.(r.t)}
              className={`hover:bg-editorial-accent/50 cursor-pointer transition-colors ${activeId === r.t ? 'bg-editorial-accent font-bold' : ''}`}
            >
              <td className={`px-4 py-2 ${activeId === r.t ? 'text-editorial-alert' : 'text-editorial-ink'}`}>#{r.t}</td>
              <td className="px-4 py-2 opacity-70">
                [{r.x.toFixed(2)}, {r.y.toFixed(2)}, {r.z.toFixed(2)}]
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 border border-editorial-ink" style={{ backgroundColor: `rgb(${r.R}, ${r.G}, ${r.B})` }} />
                  <span className="opacity-60 text-[9px]">({r.R}, {r.G}, {r.B})</span>
                </div>
              </td>
              <td className="px-4 py-2 font-bold italic">
                {r.d.toFixed(4)} Da
              </td>
              <td className="px-4 py-2 opacity-40">
                [{r.Nx.toFixed(2)}, {r.Ny.toFixed(2)}, {r.Nz.toFixed(2)}]
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
