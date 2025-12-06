import { useEffect, useRef, useState } from 'react';

export function useAutoFocusWithManualAutofill() {
  const inputRef = useRef(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleFocus = () => {
    setIsReadOnly(false);
  };

  return { inputRef, isReadOnly, handleFocus };
}


