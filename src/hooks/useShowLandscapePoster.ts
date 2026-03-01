import { useEffect, useState, type RefObject } from "react";

function useShowLandscapePoster(topBlockRef: RefObject<HTMLElement | null>, isLoading: boolean) {
  const [showLandscapePoster, setShowLandscapePoster] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (typeof ResizeObserver === "undefined") return;

    const element = topBlockRef.current;
    if (!element) return;

    const breakpoint = 1312;

    const update = () => {
      const width = element.getBoundingClientRect().width;
      const shouldShowLandscapePoster = width < breakpoint;
      setShowLandscapePoster((prev) => (prev === shouldShowLandscapePoster ? prev : shouldShowLandscapePoster));
    };

    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [topBlockRef, isLoading]);

  return showLandscapePoster;
}

export default useShowLandscapePoster;
