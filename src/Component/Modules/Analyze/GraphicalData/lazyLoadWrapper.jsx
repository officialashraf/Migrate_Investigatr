import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const LazyLoadWrapper = ({ children, height = 350 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: height }}>
      {isVisible ? children : null}
    </div>
  );
};
LazyLoadWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.number
};

LazyLoadWrapper.defaultProps = {
  height: 350
};
export default LazyLoadWrapper;