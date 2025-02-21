import  { useState,useEffect } from 'react';
import { BsFillSendFill } from "react-icons/bs";
import { SiGoogletranslate } from "react-icons/si";


const App = () => { 
  const [darkMode, setDarkMode] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prompt, setPrompt] = useState(false);
  const [translator, setTranslator] = useState(null);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [summary, setSummary] = useState(""); // Store summarized text
  const [summarizeButton, setSummarizeButton] = useState(false);

  useEffect(() => {
    async function initTranslator() {
      console.log("🔍 Checking AI Translator API...");

      if (!("ai" in self) || !self.ai.languageDetector || !self.ai.translator) {
        alert('Not supported in your device at the moment');
        // document.querySelector(".not-supported-message").hidden = false;
        return;
      }

      const detector = await self.ai.languageDetector.create();
      const input = document.querySelector("textarea");
      input.addEventListener("input", async () => {
        if (!input.value.trim()) {
          setDetectedLanguage("not sure what language this is");
          setConfidence(0);
          return;
        }
        const { detectedLanguage, confidence } = (
          await detector.detect(input.value.trim())
        )[0];
        setDetectedLanguage(
          `${(confidence * 100).toFixed(1)}% detected to be ${languageTagToHumanReadable(
            detectedLanguage,
            "en"
          )}`
        );
        setConfidence(confidence);
      });

      const languageTagToHumanReadable = (languageTag, targetLanguage) => {
        const displayNames = new Intl.DisplayNames([targetLanguage], {
          type: "language",
        });
        return displayNames.of(languageTag);
      };

      document
        .querySelectorAll("[hidden]:not(.not-supported-message)")
        .forEach((el) => {
          el.removeAttribute("hidden");
        });

      setTranslator({
        detectLanguage: detector,
        translate: async (text) => {
          const sourceLanguage = (
            await detector.detect(text.trim())
          )[0].detectedLanguage;
          if (!["en", "pt", "es", "ru", "tr", "fr"].includes(sourceLanguage)) {
            setPrompt(true);
            return;
          } else if (
            ["en", "pt", "es", "ru", "tr", "fr"].includes(sourceLanguage)
          ) {
            setPrompt(false);
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
        },
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
    setTranslatedText("Translating..."); // Show loading message
  
    try {
      await translator.translate(inputText);
    } catch (error) {
      console.error("❌ Translation failed:", error);
      setTranslatedText("⚠️ Translation failed");
    }
  
    setLoading(false);
  };
  
  // Summarization function
  

useEffect(() => {
  const wordCount = inputText.trim().split(/\s+/).length;
  setSummarizeButton(wordCount > 150); // Show button only if words > 150
}, [inputText]);

const summarizeText = async () => {
  if (!("ai" in self) || !self.ai.summarizer) {
    console.error("❌ Summarizer API is not available.");
    alert("❌ Summarizer API is not available.");
    return;
  }

  setLoading(true);
  setSummary("Summarizing..."); // Show loading message

  try {
    const summarizer = await self.ai.summarizer.create();
    const summaryResult = await summarizer.summarize(inputText);
    setSummary(summaryResult);
  } catch (error) {
    console.error("❌ Summarization error:", error);
    setSummary("⚠️ An error occurred while summarizing.");
  }
  setLoading(false);
};

  
  return (
    <>
    <main className={`flex justify-center items-center py-8 ${darkMode? 'bg-gray-500': 'bg-transparent'}`}>
      <div className={`min-h-[90vh] xl:w-[50vw] md:w-[80vw] w-[90vw] rounded-2xl overflow-x-hidden  bg-gray-200 flex flex-col ${darkMode? 'bg-gray-900': 'bg-gray-200'}`}>
        <div className='h-20 bg-rose-800 w-full flex-grow-0 flex-shrink-0 flex justify-between items-center p-5'>
        {/* header components */}
        <div className='text-white sm:text-2xl text-xl font-[Roboto]'>
          <span>AI TRANSLATOR</span>
        </div>
        <div className={`rounded-3xl w-[80px] h-full p-1 bg-gray-200 `} >
          <div className={`h-full w-full rounded-3xl flex ${!darkMode? 'justify-start bg-slate-800': 'justify-end  bg-gray-400'}`}
          onClick={()=>!darkMode? setDarkMode(true): setDarkMode(false)}
          >
          <div 
          
          className='bg-rose-800 h-full w-1/2 rounded-full shadow-md shadow-black'>
        </div>
          </div>
        </div>
        </div>
        <div className='flex-grow overflow-y-scroll custom-scrollbar h-[65vh]'>
          {/* texting area */}
          <div className="relative">
      <button
        onClick={() => {
          console.log('Button was clicked!');
          setVisible(prev => !prev);
        }}
        className="h-[50px] w-[50px] bg-rose-800 rounded-full flex justify-center items-center shadow-md shadow-black absolute top-3 left-3 z-10"
      >
        <SiGoogletranslate size={30} color="white" />
      </button>
      
      
      <div className={`pt-5 transition-all duration-500 ${!visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}`}>

        <div className="bg-slate-100 flex w-fit gap-4 justify-center items-center px-2 shadow ml-16">
          <select 
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="p-2 outline-none bg-transparent rounded">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="tr">Turkish</option>
            <option value="ru">Russia</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
      </div>
      </div>
      {/* starts here */}
        <div className='min-h-[65vh] flex flex-col gap-4 p-4 relative'>
        {summarizeButton && (
          <button 
          onClick={summarizeText}
          className='p-3 bg-rose-800 rounded-xl shadow-md shadow-black text-white absolute right-3 bottom-10'>Summarize</button>
        )}
          <div className={`${darkMode? 'bg-[#4b55638d]': 'bg-[#ffffff8f]'} min-h-[27vh] w-3/5 rounded-xl place-self-end shadow p-1`}>
          <textarea name="text" id="text"
          placeholder='enter text here'
          value={inputText}
        onChange={(e) => setInputText(e.target.value)}
          className={`min-h-[27vh] w-full bg-transparent outline-none  overflow-hidden resize-none p-4 ${darkMode? 'text-gray-300': 'text-black'}`}
          ></textarea>
          
          </div>
          <div className={`${darkMode? 'bg-[#4b55638d]': 'bg-[#ffffff8f]'} min-h-[27vh] w-3/5 rounded-xl place-self-start shadow p-4 relative`}>
          
          <div className={`absolute bottom-14 p-3 bg-white transition-all duration-500 transform
          ${prompt ? 'opacity-100 scale-100 translate-x-0 -right-60' : 'opacity-0 scale-95 -translate-x-10 left-0 hidden'} 
          rounded-lg shadow-md shadow-red-300`}
>
          <h3 className = 'font-bold'>List of supported languages</h3>
          <ul className='grid grid-cols-2 mt-2 ml-4'>
            <li>English</li>
            <li>Spanish</li>
            <li>Portuguese</li>
            <li>French</li>
            <li>Russia</li>
            <li>Turkish</li>
          </ul>
        </div>
          <div className='min-h-[20vh]'>
          {translatedText && (
          <p className={`${darkMode? 'text-gray-300': 'text-black'}`}>{translatedText}</p>
      )}
          </div>
        <div>
        {summary && (
                <div className={`${darkMode? 'text-gray-300': 'text-black'} p-4`}>
                  <p>{ summary}</p>
                </div>
              )}
        </div>
          </div>
        </div>
        </div>
        <div className='min-h-20 w-full flex-grow-0 flex-shrink-0 sm:py-3 flex justify-around items-center sm:px-6 p-1'>
        {/* footer components */}
        
        <div  className={` h-full md:w-10/12 w-[70%] rounded-lg shadow-md px-4 py-2 ${darkMode? 'bg-[#4b55638d] text-gray-300': 'bg-[#ffffff8f] text-black'}`}>
        <span className='font-bold'>Detected Language:</span>
        {detectedLanguage && (
        <span> {detectedLanguage} </span>
      )}
        
        </div>
        <button 
        onClick={handleTranslate}
        disabled={loading || !translator}
        className='h-[50px] w-[50px] bg-rose-800 rounded-full flex justify-center items-center shadow-md shadow-black'>
            <BsFillSendFill size={30} color='white'/>
        </button>
        </div>
        
      </div>
    </main>
    </>
  )
}

export default App