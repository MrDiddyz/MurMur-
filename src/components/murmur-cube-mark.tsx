type MurmurCubeMarkProps = {
  size?: 'sm' | 'md';
};

export function MurmurCubeMark({ size = 'md' }: MurmurCubeMarkProps) {
  const sizeClass = size === 'sm' ? 'murmur-cube-sm' : 'murmur-cube-md';

  return (
    <span className={`murmur-cube ${sizeClass}`} aria-hidden="true">
      <span className="murmur-cube-face murmur-cube-front" />
      <span className="murmur-cube-face murmur-cube-right" />
      <span className="murmur-cube-face murmur-cube-top" />
    </span>
  );
}
