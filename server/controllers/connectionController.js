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
    const requestData = req.body;
    let updateData = {};

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    // Check if this is an X platform update
    if (requestData.X) {
      const { apiKey, apiSecret, accessToken, accessTokenSecret } = requestData.X;
      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        return res.status(400).json({ error: 'Missing required fields for X platform' });
      }
      updateData = requestData; // Use the X data as is
    } 
    // Standard platform update
    else if (requestData.platform) {
      const { platform, webhookUrl, pageId } = requestData;
      if (!platform || !webhookUrl || !pageId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      updateData = {
        [`${platform}`]: { webhookUrl, pageId }
      };
    } else {
      return res.status(400).json({ error: 'Invalid connection data format' });
    }

    const connection = await Connection.findOneAndUpdate(
      { accountId },
      updateData,
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