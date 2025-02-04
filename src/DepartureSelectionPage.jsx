import React, { useState, useEffect } from 'react';
import { DepartureSelection } from 'jetsetgo_departure-selection';
import { useNavigate } from 'react-router-dom';
import { getOutboundDepartures, getReturnDepartures } from './dataService';
import testingContext from '../testingcontext.json';
import testConfig from '../testconfig.json';

// Helper functions for persistent context
const getPersistedContext = () => {
  const stored = sessionStorage.getItem('departureSelectionContext');
  return stored ? JSON.parse(stored) : testingContext;
};

const persistContext = (context) => {
  sessionStorage.setItem('departureSelectionContext', JSON.stringify(context));
};

function DepartureSelectionPage({ onData }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState('both');
  const [services, setServices] = useState({
    departure: [],
    return: []
  });

  // Initialize state from persisted context
  const [selectedOutboundId, setSelectedOutboundId] = useState(() => getPersistedContext().selectedOutboundId);
  const [selectedReturnId, setSelectedReturnId] = useState(() => getPersistedContext().selectedReturnId);
  const [currentContext, setCurrentContext] = useState(() => getPersistedContext().currentContext);

  // Load initial data
  useEffect(() => {
    const outboundData = getOutboundDepartures();
    const returnData = getReturnDepartures();
    setServices({
      departure: outboundData.outboundServices,
      return: returnData.returnServices
    });
  }, []);

  // Send initial context to parent when component mounts
  useEffect(() => {
    onData({
      type: 'contextChange',
      event: {
        previousContext: currentContext,
        nextContext: currentContext,
        selectedOutboundId,
        selectedReturnId
      }
    });
  }, []);

  const handleDateSelect = async (event) => {
    setIsLoading(true);
    setLoadingContext(event.context);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    onData({ type: 'dateSelect', event });
  };

  const handleServiceSelect = (event) => {
    onData({ type: 'serviceSelect', event });
  };

  const handleContextChange = (event) => {
    // Update the state with the new values from the event
    const newContext = {
      selectedOutboundId: event.selectedOutboundId,
      selectedReturnId: event.selectedReturnId,
      currentContext: event.nextContext
    };

    setSelectedOutboundId(event.selectedOutboundId);
    setSelectedReturnId(event.selectedReturnId);
    setCurrentContext(event.nextContext);
    
    // Persist the new context
    persistContext(newContext);
    
    onData({ type: 'contextChange', event });
    
    // Navigate to options if we're moving from outbound to return
    if (event.previousContext === 'outbound' && event.nextContext === 'return') {
      navigate('/options');
    }
  };

  const handleComplete = (data) => {
    onData({ type: 'complete', data });
    
    // Store the selected return service ID in session storage
    const newContext = {
      selectedOutboundId: data.selectedDepartureId,
      selectedReturnId: data.selectedReturnId,
      currentContext: 'return'
    };
    persistContext(newContext);
    
    // Navigate to options page for return journey
    navigate('/options');
  };

  const uiConfig = {
    continueToReturnText: "Continue to Return Journey",
    finalContinueText: "Complete Booking",
    backToOutboundText: "Back to Outbound",
    backText: "Back",
    outboundTitle: "Select Outbound Journey",
    returnTitle: "Select Return Journey",
    pageTitle: "Choose your journey",
    pageSubtitle: "Select your preferred travel times",
    outboundButtonMode: testConfig.returnRequired ? 'continue' : 'complete' // Set based on whether return is required
  };

  return (
    <DepartureSelection
      initialData={services}
      uiConfig={uiConfig}
      onComplete={handleComplete}
      onDateSelect={handleDateSelect}
      onServiceSelect={handleServiceSelect}
      onContextChange={handleContextChange}
      isLoading={isLoading}
      loadingContext={loadingContext}
      selectedOutboundId={selectedOutboundId}
      selectedReturnId={selectedReturnId}
      currentContext={currentContext}
    />
  );
}

export default DepartureSelectionPage;