import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
import { contentPlanPrompt } from './promptsService.js';
import { generateText } from './llmService.js';

const getEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  
  if (duration === 'week') {
    return new Date(start.setDate(start.getDate() + 7));
  } else if (duration === 'month') {
    // Get the last day of the current month
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    return new Date(start.setDate(start.getDate() + lastDay));
  }
  
  throw new Error('Invalid duration specified');
};

export const createContentPlanner = async (accountId) => {
  try {
    const contentPlanner = new ContentPlanner({
      accountId
    });
    return await contentPlanner.save();
  } catch (error) {
    console.error('Error creating content planner:', error);
    throw error;
  }
};

export const getContentPlannerByAccountId = async (accountId) => {
  return await ContentPlanner.findOne({ accountId });
};

export const updateContentPlanner = async (accountId, updates) => {
  return await ContentPlanner.findOneAndUpdate(
    { accountId },
    updates,
    { new: true, runValidators: true }
  );
};

export const generateContentPlan = async (accountId) => {
  try {
    // Get account and content planner data
    const [account, contentPlanner] = await Promise.all([
      Account.findById(accountId),
      ContentPlanner.findOne({ accountId })
    ]);

    if (!account || !contentPlanner) {
      throw new Error('Account or content planner not found');
    }

    const endDate = getEndDate(contentPlanner.date, contentPlanner.duration);

    // Prepare prompt data
    const promptData = {
      accountName: account.name,
      accountReview: account.accountReview,
      audience: contentPlanner.audience,
      guidelines: contentPlanner.textGuidelines,
      startDate: contentPlanner.date.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      frequency: contentPlanner.frequency,
      voice: contentPlanner.voice
    };
    console.log("promptData", promptData);
    // Generate content plan using LLM
    const { prompt, system } = contentPlanPrompt(promptData);
    const contentPlan = await generateText({
      topic: prompt,
      system,
      model: contentPlanner.llm
    });
    console.log("contentPlan", contentPlan);
    // Save content plan to database
    await ContentPlanner.findOneAndUpdate(
      { accountId },
      { contentPlanJSON: JSON.stringify(contentPlan) },
      { new: true }
    );

    return { message: 'ContentPlanSaved:ok' };
  } catch (error) {
    console.error('Error generating content plan:', error);
    throw error;
  }
}; 