import { sendSuccess } from '../utils/apiResponse.js';

export const getUserImpact = async (req, res, next) => {
  try {
    const impactStats = {
      totalDonated: 12500,
      livesTouched: 4,
      hoursVolunteered: 18,
      rank: 'Silver Guardian',
      trophies: [
        { id: 1, title: 'First Spark', description: 'Made your first donation', unlocked: true },
        { id: 2, title: 'Guardian Angel', description: 'Contributed to 3+ orphanages', unlocked: true },
        { id: 3, title: 'Golden Mentor', description: 'Volunteered 15+ hours teaching', unlocked: true },
        { id: 4, title: 'Beacon of Hope', description: 'Helped close a critical medical need', unlocked: false },
      ],
    };
    return sendSuccess(res, 'User impact and trophy stats fetched', impactStats);
  } catch (error) {
    next(error);
  }
};
