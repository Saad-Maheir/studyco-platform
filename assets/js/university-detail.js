import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';
import { getExchangeRates, convertFromMYR, convertCurrency, formatCurrencyValue, formatProgramPrice, getCountryCurrency } from './currency.js?v=88.0';
import { ICONS, FIELD_SVG_ICONS, resolveIcon, formatRanking } from './icons.js';

const SHOW_ARTICLES_TAB = false; // Toggle to true when Articles & Guides content is ready

const COUNTRY_KEY = {
  malaysia: 'dest_malaysia',
  australia: 'dest_australia',
  uk: 'dest_uk',
  canada: 'dest_canada',
  newzealand: 'dest_newzealand',
  singapore: 'dest_singapore'
};

const FIELD_KEY = {
  business: 'field_business',
  cs: 'field_cs',
  engineering: 'field_engineering',
  health: 'field_health',
  hospitality: 'field_hospitality',
  arts: 'field_arts',
  architecture: 'field_architecture',
  law: 'field_law',
  education: 'field_education'
};

const LEVEL_KEY = {
  foundation: 'level_foundation',
  diploma: 'level_diploma',
  bachelor: 'level_bachelor',
  master: 'level_master',
  phd: 'level_phd'
};

const FLAG = {
  malaysia: 'assets/photo/flag-malaysia.svg',
  australia: 'assets/photo/flag-australia.svg',
  uk: 'assets/photo/flag-uk.svg',
  canada: 'assets/photo/flag-canada.svg',
  newzealand: 'assets/photo/flag-newzealand.svg',
  singapore: 'assets/photo/flag-singapore.svg'
};

// Multilingual data helpers for Taylor's facilities, highlights, faqs, articles, and accommodation
const DATA_DICTIONARY = {
  facilities: [
    {
      icon: "lake",
      title: {
        id: "Kampus Lakeside 27 Hektar di Tepi Danau",
        en: "Lakeside 27-Acre Scenic Waterfront Campus",
        ar: "حرم لايك سايد بمساحة 27 فداناً حول بحيرة طبيعية خلابة",
        ko: "아름다운 호수를 품은 27에이커 규모의 레이크사이드 캠퍼스",
        ja: "美しい湖を望む27エーカーの広大なレイクサイドキャンパス",
        zh: "占地27英亩优美湖畔景致现代化校区",
        ru: "Живописный кампус Лейксайд площадью 27 акров у озера",
        fr: "Campus pittoresque de 27 acres au bord d'un lac",
        es: "Campus escénico de 27 acres junto al lago"
      }
    },
    {
      icon: "lab",
      title: {
        id: "Laboratorium AI, Robotika & Rekayasa Modern",
        en: "Next-Gen AI, Robotics & Engineering Labs",
        ar: "مختبرات الذكاء الاصطناعي والروبوتات والهندسة المتطورة",
        ko: "차세대 AI, 로봇 공학 및 엔지니어링 첨단 연구실",
        ja: "次世代AI・ロボティクス・工学専門研究ラボ",
        zh: "下一代人工智能、机器人与工程前沿实验室",
        ru: "Лаборатории ИИ, робототехники и современной инженерии",
        fr: "Laboratoires d'IA, de robotique et d'ingénierie avancée",
        es: "Laboratorios avanzados de IA, robótica e ingeniería"
      }
    },
    {
      icon: "culinary",
      title: {
        id: "Suite Kuliner & Perhotelan Berstandar Dunia (Peringkat 16 Global)",
        en: "World-Class Culinary & Hospitality Suites (Ranked 16th Worldwide)",
        ar: "أجنحة فندقية ومطابخ تجريبية فندقية مصنفة بالمرتبة 16 عالمياً",
        ko: "세계 16위 수준의 최고급 호텔 및 조리 실습 스위트",
        ja: "世界第16位の最高峰ホスピタリティ・調理実習スイート",
        zh: "世界排名前16顶尖酒店管理与烹饪艺术实训套房",
        ru: "Кулинарные и гостиничные комплексы мирового уровня (16 в мире)",
        fr: "Suites hôtelières et culinaires de classe mondiale (16e mondial)",
        es: "Suites de hotelería y artes culinarias de clase mundial (16 global)"
      }
    },
    {
      icon: "library",
      title: {
        id: "Perpustakaan Digital Multi-Lantai Otomatis",
        en: "Multi-Storey Automated Digital Library",
        ar: "مكتبة رقمية تفاعلية ضخمة مزودة بغرف دراسة وقاعات بحث",
        ko: "최첨단 자동화 다층 디지털 도서관 및 스터디 라운지",
        ja: "最新の自動化マルチフロア・デジタル図書館",
        zh: "多层现代化智能数字图书馆与静音研讨室",
        ru: "Многоэтажная автоматизированная цифровая библиотека",
        fr: "Bibliothèque numérique automatisée sur plusieurs étages",
        es: "Biblioteca digital automatizada de varios niveles"
      }
    }
  ],
  highlights: [
    {
      icon: "award",
      title: {
        id: "Peringkat 251 Dunia QS & Bintang 5",
        en: "QS Ranked 251st Worldwide & 5-Star Rating",
        ar: "المرتبة 251 عالمياً وتصنيف 5 نجوم QS",
        ko: "QS 세계 251위 및 5스타 최고 등급",
        ja: "QS世界大学ランキング第251位＆5つ星評価",
        zh: "QS全球大学排名前251位与五星级评级",
        ru: "Топ-251 в мире по рейтингу QS и 5 звезд",
        fr: "Classé 251e mondial au QS et 5 étoiles",
        es: "Puesto 251 del mundo en QS y 5 estrellas"
      },
      desc: {
        id: "Top 1% universitas dunia dan universitas swasta No. 1 di Asia Tenggara.",
        en: "Top 1% universities globally and No. 1 private university in Southeast Asia.",
        ar: "مصنفة ضمن أفضل 1% من جامعات العالم والجامعة الخاصة الأولى في جنوب شرق آسيا.",
        ko: "전 세계 상위 1% 대학이자 동남아시아 사립 대학교 1위입니다.",
        ja: "世界の上位1％の大学であり、東南アジアの私立大学で第1位を誇ります。",
        zh: "位列全球前1%顶尖高校，蝉联东南亚私立大学第一。",
        ru: "Входит в 1% лучших вузов мира и является частным университетом No. 1 в ЮВА.",
        fr: "Fait partie du top 1% mondial et 1ère université privée d'Asie du Sud-Est.",
        es: "Top 1% de universidades globales y universidad privada No. 1 del sudeste asiático."
      }
    },
    {
      icon: "global",
      title: {
        id: "Gelar Ganda Resmi Inggris & Australia",
        en: "Dual Award Degrees with UK & Australia",
        ar: "شهادات ثنائية دولية مع بريطانيا وأستراليا",
        ko: "영국 및 호주 명문대 복수 학위 수여",
        ja: "英国・オーストラリアの名門大学デュアルディグリー",
        zh: "英国与澳大利亚名校官方双学位认证",
        ru: "Программы двойных дипломов с вузами Великобритании и Австралии",
        fr: "Doubles diplômes officiels avec le Royaume-Uni et l'Australie",
        es: "Titulaciones dobles oficiales con el Reino Unido y Australia"
      },
      desc: {
        id: "Dapatkan dua ijazah resmi sekaligus dari Taylor's dan universitas mitra ternama di Inggris/Australia.",
        en: "Graduate with dual certifications from Taylor's and prestigious UK or Australian partner institutions.",
        ar: "شهادتين معتمدتين إحداهما من جامعة تايلور والأخرى من كبرى جامعات بريطانيا أو أستراليا.",
        ko: "테일러스 대학교와 영국/호주 파트너 대학의 공식 학위를 동시에 취득합니다.",
        ja: "テイラーズ大学と提携する英国・豪州の大学から2つの学位を取得可能です。",
        zh: "毕业同时获得泰莱大学及英澳顶尖合作大学颁发的两份官方学位证书。",
        ru: "Выпускники получают два диплома: от Taylor's и престижных вузов-партнеров.",
        fr: "Obtenez simultanément deux diplômes reconnus de Taylor et d'universités partenaires.",
        es: "Gradúate con dos títulos reconocidos de Taylor y prestigiosas universidades asociadas."
      }
    },
    {
      icon: "briefcase",
      title: {
        id: "Tingkat Keterserapan Kerja 99%",
        en: "99% Graduate Employability Rate",
        ar: "معدل توظيف استثنائي 99%",
        ko: "99%에 달하는 높은 졸업생 취업률",
        ja: "99％を誇る圧倒的な就職内定率",
        zh: "99% 毕业生高就业率与行业口碑",
        ru: "99% уровень трудоустройства выпускников",
        fr: "Taux d'employabilité des diplômés de 99%",
        es: "99% de tasa de empleabilidad de graduados"
      },
      desc: {
        id: "Lebih dari 99% lulusan mendapatkan pekerjaan profesional dalam waktu 6 bulan setelah kelulusan.",
        en: "Over 99% of graduates secure professional employment within 6 months of graduation.",
        ar: "أكثر من 99% من الخريجين يحصلون على وظائف مرموقة في كبرى الشركات خلال 6 أشهر.",
        ko: "졸업생의 99% 이상이 졸업 후 6개월 이내에 글로벌 우수 기업에 취업합니다.",
        ja: "99％以上の卒業生が卒業後6ヶ月以内に優良企業への就職を果たしています。",
        zh: "超过99%的毕业生在毕业后6个月内顺利进入跨国名企与知名机构就职。",
        ru: "Более 99% выпускников находят работу по специальности в течение 6 месяцев.",
        fr: "Plus de 99% des diplômés décrochent un emploi qualifié dans les 6 mois.",
        es: "Más del 99% de los graduados obtienen empleo cualificado en menos de 6 meses."
      }
    },
    {
      icon: "hotel",
      title: {
        id: "Peringkat 16 Dunia Manajemen Perhotelan",
        en: "Ranked 16th Worldwide in Hospitality Management",
        ar: "المرتبة 16 عالمياً في إدارة الضيافة",
        ko: "호텔경영 및 조리예술 분야 세계 16위",
        ja: "ホスピタリティ・観光学分野で世界第16位",
        zh: "款待与休闲管理专业位列全球第16位",
        ru: "16 в мире по направлению «Гостиничный менеджмент»",
        fr: "16e mondial en gestion hôtelière et tourisme",
        es: "16 mundial en gestión de hotelería y turismo"
      },
      desc: {
        id: "Pemimpin global dalam bidang Manajemen Perhotelan, Pariwisata, dan Seni Kuliner.",
        en: "Recognized global leader in Hospitality, Tourism, and Culinary Arts education.",
        ar: "رائدة عالمياً في تخصصات الضيافة والسياحة وفنون الطهي بشراكات مع أشهر سلاسل الفنادق.",
        ko: "호텔, 관광 및 조리 예술 교육 분야에서 세계적인 명성을 인정받고 있습니다.",
        ja: "ホスピタリティ、観光、料理芸術の分野において世界的な評価を得ています。",
        zh: "国际公认的酒店管理、旅游管理与烹饪艺术教育领军名校。",
        ru: "Признанный мировой лидер в области гостеприимства, туризма и кулинарии.",
        fr: "Leader mondial reconnu dans l'enseignement de l'hôtellerie et des arts culinaires.",
        es: "Líder global reconocido en hotelería, turismo y formación en artes culinarias."
      }
    }
  ],
  faqs: [
    {
      q: {
        id: "Apakah ijazah dari Taylor's University diakui secara internasional?",
        en: "Is a degree from Taylor's University internationally accredited and recognized?",
        ar: "هل شهادات جامعة تايلور معترف بها دولياً وفي الدول العربية؟",
        ko: "테일러스 대학교의 학위는 국제적으로 공인되나요?",
        ja: "テイラーズ大学の学位は国際的に認定されていますか？",
        zh: "泰莱大学的学位是否获得国际与教育部官方认证？",
        ru: "Признается ли диплом Taylor's University на международном уровне?",
        fr: "Le diplôme de Taylor's University est-il reconnu à l'international ?",
        es: "¿Está el título de Taylor's University reconocido internacionalmente?"
      },
      a: {
        id: "Ya, terakreditasi penuh oleh Badan Akreditasi Malaysia (MQA), Kementerian Pendidikan Tinggi Malaysia, serta diakui oleh universitas dan kementerian pendidikan di seluruh dunia termasuk negara-negara Commonwealth, Eropa, dan Asia.",
        en: "Yes, fully accredited by the Malaysian Qualifications Agency (MQA), Ministry of Higher Education Malaysia, and globally recognized across the UK, Commonwealth, Arab ministries, and international education authorities.",
        ar: "نعم، جامعة تايلور معتمدة بالكامل من هيئة المؤهلات الماليزية (MQA) ووزارة التعليم العالي، وشهاداتها معترف بها ومصادق عليها في جميع الدول العربية وعالمياً.",
        ko: "네, 말레이시아 고등교육부 및 MQA의 완전한 인증을 받았으며 전 세계 및 아시아, 영연방 국가에서 정식 학위로 인정받습니다.",
        ja: "はい、マレーシア資格機構 (MQA) および高等教育省により完全認定されており、世界各国で正式な学位として認められています。",
        zh: "是的，拥有马来西亚学术鉴定局 (MQA) 与高等教育部完全认证，受中国教育部留学服务中心及全球权威机构认可。",
        ru: "Да, вуз имеет полную аккредитацию MQA и признается министерствами образования по всему миру.",
        fr: "Oui, accrédité par la MQA et le ministère de l'Enseignement supérieur, reconnu dans le monde entier.",
        es: "Sí, totalmente acreditada por la MQA y reconocida por ministerios de educación a nivel global."
      }
    },
    {
      q: {
        id: "Apa saja syarat kemampuan bahasa Inggris untuk mendaftar?",
        en: "What are the English language requirements for admission to Taylor's?",
        ar: "ما هي شروط اللغة الإنجليزية للقبول في جامعة تايلور؟",
        ko: "입학을 위한 영어 성적 요구 조건은 어떻게 되나요?",
        ja: "出願に必要な英語要件は何ですか？",
        zh: "申请泰莱大学需要满足哪些英语语言要求？",
        ru: "Каковы требования к знанию английского языка для поступления?",
        fr: "Quelles sont les exigences linguistiques en anglais pour l'admission ?",
        es: "¿Cuáles son los requisitos de nivel de inglés para la admisión?"
      },
      a: {
        id: "Sebagian besar program Sarjana (S1) memerlukan skor IELTS 6.0 atau TOEFL/PTE yang setara. Mahasiswa yang belum memiliki tes resmi dapat mengikuti program Bahasa Inggris Intensif (IEN) langsung di kampus.",
        en: "Most undergraduate programs require IELTS 6.0 or equivalent. Applicants without IELTS can enroll in Taylor's Intensive English Programme (IEN) on campus before commencing their degree.",
        ar: "تتطلب معظم برامج البكالوريوس درجة 6.0 في IELTS. وفي حال عدم توفر الاختبار، يمكن للطالب دراسة برنامج اللغة الإنجليزية المكثف (IEN) بالحرم الجامعي.",
        ko: "대부분의 학사 과정은 IELTS 6.0 이상을 요구합니다. 공인 영어 성적이 없는 경우 캠퍼스 내 집중 영어 프로그램(IEN)을 이수할 수 있습니다.",
        ja: "多くの学部課程でIELTS 6.0相当が求められます。スコアがない場合はキャンパス内の集中英語コース (IEN) を受講可能です。",
        zh: "大部分本科课程要求雅思 6.0 或同等语言成绩。暂无雅思的学生可先就读大学校内密集英语强化课程 (IEN)。",
        ru: "Для большинства программ бакалавриата требуется IELTS 6.0. Без сертификата можно пройти интенсивный языковой курс (IEN) на кампусе.",
        fr: "La plupart des programmes de licence exigent un IELTS 6.0. Un programme intensif d'anglais (IEN) est disponible sur le campus.",
        es: "La mayoría de los grados requieren IELTS 6.0. Los estudiantes sin certificado pueden cursar el programa intensivo de inglés (IEN) en el campus."
      }
    },
    {
      q: {
        id: "Apakah StudyCo memungut biaya agen untuk pengurusan surat penawaran?",
        en: "Does StudyCo charge any agency fees for securing the official offer letter?",
        ar: "هل توفر منصة StudyCo خطاب القبول الرسمي مجاناً؟",
        ko: "StudyCo는 공식 입학 허가서 발급에 대행 수수료를 받나요?",
        ja: "StudyCoでは公式オファーレターの手続きに手数料がかかりますか？",
        zh: "StudyCo 协助获取官方录取通知书是否收取中介服务费？",
        ru: "Взимает ли StudyCo комиссию за оформление официального зачисления?",
        fr: "StudyCo facture-t-il des frais pour obtenir la lettre d'offre officielle ?",
        es: "¿StudyCo cobra honorarios por gestionar la carta de oferta oficial?"
      },
      a: {
        id: "Tidak. StudyCo adalah perwakilan resmi Taylor's University sehingga layanan konsultasi, pendaftaran, dan pengurusan Surat Penawaran Resmi adalah 100% GRATIS.",
        en: "No. StudyCo is an official authorized representative of Taylor's University. All application processing, consultation, and offer letter issuance services are 100% FREE with zero agent fees.",
        ar: "نعم، منصة StudyCo وكيل رسمي مباشر لجامعة تايلور، وتقدم خدمة التقديم والحصول على خطاب القبول الرسمي مجاناً بدون أي رسوم.",
        ko: "아닙니다. StudyCo는 테일러스 대학교의 공식 파트너로, 입학 상담 및 공식 오퍼레터 발급 서비스가 100% 무료로 제공됩니다.",
        ja: "いいえ。StudyCoはテイラーズ大学の公式提携機関であるため、カウンセリングからオファーレター取得まで100％無料でサポートいたします。",
        zh: "完全免费。StudyCo 是泰莱大学官方直属合作代表，为学生提供咨询、材料递交和录取通知书申请全套100%零中介费服务。",
        ru: "Нет. StudyCo является официальным представителем Taylor's University, поэтому консультации и оформление оффера на 100% бесплатны.",
        fr: "Non. StudyCo est un représentant officiel de Taylor's University. Les services de candidature sont 100% GRATUITS.",
        es: "No. StudyCo es representante oficial de Taylor's University. La asesoría y tramitación de la carta de oferta es 100% GRATUITA."
      }
    }
  ],
  articles: [
    {
      id: "guide-1",
      readTime: "5",
      title: {
        id: "Panduan Lengkap Pendaftaran & Visa Pelajar di Taylor's University",
        en: "Complete Admissions & Student Visa Guide at Taylor's University",
        ar: "دليل القبول والتسجيل والتأشيرة الدراسية الشامل في جامعة تايلور",
        ko: "테일러스 대학교 입학 절차 및 학생 비자(EMGS) 완전 정복 가이드",
        ja: "テイラーズ大学の出願手続きと学生ビザ (EMGS) 完全ガイド",
        zh: "泰莱大学全套入学申请与学生签证 (EMGS) 办理全流程指南",
        ru: "Полное руководство по поступлению и студенческой визе в Taylor's",
        fr: "Guide complet des admissions et du visa étudiant à Taylor's University",
        es: "Guía completa de admisión y visado de estudiante en Taylor's University"
      },
      summary: {
        id: "Langkah demi langkah pendaftaran, syarat berkas ijazah terjemahan, dan proses persetujuan visa EMGS Malaysia.",
        en: "Step-by-step application walkthrough, certified academic document translations, and Malaysian EMGS visa processing.",
        ar: "كل ما يحتاجه الطالب الدولي لمعرفة خطوات التقديم، متطلبات الشهادات، وإجراءات تأشيرة الـ EMGS.",
        ko: "단계별 지원 방법, 공증 서류 준비 요령 및 말레이시아 교육비자(VAL) 승인 절차를 안내합니다.",
        ja: "出願ステップ、英文証明書類の準備、マレーシア学生ビザの承認手続きを分かりやすく解説します。",
        zh: "包含详细申请步骤、公证认证翻译要求及马来西亚官方签证审批 (VAL) 全流程解析。",
        ru: "Пошаговая инструкция по подаче документов, переводам и получению визового одобрения EMGS.",
        fr: "Procédure étape par étape, traduction certifiée des documents et obtention du visa étudiant EMGS.",
        es: "Paso a paso para la solicitud, traducción de documentos y tramitación del visado EMGS."
      }
    },
    {
      id: "guide-2",
      readTime: "4",
      title: {
        id: "Estimasi Biaya Hidup & Pilihan Asrama Sekitar Kampus Lakeside",
        en: "Cost of Living & Student Accommodation around Taylor's Lakeside",
        ar: "دليل تكاليف المعيشة والسكن الطلابي حول حرم تايلور لايك سايد",
        ko: "테일러스 레이크사이드 캠퍼스 인근 숙소 정보 및 월별 생활비 분석",
        ja: "テイラーズ・レイクサイド周辺の学生寮・住居情報と生活費の目安",
        zh: "泰莱大学湖畔校区周边学生公寓住宿推荐及真实留学生活费预算",
        ru: "Стоимость жизни и варианты студенческого жилья рядом с кампусом",
        fr: "Coût de la vie et logement étudiant autour du campus Lakeside",
        es: "Coste de vida y alojamiento para estudiantes cerca del campus Lakeside"
      },
      summary: {
        id: "Rincian biaya sewa kamar, makanan, transportasi LRT, dan tips mengelola anggaran bulanan mahasiswa.",
        en: "Detailed monthly budget breakdown for room rent, dining, LRT transit, and smart student spending tips.",
        ar: "تفاصيل تقديرية لمصروفات السكن والمطاعم والتنقلات والمستلزمات الشهرية للطلاب مع نصائح إدارة الميزانية.",
        ko: "기숙사 렌트비, 식비, 대중교통 이용 팁 등 합리적인 유학 예산 수립 가이드를 제공합니다.",
        ja: "家賃、食費、交通機関の利用、月々の生活費を賢く節約するためのポイントを解説します。",
        zh: "涵盖租房房型、日常餐饮、轻轨通勤及留学生月度开销管理实用建议。",
        ru: "Подробный обзор аренды, питания, транспорта и полезные советы по планированию бюджета.",
        fr: "Détail du budget mensuel pour le loyer, les repas, les transports et conseils pratiques.",
        es: "Desglose mensual de alquiler, comida, transporte y consejos para optimizar tu presupuesto."
      }
    },
    {
      id: "guide-3",
      readTime: "4",
      title: {
        id: "Panduan Visa Pelajar, Izin Tinggal & Kerja Pasca Kelulusan",
        en: "International Student Visa, Residence Permit & Post-Study Work Guide",
        ar: "دليل التأشيرة الدراسية وتصاريح الإقامة والعمل بعد التخرج",
        ko: "유학생 학생비자, 거주허가 및 졸업 후 취업비자 안내",
        ja: "留学生向け学生ビザ、滞在許可および卒業後就労ガイド",
        zh: "国际学生签证办理、居留许可及毕业后工作签证指南",
        ru: "Студенческая виза, вид на жительство и работа после выпуска",
        fr: "Guide du visa étudiant, permis de séjour et travail post-études",
        es: "Guía de visado de estudiante, permiso de residencia y trabajo posterior"
      },
      summary: {
        id: "Panduan lengkap prosedur pengajuan visa pelajar resmi, syarat dokumen, dan izin kerja part-time.",
        en: "Comprehensive guide detailing official student visa requirements, application steps, and work rights.",
        ar: "شرح تفصيلي لكافة متطلبات استخراج فيزا الدراسة الرسمية، الأوراق المطلوبة، وإجراءات العمل والإقامة للطلاب.",
        ko: "공식 학생비자 발급 요건, 서류 준비 절차 및 학기 중 파트타임 근무 규정을 안내합니다.",
        ja: "公式学生ビザの申請要件、必要書類の手続き、および在学中の就労規定を詳しく解説します。",
        zh: "涵盖官方学生签证申请条件、公证材料清单及留学期间合规兼职与工作权益解析。",
        ru: "Полное руководство по получению студенческой визы, списку документов и правилам подработки.",
        fr: "Guide complet des conditions de visa étudiant, des documents requis et des droits au travail.",
        es: "Guía completa de requisitos para visados de estudiante, trámites y derechos laborales."
      }
    }
  ],
  residences: [
    {
      name: {
        id: "U-Residence (Dalam Kampus Tepi Danau)",
        en: "U-Residence (On-Campus Lakeside Waterfront)",
        ar: "سكن U-Residence (داخل الحرم الجامعي بإطلالة على البحيرة)",
        ko: "U-Residence (캠퍼스 내부 레이크사이드)",
        ja: "U-Residence (学内レイクサイド)",
        zh: "U-Residence (校内湖畔学生公寓)",
        ru: "U-Residence (На кампусе у озера)",
        fr: "U-Residence (Sur le campus au bord du lac)",
        es: "U-Residence (En el campus junto al lago)"
      },
      priceRange: "RM 850 - RM 1,600 / month",
      distance: {
        id: "0 menit (Di dalam Kampus Lakeside)",
        en: "0 mins (Inside Lakeside Campus)",
        ar: "0 دقيقة (داخل الحرم الجامعي مباشرة)",
        ko: "0분 (레이크사이드 캠퍼스 내부)",
        ja: "0分 (レイクサイドキャンパス内)",
        zh: "0分钟 (校内即达各教学楼)",
        ru: "0 мин (Прямо на территории кампуса)",
        fr: "0 min (Sur le campus Lakeside)",
        es: "0 min (Dentro del campus Lakeside)"
      },
      amenities: {
        id: ["Wi-Fi Kecepatan Tinggi", "AC & Kamar Mandi Dalam", "Keamanan 24/7 & Akses Kartu Pintar", "Kolam Renang & Gym", "Food Court Tepi Danau"],
        en: ["High-Speed Wi-Fi", "Air Conditioning & Ensuite Bath", "24/7 Security & Smart Keycards", "Swimming Pool & Fitness Gym", "Lakeside Cafes & Food Court"],
        ar: ["إنترنت فائق السرعة", "تكييف وحمام خاص", "حراسة وأمن 24/7 وبوابات ذكية", "مسبح وصالة لياقة بدنية وجيم", "مطاعم ومقاهي حول البحيرة"],
        ko: ["초고속 Wi-Fi", "개별 에어컨 및 전용 욕실", "24시간 보안 및 스마트 출입 카드", "수영장 및 피트니스 짐", "호숫가 푸드코트 및 카페"],
        ja: ["高速Wi-Fi", "エアコン・専用バスルーム完備", "24時間警備＆スマートカード入場", "プール＆フィットネスジム", "湖畔フードコート＆カフェ"],
        zh: ["高速无线网络", "独立空调与独立卫浴", "24小时安保与智能门禁", "露天泳池与健身房", "湖畔美食广场与便利店"],
        ru: ["Высокоскоростной Wi-Fi", "Кондиционер и собственная ванная", "Охрана 24/7 и смарт-карты", "Бассейн и тренажерный зал", "Кафе и фудкорт у озера"],
        fr: ["Wi-Fi haut débit", "Climatisation et salle de bain privée", "Sécurité 24/7 et accès sécurisé", "Piscine et salle de sport", "Restaurants et cafés au bord du lac"],
        es: ["Wi-Fi de alta velocidad", "Aire acondicionado y baño privado", "Seguridad 24/7 y acceso inteligente", "Piscina y gimnasio", "Zona de restaurantes junto al lago"]
      }
    },
    {
      name: {
        id: "Ruemz Residence (Gaya Hotel Dalam Kampus)",
        en: "Ruemz Residence (On-Campus Boutique Hotel Style)",
        ar: "سكن Ruemz الفندقي (داخل الحرم الجامعي)",
        ko: "Ruemz Residence (캠퍼스 내부 부티크 호텔형)",
        ja: "Ruemz Residence (学内ブティックホテル仕様)",
        zh: "Ruemz Residence (校内精品酒店式公寓)",
        ru: "Ruemz Residence (Бутик-отель на кампусе)",
        fr: "Ruemz Residence (Style hôtel boutique sur le campus)",
        es: "Ruemz Residence (Estilo hotel boutique en el campus)"
      },
      priceRange: "RM 950 - RM 1,800 / month",
      distance: {
        id: "1 menit jalan kaki ke fakultas",
        en: "1 min walk to lecture halls",
        ar: "دقيقة واحدة سيراً إلى الكليات والمحاضرات",
        ko: "강의동까지 도보 1분",
        ja: "講義棟まで徒歩1分",
        zh: "步行1分钟直达教学楼与图书馆",
        ru: "1 мин пешком до учебных корпусов",
        fr: "1 min à pied des salles de cours",
        es: "1 min a pie de las aulas"
      },
      amenities: {
        id: ["Layanan Pembersihan Kamar", "Akses Kartu RFID", "Gym & Ruang Rekreasi", "Lounge Belajar Tenang"],
        en: ["Regular Housekeeping", "Smart RFID Access", "Gym & Recreation Room", "Dedicated Quiet Study Lounges"],
        ar: ["خدمة تنظيف دورية", "دخول ذكي بالبطاقات المشفرة", "صالة ألعاب وترفيه وجيم", "قاعات مخصصة للمذاكرة الهادئة"],
        ko: ["정기 룸 클리닝 서비스", "스마트 RFID 출입 관리", "피트니스 센터 및 레크리에이션 룸", "조용한 스터디 라운지"],
        ja: ["定期清掃サービス", "スマートRFIDアクセス", "ジム＆レクリエーション室", "専用自習ラウンジ"],
        zh: ["定期客房保洁服务", "智能RFID门禁系统", "健身房与休闲娱乐室", "专属静音自修自习厅"],
        ru: ["Регулярная уборка номеров", "Смарт-карты RFID", "Тренажерный зал и комната отдыха", "Тихие учебные лаунджи"],
        fr: ["Service de ménage régulier", "Accès sécurisé RFID", "Salle de sport et loisirs", "Salons d'étude calmes"],
        es: ["Servicio de limpieza regular", "Acceso inteligente RFID", "Gimnasio y sala de ocio", "Salas de estudio tranquilas"]
      }
    },
    {
      name: {
        id: "D'Latour Bandar Sunway Condominium",
        en: "D'Latour Bandar Sunway Condominium",
        ar: "أبراج دي لاتور الفاخرة (D'Latour Bandar Sunway)",
        ko: "D'Latour 반다르 수방 콘도미니엄",
        ja: "D'Latour バンダル・サンウェイ コンドミニアム",
        zh: "D'Latour 梳邦豪华高端公寓",
        ru: "D'Latour Кондоминиум Бандар-Санвей",
        fr: "D'Latour Bandar Sunway Condominium",
        es: "D'Latour Bandar Sunway Condominium"
      },
      priceRange: "RM 900 - RM 2,000 / month",
      distance: {
        id: "5 menit jalan kaki / Shuttle bus gratis",
        en: "5 mins walk / Free university shuttle",
        ar: "5 دقائق سيراً / حافلة نقل مجانية",
        ko: "도보 5분 / 무료 셔틀버스 운행",
        ja: "徒歩5分 / 無料シャトルバス運行",
        zh: "步行5分钟 / 专属免费校车接驳",
        ru: "5 мин пешком / Бесплатный шаттл",
        fr: "5 min à pied / Navette gratuite",
        es: "5 min a pie / Autobús universitario gratuito"
      },
      amenities: {
        id: ["Kolam Renang Infinity & Jacuzzi", "Pusat Kebugaran & Sauna", "Taman Langit & Area BBQ", "Dekat Sunway Pyramid Mall"],
        en: ["Infinity Pool & Jacuzzi", "Modern Fitness Gym & Sauna", "Sky Gardens & BBQ Area", "Near Sunway Pyramid Mall"],
        ar: ["مسبح لا متناهي بتصميم عصري", "صالة رياضية متطورة وساونا", "حدائق معلقة ومنطقة شواء", "قرب مجمع صنواي بيراميد الشهير"],
        ko: ["인피니티 풀 및 자쿠지", "최신 피트니스 짐 및 사우나", "스카이 가든 및 바비큐 구역", "선웨이 피라미드 몰 인접"],
        ja: ["インフィニティプール＆ジャグジー", "最新フィットネスジム＆サウナ", "スカイガーデン＆バーベキュー場", "サンウェイピラミッド近接"],
        zh: ["无边际高空泳池与水疗按摩池", "现代健身中心与桑拿房", "空中花园与烧烤区", "紧邻双威金字塔大型购物商场"],
        ru: ["Инфинити-бассейн и джакузи", "Фитнес-центр и сауна", "Скай-гарден и зона барбекю", "Рядом с ТЦ Sunway Pyramid"],
        fr: ["Piscine à débordement et jacuzzi", "Salle de fitness et sauna", "Jardins suspendus et barbecue", "Proche du centre commercial Sunway Pyramid"],
        es: ["Piscina infinita y jacuzzi", "Gimnasio moderno y sauna", "Jardines en azotea y barbacoa", "Cerca del centro comercial Sunway Pyramid"]
      }
    }
  ],
  livingExpenses: [
    {
      item: {
        id: "Sewa Kamar / Akomodasi",
        en: "Room Accommodation (Rent)",
        ar: "السكن والإيجار الشهري",
        ko: "숙소 및 방 렌트비",
        ja: "家賃・住居費",
        zh: "学生住宿与租金",
        ru: "Аренда жилья / комнаты",
        fr: "Logement / Loyer mensuel",
        es: "Alojamiento / Alquiler mensual"
      },
      cost: "RM 800 - RM 1,600"
    },
    {
      item: {
        id: "Makan & Kuliner Harian",
        en: "Food & Daily Dining",
        ar: "الطعام والمطاعم اليومية",
        ko: "식비 및 일일 식사",
        ja: "食費・外食費",
        zh: "餐饮与日常饮食",
        ru: "Питание и продукты",
        fr: "Nourriture et repas quotidiens",
        es: "Comida y alimentación diaria"
      },
      cost: "RM 700 - RM 1,000"
    },
    {
      item: {
        id: "Transportasi Lokal & LRT",
        en: "Local Transport & LRT Transit",
        ar: "المواصلات وبطاقات المترو",
        ko: "대중교통 및 LRT 요금",
        ja: "交通費・LRT乗車代",
        zh: "市内交通与轻轨出行",
        ru: "Местный транспорт и LRT",
        fr: "Transports locaux et métro LRT",
        es: "Transporte local y metro LRT"
      },
      cost: "RM 100 - RM 200"
    },
    {
      item: {
        id: "Utilitas Listrik, Air & Wi-Fi",
        en: "Utilities, Water & Internet",
        ar: "فواتير الكهرباء والمياه والإنترنت",
        ko: "공과금 (전기, 수도, 인터넷)",
        ja: "光熱費・水道・インターネット代",
        zh: "水电费与高速网络",
        ru: "Коммунальные услуги и интернет",
        fr: "Charges (eau, électricité, internet)",
        es: "Suministros (agua, luz e internet)"
      },
      cost: "RM 100 - RM 180"
    },
    {
      item: {
        id: "Kebutuhan Pribadi & Akademik",
        en: "Personal & Academic Supplies",
        ar: "المصروف الشخصي والمستلزمات الدراسية",
        ko: "개인 용돈 및 학용품비",
        ja: "個人雑費・学用品費",
        zh: "个人日常开销与学习用品",
        ru: "Личные расходы и учебные принадлежности",
        fr: "Dépenses personnelles et fournitures",
        es: "Gastos personales y material académico"
      },
      cost: "RM 250 - RM 500"
    },
    {
      item: {
        id: "Total Estimasi Anggaran Bulanan",
        en: "Total Estimated Monthly Budget",
        ar: "إجمالي الميزانية التقديرية الشهرية",
        ko: "총 예상 월별 예산",
        ja: "推定月間総予算",
        zh: "每月预估总预算开支",
        ru: "Итого ориентировочный бюджет в месяц",
        fr: "Budget mensuel total estimé",
        es: "Presupuesto mensual total estimado"
      },
      cost: "RM 1,950 - RM 3,480"
    }
  ]
};

class UniversityDetailManager {
  constructor() {
    this.activeTab = 'overview';
    this.selectedLevel = 'all';
    this.searchQuery = '';
    this.selectedCurrency = localStorage.getItem('studyco_currency') || 'native';
    this.exchangeData = null;
    this.allUniversities = [];
    this.uni = null;
    this.details = null;
    this.programs = [];
    this.allFieldsExpanded = false;
    this.selectedProgramForModal = null;
    window.studycoDetailManager = this;
  }

  async init() {
    const desiredLang = i18n.detectLanguage();
    if (!i18n.translations || Object.keys(i18n.translations).length === 0 || i18n.currentLang !== desiredLang) {
      await i18n.loadLanguage(desiredLang);
    }

    const params = new URLSearchParams(window.location.search);
    const uniId = params.get('id') || 'taylors';

    const tabParam = params.get('tab') || window.location.hash.replace('#', '');
    const validTabs = ['overview', 'courses', 'accommodation'];
    if (SHOW_ARTICLES_TAB) validTabs.push('articles');
    if (validTabs.includes(tabParam)) {
      this.activeTab = tabParam;
    }

    try {
      const v = `?v=${Date.now()}`;
      const [uniRes, detailsRes, exchangeData] = await Promise.all([
        fetch(`./data/universities.json${v}`, { cache: 'no-cache' }),
        fetch(`./data/university-details/${uniId}.json${v}`, { cache: 'no-cache' }),
        getExchangeRates()
      ]);

      const uniData = await uniRes.json();
      this.exchangeData = exchangeData;
      this.allUniversities = uniData.universities || [];
      this.uni = this.allUniversities.find((u) => u.id === uniId) || this.allUniversities[0];

      if (detailsRes.ok) {
        this.details = await detailsRes.json();
        this.programs = this.details.programs || [];
      } else {
        this.details = {};
        this.programs = [];
      }

      // Live CMS overrides overlay (Server data/cms-overrides.json + Client localStorage)
      const applyDetailOverrides = (ov) => {
        if (!ov) return;
        const uniMod = ov.universities?.modified?.[uniId] || ov.universities?.[uniId];
        if (uniMod) {
          this.uni = Object.assign({}, this.uni, uniMod);
          this.details = Object.assign({}, this.details, uniMod);
        }
        const progMod = ov.programs?.modified || ov.programs || {};
        Object.values(progMod).forEach(p => {
          if (p && (p.university_id === uniId || p.universityId === uniId)) {
            const idx = this.programs.findIndex(x => x.id === p.id);
            if (idx >= 0) this.programs[idx] = Object.assign({}, this.programs[idx], p);
            else this.programs.unshift(p);
          }
        });
        const delProgs = ov.deleted_programs || ov.programs?.deleted || [];
        if (Array.isArray(delProgs) && delProgs.length > 0) {
          const delSet = new Set(delProgs);
          this.programs = this.programs.filter(p => !delSet.has(p.id));
        }
      };

      try {
        const ovRes = await fetch(`./data/cms-overrides.json${v}`, { cache: 'no-cache' });
        if (ovRes.ok) applyDetailOverrides(await ovRes.json());
      } catch (e) {}

      // Client-side preview overrides from localStorage (Vercel / Offline mode)
      try {
        const localOv = JSON.parse(localStorage.getItem('studyco_cms_overrides') || 'null');
        if (localOv) applyDetailOverrides(localOv);
        const localUniProgs = JSON.parse(localStorage.getItem('studyco_uni_prog_' + uniId) || 'null');
        if (Array.isArray(localUniProgs) && localUniProgs.length > 0) {
          this.programs = localUniProgs;
        }
      } catch (e) {}
    } catch (err) {
      console.warn('[UniversityDetail] Error loading data:', err);
    }

    this.render();

    window.addEventListener('languageChanged', async (e) => {
      const newLang = e.detail?.lang;
      if (newLang && i18n.currentLang !== newLang) {
        await i18n.loadLanguage(newLang);
      }
      this.render();
    });

    window.addEventListener('popstate', async () => {
      const activeLang = i18n.detectLanguage();
      if (i18n.currentLang !== activeLang) {
        await i18n.loadLanguage(activeLang);
      }
      this.render();
    });
  }

  setTab(tabId) {
    this.activeTab = tabId;
    const tabs = document.querySelectorAll('.profile-main-tab');
    const panes = document.querySelectorAll('.profile-tab-pane');

    tabs.forEach((tab) => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    panes.forEach((pane) => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    history.replaceState(null, '', `?id=${this.uni.id}&tab=${tabId}&lang=${i18n.currentLang}`);
  }

  setCurrency(currCode) {
    this.selectedCurrency = currCode;
    localStorage.setItem('studyco_currency', currCode);
    
    // Update tuition displays
    const uniCurr = this.uni.currency || getCountryCurrency(this.uni.country) || 'MYR';
    const minFee = this.uni.feeRangeMin || 25000;
    const maxFee = this.uni.feeRangeMax || 95000;
    const nativeFeeStr = `${formatCurrencyValue(minFee, uniCurr)} - ${formatCurrencyValue(maxFee, uniCurr)}`;
    let rangeText = nativeFeeStr;
    if (this.selectedCurrency && this.selectedCurrency !== 'native' && this.selectedCurrency !== uniCurr) {
      const minFeeFormatted = formatProgramPrice(minFee, uniCurr, this.selectedCurrency, this.exchangeData);
      const maxFeeFormatted = formatProgramPrice(maxFee, uniCurr, this.selectedCurrency, this.exchangeData);
      const isAr = (i18n.currentLang === 'ar');
      rangeText = `${nativeFeeStr} <span class="fee-estimate-converted" style="font-weight: 500; font-size: 0.88em; color: var(--color-gray-600); margin-inline-start: 0.4rem;">(${isAr ? 'ما يعادل' : 'approx.'} ${minFeeFormatted} - ${maxFeeFormatted})</span>`;
    }
    const rangeDisplay = document.getElementById('profile-range-display');
    if (rangeDisplay) {
      rangeDisplay.innerHTML = rangeText;
    }

    this.renderCoursesAccordion();
    
    // If modal is currently open, re-render modal fee
    if (this.selectedProgramForModal) {
      const modalFeeEl = document.getElementById('modal-course-fee');
      if (modalFeeEl) {
        const progCurr = this.selectedProgramForModal.currency || uniCurr;
        modalFeeEl.textContent = (this.selectedCurrency === 'native' || !this.selectedCurrency)
          ? `${formatCurrencyValue(this.selectedProgramForModal.annualFee, progCurr)} / ${i18n.t('calc_per_year')}`
          : `${formatProgramPrice(this.selectedProgramForModal.annualFee, progCurr, this.selectedCurrency, this.exchangeData)} / ${i18n.t('calc_per_year')}`;
      }
    }
  }

  setLevel(level) {
    this.selectedLevel = level;
    const pills = document.querySelectorAll('.courses-level-pill');
    pills.forEach((p) => {
      if (p.dataset.level === level) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    this.renderCoursesAccordion();
  }

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.renderCoursesAccordion();
  }

  toggleAllAccordions() {
    this.allFieldsExpanded = !this.allFieldsExpanded;
    const items = document.querySelectorAll('.field-accordion-item');
    items.forEach((item) => {
      if (this.allFieldsExpanded) {
        item.classList.add('open');
      } else {
        item.classList.remove('open');
      }
    });

    const toggleBtn = document.getElementById('btn-toggle-accordions');
    if (toggleBtn) {
      toggleBtn.textContent = this.allFieldsExpanded ? i18n.t('tbl_collapse_all') : i18n.t('tbl_expand_all');
    }
  }

  openCourseModal(programId) {
    const program = this.programs.find((p) => p.id === programId);
    if (!program) return;

    this.selectedProgramForModal = program;
    this.selectedProgramForModal = program;
    const lang = i18n.currentLang;
    const isAr = (lang === 'ar');
    const progCurrency = program.currency || (this.uni ? getCountryCurrency(this.uni.country) : 'MYR');
    const feeFormatted = (this.selectedCurrency === 'native' || !this.selectedCurrency)
      ? `${formatCurrencyValue(program.annualFee, progCurrency)} / ${i18n.t('calc_per_year')}`
      : `${formatProgramPrice(program.annualFee, progCurrency, this.selectedCurrency, this.exchangeData)} / ${i18n.t('calc_per_year')}`;
    const levelLabel = i18n.t(LEVEL_KEY[program.level] || program.level);
    const durationStr = i18n.t('prog_duration_val', { n: program.duration });
    const uniDisplayName = (isAr && (this.uni.arabicName || (this.details && this.details.arabicName)))
      ? (this.uni.arabicName || this.details.arabicName)
      : this.uni.name;
    const progDisplayName = (isAr && program.nameAr) ? program.nameAr : program.name;
    const waMsg = i18n.t('wa_program_apply_msg', {
      program: progDisplayName,
      university: uniDisplayName
    });
    const waLink = CONFIG.getWhatsAppLink(waMsg);

    const rawCurriculum = (isAr && program.curriculumAr)
      ? program.curriculumAr
      : (program.curriculum || null);

    let curriculum = rawCurriculum;
    if (!curriculum || Object.keys(curriculum).length === 0) {
      const dur = program.duration || 3;
      curriculum = {};
      const arYears = [
        ['مقدمة في التخصص والأسس النظرية', 'المناهج العلمية والتحليل الكمي', 'مهارات التواصل الأكاديمي والبحث', 'أخلاقيات الممارسة المهنية'],
        ['المفاهيم المتقدمة والمقررات التخصصية', 'مناهج البحث والتحليل المتعمق', 'دراسات الحالة والتطبيقات العملية', 'المسار التخصصي الاختياري'],
        ['مشروع التخرج والبحث العملي المتقدم', 'التدريب العملي الميداني الإلزامي بالصناعة', 'القيادة المهنية والتخطيط الاستراتيجي'],
        ['التطبيقات التخصصية المتقدمة', 'التصميم الهندسي المتكامل والأنظمة', 'التدريب العملي المهني الميداني المعتمد', 'أطروحة مرتبة الشرف والبحث الأكاديمي'],
        ['أطروحة الماجستير والبحث السريري / المهني', 'الممارسة التخصصية المتقدمة في بيئة العمل', 'التدريب السريري التخصصي والاستشارات', 'مشروع التخرج الشامل والاعتماد المهني']
      ];
      const enYears = [
        ['Foundations & Core Principles', 'Quantitative Methods & Computing', 'Academic Communication Skills', 'Professional Ethics'],
        ['Advanced Concepts & Specialized Modules', 'Research Methodologies & Analysis', 'Applied Case Studies Studio', 'Elective Track'],
        ['Final Year Capstone Project (FYP)', 'Compulsory Industry Internship Placement', 'Strategic Leadership & Practice'],
        ['Advanced Specialized Systems & Analysis', 'Professional Engineering / Systems Practice', 'Applied Industry Capstone Research', 'Honours Research Dissertation'],
        ['Advanced Professional Dissertation', 'Clinical / Specialized Workplace Practice', 'Strategic Leadership & Consultation Practicum', 'Comprehensive Capstone Portfolio']
      ];
      for (let i = 1; i <= Math.min(5, Math.max(1, dur)); i++) {
        curriculum[`year${i}`] = isAr ? arYears[i - 1] : enYears[i - 1];
      }
    }

    let overviewText = program.overview || program.description || '';
    let entryReqText = program.entryRequirements || program.requirements || 'Pass high school certificate / A-Levels / Foundation with minimum required grades. English proficiency: IELTS 6.0/6.5 or university academic preparation.';
    let careerText = program.careerProspects || (program.careerOpportunities && program.careerOpportunities.join(', ')) || 'High-demand industry career paths in leading multinational corporations and tech leaders.';

    if (lang === 'id') {
      overviewText = program.overviewId || `Program ${program.name} terakreditasi internasional yang diselenggarakan di kampus universitas, membekali mahasiswa dengan kualifikasi gelar global, fasilitas berstandar dunia, dan keterserapan kerja industri yang tinggi.`;
      entryReqText = program.entryRequirementsId || 'Lulus SMA / SMK / MA / Ijazah Setara / Foundation dengan nilai yang memenuhi syarat. Kemampuan Bahasa Inggris: IELTS 5.5 - 6.5 atau Kursus Persiapan Bahasa Inggris Universitas.';
      careerText = program.careerProspectsId || 'Peluang karir luas di berbagai perusahaan multinasional terkemuka, industri teknologi, dan pasar kerja internasional.';
    } else if (lang === 'ar') {
      overviewText = program.overviewAr || `برنامج ${progDisplayName} معتمد دولياً ومقدم في الحرم الجامعي، يؤهل الطلاب بشهادات دولية متطورة ومرافق تقنية عالية تؤهلهم للمنافسة بقوة في سوق العمل العالمي.`;
      entryReqText = program.requirementsAr || program.entryRequirementsAr || 'شهادة الثانوية العامة أو ما يعادلها بمعدل جيد، مع إثبات كفاءة اللغة الإنجليزية (IELTS) أو دراسة برنامج اللغة الإنجليزية بالجامعة.';
      careerText = program.careerProspectsAr || (program.careerOpportunitiesAr && program.careerOpportunitiesAr.join('، ')) || 'فرص عمل مرموقة في كبرى الشركات العالمية والمؤسسات المتخصصة محلياً ودولياً.';
    }

    let modalBackdrop = document.getElementById('course-details-modal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'course-details-modal';
      modalBackdrop.className = 'course-modal-backdrop';
      document.body.appendChild(modalBackdrop);
    }

    modalBackdrop.innerHTML = `
      <div class="course-modal-dialog">
        <div class="course-modal-header">
          <div>
            <span class="prog-table-badge" style="background-color: var(--color-primary); color: #000; margin-block-end: 0.35rem;">${levelLabel}</span>
            <h2 class="course-modal-title">${progDisplayName}</h2>
            ${isAr && program.nameAr ? `<p style="font-size: 0.92rem; color: var(--color-gray-500); margin: 0.2rem 0 0.4rem 0; font-weight: 500;">${program.name}</p>` : ''}
            <p class="course-modal-subtitle">${uniDisplayName} — ${(this.details && this.details.campusName) || this.uni.campusName}</p>
          </div>
          <button class="course-modal-close" id="btn-close-course-modal" aria-label="Close">✕</button>
        </div>

        <div class="course-modal-body">
          <!-- Key Info Grid -->
          <div class="course-key-grid">
            <div class="course-key-card">
              <span class="key-label">${i18n.t('modal_annual_fee')}</span>
              <span class="key-val" id="modal-course-fee">${feeFormatted}</span>
            </div>
            <div class="course-key-card" style="border: 2px solid var(--color-primary); background: #fffdf5;">
              <span class="key-label">${i18n.t('table_header_ielts')}</span>
              <span class="key-val" style="color: var(--color-black); font-weight: 800;">${ICONS.target} ${program.ielts || '6.0'}</span>
            </div>
            <div class="course-key-card">
              <span class="key-label">${i18n.t('modal_duration')}</span>
              <span class="key-val">${ICONS.clock} ${durationStr}</span>
            </div>
            <div class="course-key-card">
              <span class="key-label">${i18n.t('modal_degree_level')}</span>
              <span class="key-val">${ICONS.cap} ${levelLabel}</span>
            </div>
            <div class="course-key-card">
              <span class="key-label">${i18n.t('modal_intakes')}</span>
              <span class="key-val">${ICONS.calendar} ${program.intakes || this.uni.intakes || 'Feb, Apr, Sep'}</span>
            </div>
          </div>

          <!-- Tuition Breakdown & Other Expenses (Client Feedback Point) -->
          <div class="course-section-block">
            <h3>${ICONS.creditCard} ${i18n.t('fee_breakdown_heading')}</h3>
            
            <table class="prog-breakdown-table" style="width:100%; border-collapse: collapse; margin-block: 1rem; font-size: 0.92rem;">
              <thead>
                <tr style="background: var(--color-gray-100); text-align: start;">
                  <th style="padding: 0.75rem 1rem; border: 1px solid var(--color-gray-200);">${i18n.t('tbl_col_level')} / ${i18n.t('tbl_col_duration')}</th>
                  <th style="padding: 0.75rem 1rem; border: 1px solid var(--color-gray-200);">${i18n.t('modal_annual_fee')}</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const yfList = (Array.isArray(program.yearlyFees) && program.yearlyFees.length > 0)
                    ? program.yearlyFees
                    : Array.from({ length: program.duration || 3 }, (_, i) => ({ year: i + 1, fee: program.annualFee }));
                  return yfList.map(yf => {
                    const feeVal = (typeof yf.fee === 'number') ? yf.fee : program.annualFee;
                    const yfFee = (this.selectedCurrency === 'native' || !this.selectedCurrency)
                      ? formatCurrencyValue(feeVal, progCurrency)
                      : formatProgramPrice(feeVal, progCurrency, this.selectedCurrency, this.exchangeData);
                    return `
                    <tr>
                      <td style="padding: 0.65rem 1rem; border: 1px solid var(--color-gray-200); font-weight: 600;">
                        ${i18n.t('fee_year_n', { n: yf.year || 1 })}
                      </td>
                      <td style="padding: 0.65rem 1rem; border: 1px solid var(--color-gray-200); font-weight: 700; color: var(--color-primary-dark);">
                        ${yfFee}
                      </td>
                    </tr>
                    `;
                  }).join('');
                })()}
                <tr style="background: #fdfbf7; font-weight: 800;">
                  <td style="padding: 0.75rem 1rem; border: 1px solid var(--color-gray-200);">
                    ${i18n.t('fee_total_course')} (${program.duration || 3} ${i18n.t('prog_duration_val', { n: program.duration || 3 })})
                  </td>
                  <td style="padding: 0.75rem 1rem; border: 1px solid var(--color-gray-200); color: var(--color-primary-dark); font-size: 1.05rem;">
                    ${(() => {
                      const totalNum = (typeof program.totalTuitionFee === 'number' && !isNaN(program.totalTuitionFee))
                        ? program.totalTuitionFee
                        : (program.annualFee * (program.duration || 3));
                      return (this.selectedCurrency === 'native' || !this.selectedCurrency)
                        ? formatCurrencyValue(totalNum, progCurrency)
                        : formatProgramPrice(totalNum, progCurrency, this.selectedCurrency, this.exchangeData);
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 style="margin-block-start: 1.25rem; margin-block-end: 0.75rem; font-size: 0.95rem; color: var(--color-gray-800); display: flex; align-items: center; gap: 0.5rem;">
              <span>${ICONS.building}</span> <span>${i18n.t('other_expenses_heading')}</span>
            </h4>
            <table class="prog-breakdown-table" style="width:100%; border-collapse: collapse; font-size: 0.88rem;">
              <tbody>
                ${this.renderCountryExpensesTable(this.uni.country, isAr)}
              </tbody>
            </table>
          </div>

          <!-- Overview -->
          <div class="course-section-block">
            <h3>${ICONS.fileText} ${i18n.t('modal_course_overview')}</h3>
            <p style="font-size: 0.92rem; line-height: 1.7; color: var(--color-gray-700);">${overviewText}</p>
          </div>

          <!-- Curriculum by Year -->
          <div class="course-section-block">
            <h3>${ICONS.book} ${i18n.t('modal_curriculum_heading')}</h3>
            
            ${Object.keys(curriculum).sort().map((yKey, idx) => {
              const yearNum = parseInt(yKey.replace(/\D/g, '')) || (idx + 1);
              const yearTitle = isAr
                ? (['السنة الدراسية الأولى', 'السنة الدراسية الثانية', 'السنة الدراسية الثالثة', 'السنة الدراسية الرابعة', 'السنة الدراسية الخامسة'][yearNum - 1] || `السنة الدراسية ${yearNum}`)
                : (lang === 'id' ? `Tahun Akademik ${yearNum}` : `Academic Year ${yearNum}`);
              const modules = curriculum[yKey] || [];
              const countText = isAr
                ? `${modules.length} مواد دراسية`
                : (lang === 'id' ? `${modules.length} Modul` : `${modules.length} Modules`);
              return `
                <div class="curriculum-year-box">
                  <div class="curriculum-year-header">
                    <span>${ICONS.book} ${yearTitle}</span>
                    <span class="tab-count-badge">${countText}</span>
                  </div>
                  <ul class="curriculum-modules-list">
                    ${modules.map((m) => `<li>${m}</li>`).join('')}
                  </ul>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Entry Requirements -->
          <div class="course-section-block">
            <h3>${ICONS.check} ${i18n.t('modal_entry_req')}</h3>
            <div style="background-color: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 1.1rem;">
              <p style="font-size: 0.9rem; line-height: 1.6; color: var(--color-gray-700); margin: 0;">${entryReqText}</p>
            </div>
          </div>

          <!-- Career Prospects -->
          <div class="course-section-block">
            <h3>${ICONS.briefcase} ${i18n.t('modal_career_prospects')}</h3>
            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--color-gray-700);">${careerText}</p>
          </div>
        </div>

        <div class="course-modal-footer">
          <div style="font-size: 0.88rem; color: var(--color-gray-600);">
            <span>${i18n.t('modal_free_apply_badge')}</span>
          </div>
          <a class="btn-start-admission-wa" href="${waLink}" rel="noopener noreferrer" target="_blank" style="padding: 0.7rem 1.5rem; font-size: 0.95rem;">
            <svg class="wa-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"></path></svg>
            <span>${i18n.t('modal_btn_apply_prog')}</span>
          </a>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');
    modalBackdrop.style.display = 'flex';
    modalBackdrop.style.opacity = '1';
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    const closeModal = () => {
      modalBackdrop.classList.remove('open');
      modalBackdrop.style.display = 'none';
      modalBackdrop.style.opacity = '0';
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      this.selectedProgramForModal = null;
    };

    const closeBtn = document.getElementById('btn-close-course-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  renderCountryExpensesTable(country, isAr) {
    const c = country || 'malaysia';
    let items = [];

    if (c === 'australia') {
      items = [
        { name: isAr ? 'تأشيرة الطالب الأسترالية (Subclass 500 Visa)' : 'Australian Student Visa (Subclass 500)', fee: 1600, curr: 'AUD', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'التأمين الصحي الإلزامي للطلاب الأجانب (OSHC)' : 'Overseas Student Health Cover (OSHC)', fee: 650, curr: 'AUD', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم الخدمات والمرافق الطلابية (SSAF)' : 'Student Services & Amenities Fee (SSAF)', fee: 350, curr: 'AUD', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'المواد الأكاديمية والكتب والمستلزمات التقنية' : 'Academic Materials, Tech & Lab Resources', fee: 600, curr: 'AUD', period: isAr ? 'سنوياً' : 'Per Year' }
      ];
    } else if (c === 'uk') {
      items = [
        { name: isAr ? 'رسوم طلب تأشيرة الطالب البريطانية (Student Visa)' : 'UK Student Visa Application Fee', fee: 490, curr: 'GBP', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'الرسوم الصحية للهيئة الوطنية (IHS Healthcare Surcharge)' : 'Immigration Health Surcharge (IHS)', fee: 776, curr: 'GBP', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم التسجيل الأكاديمي والخدمات الجامعية' : 'Academic Registration & Campus Services', fee: 250, curr: 'GBP', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'المواد الدراسية والمختبرات والأنشطة' : 'Course Materials, Labs & Guild Membership', fee: 450, curr: 'GBP', period: isAr ? 'سنوياً' : 'Per Year' }
      ];
    } else if (c === 'canada') {
      items = [
        { name: isAr ? 'رسوم تصريح الدراسة الكندي (Study Permit)' : 'Canada Study Permit Application Fee', fee: 150, curr: 'CAD', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'رسوم القياسات الحيوية والبصمات (Biometrics)' : 'Biometrics Collection Fee', fee: 85, curr: 'CAD', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'التأمين الصحي الإقليمي للطلاب (UHIP / Provincial Health)' : 'University Health Insurance Plan (UHIP)', fee: 750, curr: 'CAD', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم الخدمات الطلابية والتقنية والاتحاد الجامعي' : 'Student Ancillary, Tech & Athletics Fees', fee: 550, curr: 'CAD', period: isAr ? 'سنوياً' : 'Per Year' }
      ];
    } else if (c === 'newzealand') {
      items = [
        { name: isAr ? 'تأشيرة الطالب النيوزيلندية (Student Visa)' : 'NZ Student Visa Application Fee', fee: 375, curr: 'NZD', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'التأمين الطبي وتأمين السفر الإلزامي (Studentsafe)' : 'Comprehensive Medical & Travel Insurance', fee: 720, curr: 'NZD', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم الخدمات والمرافق الطلابية' : 'Student Services Levy', fee: 480, curr: 'NZD', period: isAr ? 'سنوياً' : 'Per Year' }
      ];
    } else if (c === 'singapore') {
      items = [
        { name: isAr ? 'إصدار تصريح الطالب (ICA Student\'s Pass)' : 'ICA Student\'s Pass Processing & Issuance', fee: 120, curr: 'SGD', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'التأمين الطبي والصحي الجامعي الإلزامي' : 'Compulsory Group Medical Insurance', fee: 200, curr: 'SGD', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم المرافق الأكاديمية والأنشطة الطلابية' : 'Student Activity & IT Facilities Fee', fee: 300, curr: 'SGD', period: isAr ? 'سنوياً' : 'Per Year' }
      ];
    } else {
      items = [
        { name: isAr ? 'تأشيرة الطلاب EMGS والفحص الطبي' : 'EMGS Student Visa & Medical Checkup', fee: 3000, curr: 'MYR', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'رسوم التسجيل والخدمات الإدارية' : 'Registration & Administrative Fees', fee: 2800, curr: 'MYR', period: isAr ? 'دفعة واحدة' : 'One-time' },
        { name: isAr ? 'التأمين الصحي الإلزامي للطلاب' : 'Compulsory Hospitalization & Surgical Insurance', fee: 750, curr: 'MYR', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'رسوم الموارد والمختبرات السنوية' : 'Annual Resources & Laboratory Fee', fee: 1200, curr: 'MYR', period: isAr ? 'سنوياً' : 'Per Year' },
        { name: isAr ? 'التأمين المالي المسترد للجامعة' : 'Refundable University Security Deposit', fee: 1500, curr: 'MYR', period: isAr ? 'مسترد' : 'Refundable' }
      ];
    }

    return items.map(it => {
      let feeStr = '';
      if (this.selectedCurrency === 'native' || !this.selectedCurrency) {
        feeStr = formatCurrencyValue(it.fee, it.curr);
      } else {
        feeStr = formatProgramPrice(it.fee, it.curr, this.selectedCurrency, this.exchangeData);
      }
      return `
        <tr>
          <td style="padding: 0.6rem 0.8rem; border: 1px solid var(--color-gray-200);">${it.name}</td>
          <td style="padding: 0.6rem 0.8rem; border: 1px solid var(--color-gray-200); font-weight: 700;">${feeStr}</td>
          <td style="padding: 0.6rem 0.8rem; border: 1px solid var(--color-gray-200); color: var(--color-gray-600);">${it.period}</td>
        </tr>
      `;
    }).join('');
  }

  render() {
    const root = document.getElementById('profile-root');
    if (!root) return;

    if (!this.uni) {
      root.innerHTML = `<div class="entity-no-results"><p>${i18n.t('uni_profile_not_found')}</p></div>`;
      return;
    }

    const uni = this.uni;
    const details = this.details || {};
    const lang = i18n.currentLang;
    const isAr = (lang === 'ar');
    let uniDisplayName = (isAr && (uni.arabicName || details.arabicName)) ? (uni.arabicName || details.arabicName) : uni.name;
    const rawUniDisplayName = uniDisplayName;
    if (isAr && uniDisplayName.includes('(') && uniDisplayName.includes(')')) {
      uniDisplayName = uniDisplayName.replace(/\(([^)]+)\)/, '<span dir="ltr" style="display:inline-block; unicode-bidi:embed;">($1)</span>');
    }
    this.uniDisplayName = rawUniDisplayName;
    const waUniMsg = i18n.t('wa_university_msg', { university: rawUniDisplayName });
    const waLink = CONFIG.getWhatsAppLink(waUniMsg);
    const countryName = i18n.t(COUNTRY_KEY[uni.country] || uni.country);
    const cityName = i18n.t(uni.cityKey || uni.city);

    // Format tuition range
    const uniCurrency = uni.currency || getCountryCurrency(uni.country) || 'MYR';
    const minFee = uni.feeRangeMin || 25000;
    const maxFee = uni.feeRangeMax || 95000;
    const nativeFeeStr = `${formatCurrencyValue(minFee, uniCurrency)} - ${formatCurrencyValue(maxFee, uniCurrency)}`;
    let feeRangeStr = nativeFeeStr;
    if (this.selectedCurrency && this.selectedCurrency !== 'native' && this.selectedCurrency !== uniCurrency) {
      const minFeeFormatted = formatProgramPrice(minFee, uniCurrency, this.selectedCurrency, this.exchangeData);
      const maxFeeFormatted = formatProgramPrice(maxFee, uniCurrency, this.selectedCurrency, this.exchangeData);
      feeRangeStr = `${nativeFeeStr} <span class="fee-estimate-converted" style="font-weight: 500; font-size: 0.88em; color: var(--color-gray-600); margin-inline-start: 0.4rem;">(${isAr ? 'ما يعادل' : 'approx.'} ${minFeeFormatted} - ${maxFeeFormatted})</span>`;
    }

    // Similar universities
    const similarIds = details.similarUniversities || uni.similarUniversities || ['sunway', 'apu', 'monash'];
    const similarUnis = this.allUniversities.filter((u) => similarIds.includes(u.id) && u.id !== uni.id).slice(0, 3);

    // Campus name (dynamic & cleanly localized for each university)
    let campusNameText = '';
    if (isAr) {
      campusNameText = (details && details.campusNameAr)
        || uni.campusNameAr
        || (details && details.campusName)
        || uni.campusName;
    } else {
      campusNameText = (details && details.campusName)
        || uni.campusName;
    }
    if (campusNameText) {
      if (!isAr) {
        // Strip Arabic characters in English mode
        const enMatch = campusNameText.match(/\(([^)]+)\)/);
        if (enMatch && /[a-zA-Z]/.test(enMatch[1])) {
          campusNameText = enMatch[1].trim();
        } else if (/[a-zA-Z]/.test(campusNameText)) {
          campusNameText = campusNameText.replace(/[\u0600-\u06FF]+/g, '').trim();
        }
      } else {
        // Extract Arabic part in Arabic mode
        const arMatch = campusNameText.match(/^([^(]+)/);
        if (arMatch && /[\u0600-\u06FF]/.test(arMatch[1])) {
          campusNameText = arMatch[1].trim();
        }
      }
    }
    if (!campusNameText) {
      campusNameText = (uni.id === 'taylors' ? i18n.t('taylors_campus_name') : `${uni.name} Campus, ${cityName}`);
    }

    // Media sources (campus photo, video tour)
    const campusPhotoSrc = details.image || uni.image || 'assets/photo/campus_taylors.webp';
    const videoEmbedSrc = details.videoUrl
      || uni.videoUrl
      || (details.campusShowcase && details.campusShowcase.videoUrl)
      || null;
    const videoDirectUrl = videoEmbedSrc
      ? ((details.campusShowcase && details.campusShowcase.directWatchUrl)
        || details.directWatchUrl
        || (videoEmbedSrc.includes('embed/') ? videoEmbedSrc.replace('www.youtube-nocookie.com/embed/', 'www.youtube.com/watch?v=').replace('youtube.com/embed/', 'www.youtube.com/watch?v=') : videoEmbedSrc))
      : null;
    this.videoEmbedSrc = videoEmbedSrc;

    // 9-Language Generic About Fallback (prevents English leakage in zh, ar, ru, fr, es, ja, ko)
    const genericAbout = {
      ar: `تعتبر ${uniDisplayName} واحدة من أبرز مؤسسات التعليم العالي الرائدة في ${countryName}، وتتميز بالاعتماد الأكاديمي الدولي، والمرافق البحثية والتعليمية المتطورة، ومعدلات التوظيف المرتفعة لخريجيها عالمياً.`,
      en: `${uni.name} is one of the premier higher education institutions in ${countryName}, globally recognized for academic excellence, state-of-the-art facilities, and strong career outcomes for international students.`,
      id: `${uni.name} adalah salah satu perguruan tinggi terkemuka di ${countryName}, diakui secara global atas keunggulan akademik, fasilitas modern, dan prospek karier cemerlang bagi mahasiswa internasional.`,
      zh: `${uni.name} 是 ${countryName} 顶尖的高等学府之一，以卓越的教学声誉、世界一流的校园设施以及毕业生广阔的全球就业前景享誉海内外。`,
      ru: `${uni.name} является одним из ведущих высших учебных заведений в ${countryName}, признанным во всем мире за академическое превосходство, современные кампусы и отличные карьерные перспективы.`,
      fr: `${uni.name} est l'un des établissements d'enseignement supérieur de premier plan en ${countryName}, mondialement reconnu pour son excellence académique et ses infrastructures de pointe.`,
      es: `${uni.name} es una de las instituciones de educación superior líderes en ${countryName}, reconocida internacionalmente por su excelencia académica y sus modernas instalaciones.`,
      ja: `${uni.name} は ${countryName} を代表する名門高等教育機関の一つであり、卓越した教育水準、最先端の研究環境、そして高い就職実績で国際的に高い評価を得ています。`,
      ko: `${uni.name}은(는) ${countryName} 최고의 고등 교육 기관 중 하나로, 세계적으로 인정받는 교육 수준, 최첨단 캠퍼스 시설 및 높은 취업률을 자랑합니다.`
    };

    let descText = '';
    if (details.about && typeof details.about === 'object') {
      descText = details.about[lang] || (lang === 'zh' ? (details.about['zh'] || genericAbout['zh']) : null) || (lang === 'ar' ? (details.about['ar'] || details.descriptionAr || uni.descriptionAr || genericAbout['ar']) : null) || (lang === 'en' || lang === 'id' ? details.about[lang] : null);
    }
    if (!descText) {
      if (isAr && (details.descriptionAr || uni.descriptionAr)) {
        descText = details.descriptionAr || uni.descriptionAr;
      } else if (lang === 'en') {
        descText = details.description || uni.description || genericAbout['en'];
      } else {
        descText = genericAbout[lang] || details.description || uni.description || genericAbout['en'];
      }
    }

    // Currency-aware fallback fees for summary table
    const fallbackFeesByCurr = {
      SGD: ['SGD 12,000 - 18,000', 'SGD 14,000 - 22,000', 'SGD 22,000 - 38,000', 'SGD 24,000 - 42,000', 'SGD 20,000 - 35,000'],
      GBP: ['£12,000 - £16,000', '£14,000 - £18,000', '£18,000 - £28,000', '£19,000 - £30,000', '£16,000 - £26,000'],
      CAD: ['CAD 14,000 - 20,000', 'CAD 16,000 - 22,000', 'CAD 24,000 - 36,000', 'CAD 22,000 - 35,000', 'CAD 18,000 - 28,000'],
      AUD: ['AUD 18,000 - 24,000', 'AUD 20,000 - 28,000', 'AUD 30,000 - 46,000', 'AUD 32,000 - 48,000', 'AUD 26,000 - 38,000'],
      NZD: ['NZD 18,000 - 25,000', 'NZD 20,000 - 28,000', 'NZD 28,000 - 44,000', 'NZD 30,000 - 46,000', 'NZD 25,000 - 36,000'],
      MYR: ['RM 24,000 - RM 30,000', 'RM 22,000 - RM 28,000', 'RM 30,000 - RM 45,000', 'RM 32,000 - RM 45,000', 'RM 20,000 - RM 30,000']
    };
    const activeFallbackFees = fallbackFeesByCurr[uniCurrency] || fallbackFeesByCurr['MYR'];

    // Summary Fee Table levels localized & sanitized
    const summaryFeeTable = (details.summaryFeeTable && details.summaryFeeTable.length > 0)
      ? details.summaryFeeTable.map(row => {
          let durationStr = row.duration;
          if (row.durationYears) {
            durationStr = i18n.t('prog_duration_val', { n: row.durationYears });
          } else if (isAr) {
            if (row.durationAr) {
              durationStr = row.durationAr;
            } else if (typeof durationStr === 'string') {
              const m = durationStr.match(/\(([\u0600-\u06FF\s\d\-–]+)\)/);
              if (m) {
                durationStr = m[1].trim();
              } else {
                durationStr = durationStr.replace(/Years?/gi, 'سنوات').replace(/Year/gi, 'سنة');
              }
            }
          } else {
            // English or other non-Arabic language: strip any Arabic
            if (typeof durationStr === 'string') {
              durationStr = durationStr.replace(/\s*\([\u0600-\u06FF\s\d\-–]+\)\s*/g, '').trim();
              if (lang === 'id') {
                durationStr = durationStr.replace(/Years?/gi, 'Tahun');
              }
            }
          }
          let levelStr = (isAr && row.levelAr) 
            ? row.levelAr 
            : (row.levelKey 
                ? i18n.t(row.levelKey) 
                : (row.levelName || row.degree || (typeof row.faculty === 'object' ? (row.faculty[lang] || row.faculty['en']) : row.faculty) || (typeof row.category === 'object' ? (row.category[lang] || row.category['en'] || row.category['ar']) : row.category) || row.level || i18n.t('level_bachelor')));
          let feeStr = row.avgFeePerYear || row.avgFee || row.feeUSD || row.range || (uniCurrency === 'SGD' ? 'SGD 22,000 - SGD 38,000' : (uniCurrency === 'GBP' ? '£18,000 - £28,000' : (uniCurrency === 'CAD' ? 'CAD 24,000 - CAD 36,000' : (uniCurrency === 'AUD' ? 'AUD 30,000 - AUD 46,000' : 'RM 25,000 - RM 40,000'))));
          return {
            levelName: levelStr,
            duration: durationStr || '3 - 4 Years',
            avgFee: feeStr
          };
        })
      : [
          { levelName: i18n.t('level_foundation'), duration: i18n.t('prog_duration_val', { n: 1 }), avgFee: activeFallbackFees[0] },
          { levelName: i18n.t('level_diploma'), duration: i18n.t('prog_duration_val', { n: 2 }), avgFee: activeFallbackFees[1] },
          { levelName: i18n.t('level_bachelor'), duration: `${i18n.t('prog_duration_val', { n: 3 })} - ${i18n.t('prog_duration_val', { n: 4 })}`, avgFee: activeFallbackFees[2] },
          { levelName: i18n.t('level_master'), duration: `${i18n.t('prog_duration_val', { n: 1 })} - ${i18n.t('prog_duration_val', { n: 2 })}`, avgFee: activeFallbackFees[3] },
          { levelName: i18n.t('level_phd'), duration: i18n.t('prog_duration_val', { n: 3 }), avgFee: activeFallbackFees[4] }
        ];

    // 1. Dynamic Facilities list (from details.campusShowcase or details.facilities or fallback)
    const facilitiesList = (details.campusShowcase && details.campusShowcase.facilities && details.campusShowcase.facilities.length > 0)
      ? details.campusShowcase.facilities
      : (details.facilities && details.facilities.length > 0)
      ? details.facilities
      : DATA_DICTIONARY.facilities;

    // 2. Dynamic Highlights list (All 9 Languages Supported)
    const highlightsList = (details.highlights && details.highlights.length > 0 && (uni.id === 'taylors' || !JSON.stringify(details.highlights).toLowerCase().includes('taylor')))
      ? details.highlights
      : DATA_DICTIONARY.highlights.map(hl => ({
          icon: hl.icon,
          title: {
            en: `Excellence at ${uni.name}`,
            ar: `التميز الأكاديمي في ${uniDisplayName}`,
            id: `Keunggulan di ${uni.name}`,
            zh: `${uni.name} 卓越学术与优势`,
            ru: `Академическое превосходство ${uni.name}`,
            fr: `Excellence académique à ${uni.name}`,
            es: `Excelencia académica en ${uni.name}`,
            ja: `${uni.name} の学術的卓越性`,
            ko: `${uni.name}의 학문적 우수성`
          },
          desc: {
            en: `World-class facilities, globally accredited degrees, and superior career outcomes for international students at ${uni.name}.`,
            ar: `مرافق متطورة على أعلى مستوى عالمي، وشهادات معتمدة دولياً ومستقبل مهني واعد لجميع الطلاب الدوليين في ${uniDisplayName}.`,
            id: `Fasilitas kelas dunia dan prospek karier global di ${uni.name}.`,
            zh: `${uni.name} 配备国际前沿教学实验设施，提供全球权威认证学位与卓越的国际学生就业支持。`,
            ru: `Современная инфраструктура мирового уровня, международно аккредитованные программы и отличные карьерные перспективы в ${uni.name}.`,
            fr: `Infrastructures modernes, diplômes accrédités internationalement et excellentes opportunités professionnelles pour les étudiants à ${uni.name}.`,
            es: `Instalaciones de nivel mundial, titulaciones acreditadas internacionalmente y excelentes perspectivas profesionales en ${uni.name}.`,
            ja: `世界水準の研究施設、国際認定の学位、そして世界中からの留学生に対する充実したキャリア支援を提供しています。`,
            ko: `세계 최고 수준의 캠퍼스 시설, 국제 공인 학위 및 글로벌 진로 지원을 ${uni.name}에서 제공합니다.`
          }
        }));

    // Dynamic Generic FAQs per university & country (Full 9-Language Isolation)
    const dynamicFaqsList = [
      {
        q: {
          en: `Are degrees from ${uni.name} internationally recognized?`,
          ar: `هل شهادات ${uniDisplayName} معترف بها دولياً وفي الدول العربية؟`,
          id: `Apakah ijazah dari ${uni.name} diakui secara internasional?`,
          zh: `${uni.name} 的学位是否获得国际与教育部官方认证？`,
          ru: `Признаются ли дипломы ${uni.name} на международном уровне?`,
          fr: `Les diplômes de ${uni.name} sont-ils reconnus internationalement ?`,
          es: `¿Están los títulos de ${uni.name} reconocidos internacionalmente?`,
          ja: `${uni.name} の学位は国際的に認定されていますか？`,
          ko: `${uni.name}의 학위는 국제적으로 공인되나요?`
        },
        a: {
          en: `Yes, ${uni.name} is fully accredited by the official Ministry of Education in ${countryName} and its degrees are globally recognized across the UK, Commonwealth, Arab ministries, and international education authorities.`,
          ar: `نعم، ${uniDisplayName} معتمدة رسمياً من وزارة التعليم العالي في ${countryName}، وشهاداتها معترف بها ومصادق عليها في جميع الدول العربية وعالمياً لمتابعة الدراسات العليا والتوظيف في كبرى المؤسسات.`,
          id: `Ya, ${uni.name} terakreditasi penuh oleh Kementerian Pendidikan resmi di ${countryName} dan diakui secara global.`,
          zh: `是的，${uni.name} 获得 ${countryName} 教育部及官方权威机构完全认证，其颁发的学位在全球范围内受广泛认可，符合多国回国学历认证与全球升学及就业资质。`,
          ru: `Да, ${uni.name} имеет полную официальную государственную аккредитацию в ${countryName}, а ее дипломы признаются во всем мире и ведущими образовательными ведомствами.`,
          fr: `Oui, ${uni.name} est pleinement accréditée par le ministère de l'Éducation de ${countryName} et ses diplômes sont reconnus mondialement par les institutions et employeurs.`,
          es: `Sí, ${uni.name} está plenamente acreditada por el Ministerio de Educación en ${countryName} y sus títulos gozan de reconocimiento oficial e internacional en todo el mundo.`,
          ja: `はい、${uni.name} は ${countryName} の教育省により完全認定されており、世界各国で正式な学位として認められ、就職や進学に直結します。`,
          ko: `네, ${uni.name}은(는) ${countryName} 교육부의 완전한 공식 인증을 받았으며, 학위는 영연방 국가, 아시아 및 전 세계 유수 기관에서 정식 학위로 인정받습니다.`
        }
      },
      {
        q: {
          en: `What are the English language requirements for admission to ${uni.name}?`,
          ar: `ما هي شروط اللغة الإنجليزية للقبول في ${uniDisplayName}؟`,
          id: `Apa saja syarat kemampuan bahasa Inggris untuk mendaftar ke ${uni.name}?`,
          zh: `申请 ${uni.name} 需要满足哪些英语语言要求？`,
          ru: `Каковы требования к знанию английского языка для поступления в ${uni.name}?`,
          fr: `Quelles sont les exigences linguistiques en anglais pour entrer à ${uni.name} ?`,
          es: `¿Cuáles son los requisitos de nivel de inglés para acceder a ${uni.name}?`,
          ja: `${uni.name} の出願に必要な英語要件は何ですか？`,
          ko: `${uni.name} 입학을 위한 영어 성적 기준은 어떻게 되나요?`
        },
        a: {
          en: `Most undergraduate programs require IELTS 6.0 - 6.5 or equivalent TOEFL/PTE scores. Preparatory English programs are available for applicants seeking language support before commencing their degree.`,
          ar: `تتطلب معظم برامج البكالوريوس الحصول على درجة 6.0 إلى 6.5 في اختبار IELTS أو ما يعادلها في TOEFL أو PTE، كما تتوفر برامج تحضيرية مكثفة للغة الإنجليزية للطلاب الراغبين في تقوية مستواهم.`,
          id: `Sebagian besar program Sarjana memerlukan skor IELTS 6.0 - 6.5 atau setara TOEFL/PTE. Program persiapan bahasa Inggris tersedia sebelum perkuliahan dimulai.`,
          zh: `大部分本科课程要求雅思 6.0 - 6.5 或托福/PTE同等成绩。尚未获得合规语言成绩的学生，可入读大学开设的校内密集英语强化课程。`,
          ru: `Большинство программ бакалавриата требуют IELTS 6.0 - 6.5 или эквивалент TOEFL/PTE. Для абитуриентов также доступны подготовительные языковые курсы.`,
          fr: `La plupart des programmes de licence exigent un score IELTS de 6.0 à 6.5 ou équivalent. Des cours préparatoires d'anglais intensifs sont également proposés.`,
          es: `La mayoría de los grados requieren IELTS 6.0 - 6.5 o equivalente. Hay programas preparatorios de inglés disponibles antes de iniciar el grado.`,
          ja: `多くの学士課程で IELTS 6.0〜6.5 または同等の英語スコアが必要です。スコアが不足している場合は、学内の集中英語コースを受講可能です。`,
          ko: `대부분의 학부 과정은 IELTS 6.0 - 6.5 또는 동등한 공인 영어 성적을 요구합니다. 성적이 없는 경우 캠퍼스 내 어학 집중 과정을 이수할 수 있습니다.`
        }
      },
      {
        q: {
          en: `Does StudyCo charge any agency fees for securing the official offer letter?`,
          ar: `هل تتقاضى منصة StudyCo أي رسوم لتقديم وقبول الطلاب؟`,
          id: `Apakah StudyCo mengenakan biaya agensi untuk pengurusan pendaftaran?`,
          zh: `通过 StudyCo 办理 ${uni.name} 的正式录取通知书是否收取任何中介费用？`,
          ru: `Взимает ли StudyCo агентскую комиссию за оформление зачисления в ${uni.name}?`,
          fr: `StudyCo facture-t-elle des frais d'agence pour obtenir l'admission à ${uni.name} ?`,
          es: `¿Cobra StudyCo alguna comisión de agencia por gestionar la carta de admisión a ${uni.name}?`,
          ja: `StudyCo は ${uni.name} への出願や合格通知の取得に手数料を請求しますか？`,
          ko: `StudyCo는 ${uni.name} 공식 입학 허가서 발급에 별도 대행 수수료를 부과하나요?`
        },
        a: {
          en: `No, StudyCo provides 100% free official guidance, document certification, and direct application submission to ${uni.name} without any agency service fees.`,
          ar: `لا، تقدم منصة StudyCo خدمات الاستشارة وتدقيق المستندات والتقديم الرسمي للحصول على القبول الجامعي مجاناً 100% بدون أي رسوم وساطة أو أتعاب إضافية.`,
          id: `Tidak, StudyCo menyediakan bimbingan resmi dan pendaftaran gratis 100% tanpa biaya agensi.`,
          zh: `绝不收取任何费用。StudyCo 作为官方直聘与合作机构，为学生提供 100% 免费的留学规划、学术材料认证及大学直申服务，全程零中介费。`,
          ru: `Нет, StudyCo предоставляет 100% бесплатные официальные консультации, заверение документов и прямое зачисление в ${uni.name} без каких-либо комиссий.`,
          fr: `Non, StudyCo fournit un accompagnement officiel 100 % gratuit, la certification des dossiers et l'inscription directe sans aucun frais d'agence.`,
          es: `No, StudyCo ofrece asesoramiento oficial 100% gratuito, verificación de documentos y solicitud directa a ${uni.name} sin comisiones de agencia.`,
          ja: `いいえ、StudyCo は ${uni.name} への直接出願、書類審査、留学カウンセリングを完全無料（手数料ゼロ）で提供しています。`,
          ko: `아니요, StudyCo는 ${uni.name}에 대한 공식 입학 상담, 서류 검토 및 대학 원서 접수를 100% 무료로 제공하며 대행 수수료가 없습니다.`
        }
      }
    ];

    // 3. Dynamic FAQs list (safeguarded against Taylor's leaks)
    const faqsList = (details.faqs && details.faqs.length > 0 && (uni.id === 'taylors' || !JSON.stringify(details.faqs).toLowerCase().includes('taylor')))
      ? details.faqs
      : dynamicFaqsList;

    // 4. Dynamic Articles & Guides list
    const articlesList = (details.articlesTab && details.articlesTab.length > 0)
      ? details.articlesTab
      : (details.articles && details.articles.length > 0)
      ? details.articles
      : DATA_DICTIONARY.articles;

    // 5. Dynamic Residences list
    const residencesList = (details.accommodationTab && details.accommodationTab.residences && details.accommodationTab.residences.length > 0)
      ? details.accommodationTab.residences
      : (details.residences && details.residences.length > 0)
      ? details.residences
      : DATA_DICTIONARY.residences;

    // 6. Dynamic Living Expenses list
    const livingExpensesList = (details.accommodationTab && details.accommodationTab.livingExpensesBreakdown && details.accommodationTab.livingExpensesBreakdown.length > 0)
      ? details.accommodationTab.livingExpensesBreakdown
      : (details.livingExpenses && details.livingExpenses.length > 0)
      ? details.livingExpenses
      : DATA_DICTIONARY.livingExpenses;

    root.innerHTML = `
      <!-- 1. Hero Banner Card -->
      <div class="profile-banner">
        <div class="profile-banner-logo">
          <img alt="${uni.name} Logo" src="${uni.logo}?v=43.0" onerror="this.onerror=null; this.src='assets/photo/logo-dark.webp';"/>
        </div>
        <div class="profile-banner-info">
          <div class="profile-badges-row">
            <span class="profile-rank-badge">${ICONS.trophy} ${formatRanking(uni.ranking || 'QS Ranked University', lang)}</span>
            <span class="entity-card-badge">${ICONS.check} ${i18n.t('badge_free_offer_letter')}</span>
          </div>
          <div>
            <h1 class="profile-banner-title">${uniDisplayName}</h1>
          </div>
          <p class="profile-banner-meta">
            <img alt="${countryName} Flag" class="entity-flag-icon" src="${FLAG[uni.country] || ''}"/>
            <span>${cityName}${i18n.t('list_separator')}${countryName}</span>
          </p>
          <div class="profile-banner-actions">
            <a class="btn-entity-wa" href="${waLink}" rel="noopener noreferrer" target="_blank">
              <svg class="wa-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"></path></svg>
              <span>${i18n.t('btn_consult_wa_uni')}</span>
            </a>
            ${uni.website ? `
              <a class="btn-profile-outline" href="${uni.website}" rel="noopener noreferrer" target="_blank">
                <span>${i18n.t('uni_profile_visit_website')}</span> ↗
              </a>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- 2. Main 4-Tab Navigation Bar -->
      <div class="profile-tabs-nav">
        <button class="profile-main-tab ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
          <span class="tab-icon">${ICONS.building}</span>
          <span>${i18n.t('tab_overview')}</span>
        </button>
        <button class="profile-main-tab ${this.activeTab === 'courses' ? 'active' : ''}" data-tab="courses">
          <span class="tab-icon">${ICONS.cap}</span>
          <span>${i18n.t('tab_courses')}</span>
          <span class="tab-count-badge">${this.programs.length}</span>
        </button>
        <button class="profile-main-tab ${this.activeTab === 'articles' ? 'active' : ''}" data-tab="articles" style="${SHOW_ARTICLES_TAB ? '' : 'display:none !important;'}">
          <span class="tab-icon">${ICONS.fileText}</span>
          <span>${i18n.t('tab_articles')}</span>
        </button>
        <button class="profile-main-tab ${this.activeTab === 'accommodation' ? 'active' : ''}" data-tab="accommodation">
          <span class="tab-icon">${ICONS.home}</span>
          <span>${i18n.t('tab_accommodation')}</span>
        </button>
      </div>

      <!-- TAB 1: OVERVIEW PANE -->
      <div class="profile-tab-pane ${this.activeTab === 'overview' ? 'active' : ''}" id="tab-overview">
        <!-- Quick Key Stats Grid -->
        <div class="profile-stats-grid">
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.trophy}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('uni_profile_ranking_label')}</div>
              <div class="stat-card-val">${formatRanking((details.ranking || uni.ranking || 'QS World').split('(')[0].trim(), lang)}</div>
            </div>
          </div>
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.building}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('uni_profile_est_label')}</div>
              <div class="stat-card-val">${uni.established || details.established || '1969'}</div>
            </div>
          </div>
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.location}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('uni_profile_campus_label')}</div>
              <div class="stat-card-val">${campusNameText}</div>
            </div>
          </div>
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.users}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('uni_profile_students_label')}</div>
              <div class="stat-card-val">${(() => {
                const raw = uni.studentCount || details.studentCount || '12,000+';
                if (isAr) {
                  return raw
                    .replace(/(\d+[\d,]*)\+\s*\((\d+)\+\s*Countries\)/gi, '+$1 طالب ($2+ دولة)')
                    .replace(/(\d+[\d,]*)\+\s*\((\d+)\s*Countries\)/gi, '+$1 طالب ($2 دولة)')
                    .replace(/(\d+[\d,]*)\+\s*\((\d+)\+\s*دولة\)/gi, '+$1 طالب ($2+ دولة)')
                    .replace(/\((\d+)\+\s*Countries\)/gi, '($1+ دولة)')
                    .replace(/\((\d+)\s*Countries\)/gi, '($1 دولة)')
                    .replace(/Countries/gi, 'دولة');
                }
                if (lang === 'id') return raw.replace(/Countries/gi, 'Negara');
                if (lang === 'zh') return raw.replace(/Countries/gi, '个国家').replace(/\+\s*\(/, '+ 名在读生 (来自 ');
                if (lang === 'ru') return raw.replace(/Countries/gi, 'стран');
                if (lang === 'fr') return raw.replace(/Countries/gi, 'pays');
                if (lang === 'es') return raw.replace(/Countries/gi, 'países');
                if (lang === 'ja') return raw.replace(/Countries/gi, 'か国');
                if (lang === 'ko') return raw.replace(/Countries/gi, '개국');
                return raw;
              })()}</div>
            </div>
          </div>
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.cap}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('nav_programs')}</div>
              <div class="stat-card-val">${this.programs.length}+ ${isAr ? 'برنامجاً' : (lang === 'id' ? 'Program' : (lang === 'zh' ? '个专业课程' : 'Programs'))}</div>
            </div>
          </div>
          <div class="profile-stat-card">
            <div class="stat-icon-wrap">${ICONS.calendar}</div>
            <div class="stat-text-wrap">
              <div class="stat-card-label">${i18n.t('uni_profile_intakes_label')}</div>
              <div class="stat-card-val">${(() => {
                const rawIntakes = uni.intakes || details.intakes || 'Feb, Apr, Jun, Aug, Sep, Nov';
                if (isAr) {
                  return rawIntakes
                    .replace(/Jan/gi, 'يناير').replace(/Feb/gi, 'فبراير').replace(/Mar/gi, 'مارس')
                    .replace(/Apr/gi, 'أبريل').replace(/May/gi, 'مايو').replace(/Jun/gi, 'يونيو')
                    .replace(/Jul/gi, 'يوليو').replace(/Aug/gi, 'أغسطس').replace(/Sep/gi, 'سبتمبر')
                    .replace(/Oct/gi, 'أكتوبر').replace(/Nov/gi, 'نوفمبر').replace(/Dec/gi, 'ديسمبر');
                }
                if (lang === 'zh' || lang === 'ja') {
                  return rawIntakes
                    .replace(/Jan/gi, '1月').replace(/Feb/gi, '2月').replace(/Mar/gi, '3月')
                    .replace(/Apr/gi, '4月').replace(/May/gi, '5月').replace(/Jun/gi, '6月')
                    .replace(/Jul/gi, '7月').replace(/Aug/gi, '8月').replace(/Sep/gi, '9月')
                    .replace(/Oct/gi, '10月').replace(/Nov/gi, '11月').replace(/Dec/gi, '12月');
                }
                if (lang === 'ko') {
                  return rawIntakes
                    .replace(/Jan/gi, '1월').replace(/Feb/gi, '2월').replace(/Mar/gi, '3월')
                    .replace(/Apr/gi, '4월').replace(/May/gi, '5월').replace(/Jun/gi, '6월')
                    .replace(/Jul/gi, '7월').replace(/Aug/gi, '8월').replace(/Sep/gi, '9월')
                    .replace(/Oct/gi, '10월').replace(/Nov/gi, '11월').replace(/Dec/gi, '12월');
                }
                return rawIntakes;
              })()}</div>
            </div>
          </div>
        </div>

        <!-- Campus Showcase & Overview Section -->
        <section class="profile-section">
          <div class="profile-overview-layout">
            <div class="profile-media-box">
              <img alt="${uni.name} Campus" class="profile-campus-img" src="${campusPhotoSrc}" loading="lazy"/>
              <div class="profile-media-badge">${ICONS.location} ${campusNameText}</div>
            </div>
            <div class="profile-about-content">
              <h2 class="profile-section-title">${i18n.t('uni_profile_overview_title')}</h2>
              <p class="profile-about-desc">${descText}</p>
              <div class="profile-fee-estimate-box">
                <span class="fee-estimate-label">${i18n.t('uni_profile_tuition_range_label')}:</span>
                <span class="fee-estimate-val" id="profile-range-display">${feeRangeStr}</span>
              </div>
            </div>
          </div>

          <!-- Video Tour Embed -->
          ${videoEmbedSrc ? `
          <div class="profile-video-wrapper">
            <h3 class="profile-sub-title">${ICONS.video} ${i18n.t('video_tour_title')}</h3>
            <div class="profile-video-container" id="video-embed-box">
              <div class="profile-video-poster" id="btn-play-video-poster" style="background-image: url('${campusPhotoSrc}');">
                <div class="video-play-btn" title="Play">
                  <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div class="video-poster-info">
                  <div>
                    <h4 class="video-poster-title">${ICONS.video} ${i18n.t('video_tour_title')}</h4>
                    <p class="video-poster-subtitle">${ICONS.check} ${i18n.t('video_tour_badge')}</p>
                  </div>
                  <span class="profile-rank-badge" style="background: rgba(0,0,0,0.75); color: #fff; border: 1px solid var(--color-primary);">HD 4K</span>
                </div>
              </div>
              <iframe id="taylor-video-iframe" src="${videoEmbedSrc}?rel=0&modestbranding=1" title="${uniDisplayName} Video Tour" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
            <div class="video-action-bar">
              <span style="font-size: 0.86rem; color: var(--color-gray-600); font-weight: 600;">
                ${ICONS.video} ${i18n.t('video_official_channel', { university: uniDisplayName })}
              </span>
            </div>
          </div>
          ` : ''}

          <!-- Campus Facilities Grid -->
          <h3 class="profile-sub-title" style="margin-block-start: 2rem;">${ICONS.building} ${i18n.t('facilities_heading')}</h3>
          <div class="facilities-cards-grid">
            ${facilitiesList.map((fac) => {
              const facName = (fac.title && typeof fac.title === 'object' ? (fac.title[lang] || fac.title['en'] || fac.title['id']) : (isAr && fac.titleAr ? fac.titleAr : (fac.title || (isAr && fac.nameAr ? fac.nameAr : fac.name)))) || '';
              const facIcon = resolveIcon(fac.icon);
              return `
                <div class="facility-item-card">
                  <div class="facility-icon-wrap">${facIcon}</div>
                  <div class="facility-name-wrap">${facName}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Summary Fee Table -->
          <h3 class="profile-sub-title" style="margin-block-start: 2rem;">${ICONS.chart} ${i18n.t('summary_fee_heading')}</h3>
          <div class="summary-fee-table-container">
            <table class="summary-fee-table">
              <thead>
                <tr>
                  <th>${i18n.t('tbl_col_study_level')}</th>
                  <th>${i18n.t('tbl_col_prog_duration')}</th>
                  <th>${i18n.t('tbl_col_est_tuition')}</th>
                  <th style="text-align: center;">${i18n.t('tbl_col_action')}</th>
                </tr>
              </thead>
              <tbody>
                ${summaryFeeTable.map((row) => `
                  <tr>
                    <td><strong>${row.levelName}</strong></td>
                    <td>${ICONS.clock} ${row.duration}</td>
                    <td><span class="prog-table-fee" style="font-size: 0.95rem;">${row.avgFee}</span></td>
                    <td style="text-align: center;">
                      <a class="btn-view-course-details" href="javascript:void(0)" onclick="document.querySelector('[data-tab=\\'courses\\']').click()">
                        <span>${i18n.t('btn_view_courses')}</span>
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Highlights Grid -->
          <h3 class="profile-sub-title" style="margin-block-start: 2rem;">${ICONS.sparkles} ${i18n.t('highlights_heading', { university: uniDisplayName })}</h3>
          <div class="profile-highlights-grid">
            ${highlightsList.map((hl) => {
              const hlTitle = (hl.title && typeof hl.title === 'object' ? (hl.title[lang] || hl.title['en'] || hl.title['id']) : (isAr && hl.titleAr ? hl.titleAr : hl.title)) || '';
              const hlDesc = (hl.desc && typeof hl.desc === 'object' ? (hl.desc[lang] || hl.desc['en'] || hl.desc['id']) : (isAr && hl.descAr ? hl.descAr : hl.desc)) || '';
              const hlIcon = resolveIcon(hl.icon);
              return `
                <div class="profile-highlight-item">
                  <div class="highlight-icon">${hlIcon}</div>
                  <h4>${hlTitle}</h4>
                  <p>${hlDesc}</p>
                </div>
              `;
            }).join('')}
          </div>

          <!-- FAQ Accordion Section -->
          <h3 class="profile-sub-title" style="margin-block-start: 2.5rem;">${ICONS.help} ${i18n.t('faqs_heading', { university: uniDisplayName })}</h3>
          <div class="faq-accordion-container">
            ${faqsList.map((faq, fIdx) => {
              const qText = (faq.q && typeof faq.q === 'object' ? (faq.q[lang] || faq.q['en'] || faq.q['id']) : (isAr && faq.qAr ? faq.qAr : faq.q)) || '';
              const aText = (faq.a && typeof faq.a === 'object' ? (faq.a[lang] || faq.a['en'] || faq.a['id']) : (isAr && faq.aAr ? faq.aAr : faq.a)) || '';
              return `
                <div class="faq-accordion-item ${fIdx === 0 ? 'open' : ''}">
                  <div class="faq-accordion-header">
                    <span>${qText}</span>
                    <svg class="faq-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <div class="faq-accordion-body">
                    <p>${aText}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>

      <!-- TAB 2: COURSES & PROGRAMMES PANE -->
      <div class="profile-tab-pane ${this.activeTab === 'courses' ? 'active' : ''}" id="tab-courses">
        <!-- Courses Header & Currency Switcher -->
        <div class="courses-toolbar-box">
          <div class="courses-search-box">
            <input type="text" id="courses-search-input" class="courses-search-input" placeholder="${i18n.t('tbl_search_programs')}" value="${this.searchQuery}"/>
          </div>

          <div class="profile-currency-wrap">
            <div class="profile-currency-picker">
              <label for="profile-currency-select">${i18n.t('currency_label')}</label>
              <select id="profile-currency-select" class="currency-select">
                <option value="native" ${this.selectedCurrency === 'native' ? 'selected' : ''}>${i18n.t('curr_native') || 'العملة الأصلية للجامعة'}</option>
                <option value="USD" ${this.selectedCurrency === 'USD' ? 'selected' : ''}>${i18n.t('curr_usd')} ($ USD)</option>
                <option value="IDR" ${this.selectedCurrency === 'IDR' ? 'selected' : ''}>${i18n.t('curr_idr') || 'الروبية الإندونيسية'} (Rp IDR)</option>
                <option value="SAR" ${this.selectedCurrency === 'SAR' ? 'selected' : ''}>${i18n.t('curr_sar') || 'الريال السعودي'} (SAR)</option>
                <option value="MYR" ${this.selectedCurrency === 'MYR' ? 'selected' : ''}>${i18n.t('curr_myr')} (RM MYR)</option>
              </select>
            </div>
            <span class="currency-disclaimer-text">${i18n.t('currency_disclaimer_note')}</span>
          </div>
        </div>

        <!-- Level Filters Bar -->
        <div class="profile-filter-container">
          <div class="courses-level-filters">
            <button class="courses-level-pill ${this.selectedLevel === 'all' ? 'active' : ''}" data-level="all">${i18n.t('level_all')}</button>
            <button class="courses-level-pill ${this.selectedLevel === 'bachelor' ? 'active' : ''}" data-level="bachelor">${i18n.t('level_bachelor')}</button>
            <button class="courses-level-pill ${this.selectedLevel === 'master' ? 'active' : ''}" data-level="master">${i18n.t('level_master')}</button>
            <button class="courses-level-pill ${this.selectedLevel === 'phd' ? 'active' : ''}" data-level="phd">${i18n.t('level_phd')}</button>
            <button class="courses-level-pill ${this.selectedLevel === 'diploma' ? 'active' : ''}" data-level="diploma">${i18n.t('level_diploma')}</button>
            <button class="courses-level-pill ${this.selectedLevel === 'foundation' ? 'active' : ''}" data-level="foundation">${i18n.t('level_foundation')}</button>
          </div>

          <div class="accordion-controls-row" style="margin: 0;">
            <button id="btn-toggle-accordions" class="btn-toggle-all-accordions">${this.allFieldsExpanded ? i18n.t('tbl_collapse_all') : i18n.t('tbl_expand_all')}</button>
          </div>
        </div>

        <!-- Accordion Container for Academic Fields -->
        <div id="fields-accordion-container"></div>
      </div>

      <!-- TAB 3: ARTICLES & GUIDES PANE -->
      <div class="profile-tab-pane ${this.activeTab === 'articles' ? 'active' : ''}" id="tab-articles" style="${SHOW_ARTICLES_TAB ? '' : 'display:none !important;'}">
        <section class="profile-section">
          <h2 class="profile-section-title">${i18n.t('tab_articles')}</h2>
          <p class="profile-section-subtitle" style="margin-block-end: 2rem;">${i18n.t('articles_subtitle')}</p>

          <div class="articles-cards-grid">
            ${articlesList.map((art) => {
              const artTitle = (art.title && typeof art.title === 'object' ? (art.title[lang] || art.title['en'] || art.title['id']) : (isAr && art.titleAr ? art.titleAr : art.title)) || '';
              const artSummary = (art.summary && typeof art.summary === 'object' ? (art.summary[lang] || art.summary['en'] || art.summary['id']) : (isAr && art.summaryAr ? art.summaryAr : art.summary)) || '';
              const artWaMsg = i18n.t('wa_guide_request_msg', { guide: artTitle, university: uniDisplayName });
              const artWaLink = CONFIG.getWhatsAppLink(artWaMsg);

              return `
                <div class="article-guide-card">
                  <div>
                    <span class="article-card-tag">${ICONS.fileText} ${art.readTime || '4 min'} ${i18n.t('read_time_min')}</span>
                    <h3 class="article-card-title">${artTitle}</h3>
                    <p class="article-card-desc">${artSummary}</p>
                  </div>
                  <a class="btn-entity-wa" href="${artWaLink}" rel="noopener noreferrer" target="_blank">
                    <span>${i18n.t('btn_request_guide_wa')}</span>
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>

      <!-- TAB 4: ACCOMMODATION & LIVING EXPENSES PANE -->
      <div class="profile-tab-pane ${this.activeTab === 'accommodation' ? 'active' : ''}" id="tab-accommodation">
        <section class="profile-section">
          <h2 class="profile-section-title">${i18n.t('tab_accommodation')}</h2>
          <p class="profile-section-subtitle" style="margin-block-end: 2rem;">${i18n.t('accom_subtitle')}</p>

          <div class="accom-layout-grid">
            <!-- Residences Column -->
            <div class="residence-cards-col">
              ${residencesList.map((res) => {
                const resName = (res.name && typeof res.name === 'object' ? (res.name[lang] || res.name['en'] || res.name['id']) : (isAr && res.nameAr ? res.nameAr : res.name)) || '';
                const resDist = (res.distance && typeof res.distance === 'object' ? (res.distance[lang] || res.distance['en'] || res.distance['id']) : (isAr && res.distanceAr ? res.distanceAr : (lang === 'en' && res.distanceEn ? res.distanceEn : res.distance))) || '';
                let resPrice = (isAr && res.priceRangeAr) ? res.priceRangeAr : (res.priceRange || 'RM 750 - RM 1,500 / month');
                if (lang === 'id' && resPrice.includes('/ month')) {
                  resPrice = resPrice.replace('/ month', ' / bulan');
                }
                const rawAmenities = (isAr && res.amenitiesAr) ? res.amenitiesAr : res.amenities;
                const amenitiesList = Array.isArray(rawAmenities)
                  ? rawAmenities.map(am => typeof am === 'object' ? (am[lang] || am['en'] || am['id'] || Object.values(am)[0]) : am)
                  : (rawAmenities && rawAmenities[lang]) || (rawAmenities && rawAmenities['en']) || (rawAmenities && rawAmenities['id']) || [];

                return `
                  <div class="residence-card">
                    <div class="residence-header">
                      <div>
                        <h3 class="residence-title">${ICONS.building} ${resName}</h3>
                        ${resDist ? `<span style="font-size: 0.8rem; color: var(--color-gray-500); font-weight: 600;">${ICONS.location} ${resDist}</span>` : ''}
                      </div>
                      <span class="residence-price-badge">${resPrice}</span>
                    </div>
                    <ul class="residence-amenities-list">
                      ${amenitiesList.map((am) => `<li>${ICONS.check} ${am}</li>`).join('')}
                    </ul>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Living Costs Breakdown Column -->
            <div class="living-cost-card">
              <h3 class="residence-title">${ICONS.chart} ${i18n.t('living_expenses_title')}</h3>
              <p style="font-size: 0.85rem; color: var(--color-gray-600); margin-block-end: 1rem;">${i18n.t('living_exp_monthly_note')}</p>
              <table class="living-cost-table">
                <tbody>
                  ${livingExpensesList.map((exp) => {
                    const itemName = exp.itemKey ? i18n.t(exp.itemKey) : ((exp.item && typeof exp.item === 'object' ? (exp.item[lang] || exp.item['en'] || exp.item['id']) : (isAr && exp.itemAr ? exp.itemAr : exp.item)) || '');
                    return `
                      <tr>
                        <td>${itemName}</td>
                        <td>${exp.cost || ''}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <a class="btn-start-admission-wa" href="${CONFIG.getWhatsAppLink(i18n.t('wa_living_budget_msg', { university: uniDisplayName }))}" rel="noopener noreferrer" target="_blank" style="width: 100%; justify-content: center; margin-block-start: 1rem; font-size: 0.95rem;">
                <span>${i18n.t('btn_consult_accom_wa')}</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- 3. Reusable 4-Step Admissions Workflow Component -->
      <section class="admissions-workflow-section">
        <div class="admissions-workflow-header">
          <span class="entity-card-badge" style="margin-block-end: 0.5rem;">StudyCo Admissions Guarantee</span>
          <h2 class="admissions-workflow-title">${i18n.t('adm_workflow_title')}</h2>
          <p class="profile-section-subtitle">${i18n.t('adm_workflow_subtitle')}</p>
        </div>

        <div class="admissions-steps-grid">
          <div class="step-card">
            <div class="step-number-circle">${i18n.t('adm_step_1_num')}</div>
            <h3 class="step-title">${i18n.t('adm_step_1_title')}</h3>
            <p class="step-desc">${i18n.t('adm_step_1_desc')}</p>
          </div>

          <div class="step-card">
            <div class="step-number-circle">${i18n.t('adm_step_2_num')}</div>
            <h3 class="step-title">${i18n.t('adm_step_2_title')}</h3>
            <p class="step-desc">${i18n.t('adm_step_2_desc')}</p>
          </div>

          <div class="step-card">
            <div class="step-number-circle">${i18n.t('adm_step_3_num')}</div>
            <h3 class="step-title">${i18n.t('adm_step_3_title')}</h3>
            <p class="step-desc">${i18n.t('adm_step_3_desc')}</p>
          </div>

          <div class="step-card">
            <div class="step-number-circle">${i18n.t('adm_step_4_num')}</div>
            <h3 class="step-title">${i18n.t('adm_step_4_title')}</h3>
            <p class="step-desc">${i18n.t('adm_step_4_desc')}</p>
          </div>
        </div>

        <div class="admissions-workflow-cta">
          <a class="btn-start-admission-wa" href="${CONFIG.getWhatsAppLink(i18n.t('wa_admission_start_msg', { university: uniDisplayName }))}" rel="noopener noreferrer" target="_blank">
            <svg class="wa-icon" viewBox="0 0 24 24" width="22" height="22"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"></path></svg>
            <span>${i18n.t('btn_start_adm_wa')}</span>
          </a>
        </div>
      </section>

      <!-- 4. Similar Universities Section -->
      ${similarUnis.length > 0 ? `
      <section class="similar-unis-section">
        <h2 class="profile-section-title">${i18n.t('similar_unis_title')}</h2>
        <p class="profile-section-subtitle">${i18n.t('similar_unis_subtitle')}</p>

        <div class="similar-unis-grid">
          ${similarUnis.map((simUni) => {
            const simCountry = i18n.t(COUNTRY_KEY[simUni.country] || simUni.country);
            let simName = (isAr && simUni.arabicName) ? simUni.arabicName : simUni.name;
            if (isAr && simName.includes('(') && simName.includes(')')) {
              simName = simName.replace(/\(([^)]+)\)/, '<span dir="ltr" style="display:inline-block; unicode-bidi:embed;">($1)</span>');
            }
            const simWaMsg = i18n.t('wa_university_msg', { university: simUni.name });
            return `
              <div class="entity-card">
                <a href="university.html?id=${simUni.id}"><div class="entity-card-logo"><img alt="${simUni.name}" loading="lazy" src="${simUni.logo}"/></div></a>
                <h3 class="entity-card-title"><a href="university.html?id=${simUni.id}" style="color:inherit;"><bdi>${simName}</bdi></a></h3>
                <p class="entity-card-meta"><img alt="" class="entity-flag-icon" src="${FLAG[simUni.country] || ''}"/> ${i18n.t(simUni.cityKey || simUni.city)}${i18n.t('list_separator')}${simCountry}</p>
                <span class="profile-rank-badge">${ICONS.trophy} ${formatRanking(simUni.ranking ? simUni.ranking.split('(')[0].trim() : 'QS Top University', lang)}</span>
                <div class="entity-card-actions" style="margin-block-start: 0.5rem; width: 100%;">
                  <a class="btn-entity-primary" href="university.html?id=${simUni.id}">${i18n.t('btn_view_university')}</a>
                  <a class="btn-entity-wa" href="${CONFIG.getWhatsAppLink(simWaMsg)}" rel="noopener noreferrer" target="_blank">${i18n.t('btn_consult_wa_uni')}</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
      ` : ''}
    `;

    this.attachEventListeners();
    this.renderCoursesAccordion();
  }

  attachEventListeners() {
    // Delegated click listener for course modal buttons and links (100% guaranteed click handling)
    if (!this.hasAttachedModalDelegation) {
      this.hasAttachedModalDelegation = true;
      document.addEventListener('click', (e) => {
        const modalBtn = e.target.closest('.btn-open-modal, .course-name-link');
        if (modalBtn) {
          e.preventDefault();
          e.stopPropagation();
          const progId = modalBtn.dataset.progId;
          if (progId) {
            this.openCourseModal(progId);
          }
        }
      });
    }

    // 4 Main tab switching
    const mainTabs = document.querySelectorAll('.profile-main-tab');
    mainTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.setTab(tabId);
      });
    });

    // Level filter pills
    const levelPills = document.querySelectorAll('.courses-level-pill');
    levelPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level;
        this.setLevel(level);
      });
    });

    // Search input within courses
    const searchInput = document.getElementById('courses-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setSearch(e.target.value);
      });
    }

    // Toggle all accordions button
    const toggleBtn = document.getElementById('btn-toggle-accordions');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleAllAccordions();
      });
    }

    // Currency selector
    const currSelect = document.getElementById('profile-currency-select');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        this.setCurrency(e.target.value);
      });
    }

    // FAQ Accordion click toggling
    const faqHeaders = document.querySelectorAll('.faq-accordion-header');
    faqHeaders.forEach((hdr) => {
      hdr.addEventListener('click', (e) => {
        const item = e.currentTarget.closest('.faq-accordion-item');
        if (item) {
          item.classList.toggle('open');
        }
      });
    });

    // Interactive video poster click
    const videoPoster = document.getElementById('btn-play-video-poster');
    if (videoPoster) {
      videoPoster.addEventListener('click', () => {
        videoPoster.style.display = 'none';
        const iframe = document.getElementById('taylor-video-iframe');
        if (iframe && this.videoEmbedSrc) {
          const currentSrc = this.videoEmbedSrc;
          const sep = currentSrc.includes('?') ? '&' : '?';
          iframe.src = `${currentSrc}${sep}autoplay=1&rel=0&modestbranding=1`;
        }
      });
    }
  }

  renderCoursesAccordion() {
    const container = document.getElementById('fields-accordion-container');
    if (!container) return;

    let filtered = this.programs;

    // Filter by Level
    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter((p) => p.level === this.selectedLevel);
    }

    // Filter by Search Query (Support English, Arabic, Field, and Level)
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const nameEn = (p.name || '').toLowerCase();
        const nameAr = (p.nameAr || p.arabicName || '').toLowerCase();
        const fieldName = (p.field || '').toLowerCase();
        const levelName = (p.level || '').toLowerCase();
        return nameEn.includes(q) || nameAr.includes(q) || fieldName.includes(q) || levelName.includes(q);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="entity-no-results" style="padding: 2.5rem; text-align: center; background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200);">
          <p style="font-size: 1.1rem; color: var(--color-gray-600);">${i18n.t('prog_no_results')}</p>
        </div>
      `;
      return;
    }

    const CAT_LABELS = {
      'Business & Management': { ar: 'إدارة الأعمال والعلوم الإدارية', en: 'Business & Management', icon: FIELD_SVG_ICONS.business || ICONS.briefcase },
      'Computer Science & IT': { ar: 'علوم الحاسوب وتكنولوجيا المعلومات', en: 'Computer Science & IT', icon: FIELD_SVG_ICONS.cs || ICONS.cpu },
      'Engineering & Applied Sciences': { ar: 'الهندسة والعلوم التطبيقية', en: 'Engineering & Applied Sciences', icon: FIELD_SVG_ICONS.engineering || ICONS.cog },
      'Engineering': { ar: 'الهندسة والتكنولوجيا', en: 'Engineering', icon: FIELD_SVG_ICONS.engineering || ICONS.cog },
      'Social Sciences & Humanities': { ar: 'العلوم الاجتماعية والإنسانية', en: 'Social Sciences & Humanities', icon: FIELD_SVG_ICONS.arts || ICONS.users },
      'Law & Legal Studies': { ar: 'القانون والدراسات القضائية', en: 'Law & Legal Studies', icon: FIELD_SVG_ICONS.law || ICONS.scale },
      'Law': { ar: 'القانون والحقوق', en: 'Law', icon: FIELD_SVG_ICONS.law || ICONS.scale },
      'Art & Design': { ar: 'الفنون والتصميم والوسائط الرقمية', en: 'Art & Design', icon: FIELD_SVG_ICONS.arts || ICONS.palette },
      'Communication & Media': { ar: 'علوم الإعلام والاتصال الجماهيري', en: 'Communication & Media', icon: FIELD_SVG_ICONS.arts || ICONS.video },
      'Medicine & Health Sciences': { ar: 'الطب والعلوم الصحية والتمريض', en: 'Medicine & Health Sciences', icon: FIELD_SVG_ICONS.health || ICONS.health },
      'Hospitality & Tourism': { ar: 'الضيافة والفندقة وإدارة السياحة', en: 'Hospitality & Tourism', icon: FIELD_SVG_ICONS.hospitality || ICONS.hotel },
      'Education & Training': { ar: 'التربية والتعليم والتأهيل الأكاديمي', en: 'Education & Training', icon: FIELD_SVG_ICONS.education || ICONS.book },
      'Applied Sciences': { ar: 'العلوم التطبيقية والتكنولوجيا الحيوية', en: 'Applied Sciences', icon: FIELD_SVG_ICONS.cs || ICONS.cpu },
      'Architecture & Built Environment': { ar: 'الهندسة المعمارية والبيئة العمرانية', en: 'Architecture & Built Environment', icon: FIELD_SVG_ICONS.architecture || ICONS.architecture }
    };

    // Group programs by category or academic field
    const grouped = {};
    filtered.forEach((p) => {
      const f = p.category || p.field || 'business';
      if (!grouped[f]) grouped[f] = [];
      grouped[f].push(p);
    });

    const fieldsList = Object.keys(grouped);

    container.innerHTML = fieldsList.map((fieldKey) => {
      const fieldProgs = grouped[fieldKey];
      const isAr = (i18n.currentLang === 'ar');
      const catObj = CAT_LABELS[fieldKey];
      const fieldName = catObj
        ? (isAr ? catObj.ar : catObj.en)
        : (i18n.t(FIELD_KEY[fieldKey] || fieldKey));
      const fieldIcon = (catObj && catObj.icon)
        ? catObj.icon
        : (FIELD_SVG_ICONS[fieldKey] || ICONS.cap);
      const isOpen = this.allFieldsExpanded;
      const isExpanded = (this.expandedFields && this.expandedFields[fieldKey]);
      const initialLimit = (this.searchQuery || isExpanded) ? fieldProgs.length : 25;
      const visibleProgs = fieldProgs.slice(0, initialLimit);
      const hasMore = fieldProgs.length > initialLimit;

      return `
        <div class="field-accordion-item ${isOpen ? 'open' : ''}" data-field="${fieldKey}">
          <div class="field-accordion-header">
            <div class="field-header-info">
              <div class="field-header-icon">${fieldIcon}</div>
              <h3 class="field-header-title">${fieldName}</h3>
              <span class="field-count-pill">${fieldProgs.length} ${isAr ? (fieldProgs.length === 1 ? 'برنامج' : 'برنامجاً') : (fieldProgs.length === 1 ? 'Program' : 'Programs')}</span>
            </div>
            <svg class="field-chevron-icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="field-accordion-body">
            <div class="programs-table-container">
              <table class="programs-table">
                <thead>
                  <tr>
                    <th>${i18n.t('tbl_col_program')}</th>
                    <th>${i18n.t('tbl_col_level')}</th>
                    <th style="text-align: center;">${i18n.t('table_header_ielts')}</th>
                    <th>${i18n.t('tbl_col_duration')}</th>
                    <th>${i18n.t('tbl_col_fee')}</th>
                    <th style="text-align: center;">${i18n.t('tbl_col_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${visibleProgs.map((prog) => {
                    const levelLabel = i18n.t(LEVEL_KEY[prog.level] || prog.level);
                    const durationStr = i18n.t('prog_duration_val', { n: prog.duration });
                    const progCurr = prog.currency || (this.uni ? getCountryCurrency(this.uni.country) : 'MYR');
                    const feeFormatted = (this.selectedCurrency === 'native' || !this.selectedCurrency)
                      ? `${formatCurrencyValue(prog.annualFee, progCurr)} / ${i18n.t('calc_per_year')}`
                      : `${formatProgramPrice(prog.annualFee, progCurr, this.selectedCurrency, this.exchangeData)} / ${i18n.t('calc_per_year')}`;
                    const uniDisplayName = (isAr && (this.uni.arabicName || (this.details && this.details.arabicName)))
                      ? (this.uni.arabicName || this.details.arabicName)
                      : this.uni.name;
                    const pName = (isAr && prog.nameAr) ? prog.nameAr : prog.name;
                    const waMsg = i18n.t('wa_program_apply_msg', { program: pName, university: uniDisplayName });
                    const waLink = CONFIG.getWhatsAppLink(waMsg);

                    return `
                      <tr>
                        <td>
                          <div class="prog-cell-name">
                            <a href="javascript:void(0)" class="course-name-link" data-prog-id="${prog.id}" style="color: inherit; text-decoration: none; cursor: pointer;">
                              <span style="font-weight: 700; color: var(--color-black); display: block;">${pName}</span>
                              ${isAr && prog.nameAr ? `<span style="font-size: 0.82rem; color: var(--color-gray-500); font-weight: 500;">${prog.name}</span>` : ''}
                            </a>
                          </div>
                        </td>
                        <td>
                          <span class="prog-table-badge">${levelLabel}</span>
                        </td>
                        <td style="text-align: center;">
                          <span class="prog-table-badge" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-weight: 700; white-space: nowrap;">${ICONS.target} ${prog.ielts || '6.0'}</span>
                        </td>
                        <td>
                          <span>${ICONS.clock} ${durationStr}</span>
                        </td>
                        <td>
                          <span class="prog-table-fee">${feeFormatted}</span>
                        </td>
                        <td style="text-align: center;">
                          <div class="prog-table-actions-cell">
                            <button class="btn-view-course-details btn-open-modal" data-prog-id="${prog.id}">
                              <span>${ICONS.book} ${i18n.t('btn_details_syllabus')}</span>
                            </button>
                            <a class="btn-table-apply" href="${waLink}" rel="noopener noreferrer" target="_blank">
                              <svg class="wa-icon" viewBox="0 0 24 24" width="14" height="14"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"></path></svg>
                              <span>${i18n.t('btn_apply_table')}</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              ${hasMore ? `
                <div style="text-align: center; padding: 1.2rem;">
                  <button class="btn-load-more-field" data-field="${fieldKey}" style="background: var(--color-gray-100, #f3f4f6); border: 1px solid var(--color-gray-300, #d1d5db); color: var(--color-primary, #e11d48); padding: 0.6rem 1.6rem; border-radius: 9999px; font-weight: 700; cursor: pointer; font-size: 0.9rem;">
                    + ${fieldProgs.length - initialLimit} ${isAr ? 'عرض باقي البرامج' : 'Show remaining programs'}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener to load more buttons
    const loadMoreBtns = container.querySelectorAll('.btn-load-more-field');
    loadMoreBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const fKey = e.currentTarget.dataset.field;
        this.expandedFields = this.expandedFields || {};
        this.expandedFields[fKey] = true;
        this.renderCoursesAccordion();
      });
    });

    // Attach click listener to each accordion header
    const accordionHeaders = container.querySelectorAll('.field-accordion-header');
    accordionHeaders.forEach((hdr) => {
      hdr.addEventListener('click', (e) => {
        const item = e.currentTarget.closest('.field-accordion-item');
        if (item) {
          item.classList.toggle('open');
        }
      });
    });

    // Attach click listeners to "Details & Syllabus" buttons and Course name links
    const modalButtons = container.querySelectorAll('.btn-open-modal, .course-name-link');
    modalButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const progId = target.dataset.progId;
        if (progId) {
          this.openCourseModal(progId);
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const manager = new UniversityDetailManager();
  await manager.init();
});
