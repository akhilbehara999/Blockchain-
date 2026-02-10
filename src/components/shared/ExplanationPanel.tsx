import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { EXPLANATIONS } from '../../content/explanations';
import Tabs from '../ui/Tabs';
import Sheet from '../ui/Sheet';
import { BookOpen, Terminal } from 'lucide-react';
import Card from '../ui/Card';

interface ExplanationPanelProps {
  moduleId: string;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ moduleId }) => {
  const [activeTab, setActiveTab] = useState<'simple' | 'technical'>('simple');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const content = EXPLANATIONS[moduleId] || { simple: 'Content not found', technical: 'Content not found' };

  const tabs = [
    { id: 'simple', label: 'Simple', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'technical', label: 'Technical', icon: <Terminal className="w-4 h-4" /> },
  ];

  // Mobile layout: render trigger button, sheet on click
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-24 right-4 z-40">
           <button
             onClick={() => setIsSheetOpen(true)}
             className="bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
             aria-label="Open explanation"
           >
             <BookOpen className="w-6 h-6" />
           </button>
        </div>

        <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Explanation">
           <Tabs
             tabs={tabs}
             activeTab={activeTab}
             onChange={(id) => setActiveTab(id as 'simple' | 'technical')}
             className="mb-4"
           />
           <div className="prose prose-invert max-w-none pb-20">
             <div className="whitespace-pre-wrap font-sans text-text-secondary">
               {content[activeTab]}
             </div>
           </div>
        </Sheet>
      </>
    );
  }

  // Desktop layout: render inline card
  return (
    <Card className="mt-8 bg-tertiary-bg/30 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Explanation</h3>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'simple' | 'technical')}
        />
      </div>
      <div className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed">
          {content[activeTab]}
        </div>
      </div>
    </Card>
  );
};

export default ExplanationPanel;
