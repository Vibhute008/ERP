'use client';

import Image from 'next/image';

export default function ImageTestPage() {
  return (
    <div className="p-8">
      <h1>Image Test Page</h1>
      <p>This page tests if images are loading correctly.</p>
      
      <div className="mt-8">
        <h2>Next.js Image Component:</h2>
        <Image 
          src="/assets/logo.png" 
          alt="Logo Test" 
          width={100} 
          height={100}
        />
      </div>
      
      <div className="mt-8">
        <h2>Regular img tag:</h2>
        <img 
          src="/assets/logo.png" 
          alt="Logo Test" 
          width={100} 
          height={100}
        />
      </div>
    </div>
  );
}