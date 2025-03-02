'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
      <div className="flex mt-16 w-full mx-auto justify-center p-2 max-w-sm flex-col gap-6">
       <h2 className="animate-fade-right text-2xl font-semibold">
         Something went wrong!
       </h2>
       <p className="animate-fade-up">May be refresh?</p>
       <p className="mt-10">
         You can {' '}
         <a
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          try again
        </a>.
       </p>
     </div>

  );
}
