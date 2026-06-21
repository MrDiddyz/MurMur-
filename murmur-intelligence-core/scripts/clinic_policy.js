const CLAIM_PATTERN = /\b(kurerer|kurere|helbreder|helbrede|garantert|bevist|beviser|cures?|guaranteed?|proven)\b/i;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildEvidenceRegex(markerPrefix) {
  const prefix = typeof markerPrefix === 'string' && markerPrefix.trim().length > 0
    ? markerPrefix.trim()
    : '[kilde:';

  return new RegExp(`${escapeRegex(prefix)}[^\\]]+\\]`, 'i');
}

function collectClaimTextCandidates(routerConfig) {
  const candidates = [];
  const service = routerConfig?.knowledge_base?.service || {};
  const faq = Array.isArray(routerConfig?.knowledge_base?.faq)
    ? routerConfig.knowledge_base.faq
    : [];

  if (typeof service.description === 'string') {
    candidates.push({ path: '/knowledge_base/service/description', text: service.description });
  }

  if (typeof service.deliverable_after === 'string') {
    candidates.push({ path: '/knowledge_base/service/deliverable_after', text: service.deliverable_after });
  }

  faq.forEach((item, index) => {
    if (typeof item?.a === 'string') {
      candidates.push({ path: `/knowledge_base/faq/${index}/a`, text: item.a });
    }
  });

  return candidates;
}

function validateNoClaimWithoutEvidence(routerConfig) {
  const policy = routerConfig?.safety_policy?.no_claim_without_evidence;
  if (!policy?.enabled) {
    return [];
  }

  const evidenceRegex = buildEvidenceRegex(policy.evidence_marker_prefix);

  return collectClaimTextCandidates(routerConfig)
    .filter(({ text }) => CLAIM_PATTERN.test(text) && !evidenceRegex.test(text))
    .map(({ path, text }) => ({
      path,
      message: 'Found medical/guarantee claim without required evidence marker.',
      excerpt: text.slice(0, 160)
    }));
}

module.exports = {
  validateNoClaimWithoutEvidence,
  collectClaimTextCandidates
};
