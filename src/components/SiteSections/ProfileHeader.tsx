import React from 'react';

interface ProfileHeaderProps {
  content: {
    name: string;
    bio: string;
    image_keyword?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ content, primaryColor, isMobile }) => {
  return (
    <section className="pt-16 pb-8 px-4 text-center">
      <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden bg-slate-100"
           style={{ borderColor: primaryColor }}>
         <img 
           src={`https://source.unsplash.com/400x400/?${encodeURIComponent(content.image_keyword || 'portrait')}`} 
           className="w-full h-full object-cover" 
         />
      </div>
      <h1 className="text-2xl font-bold mb-2">{content.name}</h1>
      <p className="text-slate-500 max-w-sm mx-auto">{content.bio}</p>
    </section>
  );
};