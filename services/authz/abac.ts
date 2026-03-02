export const canAccessResource = (
  userAttributes: Record<string, string>,
  resourceAttributes: Record<string, string>
): boolean => {
  return Object.entries(resourceAttributes).every(([key, value]) => userAttributes[key] === value);
};
