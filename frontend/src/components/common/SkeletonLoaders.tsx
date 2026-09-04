'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs animate-pulse flex flex-col">
      <div className="h-56 bg-slate-100 relative" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded-md w-1/3" />
          <div className="h-4 bg-slate-200 rounded-md w-4/5" />
          <div className="h-3 bg-slate-100 rounded-md w-full" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 bg-slate-200 rounded-md w-20" />
            <div className="h-2.5 bg-slate-100 rounded-md w-16" />
          </div>
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      <div className="lg:col-span-6 space-y-4">
        <div className="h-[450px] bg-slate-100 rounded-3xl border border-slate-200" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-6 space-y-5">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-8 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-10 bg-slate-100 rounded-2xl w-1/2" />
        <div className="h-24 bg-slate-100 rounded-2xl" />
        <div className="h-12 bg-slate-200 rounded-2xl w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}
