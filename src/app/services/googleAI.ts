import { GoogleGenerativeAI } from '@google/generative-ai';
import { Influencer, Claim } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { statsService } from './statsService';

const genAI = new GoogleGenerativeAI('AIzaSyDkcdH6gRynNeDsyhi7z1Ic_Qmc6RAvf2Y');

function validateInfluencerData(data: any): boolean {
  return (
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    typeof data.handle === 'string' &&
    typeof data.platform === 'string' &&
    typeof data.followers === 'number' &&
    typeof data.trustScore === 'number' &&
    Array.isArray(data.claims) &&
    data.claims.every((claim: any) =>
      typeof claim.text === 'string' &&
      typeof claim.category === 'string' &&
      typeof claim.status === 'string' &&
      typeof claim.confidence === 'number'
    )
  );
}

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Find the first '{' and last '}'
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1) {
    cleaned = cleaned.slice(startIndex, endIndex + 1);
  }
  
  return cleaned.trim();
}

export async function analyzeInfluencer(influencerName: string): Promise<Influencer | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analyze the health influencer "${influencerName}" and return ONLY a JSON object (no markdown, no explanation) with this exact structure:
    {
      "name": "Full Name",
      "handle": "social media handle",
      "platform": "primary platform (Instagram/YouTube/Twitter)",
      "followers": number,
      "trustScore": number between 0-100,
      "profileImage": "profile image URL if available",
      "claims": [
        {
          "text": "exact health claim quote",
          "category": "Nutrition" or "Medicine" or "Mental Health" or "Fitness",
          "status": "Verified" or "Questionable" or "Debunked",
          "confidence": number between 0-100,
          "source": "verification source if available",
          "date": "approximate date"
        }
      ]
    }`;

  let responseText = '';
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();
    
    const cleanedJson = cleanJsonResponse(responseText);
    const parsedData = JSON.parse(cleanedJson);
    
    if (!validateInfluencerData(parsedData)) {
      console.error('Invalid data format received from AI');
      return null;
    }

    // Ensure each claim has a unique ID
    parsedData.claims = parsedData.claims.map((claim: Claim) => ({
      ...claim,
      id: claim.id || uuidv4()
    }));

    if (parsedData) {
      // Update stats when successfully analyzing an influencer
      statsService.updateStats(parsedData);
    }

    return parsedData;
  } catch (e) {
    console.error('Failed to analyze influencer:', e);
    console.error('AI Response:', responseText);
    return null;
  }
}

export async function getDetailedAnalysis(claim: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analyze this health claim and return ONLY a JSON object (no markdown, no explanation): "${claim}"
    {
      "analysis": "detailed analysis text",
      "evidenceLevel": "Strong" or "Moderate" or "Weak" or "None",
      "sources": ["list of scientific sources"],
      "recommendations": ["key takeaways or recommendations"]
    }`;

  let responseText = '';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();
    
    const cleanedJson = cleanJsonResponse(responseText);
    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error('Failed to analyze claim:', e);
    console.error('AI Response:', responseText);
    return null;
  }
} 