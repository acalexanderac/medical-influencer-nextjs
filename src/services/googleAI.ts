import { GoogleGenerativeAI } from '@google/generative-ai';
import { Influencer, Claim, DetailedAnalysis } from '@/app/types/types';
import { statsService } from '@/services/statsService';

if (!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY);

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

  const prompt = `Analyze ${influencerName} and provide their most significant health/science claims. Return as JSON:
{
  "name": "${influencerName}",
  "handle": "their actual social media handle",
  "platform": "their main platform (YouTube, Instagram, etc)",
  "followers": actual_follower_count,
  "trustScore": score_based_on_credentials_and_accuracy,
  "profileImage": "",
  "claims": [
    {
      "text": "Specific claim they made (e.g. 'Morning sunlight exposure improves sleep quality')",
      "category": "Sleep/Nutrition/Fitness/Mental Health/Neuroscience",
      "status": "Verified/Questionable/Debunked",
      "confidence": rating_from_0_to_100,
      "date": "2024-03-15",
      "analysis": {
        "summary": "Brief 1-2 sentence summary of the analysis",
        "methodology": "How this claim was verified",
        "evidence": [
          {
            "source": "Title of scientific paper or study",
            "link": "URL to the source if available",
            "description": "Brief description of the evidence"
          }
        ],
        "limitations": ["List of important caveats or limitations"],
        "conclusion": "Detailed scientific conclusion",
        "expertOpinions": [
          {
            "expert": "Expert name and credentials",
            "opinion": "What they say about this claim"
          }
        ],
        "references": [
          {
            "title": "Reference title",
            "authors": "Authors",
            "publication": "Journal/Publication",
            "year": "Publication year",
            "link": "DOI or URL"
          }
        ]
      }
    }
  ]
}

For ${influencerName}, provide detailed scientific analysis for each claim, including:
1. Direct quotes or paraphrased statements from their content
2. Scientific evidence supporting or refuting each claim
3. Expert opinions and consensus
4. Links to peer-reviewed research where available
5. Clear explanations of the science behind each claim`;

  try {
    const result = await model.generateContent(prompt);
    if (!result?.response) {
      console.error('No response from AI model');
      return createDefaultInfluencer(influencerName);
    }

    const responseText = result.response.text();
    console.log('Raw AI response:', responseText); // Add logging
    
    if (!responseText?.trim()) {
      console.error('Empty response from AI model');
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
      console.log('Parsed data before validation:', parsedData); // Add logging
      
      // Check if claims exist and have required properties
      if (!parsedData.claims || !Array.isArray(parsedData.claims) || parsedData.claims.length === 0) {
        console.error('No claims found in response, using default');
        return createDefaultInfluencer(influencerName);
      }

      const finalData = validateAndFixData(parsedData, influencerName);
      console.log('Final validated data:', finalData); // Add logging
      
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
  const defaultClaims: Claim[] = [
    {
      id: 1,
      text: "Regular exercise is important for health",
      category: "Fitness",
      status: "Verified",
      confidence: 90,
      date: new Date().toISOString(),
      analysis: {
        summary: "Well-established scientific consensus",
        methodology: "Scientific literature review",
        evidence: [{
          source: "World Health Organization Guidelines",
          link: "https://www.who.int/health-topics/physical-activity",
          description: "WHO recommendations on physical activity"
        }],
        limitations: ["Individual fitness levels may vary"],
        conclusion: "Based on extensive research and global health guidelines",
        expertOpinions: [],
        references: [{
          title: "WHO Guidelines on Physical Activity",
          authors: "World Health Organization",
          publication: "WHO",
          year: "2020",
          link: "https://www.who.int/publications/i/item/9789240015128"
        }]
      },
      influencer: {
        id: 1,
        name: name,
        handle: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        platform: 'YouTube',
        trustScore: 85
      }
    }
  ];

  return {
    name: name,
    handle: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    platform: 'YouTube',
    followers: 1000000,
    trustScore: 85,
    profileImage: '',
    claims: defaultClaims
  };
}

function validateAndFixData(data: any, originalName: string): Influencer {
  const defaultData = createDefaultInfluencer(originalName);

  const finalData = {
    ...defaultData,
    ...data,
    name: data.name || defaultData.name,
    claims: Array.isArray(data.claims) && data.claims.length > 0 
      ? data.claims.map((claim: any, index: number) => ({
          id: index + 1,
          text: claim.text || defaultData.claims[0].text,
          category: isValidCategory(claim.category) ? claim.category : defaultData.claims[0].category,
          status: isValidStatus(claim.status) ? claim.status : defaultData.claims[0].status,
          confidence: Number(claim.confidence) || defaultData.claims[0].confidence,
          date: isValidDate(claim.date) ? claim.date : new Date().toISOString(),
          analysis: {
            summary: claim.analysis?.summary || "Analysis based on available evidence",
            methodology: claim.analysis?.methodology || "Scientific literature review",
            evidence: Array.isArray(claim.analysis?.evidence) 
              ? claim.analysis.evidence.map((e: any) => ({
                  source: e.source || "Scientific study",
                  link: e.link || "",
                  description: e.description || "Supporting evidence"
                }))
              : [{
                  source: "Scientific literature",
                  link: "",
                  description: "General scientific consensus"
                }],
            limitations: Array.isArray(claim.analysis?.limitations)
              ? claim.analysis.limitations
              : ["Individual results may vary"],
            conclusion: claim.analysis?.conclusion || "Based on current scientific understanding",
            expertOpinions: Array.isArray(claim.analysis?.expertOpinions)
              ? claim.analysis.expertOpinions
              : [],
            references: Array.isArray(claim.analysis?.references)
              ? claim.analysis.references
              : []
          },
          influencer: {
            id: index + 1,
            name: originalName,
            handle: data.handle || originalName.toLowerCase().replace(/[^a-z0-9]/g, ''),
            platform: data.platform || 'YouTube',
            trustScore: Number(data.trustScore) || 85
          }
        }))
      : defaultData.claims
  };

  return finalData;
}

function isValidCategory(category: string): boolean {
  const validCategories = [
    'Sleep', 
    'Neuroscience', 
    'Mental Health', 
    'Fitness', 
    'Nutrition', 
    'Hormones',
    'Performance',
    'Behavior'
  ];
  return validCategories.includes(category);
}

function isValidStatus(status: string): boolean {
  const validStatuses = ['Verified', 'Questionable', 'Debunked'];
  return validStatuses.includes(status);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function getDetailedAnalysis(claim: string): Promise<DetailedAnalysis | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analyze this health claim with scientific rigor: "${claim}"
Return a JSON object with this structure:
{
  "analysis": "detailed scientific analysis",
  "evidenceLevel": "None" | "Weak" | "Moderate" | "Strong" (based on these criteria:
    - None: No scientific evidence or studies support the claim
    - Weak: Limited or conflicting evidence, mostly anecdotal
    - Moderate: Some peer-reviewed studies support it, but more research needed
    - Strong: Multiple high-quality studies consistently support the claim),
  "sources": [
    "Include at least 2-3 specific scientific sources here",
    "Example: 'World Health Organization (WHO) Report on Cancer Risk Factors, 2022'",
    "Example: 'Journal of Clinical Nutrition, Study on Red Meat Consumption, 2023'",
    "Must include real, verifiable scientific sources"
  ],
  "recommendations": [
    "List 2-3 evidence-based recommendations",
    "Be specific and actionable"
  ]
}

Requirements:
1. ALWAYS include at least 2 specific scientific sources
2. Sources must be real and verifiable (WHO, NIH, major medical journals, etc.)
3. Be conservative with evidence levels
4. Default to "None" or "Weak" if evidence is limited
5. Only use "Strong" when there are multiple peer-reviewed studies
6. Be clear about limitations and uncertainties
7. Recommendations must be based on available evidence`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const cleanedJson = cleanJsonResponse(responseText);
    
    try {
      const parsed = JSON.parse(cleanedJson);
      
      // Validar el nivel de evidencia
      if (parsed.analysis.toLowerCase().includes("no evidence") || 
          parsed.analysis.toLowerCase().includes("no scientific evidence") ||
          parsed.analysis.toLowerCase().includes("no credible evidence")) {
        parsed.evidenceLevel = "None";
      }

      // Asegurar que siempre haya fuentes
      if (!parsed.sources || parsed.sources.length === 0) {
        parsed.sources = [
          "World Health Organization (WHO) Guidelines",
          "National Institutes of Health (NIH) Research Database",
          "PubMed Central - Systematic Reviews"
        ];
      }

      // Asegurar que siempre haya recomendaciones
      if (!parsed.recommendations || parsed.recommendations.length === 0) {
        parsed.recommendations = [
          "Consult with healthcare professionals for personalized advice",
          "Refer to evidence-based medical guidelines",
          "Consider multiple reliable sources before making health decisions"
        ];
      }

      return {
        analysis: parsed.analysis,
        evidenceLevel: parsed.evidenceLevel,
        sources: parsed.sources,
        recommendations: parsed.recommendations
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return {
        analysis: "Could not analyze the claim properly.",
        evidenceLevel: "None",
        sources: [
          "World Health Organization (WHO) Guidelines",
          "National Institutes of Health (NIH) Research Database"
        ],
        recommendations: [
          "Consult with healthcare professionals for accurate information",
          "Refer to evidence-based medical guidelines"
        ]
      };
    }
  } catch (e) {
    console.error('Failed to analyze claim:', e);
    return null;
  }
} 