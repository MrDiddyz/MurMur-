export function AnalyticsPlaceholder() {
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__MURMUR_ANALYTICS__ = {enabled:false, provider:'add-provider-script-here'};`,
      }}
    />
  );
}
