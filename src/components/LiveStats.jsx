'use client';
import React from 'react';

// LiveStats had been causing runtime errors. Replace with a tiny safe stub
// so other parts of the app that import it won't crash. If you want the
// original feature back later, restore the implementation here.
export default function LiveStats() {
  return null;
}
