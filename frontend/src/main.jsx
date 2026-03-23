import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import App from './App';
import AppSplash from './components/AppSplash';
import './index.css';

function Root() {
  // Persist across reloads within same session — back-button reloads won't re-show splash
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splashShown') === '1'
  );

  const handleDone = () => {
    sessionStorage.setItem('splashShown', '1');
    setSplashDone(true);
  };

  if (splashDone) return <App />;

  return <AppSplash onDone={handleDone} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <DataProvider>
          <Root />
        </DataProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
