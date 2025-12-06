import { useEffect, useRef } from 'react';
import throttle from 'lodash.throttle';
import { useSelector } from 'react-redux';

const useInfiniteScroll = ({
  currentPage,
  totalPages,
  loading,
  onPageChange,
  threshold = 150,
  throttleMs = 500
}) => {
  // const {
  //     data,
  //     page,
  //     totalPages,
  //   } = useSelector((state) => state.filterData);
    // const currentPage = page;

  const containerRef = useRef(null);
  const scrollDirectionRef = useRef(null);
  const canFetchRef = useRef(true);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInfiniteScroll = throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (!canFetchRef.current || loading) return;

      // Bottom Scroll
     if (scrollHeight - scrollTop - clientHeight < threshold && currentPage < totalPages) {
  onPageChange(currentPage + 1);
}

      // Top Scroll
      else if (scrollTop <= threshold) {
        if (!loading && currentPage > 1) {
          scrollDirectionRef.current = 'up';
          onPageChange(currentPage - 1);
        }
      }
    }, throttleMs);

    container.addEventListener("scroll", handleInfiniteScroll);
    return () => container.removeEventListener("scroll", handleInfiniteScroll);
  }, [loading, currentPage, totalPages, onPageChange, threshold, throttleMs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFirstMount.current) {
      const centerScroll = Math.max(
        (container.scrollHeight - container.clientHeight) / 2,
        0
      );
      container.scrollTo({ top: centerScroll, behavior: 'auto' });
      isFirstMount.current = false;
      return;
    }

    if (scrollDirectionRef.current === 'up') {
      const newScrollTop = currentPage === 1
        ? 0
        : container.scrollHeight / 2 - container.clientHeight / 2;
      container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
    } else if (scrollDirectionRef.current === 'down') {
      const newScrollTop = currentPage === totalPages
        ? container.scrollHeight
        : container.scrollHeight / 2 - container.clientHeight / 2;
      container.scrollTo({ top: newScrollTop, behavior: 'auto' });
    }
  }, [currentPage, totalPages]);

  return { containerRef, scrollDirectionRef };
};

export default useInfiniteScroll;
