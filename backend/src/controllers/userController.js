import { sendSuccess } from '../utils/apiResponse.js';
import { Donation, DonationStatus } from '../models/Donation.js';
import { VolunteerApplication } from '../models/VolunteerApplication.js';

export const getUserImpact = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email ? req.user.email.toLowerCase().trim() : null;

    // 1. Query user's real completed donations from MongoDB
    const userQuery = [];
    if (userId) userQuery.push({ donorId: userId });
    if (userEmail) userQuery.push({ donorEmail: userEmail });

    const donations = userQuery.length > 0
      ? await Donation.find({
          $or: userQuery,
          status: DonationStatus.COMPLETED,
        }).populate('requirementId', 'urgency category').lean()
      : [];

    const totalDonated = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    // 2. Query user's real approved volunteer applications from MongoDB
    const volQuery = [];
    if (userEmail) volQuery.push({ email: userEmail });
    if (req.user?.phone) volQuery.push({ phone: req.user.phone });

    const volunteerApps = volQuery.length > 0
      ? await VolunteerApplication.find({
          $or: volQuery,
          status: { $in: ['approved', 'accepted'] },
        }).lean()
      : [];

    // Real hours volunteered (e.g. 4 hours per approved application or impact field)
    const hoursVolunteered = (req.user?.impact?.hoursVolunteered && req.user.impact.hoursVolunteered > 0)
      ? req.user.impact.hoursVolunteered
      : volunteerApps.length * 4;

    // 3. Count distinct orphanages supported
    const distinctOrphanages = new Set();
    donations.forEach((d) => {
      if (d.orphanageId) distinctOrphanages.add(d.orphanageId.toString());
    });
    volunteerApps.forEach((v) => {
      if (v.orphanageId) distinctOrphanages.add(v.orphanageId.toString());
    });
    const livesTouched = distinctOrphanages.size > 0 ? distinctOrphanages.size * 5 : 0;

    // 4. Calculate trophy milestones strictly from database records
    const criticalDonationsCount = donations.filter(
      (d) => d.requirementId?.urgency === 'Critical'
    ).length;

    const highMedDonationsCount = donations.filter(
      (d) => d.requirementId?.urgency === 'High' || d.requirementId?.urgency === 'Medium'
    ).length;

    const standardDonationsCount = donations.length;

    const goldenTrophies = criticalDonationsCount;
    const silverTrophies = highMedDonationsCount;
    const bronzeTrophies = Math.max(0, standardDonationsCount - goldenTrophies - silverTrophies) + volunteerApps.length;

    const trophies = [
      {
        id: 1,
        title: 'First Spark',
        description: 'Made your first donation to support children in need',
        unlocked: totalDonated > 0,
      },
      {
        id: 2,
        title: 'Guardian Angel',
        description: 'Contributed to 3+ orphanages across the community',
        unlocked: distinctOrphanages.size >= 3,
      },
      {
        id: 3,
        title: 'Golden Mentor',
        description: 'Completed volunteer sessions supporting children',
        unlocked: hoursVolunteered >= 4,
      },
      {
        id: 4,
        title: 'Beacon of Hope',
        description: 'Helped fund a critical emergency healthcare or urgent need',
        unlocked: criticalDonationsCount >= 1,
      },
    ];

    let rank = 'New Supporter';
    if (totalDonated >= 25000 || distinctOrphanages.size >= 5) rank = 'Gold Guardian';
    else if (totalDonated >= 5000 || distinctOrphanages.size >= 2) rank = 'Silver Guardian';
    else if (totalDonated > 0 || volunteerApps.length > 0) rank = 'Bronze Supporter';

    const impactStats = {
      totalDonated,
      livesTouched,
      hoursVolunteered,
      goldenTrophies,
      silverTrophies,
      bronzeTrophies,
      rank,
      trophies,
    };

    return sendSuccess(res, 'User impact and trophy stats fetched from database', impactStats);
  } catch (error) {
    next(error);
  }
};
