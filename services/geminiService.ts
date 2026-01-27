
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY missing");
  return new GoogleGenAI({ apiKey });
};

const extractBase64 = (dataUrl: string) => dataUrl.split(',')[1] || dataUrl;

export const generateImageFromText = async (prompt: string, style: string, size: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Create a professional ${style} of: ${prompt}. Aspect ratio ${size}.` }] },
  });
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return `data:image/png;base64,${part?.inlineData?.data}`;
};

export const styleTransform = async (imgDataUrl: string, style: string, refinePrompt?: string) => {
  const ai = getAI();
  const base64 = extractBase64(imgDataUrl);
  
  const instruction = refinePrompt 
    ? `Re-render this image in ${style} style. Additional styling details: ${refinePrompt}. Preserve the exact subject pose and structure. Change ONLY visual aesthetic. No extra objects.`
    : `Re-render this image in ${style} style. Preserve the exact subject pose and structure. Change ONLY visual aesthetic. No extra objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64 } },
        { text: instruction }
      ]
    }
  });
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return `data:image/png;base64,${part?.inlineData?.data}`;
};

export const fuseImages = async (imgAUrl: string, imgBUrl: string) => {
  const ai = getAI();
  const base64A = extractBase64(imgAUrl);
  const base64B = extractBase64(imgBUrl);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64A } },
        { inlineData: { mimeType: 'image/png', data: base64B } },
        { text: `Intelligently fuse these images. Preserve the main subject from the first image. Apply the background, lighting, and textures from the second image. Make it look like one cohesive, realistic photo.` }
      ]
    }
  });
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return `data:image/png;base64,${part?.inlineData?.data}`;
};

export const runFitCheck = async (personUrl: string, outfitUrl: string) => {
  const ai = getAI();
  const pB64 = extractBase64(personUrl);
  const oB64 = extractBase64(outfitUrl);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: pB64 } },
        { inlineData: { mimeType: 'image/png', data: oB64 } },
        { text: `Generate a visualization of the person wearing this outfit. Preserve body shape and face. Output JSON: { "score": number, "colorFeedback": "string", "sizeFeedback": "string", "occasion": "string", "suggestions": "string" }` }
      ]
    }
  });
  const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
  const analysis = JSON.parse(response.text.match(/\{.*\}/s)?.[0] || "{}");
  return { imageUrl: `data:image/png;base64,${imagePart?.inlineData?.data}`, analysis };
};
