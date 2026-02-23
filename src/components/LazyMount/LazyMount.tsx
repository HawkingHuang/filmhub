import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./LazyMount.module.scss";

type LazyMountProps = {
  children: ReactNode;
  rootMargin?: string;
};

function LazyMount({ children, rootMargin = "40px 0px" }: LazyMountProps) {
  const [mounted, setMounted] = useState(false);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mounted) return;

    const node = placeholderRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => {
        setMounted(true);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  if (mounted) {
    return <>{children}</>;
  }

  return <div ref={placeholderRef} className={styles.placeholder} aria-hidden />;
}

export default LazyMount;
