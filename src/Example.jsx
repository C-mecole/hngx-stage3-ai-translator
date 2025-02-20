import { useEffect, useState } from "react";

function Translator() {
  const [translator, setTranslator] = useState(null);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es"); // Default to Spanish
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    async function initTranslator() {
      console.log("🔍 Checking AI Translator API...");

      if (!("ai" in self) || !self.ai.languageDetector || !self.ai.translator) {
        document.querySelector('.not-supported-message').hidden = false;
        return;
      }

      // Initialize the language detector
      const detector = await self.ai.languageDetector.create();

      const input = document.querySelector('textarea');
      input.addEventListener('input', async () => {
        if (!input.value.trim()) {
          setDetectedLanguage('not sure what language this is');
          setConfidence(0);
          return;
        }
        const { detectedLanguage, confidence } = (
          await detector.detect(input.value.trim())
        )[0];
        setDetectedLanguage(`${(confidence * 100).toFixed(1)}% sure that this is ${languageTagToHumanReadable(detectedLanguage, 'en')}`);
        setConfidence(confidence);
      });

      // Handle language translation setup when API is available
      const languageTagToHumanReadable = (languageTag, targetLanguage) => {
        const displayNames = new Intl.DisplayNames([targetLanguage], {
          type: 'language',
        });
        return displayNames.of(languageTag);
      };

      document.querySelectorAll('[hidden]:not(.not-supported-message)').forEach((el) => {
        el.removeAttribute('hidden');
      });

      setTranslator({
        detectLanguage: detector,
        translate: async (text) => {
          const sourceLanguage = (await detector.detect(text.trim()))[0].detectedLanguage;
          if (!['en', 'pt', 'es', 'ru', 'tr', 'fr' ].includes(sourceLanguage)) {
            setTranslatedText('Currently, only English ↔ Spanish and English ↔ Japanese are supported.');
            return;
          }

          try {
            const aiTranslator = await self.ai.translator.create({
              sourceLanguage,
              targetLanguage,
            });
            const translation = await aiTranslator.translate(text.trim());
            setTranslatedText(translation);
          } catch (err) {
            console.error("❌ Error with translation:", err);
            setTranslatedText("⚠️ An error occurred. Please try again.");
          }
        }
      });

      console.log("🚀 Translator is ready!");
    }

    initTranslator();
  }, [targetLanguage]);

  const handleTranslate = async () => {
    if (!translator) {
      console.error("❌ Translator is not initialized.");
      return;
    }

    setLoading(true);
    setTranslatedText(""); // Clear previous translation

    try {
      await translator.translate(inputText);
    } catch (error) {
      console.error("❌ Translation failed:", error);
      setTranslatedText("⚠️ Translation failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">AI Translator</h2>

      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter text to translate..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>

      <select
        className="mt-2 p-2 border rounded"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="zh">Chinese</option>
      </select>

      <button
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
        onClick={handleTranslate}
        disabled={loading || !translator}
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {detectedLanguage && (
        <div className="mt-2">
          <p>Detected Language: {detectedLanguage}</p>
        </div>
      )}

      {translatedText && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold">Translated Text:</h3>
          <p>{translatedText}</p>
          
        </div>
      )}
    </div>
  );
}

export default Translator;
