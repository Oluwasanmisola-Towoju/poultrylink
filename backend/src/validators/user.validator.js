const { z } = require('zod');

const updateProfile = {
  body: z.object({
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    businessName: z.string().max(120).optional(),
    bio: z.string().max(500).optional(),
    address: z.string().max(200).optional(),
    state: z.string().max(80).optional(),
    lga: z.string().max(80).optional(),
    avatarUrl: z.string().url().optional(),
  }),
};

const listUsers = {
  query: z.object({
    role: z.enum(['FARMER', 'BUYER', 'SUPPLIER', 'TRANSPORTER', 'VET', 'COOPERATIVE', 'FINANCIER', 'ADMIN']).optional(),
    verificationStatus: z.enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

const idParam = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { updateProfile, listUsers, idParam };