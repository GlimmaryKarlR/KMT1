import { ReactionData } from "../types";

export async function getEmergentAnalysis(reaction: ReactionData, neighborhood: ReactionData[]) {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reaction, neighborhood }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch analysis");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Analysis unavailable at this time. Please check server logs.";
  }
}
