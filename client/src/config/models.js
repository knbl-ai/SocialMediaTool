// Parse array from environment variable string
const parseEnvArray = (envVar) => {
  try {
    return envVar ? JSON.parse(envVar) : [];
  } catch (error) {
    console.error(`Error parsing environment variable: ${error}`);
    return [];
  }
};

// Default models if environment variables are not set
const defaultModels = {
  image: [{ value: "dalle3", label: "DALL-E 3" }],
  video: [{ value: "runway", label: "Runway Gen-2" }],
  llm: [{ value: "gpt4", label: "GPT-4" }]
};

// Get models from environment variables or use defaults
export const models = {
  image: parseEnvArray(import.meta.env.VITE_IMAGE_MODELS) || defaultModels.image,
  video: parseEnvArray(import.meta.env.VITE_VIDEO_MODELS) || defaultModels.video,
  llm: parseEnvArray(import.meta.env.VITE_LLM_MODELS) || defaultModels.llm
};
