

/**
 * Adapter to a generic Pollinations-style image generation API.
 *
 * NOTE:
 * - Set POLLINATIONS_API_KEY in your Vercel project environment and locally in .env (do NOT commit .env).
 * - Update POLLINATIONS_ENDPOINT to the exact endpoint from Pollinations docs (I used a placeholder).
 * - If Pollinations returns a direct image URL, this code returns that URL.
 *   If it returns base64 image data, this returns a data URL (`data:image/png;base64,...`).
 */

const POLLINATIONS_ENDPOINT = process.env.POLLINATIONS_ENDPOINT || 'https://api.pollinations.ai/generate'; // <-- replace if needed
const API_KEY = process.env.POLLINATIONS_API_KEY;

/** Simple retry wrapper for transient 429/5xx errors */
async function fetchWithRetry(url: string, opts: any, attempts = 4, backoff = 800) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, opts);
    if (res.ok) return res;
    // Retry on 429 or 5xx
    if ((res.status === 429 || (res.status >= 500 && res.status < 600)) && i < attempts - 1) {
      const wait = backoff * Math.pow(2, i);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    // Non-retryable or last attempt: throw
    const text = await res.text();
    const err: any = new Error(`Pollinations error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  throw new Error('Unreachable fetchWithRetry exit');
}

const requireKey = () => {
  if (!API_KEY) {
    throw new Error(
      'POLLINATIONS_API_KEY missing. Add POLLINATIONS_API_KEY to your Vercel project environment (or .env for local dev).'
    );
  }
};

/**
 * Helper to send request to Pollinations-like API.
 * The exact body below is generic — adjust fields to match your Pollinations plan/docs.
 */
async function callPollinations(payload: any) {
  requireKey();
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Many APIs expect the key in Authorization Bearer or custom header — update if Pollinations uses a different header
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload),
    // If using node-fetch and want streaming, adjust here
  };

  const res = await fetchWithRetry(POLLINATIONS_ENDPOINT, opts);
  const contentType = res.headers.get('content-type') || '';

  // If API returns image binary directly (e.g., image/png), convert to base64
  if (contentType.startsWith('image/')) {
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  }

  // Otherwise assume JSON
  const json = await res.json();

  /**
   * Typical response shapes you may see:
   * - { image: "https://..." }
   * - { data: { image: "data:image/png;base64,..." } }
   * - { images: ["https://...", ...] }
   * - { base64: "..." }
   *
   * Adjust the extraction logic to match Pollinations' exact response.
   */
  // flexible parsing:
  if (json.image && typeof json.image === 'string') return json.image;
  if (json.images && Array.isArray(json.images) && json.images[0]) return json.images[0];
  if (json.data && json.data.image) return json.data.image;
  if (json.base64) return `data:image/png;base64,${json.base64}`;
  if (json.url) return json.url;

  // If none matched, return raw JSON for debugging
  throw new Error('Unexpected Pollinations response format: ' + JSON.stringify(json));
}

/* Exported functions mimic previous API shape so UI plumbing remains the same */

/** Generate an image from text */
export const generateImageFromText = async (prompt: string, style: string, size: string) => {
  // Example payload — adjust to Pollinations API shape
  const payload = {
    prompt: `${prompt} Style: ${style}. Aspect: ${size}.`,
    // optional params depending on API:
    // width/height, steps, sampler, seed, etc.
    // You can add something like: { width: 1024, height: 1024 }
  };

  const image = await callPollinations(payload);
  // If returned URL, you may want to fetch and convert to data URL before returning; UI currently works with both
  return image;
};

/** Transform style of a provided image (expects data URL) */
export const styleTransform = async (imgDataUrl: string, style: string, refinePrompt?: string) => {
  const payload = {
    prompt: refinePrompt ? `Transform image to ${style}. ${refinePrompt}` : `Transform image to ${style}.`,
    init_image: imgDataUrl, // many APIs accept a data URL or multipart upload
    // mode: 'image-to-image' // depends on API
  };

  const image = await callPollinations(payload);
  return image;
};

/** Fuse two images into one */
export const fuseImages = async (imgAUrl: string, imgBUrl: string) => {
  const payload = {
    prompt: `Fuse two images. Use the first image's subject and the second's background/texture. Make it cohesive.`,
    init_images: [imgAUrl, imgBUrl],
    // other API-specific params
  };

  const image =await callPollinations(payload);
  return image;
};

/** Run a fit check (image comparison / analysis) */
export const runFitCheck = async (personUrl: string, outfitUrl: string) => {
  const payload = {
    prompt: `Compare person image to outfit image and return fit analysis and a visualization.`,
    init_images: [personUrl, outfitUrl],
    // If Pollinations doesn't support analysis, you may need a different service — this POST may produce an image result or JSON
  };

  const imageOrResult = await callPollinations(payload);
  return imageOrResult;
};
