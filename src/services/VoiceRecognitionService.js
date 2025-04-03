let recognition = null;

const setupRecognition = (onTranscriptionUpdate) => {
  // Prüfen, ob die Web Speech API verfügbar ist
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Ihr Browser unterstützt die Spracherkennung nicht. Bitte verwenden Sie Chrome, Edge oder Safari.');
    return null;
  }
  
  // Speech Recognition API initialisieren
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionInstance = new SpeechRecognition();
  
  // Konfiguration
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = 'de-DE';
  
  // Vollständiges Transkript speichern
  let fullTranscript = '';
  
  // Event-Handler
  recognitionInstance.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        fullTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Callback mit dem aktuellen Stand des Transkripts
    onTranscriptionUpdate(fullTranscript + interimTranscript);
  };
  
  recognitionInstance.onerror = (event) => {
    console.error('Fehler bei der Spracherkennung:', event.error);
    
    // Bei Netzwerkfehlern neu starten
    if (event.error === 'network') {
      setTimeout(() => {
        if (recognition === recognitionInstance) {
          recognitionInstance.start();
        }
      }, 1000);
    }
  };
  
  recognitionInstance.onend = () => {
    // Automatisch neu starten, falls die Erkennung unerwartet endet
    if (recognition === recognitionInstance) {
      recognitionInstance.start();
    }
  };
  
  return recognitionInstance;
};

export const startRecognition = async (onTranscriptionUpdate) => {
  // Prüfen ob bereits eine aktive Erkennung läuft
  if (recognition && recognition.state === 'recording') {
    return;
  }
  
  if (recognition) {
    await stopRecognition();
  }
  
  recognition = setupRecognition(onTranscriptionUpdate);
  
  if (recognition) {
    try {
      if (recognition.state !== 'recording') {
        await recognition.start();
      }
    } catch (error) {
      console.error('Fehler beim Starten der Spracherkennung:', error);
    }
  }
};

export const stopRecognition = async () => {
  if (recognition) {
    try {
      recognition.stop();
      recognition = null;
    } catch (error) {
      console.error('Fehler beim Stoppen der Spracherkennung:', error);
    }
  }
};