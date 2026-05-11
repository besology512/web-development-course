'use client';

import React from 'react';

export const VideoCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
            {/* Video Thumbnail Skeleton */}
            <div className="bg-gray-300 dark:bg-gray-700 aspect-video w-full" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title Skeleton */}
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />

                {/* Metadata Skeleton */}
                <div className="flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-1" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="flex gap-4 pt-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                </div>
            </div>
        </div>
    );
};

export const VideoDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Video Player Skeleton */}
            <div className="bg-gray-300 dark:bg-gray-700 aspect-video w-full rounded-lg" />

            {/* Title and Description */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                </div>
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>

            {/* Comments Skeleton */}
            <div className="space-y-4 mt-8">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(count)].map((_, i) => (
                <VideoCardSkeleton key={i} />
            ))}
        </div>
    );
};
