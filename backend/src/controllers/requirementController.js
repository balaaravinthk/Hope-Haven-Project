import { sendSuccess } from '../utils/apiResponse.js';
import { prioritizeNeeds } from '../services/feedService.js';

// Seed / sample requirements matching frontend constants
let requirements = [
  {
    id: 1,
    title: 'Emergency Medical kit restock',
    category: 'Healthcare',
    amountNeeded: 25000,
    amountRaised: 18500,
    status: 'active',
    urgency: 'Critical',
    orphanage: { name: "Hope Children's Home", address: "Coimbatore, Tamil Nadu", verified: true },
    datePosted: '2026-10-15',
  },
  {
    id: 2,
    title: 'School uniforms & footwear for 30 children',
    category: 'Clothing',
    amountNeeded: 45000,
    amountRaised: 45000,
    status: 'fulfilled',
    urgency: 'Medium',
    orphanage: { name: "Hope Children's Home", address: "Coimbatore, Tamil Nadu", verified: true },
    datePosted: '2026-10-10',
  },
  {
    id: 3,
    title: 'Monthly grocery & nutrition ration',
    category: 'Food & Nutrition',
    amountNeeded: 60000,
    amountRaised: 32000,
    status: 'active',
    urgency: 'High',
    orphanage: { name: "Hope Children's Home", address: "Coimbatore, Tamil Nadu", verified: true },
    datePosted: '2026-10-12',
  },
];

export const getRequirements = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let filtered = [...requirements];

    if (status) {
      filtered = filtered.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }
    if (category) {
      filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    return sendSuccess(res, 'Requirements fetched', filtered);
  } catch (error) {
    next(error);
  }
};

export const getLiveFeed = async (req, res, next) => {
  try {
    // Prioritize active needs using double-sort algorithm
    const activeNeeds = requirements.filter((r) => r.status === 'active');
    const prioritized = prioritizeNeeds(activeNeeds);
    return sendSuccess(res, 'Live urgency feed retrieved', prioritized);
  } catch (error) {
    next(error);
  }
};

export const createRequirement = async (req, res, next) => {
  try {
    const { title, category, amountNeeded, urgency } = req.body;
    const newReq = {
      id: requirements.length + 1,
      title,
      category,
      amountNeeded: Number(amountNeeded),
      amountRaised: 0,
      status: 'active',
      urgency: urgency || 'Medium',
      datePosted: new Date().toISOString().split('T')[0],
    };
    requirements.unshift(newReq);
    return sendSuccess(res, 'Requirement created successfully', newReq, 201);
  } catch (error) {
    next(error);
  }
};

export const updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = requirements.findIndex((r) => r.id === Number(id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    requirements[index] = { ...requirements[index], ...req.body };
    return sendSuccess(res, 'Requirement updated', requirements[index]);
  } catch (error) {
    next(error);
  }
};

export const deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    requirements = requirements.filter((r) => r.id !== Number(id));
    return sendSuccess(res, 'Requirement deleted');
  } catch (error) {
    next(error);
  }
};
