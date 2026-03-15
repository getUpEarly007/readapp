import React, { useState, useCallback } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('input');
  const [textInput, setTextInput] = useState('');
  const [wordPairs, setWordPairs] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [audioReady, setAudioReady] = useState(false);
  const [savedCards, setSavedCards] = useState(() => {
    const saved = localStorage.getItem('savedCards');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);

  // Parse the input text - multiple lines
  const parseInput = useCallback(() => {
    const lines = textInput.split('\n').filter(line => line.trim());
    const pairs = [];
    
    for (const line of lines) {
      const parts = line.split('-').map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        pairs.push({ english: parts[0], chinese: parts[1] });
      }
    }
    
    if (pairs.length > 0) {
      setWordPairs(pairs);
      setAudioReady(true);
      setStatusMessage({ type: 'success', text: `${pairs.length} word pair(s) ready!` });
      return pairs;
    } else {
      setStatusMessage({ type: 'error', text: 'Please use format: english - 中文 (one pair per line)' });
      return null;
    }
  }, [textInput]);

  // Play audio for multiple pairs sequentially
  const playAllAudio = useCallback((pairs) => {
    if (!pairs || pairs.length === 0) return;

    setIsPlaying(true);
    const synth = window.speechSynthesis;
    synth.cancel();

    let pairIndex = 0;
    
    const playPair = () => {
      if (pairIndex >= pairs.length) {
        setIsPlaying(false);
        setCurrentPlayingIndex(-1);
        return;
      }

      setCurrentPlayingIndex(pairIndex);
      const pair = pairs[pairIndex];
      const utterances = [];

      if (pair.english) {
        const engUtterance = new SpeechSynthesisUtterance(pair.english);
        engUtterance.lang = 'en-US';
        engUtterance.rate = 0.8;
        utterances.push(engUtterance);
      }

      if (pair.chinese) {
        const chiUtterance = new SpeechSynthesisUtterance(pair.chinese);
        chiUtterance.lang = 'zh-CN';
        chiUtterance.rate = 0.8;
        utterances.push(chiUtterance);
      }

      let uttIndex = 0;
      const playNextUtterance = () => {
        if (uttIndex < utterances.length) {
          utterances[uttIndex].onend = () => {
            uttIndex++;
            setTimeout(playNextUtterance, 300);
          };
          synth.speak(utterances[uttIndex]);
        } else {
          pairIndex++;
          setTimeout(playPair, 600); // Pause between pairs
        }
      };

      playNextUtterance();
    };

    playPair();
  }, []);

  // Play a single pair
  const playSinglePair = useCallback((english, chinese) => {
    setIsPlaying(true);
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterances = [];

    if (english) {
      const engUtterance = new SpeechSynthesisUtterance(english);
      engUtterance.lang = 'en-US';
      engUtterance.rate = 0.8;
      utterances.push(engUtterance);
    }

    if (chinese) {
      const chiUtterance = new SpeechSynthesisUtterance(chinese);
      chiUtterance.lang = 'zh-CN';
      chiUtterance.rate = 0.8;
      utterances.push(chiUtterance);
    }

    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex < utterances.length) {
        utterances[currentIndex].onend = () => {
          currentIndex++;
          setTimeout(playNext, 300);
        };
        synth.speak(utterances[currentIndex]);
      } else {
        setIsPlaying(false);
      }
    };

    playNext();
  }, []);

  // Generate and play current input
  const generateAndPlay = useCallback(() => {
    const parsed = parseInput();
    if (parsed) {
      playAllAudio(parsed);
    }
  }, [parseInput, playAllAudio]);

  // Save all pairs as a card
  const saveCard = useCallback(() => {
    if (wordPairs.length === 0) {
      setStatusMessage({ type: 'error', text: 'Nothing to save.' });
      return;
    }

    const newCard = {
      id: Date.now(),
      pairs: wordPairs,
      createdAt: new Date().toISOString()
    };

    const updatedCards = [newCard, ...savedCards];
    setSavedCards(updatedCards);
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
    
    setStatusMessage({ type: 'success', text: `Saved ${wordPairs.length} word pair(s)!` });
    setTextInput('');
    setWordPairs([]);
    setAudioReady(false);
  }, [wordPairs, savedCards]);

  // Delete saved card
  const deleteCard = useCallback((id) => {
    const updatedCards = savedCards.filter(card => card.id !== id);
    setSavedCards(updatedCards);
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
  }, [savedCards]);

  // Clear current input
  const clearInput = useCallback(() => {
    setTextInput('');
    setWordPairs([]);
    setAudioReady(false);
    setStatusMessage({ type: '', text: '' });
  }, []);

  // Stop playing
  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentPlayingIndex(-1);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>📚 English Learning</h1>
        <p>Learn vocabulary with audio</p>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          ✏️ Input
        </button>
        <button 
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved ({savedCards.length})
        </button>
      </div>

      {activeTab === 'input' && (
        <>
          <div className="card">
            <h2 className="card-title">✏️ Enter Word Pairs</h2>
            
            {statusMessage.text && (
              <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}

            <div className="input-section">
              <label className="text-label" htmlFor="word-input">
                One pair per line: english - 中文
              </label>
              <textarea
                id="word-input"
                className="text-input textarea"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="deluge - 洪水&#10;ensnare - 诱捕&#10;jiggle - 摇晃&#10;autocratic - 专制"
                rows={6}
              />
              
              {textInput && (
                <button 
                  className="btn btn-secondary btn-small clear-btn-bottom"
                  onClick={clearInput}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {audioReady && wordPairs.length > 0 && (
              <div className="parsed-words">
                <div className="parsed-header">
                  {wordPairs.length} word pair(s) parsed:
                </div>
                {wordPairs.map((pair, index) => (
                  <div 
                    key={index} 
                    className={`word-pair ${currentPlayingIndex === index ? 'playing' : ''}`}
                    onClick={() => playSinglePair(pair.english, pair.chinese)}
                  >
                    <span className="word-english">{pair.english}</span>
                    <span className="word-divider">—</span>
                    <span className="word-chinese">{pair.chinese}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">🔊 Audio</h2>
            
            <div className="audio-controls">
              {isPlaying ? (
                <button 
                  className="btn btn-danger"
                  onClick={stopAudio}
                >
                  ⏹️ Stop
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={generateAndPlay}
                  disabled={!textInput.trim()}
                >
                  🔊 Play All
                </button>
              )}

              {audioReady && !isPlaying && (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => playAllAudio(wordPairs)}
                  >
                    🔁 Replay All
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={saveCard}
                  >
                    💾 Save Card
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'saved' && (
        <div className="card">
          <h2 className="card-title">💾 Saved Cards</h2>
          
          {savedCards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>No saved cards yet</p>
              <p>Add your first word pairs!</p>
            </div>
          ) : (
            <div className="saved-cards">
              {savedCards.map((card) => (
                <div key={card.id} className="saved-card">
                  <div className="saved-card-header">
                    <span className="saved-card-count">
                      {card.pairs ? card.pairs.length : 1} word(s)
                    </span>
                    <span className="saved-card-date">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="saved-card-words">
                    {card.pairs ? (
                      card.pairs.map((pair, idx) => (
                        <div 
                          key={idx} 
                          className="saved-word-pair"
                          onClick={() => playSinglePair(pair.english, pair.chinese)}
                        >
                          <span>{pair.english}</span>
                          <span className="word-divider">—</span>
                          <span>{pair.chinese}</span>
                        </div>
                      ))
                    ) : (
                      <div className="saved-word-pair">
                        <span>{card.english}</span>
                        <span className="word-divider">—</span>
                        <span>{card.chinese}</span>
                      </div>
                    )}
                  </div>
                  <div className="saved-card-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => playAllAudio(card.pairs || [{ english: card.english, chinese: card.chinese }])}
                      disabled={isPlaying}
                    >
                      🔊 Play All
                    </button>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => deleteCard(card.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
