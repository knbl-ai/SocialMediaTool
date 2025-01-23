import express from 'express';
import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import ContentPlanner from '../models/ContentPlanner.js';
import { formatUrl } from '../utils/urlHelper.js';

const router = express.Router();

const ANALYSIS_PROMPT = `You are an advanced AI assistant tasked with providing a comprehensive and detailed summary of any news article presented to you. Your response should include the following elements:

1. **Detailed Summary:** Provide a thorough and concise summary of the article, capturing all essential details, events, and context. Ensure that the summary is well-structured and easy to follow.

2. **Key Points:** Identify and list the key points or main arguments presented in the article. Highlight any critical information, data, or statistics that are central to the article's narrative.

3. **Main Themes:** Analyze and extract the main themes or overarching messages conveyed by the article. Discuss how these themes are developed and supported throughout the text.

4. **Vulnerabilities and Criticisms:** Critically evaluate the article by identifying any potential vulnerabilities, biases, or weaknesses in its arguments, evidence, or presentation. Consider the following aspects:
   - **Logical Consistency:** Are there any logical fallacies or inconsistencies in the article's reasoning?
   - **Evidence and Sources:** Is the evidence provided credible, reliable, and sufficient to support the claims made? Are the sources cited authoritative and unbiased?
   - **Bias and Perspective:** Does the article exhibit any noticeable bias or one-sided perspective? How might this affect the overall credibility and objectivity of the piece?
   - **Omissions and Gaps:** Are there any important details, perspectives, or counterarguments that are omitted or inadequately addressed?
   - **Impact and Implications:** What are the potential implications of the article's conclusions or recommendations? Are there any unintended consequences or overlooked factors?

5. **Constructive Criticism:** Offer constructive criticism and suggest ways in which the article could be improved or made more robust. Provide recommendations for addressing any identified weaknesses or gaps.

Your response should be analytical, well-reasoned, and supported by evidence from the article itself. Aim to provide a balanced and insightful critique that adds value to the reader's understanding of the topic.`;

router.post('/analyze', async (req, res, next) => {
  try {
    const { url, accountId } = req.body;

    if (!url) {
      throw new ApiError(400, 'URL is required');
    }

    if (!accountId) {
      throw new ApiError(400, 'Account ID is required');
    }

    // Format the URL
    const formattedUrl = formatUrl(url);
    if (!formattedUrl) {
      throw new ApiError(400, 'Invalid URL format');
    }

    try {
      // Make request to external API with a longer timeout
      const response = await axios.post(
        `${process.env.COMPANY_ANALYZER_API}/api/analyze`,
        { 
          url: formattedUrl,
          prompt: ANALYSIS_PROMPT
        },
        { timeout: 45000 }
      );

      if (response.data?.summary) {
        // Update ContentPlanner with the summary
        const updatedPlanner = await ContentPlanner.findOneAndUpdate(
          { accountId },
          { textGuidelines: response.data.summary },
          { new: true }
        );

        if (!updatedPlanner) {
          throw new ApiError(404, 'Content planner not found');
        }

        res.json({
          message: 'Website analyzed successfully',
          textGuidelines: updatedPlanner.textGuidelines
        });
      } else {
        throw new ApiError(400, 'Failed to analyze website: No summary generated');
      }
    } catch (analyzeError) {
      console.error('Website analysis error:', analyzeError);
      
      if (analyzeError.code === 'ECONNABORTED' || analyzeError.message.includes('timeout')) {
        throw new ApiError(408, 'Website analysis timed out. The website might be slow or unavailable.');
      }
      
      if (analyzeError.response?.data?.details) {
        throw new ApiError(400, analyzeError.response.data.details);
      }

      throw new ApiError(500, 'Failed to analyze website');
    }
  } catch (error) {
    next(error);
  }
});

export default router; 