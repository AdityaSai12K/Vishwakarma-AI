import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative p-8 rounded-2xl bg-card shadow-card hover-lift border border-border/50 hover:border-purple-light/50 transition-smooth">
      <div className="absolute inset-0 rounded-2xl bg-gradient-purple opacity-0 group-hover:opacity-5 transition-smooth" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
