import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  // Use window.process or standard process to find the injected API_KEY
  const apiKey = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please ensure it is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const extractBase64 = (dataUrl: string) => dataUrl.split(',')[1] || dataUrl;

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateImageFromText = async (prompt: string, style: string, size: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [{ text: `Create a professional ${style} of: ${prompt}. Aspect ratio ${size}.` }] },
  });
  
  // Find the image part in candidates
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part?.inlineData?.data) {
    throw new Error("Failed to generate image. Please try a different prompt.");
  }
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const styleTransform = async (imgDataUrl: string, style: string, refinePrompt?: string) => {
  const ai = getAI();
  const base64 = extractBase64(imgDataUrl);
  
  const instruction = refinePrompt 
    ? `Re-render this image in ${style} style. Additional styling details: ${refinePrompt}. Preserve the exact subject pose and structure. Change ONLY visual aesthetic. No extra objects.`
    : `Re-render this image in ${style} style. Preserve the exact subject pose and structure. Change ONLY visual aesthetic. No extra objects.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64 } },
        { text: instruction }
      ]
    }
  });
  
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part?.inlineData?.data) {
    throw new Error("Failed to transform image style.");
  }
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const fuseImages = async (imgAUrl: string, imgBUrl: string) => {
  const ai = getAI();
  const base64A = extractBase64(imgAUrl);
  const base64B = extractBase64(imgBUrl);
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64A } },
        { inlineData: { mimeType: 'image/png', data: base64B } },
        { text: `Intelligently fuse these images. Preserve the main subject from the first image. Apply the background, lighting, and textures from the second image. Make it look like one cohesive, realistic photo.` }
      ]
    }
  });
  
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part?.inlineData?.data) {
    throw new Error("Failed to fuse images.");
  }
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const runFitCheck = async (personUrl: string, outfitUrl: string) => {
  const ai = getAI();
  const pB64 = extractBase64(personUrl);
  const oB64 = extractBase64(outfitUrl);
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: pB64 } },
        { inlineData: { mimeType: 'image/png', data: oB64 } },
        { text: `Generate a visualization of the person wearing this outfit. Preserve body shape and face. Additionally, provide a JSON response with fit analysis feedback. Format the JSON as: { "score": number, "colorFeedback": "string", "sizeFeedback": "string", "occasion": "string", "suggestions": "string" }` }
      ]
    }
  });
  
  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
  
  let analysis = { 
    score: 0, 
    colorFeedback: "Analysis unavailable", 
    sizeFeedback: "Analysis unavailable", 
    occasion: "Analysis unavailable", 
    suggestions: "Try a different combination." 
  };

  if (textPart?.text) {
    const jsonMatch = textPart.text.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse analysis JSON", e);
      }
    }
  }

  return { 
    imageUrl: imagePart?.inlineData?.data ? `data:image/png;base64,${imagePart.inlineData.data}` : null, 
    analysis 
  };
};