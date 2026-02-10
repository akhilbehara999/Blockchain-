import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Tooltip from '../components/ui/Tooltip';
import Badge from '../components/ui/Badge';
import Slider from '../components/ui/Slider';
import Tabs from '../components/ui/Tabs';
import ProgressBar from '../components/ui/ProgressBar';
import Toggle from '../components/ui/Toggle';
import Modal from '../components/ui/Modal';
import Sheet from '../components/ui/Sheet';
import { Home, Settings, User } from 'lucide-react';

const Landing: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [activeTab, setActiveTab] = useState('home');
  const [toggleValue, setToggleValue] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-8 space-y-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Component Library</h1>
        <p className="text-text-secondary">Reusable UI components built with Tailwind CSS and Framer Motion.</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card status="valid">
            <h3 className="text-lg font-medium mb-2">Valid Block</h3>
            <p className="text-text-secondary text-sm">This block has been mined and is valid.</p>
          </Card>
          <Card status="invalid">
            <h3 className="text-lg font-medium mb-2">Invalid Block</h3>
            <p className="text-text-secondary text-sm">This block contains invalid transactions.</p>
          </Card>
          <Card status="mining">
            <h3 className="text-lg font-medium mb-2">Mining...</h3>
            <p className="text-text-secondary text-sm">Currently finding the nonce.</p>
          </Card>
          <Card status="neutral">
            <h3 className="text-lg font-medium mb-2">Neutral Card</h3>
            <p className="text-text-secondary text-sm">Just a regular card component.</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <Input
            label="Username"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            label="With Error"
            error="This field is required"
          />
          <Input
            label="Hash (Monospace)"
            variant="monospace"
            value="0000a1b2c3d4e5f6..."
            readOnly
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Interactive Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-text-secondary">Toggle & Slider</h3>
            <Toggle
              label="Enable Feature"
              checked={toggleValue}
              onChange={setToggleValue}
            />
            <Slider
              label="Volume"
              min={0}
              max={100}
              value={sliderValue}
              onChange={setSliderValue}
              showValue
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-text-secondary">Tabs & Progress</h3>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
            <ProgressBar
              value={sliderValue}
              label="Progress"
              showPercentage
              color={sliderValue > 80 ? 'success' : sliderValue > 40 ? 'accent' : 'danger'}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Overlays & Badges</h2>
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
             <Tooltip content="This is a tooltip">
               <Button variant="secondary" size="sm">Hover for Tooltip</Button>
             </Tooltip>
             <Button variant="primary" onClick={() => setIsModalOpen(true)}>Open Modal</Button>
             <Button variant="primary" onClick={() => setIsSheetOpen(true)}>Open Sheet</Button>
          </div>
          <div className="flex gap-4">
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
        <p className="text-text-secondary">
          This is a modal component. It uses a backdrop blur and a spring animation for the entrance.
          You can close it by clicking the X button or clicking outside.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </div>
      </Modal>

      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Example Sheet">
        <div className="space-y-4">
          <p className="text-text-secondary">
            This is a bottom sheet component, optimized for mobile but works on desktop too.
            You can drag it down to close it.
          </p>
          <div className="h-40 bg-tertiary-bg rounded-xl flex items-center justify-center text-text-secondary">
            Content Placeholder
          </div>
          <Button className="w-full" onClick={() => setIsSheetOpen(false)}>Close Sheet</Button>
        </div>
      </Sheet>
    </div>
  );
};

export default Landing;
