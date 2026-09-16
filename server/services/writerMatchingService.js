const WriterProfile = require('../models/WriterProfile');
const { WRITER_STATUS } = require('../config/constants');

const MAX_MATCHES = 25;

/**
 * Finds APPROVED, available writers for a request's location, in priority
 * order: exact city match first, then same district, then same state.
 * Stops widening the search as soon as a tier has at least one hit so a
 * customer in a well-served city doesn't get flooded with far-away writers,
 * but still returns candidates when their exact city has nobody available.
 *
 * Returns { writers, matchedTier } where matchedTier is 'CITY' | 'DISTRICT' | 'STATE' | null.
 */
async function findMatchingWriters({ state, district, city }, { excludeWriterIds = [] } = {}) {
  const baseFilter = {
    status: WRITER_STATUS.APPROVED,
    isAvailable: true,
  };
  if (excludeWriterIds.length) {
    baseFilter.user = { $nin: excludeWriterIds };
  }

  const tiers = [
    { tier: 'CITY', filter: { ...baseFilter, state, district, city } },
    { tier: 'DISTRICT', filter: { ...baseFilter, state, district } },
    { tier: 'STATE', filter: { ...baseFilter, state } },
  ];

  for (const { tier, filter } of tiers) {
    const writers = await WriterProfile.find(filter)
      .populate('user', 'fullName email phone state district city')
      .sort({ ratingAverage: -1, completedJobs: -1 })
      .limit(MAX_MATCHES);

    if (writers.length > 0) {
      return { writers, matchedTier: tier };
    }
  }

  return { writers: [], matchedTier: null };
}

module.exports = { findMatchingWriters };
