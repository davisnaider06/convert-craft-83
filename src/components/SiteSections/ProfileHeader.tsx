import React from 'react';

interface ProfileHeaderProps {
  content: {
    name: string;
    bio: string;
    visual_variant?: string;
    background_style?: string;
    gradient_from?: string;
    gradient_to?: string;
    image_keyword?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ content, primaryColor, isMobile }) => {
  const seed = encodeURIComponent(content.image_keyword || content.name || "profile");
  const profileImage = `https://picsum.photos/seed/${seed}/400/400`;
  const variant = String(content.visual_variant || "").toLowerCase();
  const wantsGradient = String(content.background_style || "").toLowerCase() === "gradient";
  const gradientFrom = content.gradient_from || primaryColor;
  const gradientTo = content.gradient_to || "#f093fb";
  const sectionStyle = wantsGradient
    ? { backgroundImage: `linear-gradient(180deg, ${gradientFrom}22, ${gradientTo}18)` }
    : undefined;
  const textTone = variant === "biolink" ? "text-slate-900" : "text-slate-100";
  const copyTone = variant === "biolink" ? "text-slate-600" : "text-slate-300";

  return (
    <section className={`pt-16 pb-8 px-4 text-center ${variant === "biolink" ? "bg-white" : "bg-[#040816]"}`} style={sectionStyle}>
      <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden bg-slate-100"
           style={{ borderColor: primaryColor }}>
         <img 
           src={profileImage}
           className="w-full h-full object-cover" 
           alt={content.name || "Perfil"}
           onError={(e) => {
             e.currentTarget.src = "https://picsum.photos/400/400";
           }}
         />
      </div>
      <h1 className={`text-2xl font-bold mb-2 ${textTone}`}>{content.name}</h1>
      <p className={`max-w-sm mx-auto ${copyTone}`}>{content.bio}</p>
    </section>
  );
};
