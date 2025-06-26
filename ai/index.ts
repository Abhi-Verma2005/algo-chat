import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";


// export const geminiProModel = (userApiKey: string) => {
//   const googleProvider = createGoogleGenerativeAI({
//     apiKey: userApiKey,
//   });

//   const model = googleProvider("gemini-2.0-flash");
//   return model;
// }

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: customMiddleware,
});
