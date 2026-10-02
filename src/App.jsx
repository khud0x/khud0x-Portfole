import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { translations } from "../translations.js";
import { buildContactMailto, CONTACT_EMAIL } from "./contact.js";
import "../styles.css";

const LANGUAGES = ["uz", "ru", "en", "tj"];
const LANGUAGE_TAGS = { uz: "uz", ru: "ru", en: "en", tj: "tg" };
function readPreference(key, accepted, fallback) {
  try {
    const value = localStorage.getItem(key);
    return accepted.includes(value) ? value : fallback;
  } catch (error) {
    console.warn(`Could not read the saved ${key} preference.`, error);
    return fallback;
  }
}

function useNotice() {
  const [notice, setNotice] = useState("");
  const timer = useRef(null);
  const notify = useCallback((message, duration = 2600) => {
    setNotice(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(""), duration);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [notice, notify];
}

export default function App() {
  const [language, setLanguage] = useState(() => readPreference("khud0x-language", LANGUAGES, "uz"));
  const [theme, setTheme] = useState(() => readPreference("khud0x-theme", ["light", "dark"], "dark"));
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const languagePickerRef = useRef(null);
  const languageButtonRef = useRef(null);
  const languageOptionsRef = useRef(null);
  const dialogRef = useRef(null);
  const [notice, notify] = useNotice();
  const t = useCallback((key) => {
    const value = translations[language]?.[key];
    if (typeof value !== "string") {
      console.error(`Missing "${key}" translation for "${language}".`);
      return key;
    }
    return value;
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAGS[language];
    document.title = t("pageTitle");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = t("metaDescription");
    try {
      localStorage.setItem("khud0x-language", language);
    } catch (error) {
      console.warn("Could not save the selected language.", error);
    }
  }, [language, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "light" ? "#ffffff" : "#10192e";
    try {
      localStorage.setItem("khud0x-theme", theme);
    } catch (error) {
      console.warn("Could not save the selected theme.", error);
    }
  }, [theme]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (profileOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("[data-close-profile]")?.focus();
    } else if (!profileOpen && dialog.open) {
      dialog.close();
    }
  }, [profileOpen]);

  useEffect(() => {
    if (!languageOpen) return;
    languageOptionsRef.current?.querySelector('[aria-selected="true"]')?.focus();
  }, [languageOpen]);

  useEffect(() => {
    const sections = document.querySelectorAll(".doc-section");
    if (!("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: "-24% 0px -68% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!languagePickerRef.current?.contains(event.target)) setLanguageOpen(false);
      if (!event.target.closest(".search-wrap")) setQuery("");
    };
    const handleDocumentKeyDown = (event) => {
      if (event.key === "Escape") {
        if (languageOpen) {
          setLanguageOpen(false);
          languageButtonRef.current?.focus();
        }
        if (profileOpen) setProfileOpen(false);
        if (query) setQuery("");
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [languageOpen, profileOpen, query]);

  const searchItems = useMemo(() => [
    [t("navAbout"), "#introduction"], [t("navProfile"), "#background"],
    [t("navTechnologies"), "#skills"], [t("navSelectedProjects"), "#projects"],
    ["Kengash", "#kengash"], ["Colibriy Academiy", "#colibriy"], ["Фарҳанги Тоҷик", "#farhangi"],
    [t("projectWordlistTitle"), "#wordlist"], ["OmborWeb", "#omborweb"], [t("navMoreProjects"), "#github-more"],
    [t("navChannels"), "#channels"], [t("navContact"), "#contact"],
    [t("aboutTitle"), "#introduction"], [t("profileTitle"), "#background"],
    [t("skillsTitle"), "#skills"], [t("projectsTitle"), "#projects"],
    [t("channelsTitle"), "#channels"], [t("contactTitle"), "#contact"],
    [t("socialFarhangi"), "https://t.me/farhangi_tojik"],
    [t("socialColibriy"), "https://t.me/colibry_academiy"],
    [t("socialKhud0x"), "https://t.me/khud0x"]
  ], [t]);
  const matches = query.trim()
    ? searchItems.filter(([label]) => label.toLocaleLowerCase(LANGUAGE_TAGS[language]).includes(query.trim().toLocaleLowerCase(LANGUAGE_TAGS[language]))).slice(0, 8)
    : [];

  function chooseLanguage(nextLanguage) {
    if (LANGUAGES.includes(nextLanguage)) setLanguage(nextLanguage);
    setLanguageOpen(false);
    languageButtonRef.current?.focus();
  }

  function handleLanguageKeyDown(event) {
    const options = [...(languageOptionsRef.current?.querySelectorAll("[data-language]") || [])];
    const index = options.indexOf(event.target.closest("[data-language]"));
    let nextIndex;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      setLanguageOpen(false);
      languageButtonRef.current?.focus();
      return;
    } else return;
    event.preventDefault();
    options[nextIndex]?.focus();
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") setQuery("");
    if (event.key === "Enter" && matches.length > 0) {
      event.preventDefault();
      searchResultsRef.current?.querySelector("a")?.click();
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      notify(t("copiedNotice"));
    } catch (error) {
      console.warn("Could not copy the contact email to the clipboard.", error);
      notify(t("copyFailedNotice"));
    }
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      notify(t("formValidation"), 3600);
      return;
    }
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const email = String(values.get("email") || "").trim();
    const message = String(values.get("message") || "").trim();
    if (!name || !email || !message) {
      notify(t("formValidation"), 3600);
      return;
    }
    window.location.href = buildContactMailto({ name, email, message }, t);
  }

  return (
    <>
    <svg className={'icon-library'} aria-hidden={'true'} xmlns={'http://www.w3.org/2000/svg'}>
      <symbol id={'icon-kali'} viewBox={'0 0 24 24'}>
        <path d={'M12 3c-1.8 2.4-1.5 4.4-.4 5.5-.7-.1-1.5-.7-1.7-1.4-1.2 1.2-1.6 3.2-.7 4.8.6 1 1.7 1.7 2.8 1.7-1.6.7-2.5 2-2.5 3.5 0 1.8 1.1 3 2.5 3.9 1.4-.9 2.5-2.1 2.5-3.9 0-1.5-.9-2.8-2.5-3.5 1.1 0 2.2-.7 2.8-1.7.9-1.6.5-3.6-.7-4.8-.2.7-1 1.3-1.7 1.4C13.5 7.4 13.8 5.4 12 3Z'} fill={'currentColor'} />
        <path d={'M7 11.7c-1.6 1.1-2.5 2.8-2.5 4.6 0 2.3 1.4 3.5 3.2 3.5M17 11.7c1.6 1.1 2.5 2.8 2.5 4.6 0 2.3-1.4 3.5-3.2 3.5M10 20.3h4'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.2'} strokeLinecap={'round'} />
      </symbol>
      <symbol id={'icon-windows'} viewBox={'0 0 24 24'}>
        <path d={'M2.5 5.2 10.6 4v7.3H2.5V5.2Zm9.3-1.4L21.5 2v9.3h-9.7V3.8ZM2.5 12.7h8.1V20l-8.1-1.2v-6.1Zm9.3 0h9.7V22l-9.7-1.8v-7.5Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-frontend'} viewBox={'0 0 24 24'}>
        <path d={'m8.5 6-6 6 6 6M15.5 6l6 6-6 6M14 3l-4 18'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'} />
      </symbol>
      <symbol id={'icon-backend'} viewBox={'0 0 24 24'}>
        <rect x={'3'} y={'3.5'} width={'18'} height={'7'} rx={'2'} fill={'currentColor'} />
        <rect x={'3'} y={'13.5'} width={'18'} height={'7'} rx={'2'} fill={'currentColor'} />
        <circle cx={'7'} cy={'7'} r={'1'} fill={'#10192e'} />
        <circle cx={'7'} cy={'17'} r={'1'} fill={'#10192e'} />
        <path d={'M11 7h6M11 17h6'} stroke={'#10192e'} strokeWidth={'1.4'} strokeLinecap={'round'} />
      </symbol>
      <symbol id={'icon-react'} viewBox={'0 0 24 24'}>
        <circle cx={'12'} cy={'12'} r={'2.1'} fill={'currentColor'} />
        <g fill={'none'} stroke={'currentColor'} strokeWidth={'1.25'}>
          <ellipse cx={'12'} cy={'12'} rx={'10'} ry={'3.9'} />
          <ellipse cx={'12'} cy={'12'} rx={'10'} ry={'3.9'} transform={'rotate(60 12 12)'} />
          <ellipse cx={'12'} cy={'12'} rx={'10'} ry={'3.9'} transform={'rotate(120 12 12)'} />
        </g>
      </symbol>
      <symbol id={'icon-java'} viewBox={'0 0 24 24'}>
        <path d={'M12.6 2.4c1.9 2.1-3 3.2-.3 5.3 1.2-2 4.4-3 1.8-5.3M7 11h10l-.8 6.6a4.2 4.2 0 0 1-8.4 0L7 11Z'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.6'} strokeLinecap={'round'} strokeLinejoin={'round'} />
        <path d={'M5 13.5c-1.5 3.5 2 5 5 5M19 13.5c1.5 3.5-2 5-5 5M7.5 21h9M10 19.7v1.2M14 19.7v1.2'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
      </symbol>
      <symbol id={'icon-python'} viewBox={'0 0 24 24'}>
        <path d={'M12 2.5c-4.6 0-4.3 2-4.3 2V8h4.5v1H5.8S2.5 8.6 2.5 13s2.9 4.2 2.9 4.2h1.7v-2.1s-.1-2.5 2.5-2.5h4.4s2.4 0 2.4-2.4V5.1s.4-2.6-4.4-2.6ZM9.4 5a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z'} fill={'currentColor'} />
        <path d={'M12 21.5c4.6 0 4.3-2 4.3-2V16h-4.5v-1h6.4s3.3.4 3.3-4-2.9-4.2-2.9-4.2h-1.7v2.1s.1 2.5-2.5 2.5H10s-2.4 0-2.4 2.4v5.1s-.4 2.6 4.4 2.6Zm2.6-2.5a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-kotlin'} viewBox={'0 0 24 24'}>
        <path d={'M3 3h18L3 21V3Zm0 18L13.3 10.7 21 21H3Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-git'} viewBox={'0 0 24 24'}>
        <path d={'m21 11.1-8.1-8.2a1.3 1.3 0 0 0-1.8 0l-1.7 1.7 2.2 2.2a2 2 0 0 1 2.5 2.5l2.1 2.1a2 2 0 1 1-1.2 1.2l-2-2v5.2a2 2 0 1 1-1.7 0v-5.3a2 2 0 0 1-1.1-2.7L8 5.8l-5 5a1.3 1.3 0 0 0 0 1.8l8.1 8.1a1.3 1.3 0 0 0 1.8 0l8.1-8.1a1.1 1.1 0 0 0 0-1.5ZM17 17.8a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4ZM10 19a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4ZM13 9.5a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-canva'} viewBox={'0 0 24 24'}>
        <path d={'M19.7 8.5c-.7 0-1.1.6-1.1 1.3 0 .6.3 1 .8 1.2-.5 3.1-2 6-3.2 6-.4 0-.6-.4-.6-1.1 0-1.8 1.4-5 1.4-6.7 0-1-.5-1.7-1.5-1.7-1.6 0-3.5 2-4.8 4.6 1.1-4.1 2.7-7.2 4.2-7.2.6 0 .8.4.8 1 0 .9.5 1.4 1.2 1.4.8 0 1.3-.6 1.3-1.5 0-1.3-1.1-2.2-2.9-2.2-4.3 0-8.5 7.5-8.5 13.2 0 2.7 1 4 2.8 4 1.8 0 3.4-1.7 5-4.4.1 2.8 1.1 4.1 2.7 4.1 2.8 0 5.5-5.2 5.5-9.5 0-1.5-1.1-2.5-3.1-2.5Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-uiux'} viewBox={'0 0 24 24'}>
        <path d={'M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.2 1.2 0 0 1 .9-2h1.2A4.3 4.3 0 0 0 21 11.3C21 6.7 17 3 12 3Z'} fill={'currentColor'} />
        <circle cx={'7.5'} cy={'11'} r={'1'} fill={'#10192e'} />
        <circle cx={'10'} cy={'7.5'} r={'1'} fill={'#10192e'} />
        <circle cx={'14'} cy={'7.5'} r={'1'} fill={'#10192e'} />
        <circle cx={'17'} cy={'10.5'} r={'1'} fill={'#10192e'} />
      </symbol>
      <symbol id={'icon-telegram'} viewBox={'0 0 24 24'}>
        <path d={'m21.5 4.3-3.2 15.2c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L5.7 13.1.8 11.6c-1.1-.3-1.1-1 .2-1.5L20 2.7c.9-.3 1.7.2 1.5 1.6Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-instagram'} viewBox={'0 0 24 24'}>
        <rect x={'3'} y={'3'} width={'18'} height={'18'} rx={'5'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} />
        <circle cx={'12'} cy={'12'} r={'4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} />
        <circle cx={'17.7'} cy={'6.6'} r={'1.2'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-x'} viewBox={'0 0 24 24'}>
        <path d={'M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.8 5.7 22H2.5l7.3-8.4L2 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.5 3.9H5.7L17.8 20Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-whatsapp'} viewBox={'0 0 24 24'}>
        <path d={'M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinejoin={'round'} />
        <path d={'M9 8.2c.2-.4.4-.4.7-.4h.4c.2 0 .4.1.5.5l.7 1.6c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .7.4.7 1.1 1.4 1.9 1.8.3.2.5.2.7-.1l.8-.9c.2-.2.4-.3.7-.2l1.6.7c.3.1.5.3.5.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-2 .5-1-.2-2.3-.8-3.7-2-1.7-1.5-2.7-3.3-2.8-4.2-.1-.7.3-1.4.7-1.9Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-youtube'} viewBox={'0 0 24 24'}>
        <path d={'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12c0 1.6.2 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.3-1.6.5-3.2.5-4.8s-.2-3.2-.5-4.8ZM9.7 15.6V8.4l6.2 3.6-6.2 3.6Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-github'} viewBox={'0 0 24 24'}>
        <path d={'M12 .9a11.1 11.1 0 0 0-3.5 21.6c.5.1.7-.2.7-.5v-2.1c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3.1 1.2a10.6 10.6 0 0 1 5.6 0c2.1-1.5 3-1.2 3-1.2.7 1.6.3 2.7.2 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.3-5.1 5.6.4.3.8 1 .8 2.1v3c0 .3.2.6.7.5A11.1 11.1 0 0 0 12 .9Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-linkedin'} viewBox={'0 0 24 24'}>
        <path d={'M5.2 7.8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.5 9.3h3.4v11.2H3.5V9.3Zm5.5 0h3.2v1.5h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.4v6.2h-3.4V15c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9V9.3Z'} fill={'currentColor'} />
      </symbol>
      <symbol id={'icon-email'} viewBox={'0 0 24 24'}>
        <rect x={'2.5'} y={'4.5'} width={'19'} height={'15'} rx={'2.5'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} />
        <path d={'m4 6 8 6.2L20 6'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinecap={'round'} strokeLinejoin={'round'} />
      </symbol>
    </svg>
    <header className={'topbar'}>
      <nav className={'nav wrap'} aria-label={t('navMain')}>
        <div className={'brand'}>
          <button className={'avatar-trigger'} type={'button'} aria-label={t('avatarOpen')} aria-haspopup={'dialog'} aria-controls={'profile-photo-dialog'} onClick={() => setProfileOpen(true)}>
            <img className={'brand-photo'} src={'assets/khud0x-mark.webp'} alt={''} />
          </button>
          <a className={'brand-name'} href={'#home'} aria-label={t('brandHome')}>
            UBAYDULLO
          </a>
        </div>
        <div className={'search-wrap'}>
          <svg className={'search-icon'} viewBox={'0 0 20 20'} fill={'none'} aria-hidden={'true'}>
            <circle cx={'8.8'} cy={'8.8'} r={'5.8'} stroke={'currentColor'} strokeWidth={'1.8'} />
            <path d={'m13.2 13.2 4 4'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinecap={'round'} />
          </svg>
          <input className={'search-input'} id={'site-search'} type={'search'} placeholder={t('searchPlaceholder')} aria-label={t('searchLabel')} autoComplete={'off'} value={query} ref={searchInputRef} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleSearchKeyDown} />
          <span className={'shortcut'}>
            Ctrl K
          </span>
          <div className={`search-results${query.trim() ? " open" : ""}`} id={'search-results'} role={'listbox'} aria-label={t('searchResults')} ref={searchResultsRef}>
            {matches.length > 0
              ? matches.map(([label, href]) => <a className={'search-result'} href={href} key={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={() => setQuery('')}>{label}</a>)
              : query.trim() ? <div className={'search-empty'}>{t('noSearchResults')}</div> : null}
          </div>
        </div>
        <div className={'nav-tools'}>
          <a className={'tool-link'} href={'mailto:u.xudoyberdiev@kstu.uz'} aria-label={t('emailWrite')} title={t('emailWrite')}>
            <svg viewBox={'0 0 20 20'} fill={'none'} aria-hidden={'true'}>
              <rect x={'2.5'} y={'4'} width={'15'} height={'12'} rx={'2'} stroke={'currentColor'} strokeWidth={'1.5'} />
              <path d={'m3.5 5.5 6.5 5 6.5-5'} stroke={'currentColor'} strokeWidth={'1.5'} />
            </svg>
          </a>
          <a className={'tool-link'} href={'https://github.com/khud0x'} target={'_blank'} rel={'noopener noreferrer'} aria-label={t('githubOpen')} title={'GitHub'}>
            <svg viewBox={'0 0 24 24'} fill={'currentColor'} aria-hidden={'true'}>
              <path d={'M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.77 2.09 3.75 1.5.1-.72.39-1.21.7-1.49-2.48-.28-5.08-1.24-5.08-5.51 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.22 2.68.11 2.96.72.78 1.15 1.78 1.15 3.01 0 4.28-2.6 5.22-5.09 5.5.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z'} />
            </svg>
          </a>
          <button className={'theme-toggle'} id={'theme-toggle'} type={'button'} aria-label={t(theme === 'dark' ? 'themeToLight' : 'themeToDark')} title={t(theme === 'dark' ? 'themeToLight' : 'themeToDark')} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <svg className={'theme-icon-sun'} viewBox={'0 0 24 24'} fill={'none'} aria-hidden={'true'}><circle cx={'12'} cy={'12'} r={'4'} stroke={'currentColor'} strokeWidth={'1.7'} /><path d={'M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42'} stroke={'currentColor'} strokeWidth={'1.7'} strokeLinecap={'round'} /></svg>
            <svg className={'theme-icon-moon'} viewBox={'0 0 24 24'} fill={'none'} aria-hidden={'true'}><path d={'M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z'} stroke={'currentColor'} strokeWidth={'1.7'} strokeLinecap={'round'} strokeLinejoin={'round'} /></svg>
          </button>
          <div className={'language-picker'} ref={languagePickerRef}>
            <button className={'language-toggle'} id={'language-toggle'} type={'button'} aria-label={t('languageLabel')} aria-haspopup={'listbox'} aria-expanded={languageOpen} aria-controls={'language-options'} ref={languageButtonRef} onClick={() => setLanguageOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setLanguageOpen(true); } }}>
            <span className={'language-icon'} aria-hidden={'true'}>
              文
            </span>
            <span id={'language-current'}>{language.toUpperCase()}</span>
            <svg className={'language-chevron'} viewBox={'0 0 12 12'} aria-hidden={'true'}><path d={'m3 4.5 3 3 3-3'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.4'} strokeLinecap={'round'} strokeLinejoin={'round'} /></svg>
            </button>
            <div className={'language-options'} id={'language-options'} role={'listbox'} aria-label={t('languageOptions')} hidden={!languageOpen} ref={languageOptionsRef} onKeyDown={handleLanguageKeyDown}>
              <button className={'language-option'} type={'button'} role={'option'} data-language={'uz'} aria-selected={language === 'uz'} onClick={() => chooseLanguage('uz')}>UZ <span>O‘zbekcha</span></button>
              <button className={'language-option'} type={'button'} role={'option'} data-language={'ru'} aria-selected={language === 'ru'} onClick={() => chooseLanguage('ru')}>RU <span>Русский</span></button>
              <button className={'language-option'} type={'button'} role={'option'} data-language={'en'} aria-selected={language === 'en'} onClick={() => chooseLanguage('en')}>EN <span>English</span></button>
              <button className={'language-option'} type={'button'} role={'option'} data-language={'tj'} aria-selected={language === 'tj'} onClick={() => chooseLanguage('tj')}>TJ <span>Тоҷикӣ</span></button>
            </div>
          </div>
          <button className={'menu-toggle'} type={'button'} aria-label={t('searchFocus')} onClick={() => searchInputRef.current?.focus()}>
            ⌕
          </button>
        </div>
      </nav>
    </header>
    <dialog className={'profile-dialog'} id={'profile-photo-dialog'} aria-labelledby={'profile-photo-name'} ref={dialogRef} onClose={() => setProfileOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
      <button className={'profile-dialog-close'} type={'button'} aria-label={t('photoClose')} data-close-profile={''} onClick={() => setProfileOpen(false)}>
        ×
      </button>
      <img className={'profile-dialog-image'} src={'assets/ubaydullo.png'} alt={t('profileImageAlt')} />
      <div className={'profile-dialog-caption'}>
        <strong id={'profile-photo-name'}>{t('fullNameShort')}</strong>
        <span>
          @khud0x
        </span>
      </div>
    </dialog>
    <main>
      <section className={'hero wrap'} id={'home'}>
        <svg className={'circuit'} viewBox={'0 0 650 490'} fill={'none'} aria-hidden={'true'}>
          <g stroke={'#367b9f'} strokeWidth={'3'} opacity={'.56'}>
            <path d={'M78 0v114c0 20 16 36 36 36h49v150c0 29 24 53 53 53h40v137'} />
            <path d={'M177 0v74c0 18 14 32 32 32h87c27 0 49 22 49 49v85c0 30 24 54 54 54h25v196'} />
            <path d={'M316 0v61c0 24 19 43 43 43h86c29 0 52 23 52 52v46c0 20 16 36 36 36h44v252'} />
            <path d={'M435 0v111c0 18 14 32 32 32h38c20 0 36 16 36 36v54c0 25 20 45 45 45h46'} />
            <path d={'M561 0v75c0 24 19 43 43 43h46'} />
            <path d={'M0 262h56c23 0 42 19 42 42v46c0 23 19 42 42 42h71'} />
          </g>
          <g fill={'#102039'} stroke={'#36bce9'} strokeWidth={'4'}>
            <circle cx={'78'} cy={'114'} r={'8'} />
            <circle cx={'177'} cy={'74'} r={'8'} />
            <circle cx={'344'} cy={'153'} r={'8'} />
            <circle cx={'536'} cy={'229'} r={'8'} />
            <circle cx={'603'} cy={'118'} r={'8'} />
            <circle cx={'98'} cy={'304'} r={'8'} />
          </g>
          <g fill={'#14243c'} stroke={'#39506f'} strokeWidth={'3'}>
            <circle cx={'316'} cy={'61'} r={'8'} />
            <circle cx={'435'} cy={'111'} r={'8'} />
            <circle cx={'561'} cy={'75'} r={'8'} />
          </g>
        </svg>
        <div className={'hero-copy'}>
          <p className={'hero-kicker'}>{t('heroKicker')}</p>
          <h1>
            <span>
              khud0x
            </span>
            <small className={'hero-name'}>{t('fullName')}</small>
          </h1>
          <p className={'hero-description'}>{t('heroDescription')}</p>
          <p className={'hero-motto'}>
            <span>{t('mottoFirst')}</span>
            <br />
            <span>{t('mottoSecond')}</span>
          </p>
          <div className={'hero-actions'}>
            <a className={'button primary'} href={'#projects'}>
              <span>{t('viewProjects')}</span>
              <span aria-hidden={'true'}>
                →
              </span>
            </a>
            <a className={'button'} href={'https://github.com/khud0x'} target={'_blank'} rel={'noopener noreferrer'}>{t('githubProfile')}</a>
          </div>
        </div>
        <div className={'hero-code'} aria-label={t('heroCode')}>
          <div className={'window-dots'}>
            <i />
            <i />
            <i />
          </div>
          <div className={'code-tabs'}>
            <span>
              portfolio.config.js
            </span>
            <span>
              about.json
            </span>
          </div>
          <div className={'code-body'} aria-hidden={'true'}>
            <div className={'code-line'}>
              <span className={'line-num'}>
                01
              </span>
              <span>
                <span className={'code-pink'}>
                  export default
                </span>
                 {"{"}
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                02
              </span>
              <span>
                  name: 
                <span className={'code-cyan'}>
                  'Ubaydullo Xudoyberdiev'
                </span>
                ,
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                03
              </span>
              <span>
                  focus: [
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                04
              </span>
              <span>
                <span className={'code-purple'}>{t('codeAi')}</span>
                ,
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                05
              </span>
              <span>
                <span className={'code-purple'}>{t('codeEducation')}</span>
                ,
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                06
              </span>
              <span>
                <span className={'code-purple'}>{t('codeHeritage')}</span>
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                07
              </span>
              <span>
                  ], 
                <span>{t('codeOpenTo')}</span>
                : 
                <span className={'code-cyan'}>{t('codeIdeas')}</span>
              </span>
            </div>
            <div className={'code-line'}>
              <span className={'line-num'}>
                08
              </span>
              <span>
                {"}"}
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className={'docs-layout'}>
        <aside className={'sidebar'} aria-label={t('portfolioSections')}>
          <div className={'side-group'}>
            <span className={'side-title'}>{t('navIntroGroup')}</span>
            <nav className={'side-list'}>
              <a className={activeSection === 'introduction' ? 'active' : ''} href={'#introduction'}>{t('navAbout')}</a>
              <a className={activeSection === 'background' ? 'active' : ''} href={'#background'}>{t('navProfile')}</a>
            </nav>
          </div>
          <div className={'side-group'}>
            <span className={'side-title'}>{t('navSkillsGroup')}</span>
            <nav className={'side-list'}>
              <a className={activeSection === 'skills' ? 'active' : ''} href={'#skills'}>{t('navTechnologies')}</a>
            </nav>
          </div>
          <div className={'side-group'}>
            <span className={'side-title'}>{t('navProjectsGroup')}</span>
            <nav className={'side-list'}>
              <a className={activeSection === 'projects' ? 'active' : ''} href={'#projects'}>{t('navSelectedProjects')}</a>
              <a className={activeSection === 'kengash' ? 'active' : ''} href={'#kengash'}>
                Kengash
              </a>
              <a className={activeSection === 'colibriy' ? 'active' : ''} href={'#colibriy'}>
                Colibriy Academiy
              </a>
              <a className={activeSection === 'farhangi' ? 'active' : ''} href={'#farhangi'}>
                Фарҳанги Тоҷик
              </a>
              <a className={activeSection === 'wordlist' ? 'active' : ''} href={'#wordlist'}>
                Password Wordlist
              </a>
              <a className={activeSection === 'omborweb' ? 'active' : ''} href={'#omborweb'}>
                OmborWeb
              </a>
              <a className={activeSection === 'github-more' ? 'active' : ''} href={'#github-more'}>{t('navMoreProjects')}</a>
            </nav>
          </div>
          <div className={'side-group'}>
            <span className={'side-title'}>{t('navContactGroup')}</span>
            <nav className={'side-list'}>
              <a className={activeSection === 'channels' ? 'active' : ''} href={'#channels'}>{t('navChannels')}</a>
              <a className={activeSection === 'contact' ? 'active' : ''} href={'#contact'}>{t('navContact')}</a>
            </nav>
          </div>
        </aside>
        <article className={'article'}>
          <section className={'doc-section'} id={'introduction'}>
            <p className={'section-label'}>{t('aboutLabel')}</p>
            <h2>{t('aboutTitle')}</h2>
            <p className={'lead'}>
              <span>{t('aboutIntro')}</span>
              <strong>
                Xudoyberdiev Ubaydullo Umedullo o‘g‘li
              </strong>
              <span>{t('aboutIntroRest')}</span>
            </p>
            <div className={'quick-grid'}>
              <a className={'quick-card'} href={'#projects'}>
                <span className={'card-icon'}>
                  ➤
                </span>
                <h3>{t('quickProjectsTitle')}</h3>
                <p>{t('quickProjectsText')}</p>
              </a>
              <a className={'quick-card'} href={'#channels'}>
                <span className={'card-icon purple'}>
                  ▦
                </span>
                <h3>{t('quickCommunityTitle')}</h3>
                <p>{t('quickCommunityText')}</p>
              </a>
              <a className={'quick-card'} href={'#kengash'}>
                <span className={'card-icon'}>
                  ⬡
                </span>
                <h3>{t('quickAiTitle')}</h3>
                <p>{t('quickAiText')}</p>
              </a>
              <a className={'quick-card'} href={'#farhangi'}>
                <span className={'card-icon purple'}>
                  ▤
                </span>
                <h3>{t('quickHeritageTitle')}</h3>
                <p>{t('quickHeritageText')}</p>
              </a>
            </div>
            <p className={'body-copy'}>{t('aboutBody')}</p>
          </section>
          <section className={'doc-section'} id={'background'}>
            <p className={'section-label'}>{t('profileLabel')}</p>
            <h2>{t('profileTitle')}</h2>
            <div className={'profile-card'}>
              <div className={'profile-row'}>
                <span>{t('profileFullName')}</span>
                <span>{t('fullName')}</span>
              </div>
              <div className={'profile-row'}>
                <span>{t('profileFocus')}</span>
                <span>{t('profileFocusValue')}</span>
              </div>
              <div className={'profile-row'}>
                <span>{t('profileLocation')}</span>
                <span>{t('profileLocationValue')}</span>
              </div>
              <div className={'profile-row'}>
                <span>{t('profileStatus')}</span>
                <span>{t('profileStatusValue')}</span>
              </div>
            </div>
          </section>
          <section className={'doc-section'} id={'skills'}>
            <p className={'section-label'}>{t('skillsLabel')}</p>
            <h2>{t('skillsTitle')}</h2>
            <p className={'lead'}>{t('skillsIntro')}</p>
            <div className={'skills-group'}>
              <h3>{t('skillsSystems')}</h3>
              <div className={'skills-grid'}>
                <article className={'skill-card'}>
                  <span className={'skill-logo kali'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-kali'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Kali Linux
                    </h4>
                    <p>{t('skillKali')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo windows'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-windows'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Windows
                    </h4>
                    <p>{t('skillWindows')}</p>
                  </div>
                </article>
              </div>
            </div>
            <div className={'skills-group'}>
              <h3>{t('skillsDesignWeb')}</h3>
              <div className={'skills-grid'}>
                <article className={'skill-card'}>
                  <span className={'skill-logo frontend'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-frontend'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Frontend
                    </h4>
                    <p>{t('skillFrontend')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo backend'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-backend'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Backend
                    </h4>
                    <p>{t('skillBackend')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo uiux'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-uiux'} />
                    </svg>
                  </span>
                  <div>
                    <h4>{t('skillUiuxTitle')}</h4>
                    <p>{t('skillUiux')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo react'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-react'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      React
                    </h4>
                    <p>{t('skillReact')}</p>
                  </div>
                </article>
              </div>
            </div>
            <div className={'skills-group'}>
              <h3>{t('skillsProgramming')}</h3>
              <div className={'skills-grid'}>
                <article className={'skill-card'}>
                  <span className={'skill-logo kotlin'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-kotlin'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Kotlin
                    </h4>
                    <p>{t('skillKotlin')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo python'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-python'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Python
                    </h4>
                    <p>{t('skillPython')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo java'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-java'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Java
                    </h4>
                    <p>{t('skillJava')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo git'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-git'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Git
                    </h4>
                    <p>{t('skillGit')}</p>
                  </div>
                </article>
                <article className={'skill-card'}>
                  <span className={'skill-logo canva'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-canva'} />
                    </svg>
                  </span>
                  <div>
                    <h4>
                      Canva
                    </h4>
                    <p>{t('skillCanva')}</p>
                  </div>
                </article>
              </div>
            </div>
          </section>
          <section className={'doc-section'} id={'projects'}>
            <p className={'section-label'}>{t('projectsLabel')}</p>
            <h2>{t('projectsTitle')}</h2>
            <p className={'lead'}>{t('projectsIntro')}</p>
            <div className={'project-list'}>
              <section className={'project-card'} id={'kengash'}>
                <div className={'project-heading'}>
                  <h3>
                    Kengash
                  </h3>
                  <span className={'project-number'}>{t('projectCategoryAi')}</span>
                </div>
                <p>{t('projectKengash')}</p>
                <div className={'tags'}>
                  <span className={'tag'}>
                    AI
                  </span>
                  <span className={'tag'}>{t('tagCollaboration')}</span>
                  <span className={'tag'}>{t('tagProjectManagement')}</span>
                </div>
              </section>
              <section className={'project-card'} id={'colibriy'}>
                <div className={'project-heading'}>
                  <h3>
                    Colibriy Academiy
                  </h3>
                  <span className={'project-number'}>{t('projectCategoryEducation')}</span>
                </div>
                <p>{t('projectColibriy')}</p>
                <div className={'tags'}>
                  <span className={'tag'}>{t('tagItEducation')}</span>
                  <span className={'tag'}>{t('tagCybersecurity')}</span>
                  <span className={'tag'}>
                    AI
                  </span>
                  <span className={'tag'}>{t('tagLabs')}</span>
                </div>
              </section>
              <section className={'project-card'} id={'farhangi'}>
                <div className={'project-heading'}>
                  <h3>
                    Фарҳанги Тоҷик
                  </h3>
                  <span className={'project-number'}>{t('projectCategoryMobile')}</span>
                </div>
                <p>{t('projectFarhangi')}</p>
                <div className={'tags'}>
                  <span className={'tag'}>{t('tagMobileApp')}</span>
                  <span className={'tag'}>{t('tagTajikLiterature')}</span>
                  <span className={'tag'}>
                    Offline MVP
                  </span>
                </div>
              </section>
              <section className={'project-card'} id={'wordlist'}>
                <div className={'project-heading'}>
                  <h3>{t('projectWordlistTitle')}</h3>
                  <span className={'project-number'}>{t('projectCategorySecurity')}</span>
                </div>
                <p>{t('projectWordlist')}</p>
                <div className={'tags'}>
                  <span className={'tag'}>{t('tagCybersecurity')}</span>
                  <span className={'tag'}>
                    Wordlist
                  </span>
                  <span className={'tag'}>{t('tagAuthorizedTesting')}</span>
                </div>
              </section>
              <section className={'project-card'} id={'omborweb'}>
                <div className={'project-heading'}>
                  <h3>
                    OmborWeb
                  </h3>
                  <span className={'project-number'}>{t('projectCategoryWeb')}</span>
                </div>
                <p>{t('projectOmbor')}</p>
                <div className={'tags'}>
                  <span className={'tag'}>{t('tagWebApp')}</span>
                  <span className={'tag'}>{t('tagInventory')}</span>
                  <span className={'tag'}>{t('tagStockFlow')}</span>
                </div>
              </section>
            </div>
            <div className={'github-more'} id={'github-more'}>
              <a className={'button'} href={'https://github.com/khud0x'} target={'_blank'} rel={'noopener noreferrer'}>
                <span>{t('moreOnGithub')}</span>
                <span aria-hidden={'true'}>
                  ↗
                </span>
              </a>
            </div>
          </section>
          <section className={'doc-section'} id={'channels'}>
            <p className={'section-label'}>{t('channelsLabel')}</p>
            <h2>{t('channelsTitle')}</h2>
            <p className={'lead'}>{t('channelsIntro')}</p>
            <div className={'social-list'}>
              <a className={'social-link'} href={'https://t.me/farhangi_tojik'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon telegram'} aria-hidden={'true'}>
                  <use href={'#icon-telegram'} />
                </svg>
                <span>{t('socialFarhangi')}</span>
                <span>
                  @farhangi_tojik ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://t.me/colibry_academiy'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon telegram'} aria-hidden={'true'}>
                  <use href={'#icon-telegram'} />
                </svg>
                <span>{t('socialColibriy')}</span>
                <span>
                  @colibry_academiy ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://t.me/khud0x'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon telegram'} aria-hidden={'true'}>
                  <use href={'#icon-telegram'} />
                </svg>
                <span>{t('socialKhud0x')}</span>
                <span>
                  @khud0x ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://t.me/khudoyberdiev_u'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon telegram'} aria-hidden={'true'}>
                  <use href={'#icon-telegram'} />
                </svg>
                <span>
                  Telegram
                </span>
                <span>
                  @khudoyberdiev_u ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://www.instagram.com/khud0yberdiev.u?igsh=cHp2M2RiMTBxaHVi'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon instagram'} aria-hidden={'true'}>
                  <use href={'#icon-instagram'} />
                </svg>
                <span>
                  Instagram
                </span>
                <span>
                  @khud0yberdiev.u ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://x.com/khudoyberdiew'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon x-social'} aria-hidden={'true'}>
                  <use href={'#icon-x'} />
                </svg>
                <span>
                  X
                </span>
                <span>
                  @khudoyberdiew ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://wa.me/qr/R3U6FLKECH3OL1'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon whatsapp'} aria-hidden={'true'}>
                  <use href={'#icon-whatsapp'} />
                </svg>
                <span>
                  WhatsApp
                </span>
                <span>
                  @khudoyberdiev ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://www.youtube.com/@uzhack'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon youtube'} aria-hidden={'true'}>
                  <use href={'#icon-youtube'} />
                </svg>
                <span>
                  YouTube
                </span>
                <span>
                  @uzhack ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://github.com/khud0x'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon github'} aria-hidden={'true'}>
                  <use href={'#icon-github'} />
                </svg>
                <span>
                  GitHub
                </span>
                <span>
                  @khud0x ↗
                </span>
              </a>
              <a className={'social-link'} href={'https://www.linkedin.com/in/ubaydullo-xudoyberdiev-4b88aa320'} target={'_blank'} rel={'noopener noreferrer'}>
                <svg className={'social-icon linkedin'} aria-hidden={'true'}>
                  <use href={'#icon-linkedin'} />
                </svg>
                <span>
                  LinkedIn
                </span>
                <span>
                  Ubaydullo Xudoyberdiev ↗
                </span>
              </a>
            </div>
          </section>
          <section className={'doc-section'} id={'contact'}>
            <p className={'section-label'}>{t('contactLabel')}</p>
            <h2>{t('contactTitle')}</h2>
            <p className={'lead'}>{t('contactIntro')}</p>
            <div className={'contact-grid'}>
              <div className={'contact-details'}>
                <h3>{t('contactDetails')}</h3>
                <a className={'contact-method'} href={'mailto:u.xudoyberdiev@kstu.uz'}>
                  <span className={'contact-icon email'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-email'} />
                    </svg>
                  </span>
                  <span>
                    <strong>
                      Email
                    </strong>
                    <small>
                      u.xudoyberdiev@kstu.uz
                    </small>
                  </span>
                </a>
                <a className={'contact-method'} href={'https://t.me/khudoyberdiev_u'} target={'_blank'} rel={'noopener noreferrer'}>
                  <span className={'contact-icon telegram'}>
                    <svg aria-hidden={'true'}>
                      <use href={'#icon-telegram'} />
                    </svg>
                  </span>
                  <span>
                    <strong>
                      Telegram
                    </strong>
                    <small>
                      @khudoyberdiev_u
                    </small>
                  </span>
                </a>
                <button className={'copy-email'} type={'button'} id={'copy-email'} data-email={'u.xudoyberdiev@kstu.uz'} onClick={handleCopyEmail}>{t('copyEmail')}</button>
              </div>
              <form className={'contact-form'} id={'contact-form'} noValidate onSubmit={handleContactSubmit}>
                <label htmlFor={'contact-name'}>{t('formName')}</label>
                <input id={'contact-name'} name={'name'} type={'text'} placeholder={t('formNamePlaceholder')} autoComplete={'name'} required />
                <label htmlFor={'contact-sender'}>{t('formEmail')}</label>
                <input id={'contact-sender'} name={'email'} type={'email'} placeholder={t('formEmailPlaceholder')} autoComplete={'email'} required />
                <label htmlFor={'contact-message'}>{t('formMessage')}</label>
                <textarea id={'contact-message'} name={'message'} placeholder={t('formMessagePlaceholder')} rows={'5'} required />
                <button className={'button primary send-button'} type={'submit'}>
                  <span>{t('sendEmail')}</span>
                  <span aria-hidden={'true'}>
                    ↗
                  </span>
                </button>
                <p className={'form-note'}>{t('formNote')}</p>
                <a className={'email-line'} href={'mailto:u.xudoyberdiev@kstu.uz'}>
                  u.xudoyberdiev@kstu.uz
                </a>
              </form>
            </div>
          </section>
        </article>
        <aside className={'toc'} aria-label={t('tableOfContents')}>
          <p className={'toc-title'}>{t('tableOfContents')}</p>
          <nav className={'toc-list'}>
            <a href={'#introduction'}>{t('tocIntro')}</a>
            <a href={'#background'}>{t('navProfile')}</a>
            <a href={'#skills'}>{t('navTechnologies')}</a>
            <a href={'#projects'}>{t('navSelectedProjects')}</a>
            <a href={'#kengash'}>
              Kengash
            </a>
            <a href={'#colibriy'}>
              Colibriy Academiy
            </a>
            <a href={'#farhangi'}>
              Фарҳанги Тоҷик
            </a>
            <a href={'#wordlist'}>
              Password Wordlist
            </a>
            <a href={'#omborweb'}>
              OmborWeb
            </a>
            <a href={'#channels'}>{t('navChannels')}</a>
            <a href={'#contact'}>{t('navContact')}</a>
          </nav>
        </aside>
      </div>
    </main>
    <footer className={'footer wrap'}>
      <span>
        © 
        <span id={'year'}>
          {new Date().getFullYear()}
        </span>
         Xudoyberdiev Ubaydullo
      </span>
      <a href={'#home'}>{t('backToTop')}</a>
      <span>{t('footerMade')}</span>
    </footer>
    <div className={`notice${notice ? ' show' : ''}`} id={'notice'} role={'status'} aria-live={'polite'}>{notice}</div>
    </>
  );
}
