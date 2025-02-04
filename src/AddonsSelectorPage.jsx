import React, { useEffect, useState } from 'react';
import { AddonsSelector } from 'jsg_addons-selector';
import { getOptionsForService } from './dataService';
import testConfig from '../testconfig.json';
import { useNavigate } from 'react-router-dom';

function AddonsSelectorPage({ onData, appState }) {
  const [optionsData, setOptionsData] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the current context from session storage
    const context = JSON.parse(sessionStorage.getItem('departureSelectionContext') || '{}');
    
    // If we have a complete event (return journey), use the return service ID
    if (context.currentContext === 'return' && context.selectedReturnId) {
      const options = getOptionsForService(context.selectedReturnId, true);
      setOptionsData(options);
    }
    // If we have a context change event (outbound journey), use the outbound service ID
    else if (context.selectedOutboundId) {
      const options = getOptionsForService(context.selectedOutboundId, false);
      setOptionsData(options);
    }
  }, []); // Run once when component mounts

  const handleComplete = (data) => {
    console.log('Selected options:', data);
    
    // First send the data to parent
    onData({ type: 'addonsComplete', data });
    
    // Then handle navigation based on current context and config
    if (appState.addonsSelectionContext === 'outbound' && testConfig.returnRequired) {
      // Navigate back to departure selection
      navigate('/');
    }
  };

  const handleBack = () => {
    console.log('Back button clicked');
    onData({ type: 'addonsBack' });
  };

  return (
    <AddonsSelector
      onComplete={handleComplete}
      onBack={handleBack}
      initialData={optionsData || {}}
      testMode={testConfig.testMode}
      debugMessages={testConfig.debugMessages}
      headings={{
        title: "Select Your Package",
        subtitle: "Choose the package that fits your needs"
      }}
    />
  );
}

export default AddonsSelectorPage;