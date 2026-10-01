const { z } = require('zod');

const createFarm = {
  body: z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    address: z.string().max(200).optional(),
    state: z.string().max(80).optional(),
    lga: z.string().max(80).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
};

const createListing = {
  body: z.object({
    farmId: z.string().uuid().optional(),
    categoryId: z.string().uuid(),
    productName: z.string().min(1).max(150),
    description: z.string().max(1000).optional(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(30),
    price: z.number().positive(),
    minOrderQuantity: z.number().positive().optional(),
    location: z.string().max(150).optional(),
    state: z.string().max(80).optional(),
    lga: z.string().max(80).optional(),
    availabilityDate: z.string().datetime().optional(),
    images: z.array(z.string().url()).max(10).optional(),
  }),
};

const updateListing = {
  body: createListing.body.partial().extend({
    status: z.enum(['ACTIVE', 'SOLD_OUT', 'INACTIVE']).optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

const searchListings = {
  query: z.object({
    q: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    minQuantity: z.coerce.number().finite().positive().optional(),
    sellerId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
  }),
};

const idParam = { params: z.object({ id: z.string().uuid() }) };

module.exports = { createFarm, createListing, updateListing, searchListings, idParam };