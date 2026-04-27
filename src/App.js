import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { processText, requiresKey, getKeyPlaceholder } from './ciphers';

const ALGORITHMS = [
  { value: 'caesar', label: 'Caesar Cipher', description: 'Shift letters by a number' },
  { value: 'base64', label: 'Base64', description: 'Standard Base64 encoding' },
  { value: 'rot13', label: 'ROT13', description: 'Rotate by 13 places' },
  { value: 'xor', label: 'XOR Cipher', description: 'Key-based symmetric XOR' },
  { value: 'vigenere', label: 'Vigenère Cipher', description: 'Polyalphabetic substitution' },
  { value: 'atbash', label: 'Atbash', description: 'A↔Z substitution cipher' },
  { value: 'reverse', label: 'Reverse Text', description: 'Reverse character order' },
];

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [algorithm, setAlgorithm] = useState('caesar');
  const [mode, setMode] = useState('encrypt');
  const [key, setKey] = useState('3');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleProcess = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }
    const result = processText(inputText, algorithm, mode, key);
    setOutputText(result);

    // Add to history
    setHistory((prev) => [
      {
        id: Date.now(),
        algorithm,
        mode,
        input: inputText.length > 30 ? inputText.substring(0, 30) + '...' : inputText,
        output: result.length > 30 ? result.substring(0, 30) + '...' : result,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 9),
    ]);
  }, [inputText, algorithm, mode, key]);

  // Auto-process when inputs change
  useEffect(() => {
    handleProcess();
  }, [handleProcess]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwap = () => {
    setInputText(outputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const needsKey = requiresKey(algorithm);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🔐</span>
          <h1>EncDecy</h1>
        </div>
        <p className="tagline">Encrypt and decrypt text with multiple cipher algorithms</p>
      </header>

      <main className="main-container">
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'encrypt' ? 'active encrypt' : ''}`}
            onClick={() => setMode('encrypt')}
          >
            <span className="mode-icon">🔒</span>
            Encrypt
          </button>
          <button
            className={`mode-btn ${mode === 'decrypt' ? 'active decrypt' : ''}`}
            onClick={() => setMode('decrypt')}
          >
            <span className="mode-icon">🔓</span>
            Decrypt
          </button>
        </div>

        {/* Algorithm Selector */}
        <div className="algorithm-section">
          <label className="section-label">Algorithm</label>
          <div className="algorithm-grid">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.value}
                className={`algorithm-card ${algorithm === algo.value ? 'active' : ''}`}
                onClick={() => setAlgorithm(algo.value)}
                title={algo.description}
              >
                <span className="algorithm-name">{algo.label}</span>
                <span className="algorithm-desc">{algo.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Key Input */}
        {needsKey && (
          <div className="key-section">
            <label className="section-label">
              {algorithm === 'caesar' ? 'Shift Value' : algorithm === 'xor' ? 'Secret Key' : 'Keyword'}
            </label>
            <input
              type={algorithm === 'caesar' ? 'number' : 'text'}
              className="key-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={getKeyPlaceholder(algorithm)}
            />
          </div>
        )}

        {/* Input / Output Area */}
        <div className="io-container">
          {/* Input */}
          <div className="io-box">
            <div className="io-header">
              <label className="section-label">Input Text</label>
              <div className="io-actions">
                <span className="char-count">{inputText.length} chars</span>
                <button className="icon-btn" onClick={handleClear} title="Clear">
                  🗑️
                </button>
              </div>
            </div>
            <textarea
              className="io-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter text to ${mode}...`}
              spellCheck={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="process-btn" onClick={handleProcess}>
              {mode === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
            </button>
            <button className="swap-btn" onClick={handleSwap} title="Use output as input">
              ⇅ Swap
            </button>
          </div>

          {/* Output */}
          <div className="io-box">
            <div className="io-header">
              <label className="section-label">Result</label>
              <div className="io-actions">
                <span className="char-count">{outputText.length} chars</span>
                <button className="icon-btn" onClick={handleCopy} title="Copy to clipboard">
                  {copied ? '✅' : '📋'}
                </button>
              </div>
            </div>
            <textarea
              className="io-textarea output"
              value={outputText}
              readOnly
              placeholder={`${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} text will appear here...`}
              spellCheck={false}
            />
            {copied && <span className="copy-toast">Copied to clipboard!</span>}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="history-section">
            <label className="section-label">Recent Operations</label>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className={`history-badge ${item.mode}`}>
                    {item.mode === 'encrypt' ? '🔒' : '🔓'}
                  </span>
                  <span className="history-algo">{ALGORITHMS.find((a) => a.value === item.algorithm)?.label}</span>
                  <span className="history-text" title={`${item.input} → ${item.output}`}>
                    {item.input} → {item.output}
                  </span>
                  <span className="history-time">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>EncDecy — Simple, client-side text encryption & decryption</p>
      </footer>
    </div>
  );
}

export default App;

