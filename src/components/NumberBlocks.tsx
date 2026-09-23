/** Accessible base-ten blocks. Decorative instances inherit their parent's label. */
export function NumberBlocks({
  tens,
  ones,
  decorative = false,
}: {
  tens: number;
  ones: number;
  decorative?: boolean;
}) {
  return (
    <div
      className={decorative ? "blocks" : "visual-blocks"}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={
        decorative
          ? undefined
          : `${tens} groups of ten and ${ones} single blocks`
      }
    >
      <div className="rods">
        {Array.from({ length: tens }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="dots">
        {Array.from({ length: ones }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}
