import { useEffect, useState } from "react";

// Returns 0 on the first paint and `target` right after, so a bar or ring with a CSS transition
// grows from empty to its value instead of appearing already full.
export function useFillTo(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}