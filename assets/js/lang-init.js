/* Runs before first paint: sets document direction and language
 so RTL pages don't flash LTR while the app boots. */
(function () {
 try {
 var supported = ["ar", "en", "id", "ko", "ja", "zh", "ru", "fr", "es"];
 var params = new URLSearchParams(window.location.search);
 var lang = params.get('lang') || localStorage.getItem('studyco_lang');
 if (!lang || supported.indexOf(lang.toLowerCase()) === -1) {
 var navLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
 lang = (supported.indexOf(navLang) !== -1) ? navLang : 'id';
 } else {
 lang = lang.toLowerCase();
 }
 document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
 document.documentElement.lang = lang;
 } catch (e) { /* keep server-rendered defaults */ }
})();
