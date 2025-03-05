const { z } = require('zod');

const userRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, { message: "First name must be at least 2 characters long." })
    .max(50, { message: "First name cannot exceed 50 characters." }),
  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters long." })
    .max(50, { message: "Last name cannot exceed 50 characters." }),
  email: z.string()
    .email({ message: "Invalid email address." }),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format." }).optional(),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match.",
  path: ["confirmPassword"],
});

const requestLoginOtpSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    }),
});

const verifyLoginOtpSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    }),
  otp: z.string()
    .min(6, { message: "OTP must be 6 digits long." })
    .max(6, { message: "OTP must be 6 digits long." }),
});

const validateSchema = async (req, res, next, schema) => {
  try {
    const resolvedSchema = schema;
    const validatedData = resolvedSchema.parse(req.body);
    req.body = validatedData;

    next();
  } catch (error) {
    res.status(422).json({
      success: false,
      message: "Validation error",
      errors: error.errors,
    });
  }
};

const validateUserRegistration = (req, res, next) => validateSchema(req, res, next, userRegistrationSchema)
const validateRequestLoginOtp = (req, res, next) => validateSchema(req, res, next, requestLoginOtpSchema);
const validateVerifyLogin = (req, res, next) => validateSchema(req, res, next, verifyLoginOtpSchema);

module.exports = {
  validateUserRegistration,
  validateRequestLoginOtp,
  validateVerifyLogin,
};