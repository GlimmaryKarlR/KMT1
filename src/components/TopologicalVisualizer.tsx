import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ReactionData } from '../types';

interface Props {
  data: ReactionData[];
  activeId?: number;
}

export const TopologicalVisualizer: React.FC<Props> = ({ data, activeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const xExtent = d3.extent(data, (d: ReactionData) => d.x) as [number, number];
    const yExtent = d3.extent(data, (d: ReactionData) => d.y) as [number, number];

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] * 0.9, xExtent[1] * 1.1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] * 0.9, yExtent[1] * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5).tickSize(-height + margin.top + margin.bottom).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    // Points
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => xScale((d as ReactionData).x))
      .attr("cy", (d: any) => yScale((d as ReactionData).y))
      .attr("r", (d: any) => (d as ReactionData).t === activeId ? 8 : 4)
      .attr("fill", (d: any) => `rgb(${(d as ReactionData).R}, ${(d as ReactionData).G}, ${(d as ReactionData).B})`)
      .attr("stroke", (d: any) => (d as ReactionData).t === activeId ? "#DC2626" : "#F9F7F2")
      .attr("stroke-width", (d: any) => (d as ReactionData).t === activeId ? 3 : 0.5)
      .attr("opacity", (d: any) => (d as ReactionData).t === activeId ? 1 : 0.4)
      .style("cursor", "crosshair")
      .append("title")
      .text((d: any) => {
        const rd = d as ReactionData;
        return `ID: ${rd.t}\n(X,Y): ${rd.x.toFixed(2)}, ${rd.y.toFixed(2)}\nRGB: ${rd.R},${rd.G},${rd.B}`;
      });

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px");

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#8E9299")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px")
      .text("Topological Coordinate X (Molecular Weight Proxy)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#8E9299")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px")
      .text("Topological Coordinate Y (Lipophilicity Proxy)");

  }, [data, activeId]);

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex flex-col">
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.4em] mb-1">Manifold Visualization</span>
        <span className="text-xs font-serif italic text-white/90">Topological Origin (X,Y Projection)</span>
      </div>
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end opacity-40">
         <span className="text-[8px] font-mono text-white">GRID_SYS: COORDINATE_MESH_01</span>
      </div>
      <svg ref={svgRef} className="w-full h-full flex-1" />
    </div>
  );
};
