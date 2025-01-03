import Connection from '../models/Connection.js';
import mongoose from 'mongoose';

// Get connection details for an account
export const getConnection = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    const connection = await Connection.findOne({ accountId });
    res.json(connection || {});
  } catch (error) {
    console.error('Error getting connection:', error);
    res.status(500).json({ error: 'Failed to get connection details' });
  }
};

// Update or create connection for a platform
export const updateConnection = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { platform, webhookUrl, pageId } = req.body;

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    if (!platform || !webhookUrl || !pageId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const update = {
      [`${platform}`]: { webhookUrl, pageId }
    };

    const connection = await Connection.findOneAndUpdate(
      { accountId },
      update,
      { upsert: true, new: true }
    );

    res.json(connection);
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
};

// Disconnect a platform
export const disconnectPlatform = async (req, res) => {
  try {
    const { accountId, platform } = req.params;

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    const update = {
      $unset: { [`${platform}`]: "" }
    };

    const connection = await Connection.findOneAndUpdate(
      { accountId },
      update,
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    res.json(connection);
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    res.status(500).json({ error: 'Failed to disconnect platform' });
  }
}; 