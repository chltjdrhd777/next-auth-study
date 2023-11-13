'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

function Result() {
  const session = useSession();
  useEffect(() => {
    console.log('session', session);
  }, [session]);

  return <div>Result</div>;
}

export default Result;
