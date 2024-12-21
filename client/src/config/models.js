const parseEnvModels = (envVar, defaultValue = []) => {
  try {
    return JSON.parse(envVar || '[]');
  } catch (error) {
    console.error(`Error parsing models from environment variable:`, error);
    return defaultValue;
  }
};

const MODELS = {
  image: parseEnvModels(import.meta.env.VITE_IMAGE_MODELS, [
    { value: "fal-ai/flux/schnell", label: "flux-schnell" }
  ]),
  video: parseEnvModels(import.meta.env.VITE_VIDEO_MODELS, [
    { value: "runway", label: "Runway Gen-3" }
  ]),
  llm: parseEnvModels(import.meta.env.VITE_LLM_MODELS, [
    { value: "claude-3-5-haiku@20241022", label: "claude-haiku" }
  ])
};

export default MODELS;
