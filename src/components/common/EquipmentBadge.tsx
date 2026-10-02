import React from 'react';
import { 
  Projector, 
  Tv, 
  Video, 
  PenTool, 
  Mic, 
  Volume2, 
  Presentation, 
  Laptop, 
  CheckCircle2 
} from 'lucide-react';
import { EquipmentItem } from '../../types';

interface EquipmentBadgeProps {
  item: EquipmentItem;
  size?: 'sm' | 'md';
}

export const EquipmentBadge: React.FC<EquipmentBadgeProps> = ({ item, size = 'sm' }) => {
  const getIcon = () => {
    switch (item) {
      case 'Projector':
        return <Projector className="w-3.5 h-3.5" />;
      case 'Television':
        return <Tv className="w-3.5 h-3.5" />;
      case 'Video Conference':
        return <Video className="w-3.5 h-3.5" />;
      case 'Whiteboard':
        return <PenTool className="w-3.5 h-3.5" />;
      case 'Microphone':
        return <Mic className="w-3.5 h-3.5" />;
      case 'Speaker':
      case 'PA System':
        return <Volume2 className="w-3.5 h-3.5" />;
      case 'Smart Board':
        return <Presentation className="w-3.5 h-3.5" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 font-medium ${sizeClasses}`}
    >
      <span className="text-slate-500">{getIcon()}</span>
      <span>{item}</span>
    </span>
  );
};
