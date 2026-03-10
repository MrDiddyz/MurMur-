const FRAMEWORK_PROFILES = {
  nextjs: {
    display_name: 'Next.js',
    dev_command: 'npm run dev',
    build_command: 'npm run build',
    start_command: 'npm run start',
    lint_command: 'npm run lint',
    typecheck_command: 'npm run typecheck',
  },
};

export function normalizeFrameworkName(framework) {
  return String(framework || '')
    .trim()
    .toLowerCase()
    .replace(/\.js$/, 'js');
}

export function getFrameworkProfile(config) {
  const normalizedFramework = normalizeFrameworkName(config?.framework);

  if (!normalizedFramework) {
    throw new Error('A framework value is required.');
  }

  const profile = FRAMEWORK_PROFILES[normalizedFramework];

  if (!profile) {
    throw new Error(`Unsupported framework: ${config.framework}`);
  }

  return {
    framework: normalizedFramework,
    ...profile,
  };
}
