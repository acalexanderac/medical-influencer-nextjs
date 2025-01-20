import { GoogleGenerativeAI } from '@google/generative-ai';
import { Influencer, Claim } from '@/app/types/types';
import { statsService } from '@/services/statsService';

const genAI = new GoogleGenerativeAI('AIzaSyDkcdH6gRynNeDsyhi7z1Ic_Qmc6RAvf2Y');

function cleanJsonResponse(text: string): string {
  try {
    // Remove any markdown or extra text
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.replace(/[\u201C\u201D]/g, '"'); // Replace smart quotes
    cleaned = cleaned.replace(/[\n\r]/g, ' '); // Remove newlines
    
    // Find the first '{' and last '}'
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleaned = cleaned.slice(startIndex, endIndex + 1);
    }
    
    return cleaned.trim();
  } catch (e) {
    console.error('Error cleaning JSON response:', e);
    return text;
  }
}

export async function analyzeInfluencer(influencerName: string): Promise<Influencer | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Simplified prompt with minimal instructions
  const prompt = `Return a JSON object for ${influencerName}:
{
  "name": "${influencerName}",
  "handle": "social_media_handle",
  "platform": "YouTube",
  "followers": 1000000,
  "trustScore": 85,
  "profileImage": "",
  "claims": [
    {
      "id": "1",
      "text": "A health claim",
      "category": "Nutrition",
      "status": "Verified",
      "confidence": 90,
      "date": "2024-03-15"
    }
  ]
}`;

  let responseText = '';

  try {
    const result = await model.generateContent(prompt);
    if (!result?.response) {
      return createDefaultInfluencer(influencerName);
    }

    responseText = result.response.text();
    
    if (!responseText?.trim()) {
      return createDefaultInfluencer(influencerName);
    }

    // Enhanced JSON cleaning
    let cleanedJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Find the JSON object
    const startIndex = cleanedJson.indexOf('{');
    const endIndex = cleanedJson.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      return createDefaultInfluencer(influencerName);
    }

    cleanedJson = cleanedJson
      .slice(startIndex, endIndex + 1)
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/,\s*([}\]])/g, '$1')
      .trim();

    console.log('Cleaned JSON:', cleanedJson);
    
    try {
      const parsedData = JSON.parse(cleanedJson);
      const finalData = validateAndFixData(parsedData, influencerName);
      
      if (finalData) {
        statsService.updateStats(finalData);
      }

      return finalData;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return createDefaultInfluencer(influencerName);
    }
  } catch (e) {
    console.error('Failed to analyze influencer:', e);
    return createDefaultInfluencer(influencerName);
  }
}

function createDefaultInfluencer(name: string): Influencer {
  const defaultClaims = [
    {
      id: "1",
      text: "Regular exercise is important for health",
      category: "Fitness",
      status: "Verified",
      confidence: 90,
      date: new Date().toISOString().split('T')[0]
    }
  ];

  return {
    name: name,
    handle: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    platform: 'YouTube',
    followers: 1000000,
    trustScore: 85,
    profileImage: '',
    claims: defaultClaims as Claim[]
  };
}

function validateAndFixData(data: any, originalName: string): Influencer {
  const defaultData = createDefaultInfluencer(originalName);

  // Ensure we have valid data
  const finalData = {
    ...defaultData,
    ...data,
    // Keep original name if provided name is empty or invalid
    name: data.name || defaultData.name,
    // Ensure we have valid claims
    claims: Array.isArray(data.claims) && data.claims.length > 0 
      ? data.claims 
      : defaultData.claims
  };

  // Fix numbers
  finalData.followers = Number(finalData.followers) || defaultData.followers;
  finalData.trustScore = Number(finalData.trustScore) || defaultData.trustScore;

  // Validate and fix claims
  finalData.claims = finalData.claims.map((claim: any, index: number) => ({
    id: claim.id || String(index + 1),
    text: claim.text || defaultData.claims[0].text,
    category: isValidCategory(claim.category) ? claim.category : defaultData.claims[0].category,
    status: isValidStatus(claim.status) ? claim.status : defaultData.claims[0].status,
    confidence: Number(claim.confidence) || defaultData.claims[0].confidence,
    date: isValidDate(claim.date) ? claim.date : defaultData.claims[0].date
  }));

  return finalData;
}

function isValidCategory(category: string): boolean {
  const validCategories = ['Nutrition', 'Medicine', 'Mental Health', 'Fitness'];
  return validCategories.includes(category);
}

function isValidStatus(status: string): boolean {
  const validStatuses = ['Verified', 'Questionable', 'Debunked'];
  return validStatuses.includes(status);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function getDetailedAnalysis(claim: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a JSON generator analyzing this health claim: "${claim}"
Return ONLY a valid JSON object with no additional text, comments, or formatting.
The JSON must follow this EXACT structure:
{
  "analysis": "detailed analysis text",
  "evidenceLevel": "Strong",
  "sources": ["source1", "source2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  let responseText = '';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();
    
    const cleanedJson = cleanJsonResponse(responseText);
    
    try {
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Invalid JSON:', cleanedJson);
      return null;
    }
  } catch (e) {
    console.error('Failed to analyze claim:', e);
    console.error('Raw response:', responseText);
    return null;
  }
} 