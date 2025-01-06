import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const validationContext = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    const { error } = schema.validate(validationContext, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));

      throw new ApiError(400, 'Validation Error', 'VALIDATION_ERROR', details);
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  id: Joi.object({
    params: Joi.object({
      id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
        .messages({
          'string.pattern.base': 'Invalid ID format'
        })
    })
  }),

  post: Joi.object({
    body: Joi.object({
      accountId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      platforms: Joi.array().items(Joi.string()).min(1).required(),
      datePost: Joi.date().iso().required(),
      timePost: Joi.string().pattern(/^([0-1][0-9]|2[0-3])$/).required(),
      models: Joi.object({
        image: Joi.string().allow(''),
        video: Joi.string().allow(''),
        text: Joi.string().allow('')
      })
    })
  }),

  account: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      platforms: Joi.array().items(Joi.string()).min(1).required(),
      logo: Joi.string().uri().allow(''),
      settings: Joi.object({
        timezone: Joi.string().default('UTC'),
        language: Joi.string().default('en'),
        notifications: Joi.boolean().default(true)
      })
    })
  }),

  auth: {
    register: Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
          .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
          }),
        name: Joi.string().min(2).max(50).required()
      })
    }),

    login: Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      })
    })
  },

  query: {
    pagination: Joi.object({
      query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('asc', 'desc').default('desc')
      })
    }),

    dateRange: Joi.object({
      query: Joi.object({
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso().min(Joi.ref('startDate'))
      })
    })
  }
};
