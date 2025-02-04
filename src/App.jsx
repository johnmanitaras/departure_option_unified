import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import DepartureSelectionPage from './DepartureSelectionPage';
import AddonsSelectorPage from './AddonsSelectorPage';
import Modal from './Modal';
import StateModal from './StateModal';
import testConfig from '../testconfig.json';

function App() {
  const [modalData, setModalData] = useState(null);
  const [debugMode, setDebugMode] = useState(testConfig.debugModalsOn);
  const [showStateModal, setShowStateModal] = useState(false);

  // Global state tracking
  const [appState, setAppState] = useState({
    currentPage: 'departureSelection',
    departureSelectionContext: null,
    departureSelection_outbound_service: null,
    departureSelection_return_service: null,
    addonsSelectionContext: null,
    addonsOutboundSelectionFor: null,
    addonsReturnSelectionFor: null,
    addonsOutboundSelectionChoices: null,
    addonsReturnSelectionChoices: null
  });

  useEffect(() => {
    setDebugMode(testConfig.debugModalsOn);
  }, []);

  const handleData = (data) => {
    if (debugMode) {
      setModalData(data);
    }

    setAppState(prevState => {
      const newState = { ...prevState };

      if (data.type === 'contextChange') {
        newState.departureSelectionContext = data.event.nextContext;

        if (data.event.selectedOutboundId !== prevState.departureSelection_outbound_service) {
          newState.departureSelection_outbound_service = data.event.selectedOutboundId;
          newState.departureSelection_return_service = null;
          newState.addonsReturnSelectionChoices = null;
          newState.addonsReturnSelectionFor = null;
        }

        if (data.event.previousContext === 'outbound' && data.event.nextContext === 'return') {
          newState.currentPage = 'addonsSelection';
          newState.addonsSelectionContext = 'outbound';
          newState.addonsOutboundSelectionFor = data.event.selectedOutboundId;
        }
      }
      else if (data.type === 'complete') {
        newState.departureSelection_return_service = data.data.selectedReturnId;
        newState.currentPage = 'addonsSelection';
        newState.addonsSelectionContext = 'return';
        newState.addonsReturnSelectionFor = data.data.selectedReturnId;
        newState.departureSelectionContext = null;
      }
      else if (data.type === 'addonsComplete') {
        if (prevState.addonsSelectionContext === 'outbound') {
          newState.addonsOutboundSelectionChoices = data.data;
        } else if (prevState.addonsSelectionContext === 'return') {
          newState.addonsReturnSelectionChoices = data.data;
        }
      }

      return newState;
    });
  };

  const handleRouteChange = (pathname) => {
    setAppState(prevState => {
      const newState = { ...prevState };
      if (pathname === '/') {
        newState.currentPage = 'departureSelection';
      } else if (pathname === '/options') {
        newState.currentPage = 'addonsSelection';
        newState.departureSelectionContext = null;
      }
      return newState;
    });
  };

  const closeModal = () => {
    setModalData(null);
  };

  const toggleStateModal = () => {
    setShowStateModal(!showStateModal);
  };

  return (
    <Router>
      <AppContent 
        appState={appState}
        handleData={handleData}
        handleRouteChange={handleRouteChange}
        modalData={modalData}
        closeModal={closeModal}
        showStateModal={showStateModal}
        toggleStateModal={toggleStateModal}
        setAppState={setAppState}
      />
    </Router>
  );
}

function AppContent({ 
  appState, 
  handleData, 
  handleRouteChange, 
  modalData, 
  closeModal, 
  showStateModal, 
  toggleStateModal,
  setAppState
}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    handleRouteChange(location.pathname);
  }, [location.pathname]);

  const handleReset = () => {
    sessionStorage.clear();
    
    setAppState({
      currentPage: 'departureSelection',
      departureSelectionContext: null,
      departureSelection_outbound_service: null,
      departureSelection_return_service: null,
      addonsSelectionContext: null,
      addonsOutboundSelectionFor: null,
      addonsReturnSelectionFor: null,
      addonsOutboundSelectionChoices: null,
      addonsReturnSelectionChoices: null
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <ul className="flex space-x-8">
              <li>
                <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Departure Selection
                </Link>
              </li>
              <li>
                <Link to="/options" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Addons Selector
                </Link>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset App
              </button>
              <button
                onClick={toggleStateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Show State
              </button>
            </div>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<DepartureSelectionPage onData={handleData} />} />
        <Route path="/options" element={<AddonsSelectorPage onData={handleData} appState={appState} />} />
      </Routes>
      {modalData && <Modal data={modalData} onClose={closeModal} />}
      {showStateModal && <StateModal data={appState} onClose={toggleStateModal} />}
    </div>
  );
}

export default App;