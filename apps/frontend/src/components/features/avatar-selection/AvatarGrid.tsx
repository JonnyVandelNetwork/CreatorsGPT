import React, { useState } from 'react';
import Image from 'next/image';

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

interface AvatarGridProps {
  avatars: Avatar[];
  onSelect: (avatar: Avatar) => void;
  selectedAvatarId?: string;
}

export const AvatarGrid: React.FC<AvatarGridProps> = ({
  avatars,
  onSelect,
  selectedAvatarId,
}) => {
  const handleAvatarClick = (avatar: Avatar) => {
    console.log('Avatar clicked:', avatar);
    console.log('Current selected avatar:', selectedAvatarId);
    onSelect(avatar);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium text-center mb-4">Choose your avatar!</h2>
      <div className="grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
              selectedAvatarId === avatar.id
                ? 'ring-2 ring-primary-500 scale-105'
                : 'hover:scale-105'
            }`}
            onClick={() => handleAvatarClick(avatar)}
          >
            <div className="aspect-square relative bg-gray-200 flex items-center justify-center">
              {avatar.imageUrl ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                    {avatar.name.charAt(0).toUpperCase()}
                  </div>
                  <Image
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error(`Error loading avatar image: ${avatar.imageUrl}`);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-500">
                  {avatar.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs text-center py-1 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90">
              {avatar.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example usage with default avatars
export const DefaultAvatars = [
  {
    id: 'avatar-1',
    name: 'Albert',
    imageUrl: '/avatars/albert.jpg',
  },
  {
    id: 'avatar-2',
    name: 'Douglas',
    imageUrl: '/avatars/douglas.jpg',
  },
  {
    id: 'avatar-3',
    name: 'Rose',
    imageUrl: '/avatars/rose.jpg',
  },
  {
    id: 'avatar-4',
    name: 'Maria',
    imageUrl: '/avatars/maria.jpg',
  },
]; 