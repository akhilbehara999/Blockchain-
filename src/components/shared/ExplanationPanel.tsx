import React, { useState } from 'react';
import { EXPLANATIONS } from '../../content/explanations';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Tabs from '../ui/Tabs';
import Sheet from '../ui/Sheet';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BookOpen, Code, Info } from 'lucide-react';

interface ExplanationPanelProps {
  moduleId: string;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ moduleId }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'simple' | 'technical'>('simple');
  const [isOpen, setIsOpen] = useState(false);

  const explanation = EXPLANATIONS[moduleId as keyof typeof EXPLANATIONS];

  if (!explanation) {
    return null;
  }

  const tabs = [
    { id: 'simple', label: 'Simple', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'technical', label: 'Technical', icon: <Code className="w-4 h-4" /> },
  ];

  const content = (
    <div className="space-y-4">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'simple' | 'technical')}
        className="w-full"
      />
      <div className="mt-4 text-text-secondary leading-relaxed space-y-4">
        <p>{explanation[activeTab]}</p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsOpen(true)}
            className="rounded-full shadow-lg shadow-indigo-500/40"
          >
            <Info className="w-5 h-5 mr-2" />
            Explain
          </Button>
        </div>

        <Sheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Module Explanation"
        >
          {content}
        </Sheet>
      </>
    );
  }

  return (
    <Card className="mt-8">
      <div className="flex items-center mb-4 space-x-2">
        <Info className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Explanation</h3>
      </div>
      {content}
    </Card>
  );
};

export default ExplanationPanel;
