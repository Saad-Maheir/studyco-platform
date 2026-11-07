// Site-wide settings and contact info. Edit the WhatsApp number here only.
export const CONFIG = {
 whatsappNumber: "+6281252223732",

 get whatsappCleanNumber() {
 return this.whatsappNumber.replace(/[^0-9]/g, "");
 },

 supportedLanguages: ["id", "en", "ar", "ko", "ja", "zh", "ru", "fr", "es"],
 defaultLanguage: "id",

 siteName: "StudyCo Education Services",

 socialLinks: {
 facebook: "https://www.facebook.com/share/1ByT4TSRj3/?mibextid=wwXIfr",
 instagram: "https://www.instagram.com/studyco.id?igsh=MTllN2oxeHl1YmIx&igsi=MTllN2oxeHl1YmIx&utm_source=qr",
 tiktok: "https://www.tiktok.com/@studyco.id?_r=1&_t=ZS-98w7jcS2jmG"
 },

 getWhatsAppLink(message = "") {
 const baseUrl = `https://wa.me/${this.whatsappCleanNumber}`;
 if (!message) return baseUrl;
 return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
 }
};
