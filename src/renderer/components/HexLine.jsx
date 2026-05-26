// Renders one hexagram line as SVG elements inside a parent <svg>.
// value: 6=old yīn (changing), 7=young yáng, 8=young yīn, 9=old yáng (changing), null=uncast
export function HexLine({ value, y, lineH, width, className }) {
  const changing = value === 6 || value === 9;
  const isYang   = value === 7 || value === 9;
  const blank    = value == null;

  const gapW  = Math.round(width * 0.12);
  const halfW = Math.round((width - gapW) / 2);

  if (blank) {
    return (
      <g className={className}>
        <rect
          x={0} y={y} width={width} height={lineH}
          fill="none" stroke="currentColor" strokeWidth={0.75} opacity={0.2}
        />
      </g>
    );
  }

  const fill = changing ? 'var(--accent, #c9a84c)' : 'currentColor';

  if (isYang) {
    return (
      <g className={className}>
        <rect x={0} y={y} width={width} height={lineH} fill={fill} />
      </g>
    );
  }

  return (
    <g className={className}>
      <rect x={0} y={y} width={halfW} height={lineH} fill={fill} />
      <rect x={halfW + gapW} y={y} width={halfW} height={lineH} fill={fill} />
    </g>
  );
}
