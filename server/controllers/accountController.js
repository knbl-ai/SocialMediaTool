import Account from '../models/Account.js';
import { createContentPlanner } from '../services/contentPlannerService.js';

export const createAccount = async (req, res) => {
  try {
    // Get the maximum position value
    const maxPositionAccount = await Account.findOne({})
      .sort({ position: -1 })
      .limit(1);
    const nextPosition = maxPositionAccount ? maxPositionAccount.position + 1 : 0;

    // Create the account
    const account = new Account({
      userId: req.user._id,
      position: nextPosition,
      ...req.body
    });
    const savedAccount = await account.save();

    // Create associated content planner
    await createContentPlanner(savedAccount._id);

    res.status(201).json(savedAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id })
      .sort({ position: 1 });
    res.json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ message: 'Error getting accounts', error: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
}; 