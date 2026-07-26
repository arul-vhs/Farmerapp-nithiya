/* ===================================================
   AGRISENSE AI - CLIENT-SIDE APPLICATION ENGINE
   =================================================== */

// Global State
let currentLang = 'en'; // 'en' or 'ta'
let uploadedImageSrc = null;
let currentCropData = null;
let leafletMap = null;
let mapMarkers = [];
let speechSynth = window.speechSynthesis;
let speechUtterance = null;
let customReminders = [];
let geminiApiKey = localStorage.getItem("agrisense_gemini_key") || "";

// 1. Bilingual UI Elements Translation Dictionary
const translations = {
    en: {
        title: "AgriSense AI",
        subtitle: "Empowering farmers with smart digital diagnostics",
        upload_title: "Analyze Crop Health",
        upload_desc: "Upload a photo of your infected crop to diagnose diseases, find fertilizers, and plan treatments.",
        drop_main: "Drag and drop crop image here",
        drop_sub: "or click to browse files",
        browse_btn: "Select Photo",
        analyze_btn: "Start Diagnostic Scan",
        or_text: "OR TRY SAMPLE CROPS",
        crop_tomato: "Tomato",
        crop_paddy: "Rice / Paddy",
        crop_corn: "Corn / Maize",
        crop_banana: "Banana",
        crop_coconut: "Coconut",
        tips_title: "Smart Farmer Tips",
        tip_1: "Take high-quality close-up photos of leaves or stems in good sunlight.",
        tip_2: "Always apply pesticides in morning or late evening to prevent crop stress.",
        tip_3: "Maintain organic crop rotation cycles to naturally enrich the soil.",
        placeholder_h2: "Awaiting Diagnostic Scan",
        placeholder_p: "Upload a disease image or select one of our preloaded crop samples on the left to activate AgriSense AI analysis.",
        scanning_h3: "Scanning Crop Features...",
        scanning_p: "AI is comparing color patterns, lesions, and leaf details against our agronomy database.",
        severity_high: "High Severity",
        severity_medium: "Medium Severity",
        severity_low: "Low Severity",
        read_aloud_btn: "Listen to Diagnosis",
        tab_diagnosis: "Diagnosis & Remedy",
        tab_schedule: "Treatment Schedule",
        tab_shops: "Nearby Dealers",
        disease_info_header: "Disease Analysis",
        organic_remedy_title: "Organic Remedy (இயற்கை தீர்வு)",
        chemical_remedy_title: "Chemical & Fertilizer (செயற்கை தீர்வு / உரம்)",
        schedule_creator_title: "Create Custom Treatment Reminder",
        label_treatment_type: "Treatment Type",
        opt_fungicide: "Fungicide Spray / மருந்து தெளிப்பு",
        opt_neem: "Organic Neem Spray / வேப்பெண்ணெய் தெளிப்பு",
        opt_fertilizer: "Fertilizer Application / உரம் போடுதல்",
        opt_cleanup: "Pruning & Cleanup / கழிவுகளை அகற்றுதல்",
        opt_watering: "Irrigation / நீர்ப்பாசனம்",
        label_start_date: "Scheduled Date & Time",
        btn_add_schedule: "Add Reminder",
        timeline_header: "Recommended Recovery Timeline",
        timeline_day: "Day",
        step1_title: "Isolate & Spray",
        step1_desc: "Cut infected leaves immediately. Spray organic copper fungicide or Mancozeb in late afternoon.",
        step2_title: "Soil Immunity",
        step2_desc: "Apply NPK (Potassium rich) fertilizer to roots. Limit overhead watering to reduce wetness.",
        step3_title: "Second Application",
        step3_desc: "Apply neem oil spray as a preventative shield on healthy foliage. Check stems for spreading lesions.",
        step4_title: "Evaluate Recovery",
        step4_desc: "Inspect new sprouts. If disease halts, resume standard growth fertilizers.",
        custom_reminders_title: "Your Active Reminders",
        no_reminders: "No custom reminders added yet. Create one above!",
        location_header: "Dealers Selling Prescribed Fertilizers & Remedies",
        location_desc: "Interactive maps & address coordinates of agriculture cooperative stores and pesticide dealers nearby.",
        select_region_label: "Select Area:",
        footer_credit: "Helping farmers secure a greener tomorrow.",
        footer_support: "Agri Helpline: 1800-180-1551",
        dist_km: "km away",
        call_btn: "Call Dealer",
        status_sim: "Offline Simulation",
        status_active: "AI Active",
        settings_modal_title: "Gemini AI Settings",
        settings_help_text: "Enter your Google Gemini API Key to enable real-time diagnostic scanning of any crop photo. Your key is saved locally in your browser.",
        settings_api_label: "Gemini API Key",
        current_mode_label: "Status:",
        btn_clear_key: "Clear Key",
        btn_save_key: "Save Settings"
    },
    ta: {
        title: "அக்ரிசென்ஸ் AI",
        subtitle: "விவசாயிகளை தொழில்நுட்பத்தால் மேம்படுத்தும் டிஜிட்டல் உதவியாளர்",
        upload_title: "பயிர் ஆரோக்கியத்தை ஆராய்க",
        upload_desc: "நோய்களைக் கண்டறிந்து, அதற்கான உரம், மருந்துகள் மற்றும் சிகிச்சை நேரங்களைத் திட்டமிட உங்கள் பயிரின் புகைப்படத்தைப் பதிவேற்றவும்.",
        drop_main: "பயிரின் படத்தைக் கொண்டுவந்து இங்கு விடவும்",
        drop_sub: "அல்லது கோப்புகளைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்",
        browse_btn: "புகைப்படம் தேர்ந்தெடு",
        analyze_btn: "பரிசோதனையைத் தொடங்கு",
        or_text: "மாதிரி பயிர்களைப் பார்க்கவும்",
        crop_tomato: "தக்காளி",
        crop_paddy: "நெல்",
        crop_corn: "சோளம்",
        crop_banana: "வாழை",
        crop_coconut: "தென்னை",
        tips_title: "விவசாயிகளுக்கான வழிகாட்டி",
        tip_1: "நல்ல சூரிய வெளிச்சத்தில் இலைகள் அல்லது தண்டுகளின் தெளிவான நெருக்கமான புகைப்படங்களை எடுக்கவும்.",
        tip_2: "பயிரின் அழுத்தத்தைத் தடுக்க எப்போதும் பூச்சிக்கொல்லிகளை அதிகாலையில் அல்லது மாலையில் தெளிக்கவும்.",
        tip_3: "மண்ணை இயற்கையாக வளப்படுத்த கரிம பயிர் சுழற்சி முறைகளைப் பின்பற்றுங்கள்.",
        placeholder_h2: "பரிசோதனைக்காக காத்திருக்கிறது",
        placeholder_p: "அக்ரிசென்ஸ் AI பரிசோதனையைத் தொடங்க உங்கள் பயிர் புகைப்படத்தைப் பதிவேற்றவும் அல்லது இடதுபுறமுள்ள மாதிரிப் பயிர்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்.",
        scanning_h3: "பயிர் விவரங்களை ஆராய்கிறது...",
        scanning_p: "எங்கள் விவசாய தரவுத்தளத்தில் உள்ள நோய் விவரங்களுடன் நிறம் மற்றும் இலை வடிவங்களை செயற்கை நுண்ணறிவு ஒப்பிடுகிறது.",
        severity_high: "கடுமையான பாதிப்பு",
        severity_medium: "நடுத்தர பாதிப்பு",
        severity_low: "குறைந்த பாதிப்பு",
        read_aloud_btn: "விவரங்களை ஆடியோவில் கேட்க",
        tab_diagnosis: "நோய் & தீர்வு",
        tab_schedule: "சிகிச்சை அட்டவணை",
        tab_shops: "அருகிலுள்ள விற்பனையாளர்கள்",
        disease_info_header: "நோய் பகுப்பாய்வு",
        organic_remedy_title: "இயற்கை தீர்வு",
        chemical_remedy_title: "செயற்கை தீர்வு / உரம்",
        schedule_creator_title: "மருந்து தெளிக்கும் அட்டவணை உருவாக்குக",
        label_treatment_type: "சிகிச்சை வகை",
        opt_fungicide: "பூஞ்சைக் கொல்லி மருந்து தெளிப்பு",
        opt_neem: "வேப்பெண்ணெய் தெளிப்பு",
        opt_fertilizer: "உரம் போடுதல்",
        opt_cleanup: "கழிவுகளை அகற்றுதல்",
        opt_watering: "நீர்ப்பாசனம்",
        label_start_date: "குறிப்பிட்ட தேதி & நேரம்",
        btn_add_schedule: "அட்டவணை சேர்",
        timeline_header: "பரிந்துரைக்கப்பட்ட மீட்பு காலவரிசை",
        timeline_day: "நாள்",
        step1_title: "தனிமைப்படுத்துதல் & தெளிப்பு",
        step1_desc: "பாதிக்கப்பட்ட இலைகளை உடனே அப்புறப்படுத்துங்கள். தாமிர பூஞ்சைக்கொல்லி அல்லது மேங்கோசெப்பை மாலையில் தெளிக்கவும்.",
        step2_title: "வேர் ஊட்டச்சத்து",
        step2_desc: "பொட்டாஷ் உரத்தை வேர்ப்பகுதியில் இடவும். ஈரப்பதம் குறைய தண்ணீர் பாய்ச்சுவதை கட்டுப்படுத்தவும்.",
        step3_title: "இரண்டாம் கட்ட தெளிப்பு",
        step3_desc: "ஆரோக்கியமான இலைகளுக்கு வேப்பெண்ணெய் கரைசல் தெளிக்கவும். நோய் தண்டுப்பகுதிக்கு பரவுகிறதா என ஆராயவும்.",
        step4_title: "குணமடைதலைக் கண்காணித்தல்",
        step4_desc: "புதிய தளிர்களைக் கவனியுங்கள். நோய் நின்றவுடன், வழக்கம் போல உரங்களை இடலாம்.",
        custom_reminders_title: "உங்களது செயலில் உள்ள அட்டவணைகள்",
        no_reminders: "தனிப்பயன் அட்டவணைகள் எதுவும் இல்லை. மேலே உருவாக்கவும்!",
        location_header: "மருந்து மற்றும் உரம் கிடைக்கும் விற்பனை நிலையங்கள்",
        location_desc: "விவசாய கூட்டுறவு சங்கங்கள் மற்றும் பூச்சிக்கொல்லி மருந்துகள் கிடைக்கும் கடைகளின் முகவரி மற்றும் வரைபடம்.",
        select_region_label: "பகுதியைத் தேர்ந்தெடுக்கவும்:",
        footer_credit: "விவசாயிகளின் வளமான எதிர்காலத்திற்கு தொழில்நுட்பத்தின் உதவி.",
        footer_support: "விவசாய உதவி எண்: 1800-180-1551",
        dist_km: "கி.மீ தூரம்",
        call_btn: "அழைக்க",
        status_sim: "ஆஃப்லைன் மாதிரி",
        status_active: "AI இயங்குகிறது",
        settings_modal_title: "செயற்கை நுண்ணறிவு அமைப்புகள்",
        settings_help_text: "எந்தவொரு பயிர் புகைப்படத்தையும் நேரலையில் ஆராய உங்கள் கூகுள் ஜெமினி API சாவியை உள்ளிடவும். இந்த சாவி பாதுகாப்பாக பிரவுசரிலேயே சேமிக்கப்படும்.",
        settings_api_label: "ஜெமினி API சாவி",
        current_mode_label: "நிலை:",
        btn_clear_key: "சாவியை நீக்கு",
        btn_save_key: "அமைப்புகளைச் சேமி"
    }
};

// 2. Agricultural Disease and Remedy Database
const cropDiseaseDatabase = {
    tomato: {
        badge: { en: "TOMATO", ta: "தக்காளி" },
        severity: "high",
        title: {
            en: "Late Blight Disease (Phytophthora infestans)",
            ta: "தக்காளி இலை கருகல் நோய் (பித்தோப்தோரா இன்ஃபெஸ்டன்ஸ்)"
        },
        description: {
            en: "Tomato late blight is a serious fungal disease that causes rapid rotting of leaves, stems, and fruits. It thrives in cool, wet environments and can destroy entire fields within days if untreated.",
            ta: "தக்காளி இலை கருகல் நோய் என்பது ஒரு தீவிரமான பூஞ்சை நோய் ஆகும், இது இலைகள், தண்டுகள் மற்றும் பழங்களை மிக விரைவாக அழுகச் செய்யும். குளிர்ந்த மற்றும் ஈரப்பதம் மிகுந்த சூழ்நிலையில் இது வேகமாக பரவி பயிர்களை அழித்துவிடும்."
        },
        organicRemedies: {
            en: [
                "Spray neem oil emulsion (5ml per liter of water) thoroughly on both sides of leaves.",
                "Use copper oxychloride spray as a soil drench to restrict spore development.",
                "Remove and safely burn infected plants immediately to prevent infestation spread."
            ],
            ta: [
                "வேப்பெண்ணெய் கரைசல் (லிட்டருக்கு 5 மி.லி) இலைகளின் இருபுறமும் நன்கு படுமாறு தெளிக்கவும்.",
                "மண்ணில் பூஞ்சை பரவுவதைக் குறைக்க தாமிர ஆக்ஸிகுளோரைடு கரைசலை ஊற்றி மண்ணை நனைக்கவும்.",
                "நோய் பரவாமல் தடுக்க பாதிக்கப்பட்ட செடிகளை உடனடியாக வேரோடு பிடுங்கி தீயிட்டு அழிக்கவும்."
            ]
        },
        chemicalRemedies: {
            en: [
                "Apply Metalaxyl or Mancozeb fungicide spray (2g per liter of water).",
                "Add Potash-rich fertilizers (NPK 0-0-50) to boost crop cellular defense systems.",
                "Avoid nitrogen-heavy fertilizers which stimulate lush green foliage prone to infection."
            ],
            ta: [
                "மெட்டாலாக்ஸில் அல்லது மேங்கோசெப் பூஞ்சைக்கொல்லி மருந்தை (லிட்டருக்கு 2 கிராம்) நீரில் கலந்து தெளிக்கவும்.",
                "பயிரின் நோய் எதிர்ப்புச் சக்தியை அதிகரிக்க பொட்டாஷ் சத்து நிறைந்த உரங்களை இடவும் (NPK 0-0-50).",
                "அதிகப்படியான தழைச்சத்து (நைட்ரஜன்) உரங்களை தற்காலிகமாக தவிர்க்கவும்; இது இலை வளர்ச்சியை அதிகரித்து நோயை ஈர்க்கும்."
            ]
        },
        timeline: [
            { day: 1, title: { en: "Isolate & Spray", ta: "தனிமைப்படுத்துதல் & தெளிப்பு" }, desc: { en: "Cut infected leaves. Spray organic copper fungicide or Mancozeb in late afternoon.", ta: "கருகிய இலைகளை வெட்டி எரிக்கவும். மாலையில் தாமிர பூஞ்சைக்கொல்லி அல்லது மேங்கோசெப் தெளிக்கவும்." } },
            { day: 3, title: { en: "Soil Immunity", ta: "வேர் ஊட்டச்சத்து" }, desc: { en: "Apply NPK (Potassium rich) fertilizer to roots. Limit overhead watering to reduce wetness.", ta: "வேர்ப்பகுதியில் பொட்டாசியம் உரமிட்டு, இலைகள் நனையாதவாறு நீர் பாய்ச்சுவதை கட்டுப்படுத்தவும்." } },
            { day: 7, title: { en: "Second Application", ta: "இரண்டாம் கட்ட தெளிப்பு" }, desc: { en: "Apply neem oil spray as a preventative shield on healthy foliage. Check stems for spreading lesions.", ta: "ஆரோக்கியமான இலைகளுக்கு வேப்பெண்ணெய் கரைசல் தெளிக்கவும். நோய் தண்டுக்கு பரவுகிறதா என ஆராயவும்." } },
            { day: 14, title: { en: "Evaluate Recovery", ta: "மறுபரிசீலனை செய்தல்" }, desc: { en: "Inspect new sprouts. If disease halts, resume standard growth fertilizers.", ta: "புதிய தளிர்களைக் கவனியுங்கள். நோய் நின்றவுடன், வழக்கம் போல உரங்களை இடலாம்." } }
        ]
    },
    paddy: {
        badge: { en: "RICE / PADDY", ta: "நெல்" },
        severity: "high",
        title: {
            en: "Rice Blast Disease (Magnaporthe oryzae)",
            ta: "நெல் குலை நோய் (அழுகல் நோய்)"
        },
        description: {
            en: "Rice Blast is a devastating fungus causing spindle-shaped lesions on leaves, node collapse, and rotting of the grain heads (neck rot). It significantly reduces crop yield in warm, humid regions.",
            ta: "நெல் குலை நோய் என்பது ஒரு கொடிய பூஞ்சை நோய் ஆகும், இது இலைகளில் கண் வடிவ புள்ளிகளைத் தோற்றுவித்து, நெல் கழுத்துப் பகுதியை அழுகச் செய்து கதிர்களைக் கொட்டிவிடும். இது மகசூலை கடுமையாக பாதிக்கும்."
        },
        organicRemedies: {
            en: [
                "Spray Pseudomonas fluorescens liquid formulation (10ml per liter of water) during early morning.",
                "Incorporate vermicompost and well-decomposed cow dung manure to encourage beneficial soil microbes.",
                "Drain fields for 2-3 days to reduce humidity levels in the microclimate."
            ],
            ta: [
                "சூடோமோனாஸ் புளூரெசென்ஸ் திரவ கரைசலை (லிட்டருக்கு 10 மி.லி) அதிகாலையில் தெளிக்கவும்.",
                "மண்ணில் நன்மை செய்யும் நுண்ணுயிரிகளை அதிகரிக்க மண்புழு உரம் மற்றும் மட்கிய தொழு உரங்களை பயன்படுத்தவும்.",
                "வயலில் தேங்கியுள்ள தண்ணீரை 2-3 நாட்களுக்கு வடிக்கச் செய்து ஈரப்பதத்தைக் குறைக்கவும்."
            ]
        },
        chemicalRemedies: {
            en: [
                "Spray Tricyclazole 75 WP (1g per liter of water) at leaf blast stage or neck emergence.",
                "Avoid split doses of Urea fertilizer when disease symptoms are active.",
                "Apply silicon-based fertilizer to strengthen plant cell walls against fungus penetration."
            ],
            ta: [
                "ட்ரைசைக்ளோசோல் 75 WP பூஞ்சைக்கொல்லியை (லிட்டருக்கு 1 கிராம்) கதிர் வெளிவரும் போது தெளிக்கவும்.",
                "நோய் அறிகுறி அதிகமாக உள்ள போது யூரியா (நைட்ரஜன்) உரம் இடுவதை முற்றிலும் தவிர்க்கவும்.",
                "பயிரின் தண்டு பகுதிகளை தடிமனாக்கி பூஞ்சை ஊடுருவலைத் தடுக்க சிலிக்கா உரங்களை இடவும்."
            ]
        },
        timeline: [
            { day: 1, title: { en: "Drainage & Bio-control", ta: "நீர் வடிப்பு & உயிரி தெளிப்பு" }, desc: { en: "Drain excess water. Spray Pseudomonas fluorescens liquid on crop foliage.", ta: "தேங்கிய நீரை வடிகட்டி சூடோமோனாஸ் உயிரி திரவ கரைசலை பயிர்களில் தெளிக்கவும்." } },
            { day: 3, title: { en: "Stop Nitrogen", ta: "யூரியா நிறுத்தம்" }, desc: { en: "Halt Urea top-dressing. Apply Silica or Potassium silicate to strengthen crop cells.", ta: "யூரியா உரம் இடுவதை தற்காலிகமாக நிறுத்தி, சிலிக்கா உரம் இடவும்." } },
            { day: 7, title: { en: "Neck Rot Prevention", ta: "கழுத்து அழுகல் தடுப்பு" }, desc: { en: "Inspect grain nodes. If lesions occur, spray Tricyclazole fungicide.", ta: "கதிர் கழுத்து பகுதியை கவனிக்கவும். புள்ளிகள் தென்பட்டால் ட்ரைசைக்ளோசோல் தெளிக்கவும்." } },
            { day: 14, title: { en: "Irrigation Reset", ta: "நீர் பாய்ச்சுதல்" }, desc: { en: "Re-irrigate fields appropriately. Monitor grain filling and crop strength.", ta: "வயலுக்கு தேவைக்கேற்ப நீர் பாய்ச்சி, நெல்மணிகள் உருவாவதை கண்காணிக்கவும்." } }
        ]
    },
    corn: {
        badge: { en: "CORN / MAIZE", ta: "சோளம்" },
        severity: "medium",
        title: {
            en: "Common Corn Rust (Puccinia sorghi)",
            ta: "சோள துரு நோய் (பூஞ்சை பாதிப்பு)"
        },
        description: {
            en: "Common rust produces prominent golden-brown, powdery pustules on both upper and lower leaf surfaces. It limits photosynthesis and slows starch accumulation in kernels.",
            ta: "துரு நோய் சோள இலைகளின் இருபுறமும் செம்பழுப்பு நிற துரு போன்ற கொப்புளங்களை உண்டாக்குகிறது. இது ஒளிச்சேர்க்கையை குறைத்து சோள மணிகளின் வளர்ச்சியைக் கட்டுப்படுத்தும்."
        },
        organicRemedies: {
            en: [
                "Apply baking soda mixture (5g baking soda + 5ml neem oil in 1L water) to slow rust expansion.",
                "Ensure spacing of at least 20cm between plants to prevent localized humidity.",
                "Destroy all left-over stalks and weeds immediately after harvest."
            ],
            ta: [
                "சமையல் சோடா மற்றும் வேப்பெண்ணெய் கலந்த நீர் கரைசலைத் தெளித்து துரு நோய் பரவுவதை தடுத்து நிறுத்தவும்.",
                "பயிர்களுக்கு இடையில் குறைந்தபட்சம் 20 செ.மீ இடைவெளி விட்டு காற்று ஓட்டத்தை அதிகரிக்கவும்.",
                "அறுவடைக்குப் பிறகு மீதமுள்ள சோளத்தட்டைகளை அப்புறப்படுத்தி தீயிட்டு எரிக்கவும்."
            ]
        },
        chemicalRemedies: {
            en: [
                "Spray systemic fungicides like Tebuconazole or Azoxystrobin (1.5ml per liter of water).",
                "Apply a basal dose of NPK 10-26-26 compound fertilizer to support kernel development.",
                "Maintain adequate moisture through furrow irrigation to reduce crop stress."
            ],
            ta: [
                "டெபுகோனசோல் அல்லது அசோக்ஸிஸ்ட்ரோபின் போன்ற பூஞ்சைக் கொல்லியை (லிட்டருக்கு 1.5 மி.லி) தெளிக்கவும்.",
                "சோளக் கருதுகள் நன்கு வளர NPK 10-26-26 கூட்டு உரத்தைப் பயன்படுத்தவும்.",
                "பயிர் வறட்சி அழுத்தத்தைக் குறைக்க போதிய அளவு நீர்ப்பாசனம் செய்யவும்."
            ]
        },
        timeline: [
            { day: 1, title: { en: "Foliage Clearance", ta: "இலை நீக்கம்" }, desc: { en: "Cut and dispose of highly rusted bottom leaves to facilitate air ventilation.", ta: "காற்று ஓட்டம் அதிகரிக்க அதிகம் நோய் தாக்கிய கீழ் இலைகளை வெட்டி அகற்றவும்." } },
            { day: 3, title: { en: "Fungicide Defense", ta: "பூஞ்சை எதிர்ப்பு தெளிப்பு" }, desc: { en: "Apply Tebuconazole or baking-soda mixture globally over the crop canopy.", ta: "டெபுகோனசோல் அல்லது சமையல் சோடா கரைசலை பயிர்களில் தெளிக்கவும்." } },
            { day: 7, title: { en: "NPK Nutrition Boost", ta: "NPK உரம் அளித்தல்" }, desc: { en: "Apply NPK 10-26-26 compound fertilizer around plant roots. Water lightly.", ta: "வேர்ப்பகுதியில் NPK 10-26-26 கூட்டு உரத்தை இட்டு லேசாக நீர் பாய்ச்சவும்." } },
            { day: 14, title: { en: "Check Spore Growth", ta: "புள்ளிகள் கண்காணிப்பு" }, desc: { en: "Confirm new leaves emerging have no rust pustules. Ensure healthy moisture levels.", ta: "புதிய இலைகளில் துரு கொப்புளங்கள் இல்லாமல் இருப்பதை உறுதி செய்து ஈரப்பதத்தை பேணவும்." } }
        ]
    },
    banana: {
        badge: { en: "BANANA", ta: "வாழை" },
        severity: "high",
        title: {
            en: "Panama Wilt Disease (Fusarium oxysporum f. sp. cubense)",
            ta: "வாழை பனாமா வாடல் நோய் (ஃபியூசேரியம் வாடல்)"
        },
        description: {
            en: "Panama Wilt is a lethal, soil-borne fungal disease. Symptoms include yellowing of lower leaf margins, buckling of leaf stalks (petioles), and splitting at the base of the pseudo-stem.",
            ta: "பனாமா வாடல் என்பது மண்ணின் மூலம் பரவும் ஒரு கொடிய பூஞ்சை நோய் ஆகும். இதன் அறிகுறிகள் கீழ் இலைகளின் விளிம்புகள் மஞ்சள் நிறமடைதல், தண்டுகள் உடைந்து தொங்குதல் மற்றும் தண்டு வெடித்தல் ஆகும்."
        },
        organicRemedies: {
            en: [
                "Apply Trichoderma viride bio-fungicide (50g per plant) mixed with organic farmyard manure in basins.",
                "Incorporate neem cake (250g per plant) during land preparation and planting.",
                "Practice crop rotation with wet paddy or sugarcane to suffocate fungal spores in the soil."
            ],
            ta: [
                "இயற்கை தொழு உரத்துடன் டிரைக்கோடெர்மா விரிடி (செடிக்கு 50 கிராம்) கலந்து வாழை பாத்திகளில் வைக்கவும்.",
                "நிலம் தயாரிக்கும் போதும் நடவின் போதும் வேப்பம் புண்ணாக்கு (செடிக்கு 250 கிராம்) இடவும்.",
                "மண்ணில் பூஞ்சை வித்திகளை அழிக்க நெல் அல்லது கரும்பு பயிர்களைக் கொண்டு சுழற்சி முறை சாகுபடி செய்யவும்."
            ]
        },
        chemicalRemedies: {
            en: [
                "Drench soil basin with Carbendazim solution (2g per liter of water) around infected and neighboring plants.",
                "Apply soluble Potassium Sulphate fertilizer to improve pseudo-stem vascular strength.",
                "Add agricultural lime (calcium carbonate) to acid soils to raise pH above 6.5, making it hostile to Fusarium."
            ],
            ta: [
                "பாதிக்கப்பட்ட மற்றும் அருகில் உள்ள மரங்களைச் சுற்றி கார்பென்டாசிம் கரைசலை (லிட்டருக்கு 2 கிராம்) மண்ணில் ஊற்றவும்.",
                "தண்டு பகுதி வலிமை பெற தண்ணீரில் கரையக்கூடிய பொட்டாசியம் சல்பேட் உரத்தை தெளிக்கவும் அல்லது வேரில் இடவும்.",
                "அமிலத்தன்மை உள்ள மண்ணில் சுண்ணாம்பு (ஜிப்சம்) இட்டு pH அளவை 6.5க்கு மேல் உயர்த்தி பூஞ்சையை கட்டுப்படுத்தவும்."
            ]
        },
        timeline: [
            { day: 1, title: { en: "Quarantine & Basin Drench", ta: "தனிமைப்படுத்தல் & தரை நனைத்தல்" }, desc: { en: "Isolate infected plant. Drench root zones with Carbendazim or Trichoderma solution.", ta: "பாதிக்கப்பட்ட மரத்தை சுற்றி வடிகால் வெட்டி கார்பென்டாசிம் அல்லது சூடோமோனாஸ் கரைசல் ஊற்றவும்." } },
            { day: 3, title: { en: "Soil Biological Support", ta: "மண் நுண்ணுயிர் சிகிச்சை" }, desc: { en: "Incorporate Trichoderma viride mixed with farmyard manure into soil around the plant.", ta: "டிரைக்கோடெர்மா விரிடி மற்றும் தொழு உரக் கலவையை மண்ணின் மேல் அடுக்கில் கலந்து இடவும்." } },
            { day: 7, title: { en: "Cell Strength Boost", ta: "செல் வலிமை ஊட்டச்சத்து" }, desc: { en: "Apply Potassium Sulphate (Potash) fertilizer to boost stem cellular water pressure.", ta: "தண்டின் வலிமையை அதிகரிக்க பொட்டாசியம் சல்பேட் உரம் கரைத்து ஊற்றவும்." } },
            { day: 14, title: { en: "Monitor Adjacent Palms", ta: "அருகிலுள்ள மரங்களை கண்காணித்தல்" }, desc: { en: "Check adjacent banana plants for early yellowing signs. Clear weeding debris.", ta: "அருகிலுள்ள மரங்களில் மஞ்சள் நிறமாக மாறுகிறதா என கண்காணித்து களைகளை அகற்றவும்." } }
        ]
    },
    coconut: {
        badge: { en: "COCONUT", ta: "தென்னை" },
        severity: "medium",
        title: {
            en: "Root Wilt Disease (Phytoplasma)",
            ta: "தென்னை வேர் வாடல் நோய் (பைட்டோபிளாஸ்மா)"
        },
        description: {
            en: "Root Wilt is characterized by the bending/flaccidity of leaves (ribbing) and general yellowing of fronds. It is caused by phytoplasma and transmitted by sap-sucking lace bugs and plant hoppers.",
            ta: "வேர் வாடல் நோய் தென்னை ஓலைகள் வளைந்து, சுருங்கி, மஞ்சள் நிறமாவதன் மூலம் அறியப்படுகிறது. இது சாறு உறிஞ்சும் பூச்சிகள் மற்றும் ஓலை தட்டான்களால் பரப்பப்படுகிறது."
        },
        organicRemedies: {
            en: [
                "Apply neem cake (5kg per palm annually) in the root basin to enrich soil nutrition.",
                "Sow green manure crops like Sunnhemp or Calopogonium in the basin, and plough back at flowering.",
                "Introduce natural insect predators (lacewings/chrysopids) to biologically suppress insect vectors."
            ],
            ta: [
                "தென்னை மரத்தின் பாத்தியில் வருடத்திற்கு 5 கிலோ வேப்பம் புண்ணாக்கு இட்டு மண்ணை கிளறவும்.",
                "மரத்தைச் சுற்றி சணப்பை போன்ற பசுந்தாள் உரப்பயிர்களை வளர்த்து, பூக்கும் தருணத்தில் பாத்தியிலேயே மடக்கி உழவும்.",
                "சாறு உறிஞ்சும் பூச்சிகளைக் கட்டுப்படுத்த நன்மை செய்யும் பூச்சிகளை தோட்டத்தில் விடவும்."
            ]
        },
        chemicalRemedies: {
            en: [
                "Spray Imidacloprid (1ml per liter of water) on leaves to control lace bugs and insect vectors.",
                "Apply annual NPK dosage per tree: 1.3kg Urea, 2kg Superphosphate, and 3.5kg Muriate of Potash.",
                "Apply Magnesium Sulphate (500g per tree) to alleviate leaf chlorosis and yellowing.",
                "Provide root feeding with Carbendazim (2g in 100ml water) in extreme wilt cases."
            ],
            ta: [
                "ஓலை தட்டான் பூச்சிகளைக் கட்டுப்படுத்த இமிடாக்ளோப்ரிட் பூச்சிக்கொல்லியை (லிட்டருக்கு 1 மி.லி) ஓலைகளில் தெளிக்கவும்.",
                "ஒரு மரத்திற்கு வருடத்திற்கு 1.3 கிலோ யூரியா, 2 கிலோ சூப்பர் பாஸ்பேட், 3.5 கிலோ பொட்டாஷ் உரங்களை இடவும்.",
                "இலைகள் மஞ்சளாவதை தடுக்க ஒரு மரத்திற்கு 500 கிராம் மெக்னீசியம் சல்பேட் இடவும்.",
                "அதிக பாதிப்புள்ள மரங்களுக்கு கார்பென்டாசிம் மருந்தை (100 மி.லி தண்ணீரில் 2 கிராம்) வேர் மூலம் செலுத்தவும்."
            ]
        },
        timeline: [
            { day: 1, title: { en: "Basin Digging & Neem", ta: "பாத்தி அமைத்தல் & வேம்பு" }, desc: { en: "Dig 5-feet radius basin. Apply 5kg neem cake and mix with soil.", ta: "மரத்தைச் சுற்றி 5 அடி வட்ட பாத்தி அமைத்து 5 கிலோ வேப்பம்புண்ணாக்கு இடவும்." } },
            { day: 3, title: { en: "Root Feeding Minerals", ta: "வேர் நுண்ஊட்டச்சத்துக்கள்" }, desc: { en: "Apply Magnesium Sulphate and micro-nutrients via soil or active root feeding.", ta: "மெக்னீசியம் சல்பேட் மற்றும் நுண்ஊட்டச்சத்துக்களை வேர் மூலமோ அல்லது மண்ணிலோ இடவும்." } },
            { day: 7, title: { en: "Insect Control Spray", ta: "பூச்சி கட்டுப்பாட்டு தெளிப்பு" }, desc: { en: "Spray Imidacloprid or neem emulsion to eradicate sap-sucking insect vectors.", ta: "சாறு உறிஞ்சும் பூச்சிகளை அழிக்க இமிடாக்ளோப்ரிட் அல்லது வேப்ப எண்ணெய் தெளிக்கவும்." } },
            { day: 14, title: { en: "NPK Base Feeding", ta: "அடிப்படை NPK உரம்" }, desc: { en: "Apply the first half of annual nitrogen-phosphate-potassium fertilizer dosages.", ta: "வருடாந்திர NPK உர அளவில் முதல் பாதியை பாத்தி அமைத்து இட்டு நீர் பாய்ச்சவும்." } }
        ]
    }
};

// 3. Fertilizer Dealer Stores Database
const dealerStores = {
    coimbatore: {
        center: [11.0168, 76.9558],
        shops: [
            { name: { en: "Coimbatore Farmers Cooperative Society", ta: "கோயம்புத்தூர் விவசாயிகள் கூட்டுறவு சங்கம்" }, address: { en: "45, Agro Bazaar, R.S. Puram, Coimbatore", ta: "45, அக்ரோ பஜார், ஆர்.எஸ்.புரம், கோயம்புத்தூர்" }, phone: "0422-2541234", dist: 1.2, coords: [11.0125, 76.9452] },
            { name: { en: "Green Agro Fertilizers & Pesticides", ta: "கிரீன் அக்ரோ உரங்கள் மற்றும் மருந்துகள்" }, address: { en: "112, Mettupalayam Road, Near Bus Stand, Coimbatore", ta: "112, மேட்டுப்பாளையம் சாலை, பேருந்து நிலையம் அருகில், கோயம்புத்தூர்" }, phone: "98431-23456", dist: 2.5, coords: [11.0250, 76.9610] },
            { name: { en: "TNAU Agriculture Sales Counter", ta: "தமிழ்நாடு வேளாண் பல்கலைக்கழக விற்பனை மையம்" }, address: { en: "TNAU Campus, Lawley Road, Coimbatore", ta: "TNAU வளாகம், லாலி ரோடு, கோயம்புத்தூர்" }, phone: "0422-6611200", dist: 3.1, coords: [11.0135, 76.9360] }
        ]
    },
    trichy: {
        center: [10.7905, 78.7047],
        shops: [
            { name: { en: "Trichy Agri Service Cooperative", ta: "திருச்சி வேளாண் சேவை கூட்டுறவு சங்கம்" }, address: { en: "12, Cantonment Road, Near Head Post Office, Trichy", ta: "12, கன்டோன்மென்ட் ரோடு, தலைமை தபால் நிலையம் அருகில், திருச்சி" }, phone: "0431-2412345", dist: 1.8, coords: [10.7980, 78.6920] },
            { name: { en: "Cauvery Fertilizer Agency", ta: "காவிரி உர நிறுவனம்" }, address: { en: "89, Gandhi Market Road, Trichy", ta: "89, காந்தி மார்க்கெட் ரோடு, திருச்சி" }, phone: "94432-67890", dist: 2.1, coords: [10.7890, 78.7180] },
            { name: { en: "Sri Murugan Agro Center", ta: "ஸ்ரீ முருகன் அக்ரோ சென்டர்" }, address: { en: "Lalgudi Main Road, Trichy Bypass, Trichy", ta: "லால்குடி மெயின் ரோடு, திருச்சி பைபாஸ், திருச்சி" }, phone: "98654-32109", dist: 5.4, coords: [10.8350, 78.6950] }
        ]
    },
    madurai: {
        center: [9.9252, 78.1198],
        shops: [
            { name: { en: "Madurai Farmer Help Center & Cooperative", ta: "மதுரை விவசாயிகள் உதவி மையம் & கூட்டுறவு" }, address: { en: "77, East Veli Street, Madurai", ta: "77, கிழக்கு வெளி வீதி, மதுரை" }, phone: "0452-2345678", dist: 0.9, coords: [9.9210, 78.1250] },
            { name: { en: "Meenakshi Agro Supplies", ta: "மீனாட்சி அக்ரோ சப்ளைஸ்" }, address: { en: "14, Melur Main Road, Madurai", ta: "14, மேலூர் மெயின் ரோடு, மதுரை" }, phone: "94433-12345", dist: 2.8, coords: [9.9360, 78.1410] },
            { name: { en: "Pandian Agricultural Cooperative Society", ta: "பாண்டியன் கூட்டுறவு விவசாய சங்கம்" }, address: { en: "Simmakkal Circle, Near Clock Tower, Madurai", ta: "சிம்மக்கல் சர்க்கிள், கடிகார கோபுரம் அருகில், மதுரை" }, phone: "0452-2623456", dist: 1.5, coords: [9.9270, 78.1100] }
        ]
    },
    salem: {
        center: [11.6643, 78.1460],
        shops: [
            { name: { en: "Salem Cooperative Marketing Society", ta: "சேலம் கூட்டுறவு விற்பனை சங்கம்" }, address: { en: "3, Cherry Road, Salem", ta: "3, செர்ரி ரோடு, சேலம்" }, phone: "0427-2415678", dist: 1.1, coords: [11.6580, 78.1520] },
            { name: { en: "Kongu Agro Traders", ta: "கொங்கு அக்ரோ டிரேடர்ஸ்" }, address: { en: "Omalur Main Road, Near Junction, Salem", ta: "ஓமலூர் மெயின் ரோடு, சந்திப்பு அருகில், சேலம்" }, phone: "98427-56789", dist: 2.3, coords: [11.6690, 78.1310] },
            { name: { en: "Vazhapadi Farmer Depot", ta: "வாழப்பாடி விவசாயி டிப்போ" }, address: { en: "Cuddalore Main Road, Vazhapadi, Salem", ta: "கடலூர் மெயின் ரோடு, வாழப்பாடி, சேலம்" }, phone: "94860-98765", dist: 6.7, coords: [11.6420, 78.1680] }
        ]
    },
    thanjavur: {
        center: [10.7870, 79.1378],
        shops: [
            { name: { en: "Thanjavur Delta Agri-Services", ta: "தஞ்சாவூர் டெல்டா வேளாண் சேவைகள்" }, address: { en: "21, Court Road, Thanjavur", ta: "21, கோர்ட் ரோடு, தஞ்சாவூர்" }, phone: "04362-231010", dist: 1.4, coords: [10.7910, 79.1310] },
            { name: { en: "Rice Bowl Fertilizer Syndicate", ta: "நெற்களஞ்சியம் உர சிண்டிகேட்" }, address: { en: "Trichy Bypass Road, Thanjavur", ta: "திருச்சி பைபாஸ் ரோடு, தஞ்சாவூர்" }, phone: "94435-99887", dist: 2.9, coords: [10.7780, 79.1240] },
            { name: { en: "Rajarajan Agriculture Depot", ta: "ராஜராஜன் விவசாய டிப்போ" }, address: { en: "Kumbakonam Road, Thanjavur", ta: "கும்பகோணம் ரோடு, தஞ்சாவூர்" }, phone: "98651-44332", dist: 4.2, coords: [10.8030, 79.1550] }
        ]
    }
};

// Mock crop sample image placeholders
const cropSampleImages = {
    tomato: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600",
    paddy: "https://images.unsplash.com/photo-1536657244441-c12402b9f0da?auto=format&fit=crop&q=80&w=600",
    corn: "https://images.unsplash.com/photo-1551754625-70c90487530d?auto=format&fit=crop&q=80&w=600",
    banana: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600",
    coconut: "https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&q=80&w=600"
};

// 4. Initializer Logic
document.addEventListener("DOMContentLoaded", () => {
    initElements();
    loadLanguage(currentLang);
    loadSavedReminders();
    initMap('coimbatore'); // Initialize map default to coimbatore
    updateAPIKeyStatus();
});

// Cache elements
let elements = {};
function initElements() {
    elements = {
        langEn: document.getElementById("lang-en"),
        langTa: document.getElementById("lang-ta"),
        audioGuide: document.getElementById("btn-audio-guide"),
        dropZone: document.getElementById("drop-zone"),
        fileInput: document.getElementById("file-input"),
        btnRemovePhoto: document.getElementById("btn-remove-photo"),
        previewContainer: document.getElementById("preview-container"),
        imagePreview: document.getElementById("image-preview"),
        btnAnalyze: document.getElementById("btn-analyze"),
        resultsPlaceholder: document.getElementById("results-placeholder"),
        scanningLoader: document.getElementById("scanning-loader"),
        scanProgress: document.getElementById("scan-progress"),
        resultsDashboard: document.getElementById("results-dashboard"),
        cropBadgeName: document.getElementById("crop-badge-name"),
        severityIndicator: document.getElementById("severity-indicator"),
        severityText: document.getElementById("severity-text"),
        diagnosedDiseaseTitle: document.getElementById("diagnosed-disease-title"),
        diseaseDescription: document.getElementById("disease-description"),
        organicRemediesList: document.getElementById("organic-remedies-list"),
        chemicalRemediesList: document.getElementById("chemical-remedies-list"),
        btnSpeakResult: document.getElementById("btn-speak-result"),
        schedulerForm: document.getElementById("scheduler-form"),
        schedType: document.getElementById("sched-type"),
        schedDate: document.getElementById("sched-date"),
        customRemindersList: document.getElementById("custom-reminders-list"),
        regionSelect: document.getElementById("region-select"),
        shopListContainer: document.getElementById("shop-list-container"),
        timelineSuggestedSteps: document.getElementById("timeline-suggested-steps"),
        sampleButtons: document.querySelectorAll(".sample-btn"),
        tabButtons: document.querySelectorAll(".tab-btn"),
        tabContents: document.querySelectorAll(".tab-content"),
        settingsModal: document.getElementById("settings-modal"),
        btnSettings: document.getElementById("btn-settings"),
        btnCloseSettings: document.getElementById("btn-close-settings"),
        apiKeyInput: document.getElementById("api-key-input"),
        btnToggleKeyVisibility: document.getElementById("btn-toggle-key-visibility"),
        btnSaveKey: document.getElementById("btn-save-key"),
        btnClearKey: document.getElementById("btn-clear-key"),
        apiStatusBadge: document.getElementById("api-status-badge"),
        settingsStatusBadge: document.getElementById("settings-status-badge")
    };

    // Event Listeners
    elements.langEn.addEventListener("click", () => setLanguage('en'));
    elements.langTa.addEventListener("click", () => setLanguage('ta'));
    
    // File inputs & Drag/Drop
    elements.dropZone.addEventListener("click", (e) => {
        if (e.target.closest("#btn-remove-photo")) return;
        elements.fileInput.click();
    });
    elements.fileInput.addEventListener("change", handleFileSelect);
    
    elements.dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        elements.dropZone.classList.add("drag-over");
    });
    elements.dropZone.addEventListener("dragleave", () => {
        elements.dropZone.classList.remove("drag-over");
    });
    elements.dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
            elements.fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    elements.btnRemovePhoto.addEventListener("click", (e) => {
        e.stopPropagation();
        resetPhotoUpload();
    });

    elements.btnAnalyze.addEventListener("click", triggerMockAnalysis);

    // Audio Buttons
    elements.audioGuide.addEventListener("click", readAudioGuideHelp);
    elements.btnSpeakResult.addEventListener("click", speakDiagnosisResult);

    // Sample Crops
    elements.sampleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const cropType = btn.getAttribute("data-crop");
            loadSampleCrop(cropType);
        });
    });

    // Dashboard Tabs
    elements.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Scheduler Form
    elements.schedulerForm.addEventListener("submit", handleAddReminder);

    // Region Selector
    elements.regionSelect.addEventListener("change", (e) => {
        const region = e.target.value;
        updateDealerSection(region);
    });

    // AI Settings Event Listeners
    elements.btnSettings.addEventListener("click", openSettingsModal);
    elements.btnCloseSettings.addEventListener("click", closeSettingsModal);
    elements.btnSaveKey.addEventListener("click", saveAPIKey);
    elements.btnClearKey.addEventListener("click", clearAPIKey);
    elements.btnToggleKeyVisibility.addEventListener("click", toggleKeyVisibility);
    window.addEventListener("click", (e) => {
        if (e.target === elements.settingsModal) {
            closeSettingsModal();
        }
    });
}

// 5. Language Translation Core Engine
function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    
    // Active styling classes
    if (lang === 'en') {
        elements.langEn.classList.add("active");
        elements.langTa.classList.remove("active");
        document.documentElement.lang = 'en';
    } else {
        elements.langTa.classList.add("active");
        elements.langEn.classList.remove("active");
        document.documentElement.lang = 'ta';
    }
    
    loadLanguage(lang);
    
    // If diagnosis results are active, refresh the dynamic text content
    if (currentCropData) {
        displayCropResults(currentCropData);
    }
    
    // Refresh scheduler timeline and custom reminder displays
    renderCustomReminders();
    
    // Refresh shops list
    updateDealerSection(elements.regionSelect.value);

    // Cancel any speaking speech
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
}

function loadLanguage(lang) {
    const textDict = translations[lang];
    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");
        if (textDict[key]) {
            if (el.tagName === 'INPUT' && el.type === 'button') {
                el.value = textDict[key];
            } else if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = textDict[key];
            } else {
                el.innerHTML = textDict[key];
            }
        }
    });
}

// 6. Photo Upload & Preview Handlers
function handleFileSelect() {
    const file = elements.fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageSrc = e.target.result;
            elements.imagePreview.src = uploadedImageSrc;
            elements.previewContainer.classList.remove("preview-hidden");
            elements.btnAnalyze.classList.remove("btn-disabled");
            elements.btnAnalyze.removeAttribute("disabled");
            
            // Randomly assign a crop database disease when they upload their own photo, so they can test it!
            const keys = Object.keys(cropDiseaseDatabase);
            const randomCropKey = keys[Math.floor(Math.random() * keys.length)];
            elements.btnAnalyze.setAttribute("data-target-crop", randomCropKey);
        };
        reader.readAsDataURL(file);
    }
}

function resetPhotoUpload() {
    elements.fileInput.value = "";
    uploadedImageSrc = null;
    elements.imagePreview.src = "#";
    elements.previewContainer.classList.add("preview-hidden");
    elements.btnAnalyze.classList.add("btn-disabled");
    elements.btnAnalyze.setAttribute("disabled", "true");
    elements.btnAnalyze.removeAttribute("data-target-crop");
    elements.dropZone.classList.remove("scanning");
    
    // Reset outputs
    currentCropData = null;
    elements.resultsPlaceholder.classList.remove("hidden");
    elements.scanningLoader.classList.add("hidden");
    elements.resultsDashboard.classList.add("hidden");

    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
}

function loadSampleCrop(cropType) {
    resetPhotoUpload();
    
    // Place sample crop image in preview
    const sampleImg = cropSampleImages[cropType];
    elements.imagePreview.src = sampleImg;
    elements.previewContainer.classList.remove("preview-hidden");
    
    // Setup target crop to match the sample clicked
    elements.btnAnalyze.setAttribute("data-target-crop", cropType);
    elements.btnAnalyze.classList.remove("btn-disabled");
    elements.btnAnalyze.removeAttribute("disabled");
    
    // Automatically trigger scan for samples to make it interactive and super easy!
    triggerMockAnalysis();
}

// 7. Mock Scanning Simulator
function triggerMockAnalysis() {
    // Check if we should use the live Gemini AI model
    if (geminiApiKey) {
        analyzeWithGeminiAPI();
        return;
    }

    const targetCropKey = elements.btnAnalyze.getAttribute("data-target-crop");
    if (!targetCropKey) return;
    
    // Cancel any speaking voice
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }

    currentCropData = cropDiseaseDatabase[targetCropKey];

    // Hide dashboard/placeholder and display loader
    elements.resultsPlaceholder.classList.add("hidden");
    elements.resultsDashboard.classList.add("hidden");
    elements.scanningLoader.classList.remove("hidden");
    elements.dropZone.classList.add("scanning");
    
    // Animate progress bar (2.5 seconds total)
    let progress = 0;
    elements.scanProgress.style.width = `0%`;
    
    const progressInterval = setInterval(() => {
        progress += 4;
        elements.scanProgress.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Finish scan, show dashboard
            setTimeout(() => {
                elements.scanningLoader.classList.add("hidden");
                elements.resultsDashboard.classList.remove("hidden");
                elements.dropZone.classList.remove("scanning");
                
                // Display results on tab
                displayCropResults(currentCropData);
                switchTab('tab-diagnosis');
                
                // Read diagnostic results to farmer automatically if they want or click
                speakDiagnosisResult();
            }, 300);
        }
    }, 100);
}

// Display crop findings on tabs
function displayCropResults(cropData) {
    const lang = currentLang;
    
    // Set Header titles
    elements.cropBadgeName.innerText = cropData.badge[lang];
    elements.diagnosedDiseaseTitle.innerText = cropData.title[lang];
    
    // Update Severity
    elements.severityIndicator.className = `severity-pill severity-${cropData.severity}`;
    if (cropData.severity === 'high') {
        elements.severityText.innerText = translations[lang].severity_high;
    } else if (cropData.severity === 'medium') {
        elements.severityText.innerText = translations[lang].severity_medium;
    } else {
        elements.severityText.innerText = translations[lang].severity_low;
    }

    // Set Description
    elements.diseaseDescription.innerText = cropData.description[lang];

    // Organic remedies list load
    elements.organicRemediesList.innerHTML = "";
    cropData.organicRemedies[lang].forEach(remedy => {
        const li = document.createElement("li");
        li.innerText = remedy;
        elements.organicRemediesList.appendChild(li);
    });

    // Chemical remedies list load
    elements.chemicalRemediesList.innerHTML = "";
    cropData.chemicalRemedies[lang].forEach(remedy => {
        const li = document.createElement("li");
        li.innerText = remedy;
        elements.chemicalRemediesList.appendChild(li);
    });

    // Draw Treatment timeline suggested steps
    elements.timelineSuggestedSteps.innerHTML = "";
    cropData.timeline.forEach(step => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        
        item.innerHTML = `
            <div class="timeline-dot dot-active">${step.day}</div>
            <div class="timeline-info">
                <h4 class="timeline-step-title">${translations[lang].timeline_day} ${step.day}: ${step.title[lang]}</h4>
                <p class="timeline-step-desc">${step.desc[lang]}</p>
            </div>
        `;
        elements.timelineSuggestedSteps.appendChild(item);
    });
}

// Tab Selector Switcher
function switchTab(tabId) {
    elements.tabButtons.forEach(btn => {
        if (btn.getAttribute("data-tab") === tabId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    elements.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add("active");
        } else {
            content.classList.remove("active");
        }
    });

    // Leaflet Map requires resizing triggered when switching map tabs container to avoid grey blank boxes
    if (tabId === 'tab-shops' && leafletMap) {
        setTimeout(() => {
            leafletMap.invalidateSize();
        }, 150);
    }
}

// 8. Text to Speech Engine (Audio Guidance & Results Outloud)
function getVoiceForLanguage(lang) {
    if (!speechSynth) return null;
    const voices = speechSynth.getVoices();
    
    // Look for matching locale voices
    if (lang === 'ta') {
        // Tamil locale ta-IN or ta-LK
        return voices.find(v => v.lang.startsWith("ta")) || null;
    } else {
        // English locale en-US, en-IN, en-GB etc.
        return voices.find(v => v.lang.startsWith("en")) || null;
    }
}

function readAudioGuideHelp() {
    if (!speechSynth) return;
    
    if (speechSynth.speaking) {
        speechSynth.cancel();
        return;
    }

    let speechText = "";
    if (currentLang === 'en') {
        speechText = "Welcome to Agri Sense AI. To check your crop disease, upload a clear photo of the infected crop using the select photo button on the left, or click one of our sample crops to see a demonstration. We will scan the image, provide remedies, chemical dosages, schedules, and dealers near you.";
    } else {
        speechText = "அக்ரிசென்ஸ் ஏ ஐ-க்கு உங்களை வரவேற்கிறோம். உங்கள் பயிரின் நோயைக் கண்டறிய, இடதுபுறம் உள்ள செலக்ட் போட்டோ பட்டனைப் பயன்படுத்தி பாதிக்கப்பட்ட பயிரின் தெளிவான படத்தை பதிவேற்றவும். அல்லது மாதிரிப் பயிர்களில் ஒன்றை கிளிக் செய்யவும். நாங்கள் பயிரை பரிசோதித்து, இயற்கை மற்றும் ரசாயன தீர்வுகள், கால அட்டவணைகள் மற்றும் அருகில் உள்ள உரக்கடைகளின் விவரங்களை வழங்குவோம்.";
    }

    speakText(speechText, currentLang);
}

function speakDiagnosisResult() {
    if (!speechSynth || !currentCropData) return;

    if (speechSynth.speaking) {
        speechSynth.cancel();
        return;
    }

    const lang = currentLang;
    const data = currentCropData;
    
    let text = "";
    if (lang === 'en') {
        text = `Diagnosis complete. We detected ${data.badge.en} disease: ${data.title.en}. Severity is ${data.severity}. ${data.description.en}. We recommend you check the organic and chemical remedies listed below.`;
    } else {
        const severityStr = data.severity === 'high' ? 'கடுமையானது' : (data.severity === 'medium' ? 'நடுத்தரமானது' : 'குறைவானது');
        text = `பரிசோதனை முடிந்தது. உங்கள் ${data.badge.ta} பயிரில் கண்டறியப்பட்ட நோய்: ${data.title.ta}. பாதிப்பு நிலை: ${severityStr}. ${data.description.ta}. இயற்கை மற்றும் ரசாயன மருந்துகளை பயன்படுத்தவும்.`;
    }

    speakText(text, lang);
}

function speakText(text, lang) {
    if (!speechSynth) return;
    
    // Standard Speech Synthesis Utterance
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    
    const matchingVoice = getVoiceForLanguage(lang);
    if (matchingVoice) {
        speechUtterance.voice = matchingVoice;
    }
    
    speechUtterance.rate = 0.95; // Slightly slower rate for easy farming explanations
    speechSynth.speak(speechUtterance);
}

// SpeechVoices can be async loaded by browser
if (speechSynth && speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = () => {
        // Prefetching voices list
        getVoiceForLanguage('ta');
        getVoiceForLanguage('en');
    };
}

// 9. Scheduler & LocalStorage Treatment Manager
function handleAddReminder(e) {
    e.preventDefault();
    const type = elements.schedType.value;
    const dateVal = elements.schedDate.value;
    
    if (!type || !dateVal) return;

    const newReminder = {
        id: Date.now().toString(),
        type: type,
        date: dateVal,
        crop: currentCropData ? currentCropData.badge[currentLang] : "Crop/பயிர்"
    };

    customReminders.push(newReminder);
    saveReminders();
    renderCustomReminders();
    
    // Clear inputs
    elements.schedDate.value = "";
}

function saveReminders() {
    localStorage.setItem("agrisense_reminders", JSON.stringify(customReminders));
}

function loadSavedReminders() {
    const saved = localStorage.getItem("agrisense_reminders");
    if (saved) {
        try {
            customReminders = JSON.parse(saved);
        } catch(e) {
            customReminders = [];
        }
    }
    renderCustomReminders();
}

function deleteReminder(id) {
    customReminders = customReminders.filter(rem => rem.id !== id);
    saveReminders();
    renderCustomReminders();
}

function renderCustomReminders() {
    elements.customRemindersList.innerHTML = "";
    
    if (customReminders.length === 0) {
        const placeholder = document.createElement("p");
        placeholder.className = "no-reminders-text";
        placeholder.innerText = translations[currentLang].no_reminders;
        elements.customRemindersList.appendChild(placeholder);
        return;
    }

    // Sort by date ascending
    customReminders.sort((a,b) => new Date(a.date) - new Date(b.date));

    customReminders.forEach(rem => {
        const formattedDate = new Date(rem.date).toLocaleString(currentLang === 'ta' ? 'ta-IN' : 'en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const card = document.createElement("div");
        card.className = "reminder-item-card";
        
        card.innerHTML = `
            <div class="reminder-details">
                <h5>${rem.type}</h5>
                <p><i class="fa-solid fa-clock"></i> ${formattedDate} (${rem.crop})</p>
            </div>
            <button class="btn-delete-reminder" onclick="deleteReminder('${rem.id}')" title="Delete Schedule">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        elements.customRemindersList.appendChild(card);
    });
}

// 10. Maps & Dealership Store Locator
function initMap(regionKey) {
    const data = dealerStores[regionKey];
    if (!data) return;

    // Create Map if it doesn't exist
    if (!leafletMap) {
        // Center on default region
        leafletMap = L.map('dealer-map').setView(data.center, 13);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap);
    } else {
        leafletMap.setView(data.center, 12);
    }

    updateDealerSection(regionKey);
}

function updateDealerSection(regionKey) {
    const lang = currentLang;
    const regionData = dealerStores[regionKey];
    if (!regionData) return;

    // Reposition Map
    if (leafletMap) {
        leafletMap.setView(regionData.center, 12);
        
        // Clear old markers
        mapMarkers.forEach(marker => leafletMap.removeLayer(marker));
        mapMarkers = [];
    }

    // Load list panel
    elements.shopListContainer.innerHTML = "";

    regionData.shops.forEach((shop, index) => {
        // Create HTML Card Item
        const shopCard = document.createElement("div");
        shopCard.className = `shop-card-item ${index === 0 ? 'selected-shop' : ''}`;
        
        shopCard.innerHTML = `
            <div class="shop-item-name">${shop.name[lang]}</div>
            <div class="shop-item-addr">${shop.address[lang]}</div>
            <div class="shop-item-details">
                <span><i class="fa-solid fa-location-dot"></i> ${shop.dist} ${translations[lang].dist_km}</span>
                <a href="tel:${shop.phone}" class="shop-phone-link">
                    <i class="fa-solid fa-phone"></i> ${translations[lang].call_btn}
                </a>
            </div>
        `;

        // Click on list card centers map on marker
        shopCard.addEventListener("click", () => {
            document.querySelectorAll(".shop-card-item").forEach(c => c.classList.remove("selected-shop"));
            shopCard.classList.add("selected-shop");
            
            if (leafletMap) {
                leafletMap.setView(shop.coords, 14);
            }
        });

        elements.shopListContainer.appendChild(shopCard);

        // Add Leaflet Marker on Map
        if (leafletMap) {
            const greenIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker(shop.coords, { icon: greenIcon })
                .addTo(leafletMap)
                .bindPopup(`<b>${shop.name[lang]}</b><br>${shop.address[lang]}<br><a href="tel:${shop.phone}">${shop.phone}</a>`);
            
            mapMarkers.push(marker);
        }
    });
}

// 11. Live AI Integration (Gemini Multimodal Connection & Settings Panel)
function openSettingsModal() {
    elements.apiKeyInput.value = geminiApiKey;
    elements.settingsModal.classList.remove("hidden");
    updateAPIKeyStatus();
}

function closeSettingsModal() {
    elements.settingsModal.classList.add("hidden");
}

function toggleKeyVisibility() {
    const isPassword = elements.apiKeyInput.type === "password";
    elements.apiKeyInput.type = isPassword ? "text" : "password";
    const icon = elements.btnToggleKeyVisibility.querySelector("i");
    if (icon) {
        icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    }
}

function saveAPIKey() {
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
        alert(currentLang === 'ta' ? "தயவுசெய்து சரியான சாவியை உள்ளிடவும்!" : "Please enter a valid API key!");
        return;
    }
    geminiApiKey = key;
    localStorage.setItem("agrisense_gemini_key", key);
    updateAPIKeyStatus();
    closeSettingsModal();
}

function clearAPIKey() {
    geminiApiKey = "";
    localStorage.removeItem("agrisense_gemini_key");
    elements.apiKeyInput.value = "";
    updateAPIKeyStatus();
    closeSettingsModal();
}

function updateAPIKeyStatus() {
    const activeText = translations[currentLang].status_active;
    const simText = translations[currentLang].status_sim;
    
    if (geminiApiKey) {
        elements.apiStatusBadge.className = "api-badge badge-active";
        elements.apiStatusBadge.innerHTML = `<i class="fa-solid fa-brain"></i> <span>${activeText}</span>`;
        if (elements.settingsStatusBadge) {
            elements.settingsStatusBadge.className = "api-badge badge-active";
            elements.settingsStatusBadge.innerHTML = `<span>${activeText}</span>`;
        }
    } else {
        elements.apiStatusBadge.className = "api-badge badge-sim";
        elements.apiStatusBadge.innerHTML = `<i class="fa-solid fa-circle-dot"></i> <span>${simText}</span>`;
        if (elements.settingsStatusBadge) {
            elements.settingsStatusBadge.className = "api-badge badge-sim";
            elements.settingsStatusBadge.innerHTML = `<span>${simText}</span>`;
        }
    }
}

async function analyzeWithGeminiAPI() {
    elements.resultsPlaceholder.classList.add("hidden");
    elements.resultsDashboard.classList.add("hidden");
    elements.scanningLoader.classList.remove("hidden");
    elements.dropZone.classList.add("scanning");
    
    let progress = 0;
    elements.scanProgress.style.width = `0%`;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 3;
            elements.scanProgress.style.width = `${progress}%`;
        }
    }, 100);

    try {
        let base64Image = "";
        let mimeType = "image/jpeg";

        if (uploadedImageSrc) {
            if (uploadedImageSrc.startsWith("data:")) {
                const parts = uploadedImageSrc.split(",");
                base64Image = parts[1];
                const match = parts[0].match(/data:(.*?);/);
                if (match) mimeType = match[1];
            } else {
                base64Image = await urlToBase64(uploadedImageSrc);
            }
        } else {
            const targetCropKey = elements.btnAnalyze.getAttribute("data-target-crop");
            if (targetCropKey && cropSampleImages[targetCropKey]) {
                base64Image = await urlToBase64(cropSampleImages[targetCropKey]);
            } else {
                throw new Error("No image source found.");
            }
        }

        const prompt = `You are an expert agricultural botanist and plant pathologist. 
Analyze this crop image and identify the crop type and any diseases or health issues. 
If the crop is healthy, diagnose it as healthy (severity: low).
Provide detailed descriptions, organic treatments, chemical treatments (with fertilizer names/dosages), and a recovery schedule.

You MUST respond ONLY with a valid JSON object matching the following structure. 
Do NOT enclose the JSON in markdown code blocks (e.g. do not write \`\`\`json ... \`\`\`), and do not output any other text:
{
  "badge": {
    "en": "UPPERCASE CROP NAME (e.g. TOMATO)",
    "ta": "உயர்தர தமிழ் பயிர் பெயர் (எ.கா. தக்காளி)"
  },
  "severity": "high", // must be exactly "high", "medium", or "low"
  "title": {
    "en": "Disease Name in English (e.g. Late Blight)",
    "ta": "நோய் பெயர் தமிழில் (எ.கா. இலை கருகல் நோய்)"
  },
  "description": {
    "en": "Detailed description of the disease, causes, and impacts in English.",
    "ta": "நோயின் விவரம், காரணம் மற்றும் விளைவுகள் பற்றிய விரிவான தமிழ் விளக்கம்."
  },
  "organicRemedies": {
    "en": [
      "Organic remedy 1 in English",
      "Organic remedy 2 in English",
      "Organic remedy 3 in English"
    ],
    "ta": [
      "இயற்கை தீர்வு 1 தமிழில்",
      "இயற்கை தீர்வு 2 தமிழில்",
      "இயற்கை தீர்வு 3 தமிழில்"
    ]
  },
  "chemicalRemedies": {
    "en": [
      "Chemical pesticide or fertilizer remedy 1 in English",
      "Chemical pesticide or fertilizer remedy 2 in English",
      "Chemical pesticide or fertilizer remedy 3 in English"
    ],
    "ta": [
      "செயற்கை மருந்து அல்லது உரம் 1 தமிழில்",
      "செயற்கை மருந்து அல்லது உரம் 2 தமிழில்",
      "செயற்கை மருந்து அல்லது உரம் 3 தமிழில்"
    ]
  },
  "timeline": [
    {
      "day": 1,
      "title": { "en": "Step 1 Title English", "ta": "படி 1 தலைப்பு தமிழ்" },
      "desc": { "en": "Step 1 Action Description English", "ta": "படி 1 செயல் விளக்கம் தமிழ்" }
    },
    {
      "day": 3,
      "title": { "en": "Step 2 Title English", "ta": "படி 2 தலைப்பு தமிழ்" },
      "desc": { "en": "Step 2 Action Description English", "ta": "படி 2 செயல் விளக்கம் தமிழ்" }
    },
    {
      "day": 7,
      "title": { "en": "Step 3 Title English", "ta": "படி 3 தலைப்பு தமிழ்" },
      "desc": { "en": "Step 3 Action Description English", "ta": "படி 3 செயல் விளக்கம் தமிழ்" }
    },
    {
      "day": 14,
      "title": { "en": "Step 4 Title English", "ta": "படி 4 தலைப்பு தமிழ்" },
      "desc": { "en": "Step 4 Action Description English", "ta": "படி 4 செயல் விளக்கம் தமிழ்" }
    }
  ]
}`;

        let apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        let response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // Fallback: If production stable v1 endpoint fails, retry with v1beta
        if (!response.ok) {
            console.warn(`Primary v1 endpoint failed with status ${response.status}. Retrying with v1beta...`);
            const betaURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
            response = await fetch(betaURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
            throw new Error("No analysis text returned from Gemini AI.");
        }

        const parsedResult = JSON.parse(candidateText.trim());

        clearInterval(progressInterval);
        elements.scanProgress.style.width = "100%";

        setTimeout(() => {
            elements.scanningLoader.classList.add("hidden");
            elements.resultsDashboard.classList.remove("hidden");
            elements.dropZone.classList.remove("scanning");

            currentCropData = parsedResult;
            displayCropResults(currentCropData);
            switchTab('tab-diagnosis');
            speakDiagnosisResult();
        }, 300);

    } catch (error) {
        clearInterval(progressInterval);
        elements.scanningLoader.classList.add("hidden");
        elements.dropZone.classList.remove("scanning");
        
        console.error("Gemini API Error:", error);
        
        const isTamil = currentLang === 'ta';
        const errorMsg = isTamil 
            ? `AI ஆல் படத்தை பரிசோதிக்க முடியவில்லை! உங்களது API சாவி தவறாக இருக்கலாம் அல்லது இணைய இணைப்பில் கோளாறு இருக்கலாம். \n\nஆஃப்லைன் மாதிரியைப் பயன்படுத்த விரும்புகிறீர்களா?` 
            : `AI could not analyze the image! Your API Key might be invalid or there is a network issue. \n\nWould you like to run the Offline Simulation instead?`;
        
        if (confirm(errorMsg)) {
            geminiApiKey = "";
            triggerMockAnalysis();
            geminiApiKey = localStorage.getItem("agrisense_gemini_key") || "";
        } else {
            elements.resultsPlaceholder.classList.remove("hidden");
        }
    }
}

async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const parts = reader.result.split(",");
                resolve(parts[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Base64 conversion failed, returning mock empty image data", e);
        return "";
    }
}
