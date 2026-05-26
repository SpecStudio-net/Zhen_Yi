import { HexLine } from './HexLine';
import styles from './Hexagram.module.css';

// SVG coordinate space
const VIEW_W    = 100;
const VIEW_H    = 150;
const LINE_H    = 7;
const LINE_STEP = 20;   // distance from top of one line to top of the next
const PAD_TOP   = 15;   // y of the topmost line (line 6)

// lines: array[6] of 6|7|8|9|null  (index 0 = bottom line, index 5 = top line)
// subordinate: true when rendering the relating hexagram (lower contrast)
export function Hexagram({ lines = Array(6).fill(null), subordinate = false }) {
  const svgClass = [styles.svg, subordinate && styles.subordinate]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={svgClass}
      aria-hidden="true"
    >
      {lines.map((value, i) => {
        // i=0 is the bottom line; highest y in SVG = bottom of glyph
        const y = PAD_TOP + (5 - i) * LINE_STEP;
        return (
          <HexLine
            key={i}
            value={value}
            y={y}
            lineH={LINE_H}
            width={VIEW_W}
            className={value != null ? styles.lineCast : undefined}
          />
        );
      })}
    </svg>
  );
}
