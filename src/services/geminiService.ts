import { GoogleGenAI } from "@google/genai";
import { ReactionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getEmergentAnalysis(reaction: ReactionData, neighborhood: ReactionData[]) {
  const prompt = `
    Analyze this chemical reaction manifold coordinate:
    Target Reaction: ${JSON.stringify(reaction)}
    
    Neighborhood Context (100 sequential steps):
    ${JSON.stringify(neighborhood.filter((_, i) => i % 10 === 0))}
    
    Context: This dataset represents a 12D manifold projection of ~1.44 million chemical reactions.
    Coordinates (x,y,z) are Topological Origins (MW, LogP, Surface Area).
    Electronic Proxy (RGB) represents Heteroatom count (R), Ring count (G), and Reagent complexity (B).
    Transition normal (Nx,Ny,Nz) and Magnitude (d) describe the chemical transformation.
    
    Tasks:
    1. Identify "Chemical Cliffs": Look for spikes in magnitude (d) relative to coordinate changes.
    2. Pattern Recognition: Check if RGB remains constant while topology changes (Isothermal Clusters).
    3. Quantum Correlations: Speculate on latent correlations between stereoelectronic angle (th) and transformation magnitude (d).
    4. Classification: Is this neighborhood "Dense" (Standard Chemistry) or "Sparse" (Atypical/High-Energy)?
    
    Format the response as a detailed scientific technical report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analysis unavailable at this time.";
  }
}
