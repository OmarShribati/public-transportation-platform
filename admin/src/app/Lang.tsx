import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function Lang() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const isRTL = document.documentElement.dir === "rtl";


  const toggleLang = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };


  const correctedThumbTranslateClass = isRTL
    ? (isArabic ? 'translate-x-0' : 'translate-x-8')
    : (isArabic ? 'translate-x-8' : 'translate-x-0');


  const activeShadow = 'shadow-[0_0_15px_rgba(0,188,212,0.6)]';
  const inactiveShadow = 'shadow-inner shadow-black/70';

  return (
    <div className="flex items-center justify-between gap-4 p-2">

      <div className="flex items-center gap-2 text-white/80">
        <Globe className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-medium">{t('Language')}</span>
      </div>


      <button
        onClick={toggleLang}

        className={`
          relative w-16 h-8 flex items-center rounded-full p-1 
          transition-all duration-500 ease-in-out active:scale-95
          ${isArabic ? 'bg-cyan-600' : 'bg-gray-700'}
          ${isArabic ? activeShadow : inactiveShadow}
        `}
        aria-checked={isArabic}
        role="switch"
      >

        <span
          className={`
            absolute w-6 h-6 rounded-full bg-white 
            transition-all duration-500 ease-in-out 
            flex items-center justify-center text-xs font-bold
            ${correctedThumbTranslateClass} 
            shadow-md
          `}
        >
          {isArabic ? 'Ar' : 'EN'}
        </span>
      </button>
    </div>
  );
}