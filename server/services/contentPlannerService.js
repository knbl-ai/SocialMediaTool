import ContentPlanner from '../models/ContentPlanner.js';

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
  try {
    return await ContentPlanner.findOne({ accountId });
  } catch (error) {
    console.error('Error getting content planner:', error);
    throw error;
  }
};

export const updateContentPlanner = async (accountId, updates) => {
  try {
    return await ContentPlanner.findOneAndUpdate(
      { accountId },
      updates,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error updating content planner:', error);
    throw error;
  }
}; 