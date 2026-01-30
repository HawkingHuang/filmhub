import { useEffect, useRef, useState } from "react";

export function useIsClamped(content: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsClamped(el.scrollHeight > el.clientHeight + 1);
    };

    check();

    const ro = new ResizeObserver(() => check());
    ro.observe(el);

    return () => ro.disconnect();
  }, [content]);

  return { ref, isClamped };
}
