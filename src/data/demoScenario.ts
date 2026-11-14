import {
  EvidenceState,
  LanguageCode,
  FeatureMetadata,
  BarrierOption,
  EvidenceOption,
  PathwayResult,
} from '../types/accessibility';

export const FEATURES: FeatureMetadata[] = [
  {
    id: 'what-if-pathways',
    title: 'What-If Pathways',
    subtitle: 'Alternative Discovery & Evidence Checker',
    description:
      'Instructions can be clear and still be impossible for someone to follow. Explore documented alternatives and pinpoint what the source does not say.',
    position: [-2.6, 0.4, 0.5],
    badge: '01 / CORE ENGINE',
  },
  {
    id: 'live-sign-captions',
    title: 'Live Sign & Captions',
    subtitle: 'Synchronous Spatial Transmodal Bridge',
    description:
      'Simulated multi-channel visual interpreter linking real-time text streams with spatial sign cues and phonetic cadence indicators.',
    position: [2.5, 0.8, -0.6],
    badge: '02 / SENSORY SYNC',
  },
  {
    id: 'vernacular-bridge',
    title: 'Vernacular Bridge',
    subtitle: 'Nuance-Preserving Dialect Adapter',
    description:
      'Contextual translation layer tuned for administrative, academic, and civic notices across regional dialects without procedural distortion.',
    position: [0.2, -1.8, 1.8],
    badge: '03 / REGIONAL ADAPTER',
  },
];

export const DEMO_NOTICE = {
  institution: 'Apex Metropolitan University',
  department: 'Office of the Academic Registrar',
  documentTitle: 'Notice REG-2026-44: Mandatory In-Person Verification for Semester Enrollment',
  date: 'Spring Term 2026',
  disclaimer: 'SAMPLE DEMO NOTICE — Non-factual fictional scenario for interface evaluation',
  rawText:
    'All registered candidates must present their physical student verification dossier at Student Services Hall, Room 204, between 09:00 and 16:00, no later than Friday, October 24th. The dossier must contain a signed paper registration receipt printed from the portal. Failure to present the dossier in person will result in a 14-day hold on laboratory privileges. In exceptional circumstances involving registered disability or off-campus distance programs, consult the Dean of Students portal sub-clause 4.B.',
  simplifiedText:
    'Apex University requires students to show printed, signed enrollment papers in Room 204 by October 24th at 4:00 PM. If not completed, lab access is paused for 14 days. Students with approved remote or disability accommodations may check portal section 4.B for alternate submission.',
};

export const BARRIERS: BarrierOption[] = [
  {
    id: 'cant-visit-office',
    label: "I can't visit the office",
    description: 'Mobility constraints, distance, scheduling clash, or health vulnerability prevent visiting Room 204.',
  },
  {
    id: 'no-printer-access',
    label: "I don't have access to a printer",
    description: 'Hardware unavailable, cartridge exhaustion, or no digital-to-physical print station nearby.',
  },
  {
    id: 'cant-make-phone-call',
    label: "I can't make a phone call",
    description: 'Hearing or speech barrier, auditory processing difference, or telephonic anxiety.',
  },
  {
    id: 'missed-stated-deadline',
    label: 'I missed the stated deadline',
    description: 'Emergency, acute flare-up, or delayed communication after October 24th cutoff.',
  },
];

export const EVIDENCE_STATES: EvidenceOption[] = [
  {
    state: 'source-supported',
    title: 'Alternative stated in source',
    description: 'The source notice explicitly mentions a recognized exception, portal route, or authorized alternate protocol.',
    tag: 'Documented Alternative',
  },
  {
    state: 'information-not-specified',
    title: 'Alternative not specified',
    description: 'The notice commands compliance but is completely silent regarding alternatives, waivers, or remote contingencies.',
    tag: 'Policy Silence / Gap',
  },
  {
    state: 'source-ambiguous',
    title: 'Source wording is unclear',
    description: 'The notice references an exception or procedure in vague, conditional, or contradictory language.',
    tag: 'Ambiguous Exception',
  },
];

export const PATHWAY_RESULTS: Record<string, Record<EvidenceState, PathwayResult>> = {
  'cant-visit-office': {
    'source-supported': {
      headline: 'Documented Alternate: Portal Accommodation Route (Sub-clause 4.B)',
      statusLabel: 'Source-Supported Alternative',
      body: 'The notice explicitly notes an exception: candidates with registered disability status or off-campus distance programs may submit verification electronically via the Dean of Students portal sub-clause 4.B without in-person appearance.',
      sourceQuote: '"...In exceptional circumstances involving registered disability or off-campus distance programs, consult the Dean of Students portal sub-clause 4.B."',
      suggestedAction: 'Navigate to Dean of Students portal section 4.B and submit digital identity verification before Friday 16:00.',
      defaultQuestion:
        'Dear Registrar, regarding Notice REG-2026-44, I am unable to visit Room 204 in person due to health/distance constraints. Per sub-clause 4.B, could you confirm if submitting my digital dossier through the Dean of Students portal fully satisfies this requirement?',
    },
    'information-not-specified': {
      headline: 'Unaddressed Barrier: Notice Has No Remote Contingency for General Students',
      statusLabel: 'Information Not Specified in Source',
      body: 'The notice specifies an in-person requirement at Room 204 but omits any procedure for students who cannot attend due to temporary illness, caregiving obligations, or transport disruptions.',
      sourceQuote: '"All registered candidates must present their physical student verification dossier at Student Services Hall, Room 204..."',
      suggestedAction: 'Submit a proactive clarification request to the Registrar requesting an authorized digital proxy or email submission.',
      defaultQuestion:
        'Dear Registrar, regarding Notice REG-2026-44, I am unable to visit Room 204 in person before October 24th due to medical/mobility barriers. As the notice does not state a remote submission procedure for general students, may I submit a scanned PDF via student email or designate an authorized proxy?',
    },
    'source-ambiguous': {
      headline: 'Ambiguous Exception: "Exceptional Circumstances" Scope Unclear',
      statusLabel: 'Source Wording is Ambiguous',
      body: 'The notice states "In exceptional circumstances... consult sub-clause 4.B", but does not define what qualifications count or whether prior registration with the disability office is required in advance.',
      sourceQuote: '"In exceptional circumstances involving registered disability or off-campus distance programs, consult the Dean of Students portal sub-clause 4.B."',
      suggestedAction: 'Ask for prompt administrative clarification on whether your specific condition qualifies under sub-clause 4.B.',
      defaultQuestion:
        'Dear Registrar, Notice REG-2026-44 mentions an exception for exceptional circumstances under sub-clause 4.B. Could you clarify whether this applies to short-term medical restrictions that prevent visiting Room 204, and what exact documentation is needed?',
    },
  },

  'no-printer-access': {
    'source-supported': {
      headline: 'Documented Alternative: Electronic Sign-Off Recognized',
      statusLabel: 'Source-Supported Alternative',
      body: 'The companion student handbook provision states that when university print kiosks are offline, a digitally signed PDF with timestamped student ID hash is acceptable in lieu of a printed dossier.',
      sourceQuote: '"...or verified digital certificate through the campus identity gateway."',
      suggestedAction: 'Export your signed verification form as a PDF and display the barcode or submit via digital portal.',
      defaultQuestion:
        'Dear Registrar, I do not have access to a printer to create a physical dossier for Notice REG-2026-44. Can you confirm if presenting the digitally signed PDF on a mobile device or forwarding it via the portal fulfills the verification requirement?',
    },
    'information-not-specified': {
      headline: 'Missing Information: Notice Mandates Paper Dossier Without Print Provision',
      statusLabel: 'Information Not Specified in Source',
      body: 'The notice strictly commands a "signed paper registration receipt printed from the portal" but gives no instructions for students without access to functioning printers or on-campus printing funds.',
      sourceQuote: '"The dossier must contain a signed paper registration receipt printed from the portal."',
      suggestedAction: 'Request permission to display the digital receipt on a phone screen or ask if staff can print the dossier on arrival.',
      defaultQuestion:
        'Dear Student Services, Notice REG-2026-44 requires a printed registration receipt. I do not currently have access to a printer or campus print credits. May staff print this receipt from my student ID upon arrival, or may I display the digital confirmation?',
    },
    'source-ambiguous': {
      headline: 'Ambiguous Requirement: "Signed Paper Receipt" vs Digital Portal Records',
      statusLabel: 'Source Wording is Ambiguous',
      body: 'The notice instructs students to generate receipts from the portal but requires physical paper submission, leaving unclear whether a stylus-signed digital PDF or paper-only document is required.',
      sourceQuote: '"...must contain a signed paper registration receipt printed from the portal."',
      suggestedAction: 'Confirm whether an electronic signature satisfies the "signed" clause prior to printing.',
      defaultQuestion:
        'Dear Registrar, does Notice REG-2026-44 accept an electronically signed PDF uploaded to the portal, or is an ink signature on paper mandatory for Room 204 intake?',
    },
  },

  'cant-make-phone-call': {
    'source-supported': {
      headline: 'Documented Alternative: TTY & Async Desk Inquiry Available',
      statusLabel: 'Source-Supported Alternative',
      body: 'The university accessibility directory lists an active asynchronous support desk and real-time chat gateway as recognized communication equivalents to voice telephone calls.',
      sourceQuote: '"Inquiries may be directed to Student Services text-line at ext-204-CHAT or ticket #REG-ACC."',
      suggestedAction: 'Use the text-based support ticket portal or university live-chat channel.',
      defaultQuestion:
        'Hello Student Services team, as an individual with an auditory/speech barrier unable to place phone calls, I am writing to confirm receipt of my registration query regarding Notice REG-2026-44 via this text channel.',
    },
    'information-not-specified': {
      headline: 'Accessibility Gap: Notice Only Lists Telephone Helpline for Queries',
      statusLabel: 'Information Not Specified in Source',
      body: 'The notice advises students with scheduling questions to call the central hotline, offering no email address, text relay, or asynchronous contact channel for deaf, hard-of-hearing, or non-speaking students.',
      sourceQuote: '"For questions concerning dossier intake, call the Registrar Hotline at 555-0199."',
      suggestedAction: 'Initiate communication via the official administrative email and request asynchronous correspondence.',
      defaultQuestion:
        'Dear Registrar Office, I am unable to use the telephone hotline listed in Notice REG-2026-44 due to a speech/hearing barrier. Could you please provide an official email address or async portal ticket for submitting intake queries?',
    },
    'source-ambiguous': {
      headline: 'Ambiguous Channel: "Contact Office Before October 24" Method Unstated',
      statusLabel: 'Source Wording is Ambiguous',
      body: 'The notice instructs students to "contact the office" for conflicts, but fails to define whether voicemail, email, or physical appointment is the official notification benchmark.',
      sourceQuote: '"Candidates with conflicts should contact the office prior to Friday."',
      suggestedAction: 'Clarify which digital channels constitute valid, timestamped contact before the cutoff.',
      defaultQuestion:
        'Dear Registrar, Notice REG-2026-44 asks candidates to contact the office prior to Friday. Does submitting this email message count as official contact, or is another specific text-based channel required?',
    },
  },

  'missed-stated-deadline': {
    'source-supported': {
      headline: 'Documented Alternative: 5-Day Retroactive Grace Period Protocol',
      statusLabel: 'Source-Supported Alternative',
      body: 'University Academic Policy Section 12.3 permits a 5-business-day retroactive cure window with a late filing declaration form before laboratory privilege holds are enforced.',
      sourceQuote: '"Subject to standard late verification provisions in Academic Policy 12.3."',
      suggestedAction: 'File the Academic Policy 12.3 Late Declaration Form immediately via the student portal.',
      defaultQuestion:
        'Dear Registrar, I missed the October 24th deadline for Notice REG-2026-44 due to unforeseen circumstances. I am submitting this request under Academic Policy 12.3 for the 5-day cure window to avoid holds on my laboratory privileges.',
    },
    'information-not-specified': {
      headline: 'Strict Penalty Without Relief: Notice Silent on Late Filing or Appeals',
      statusLabel: 'Information Not Specified in Source',
      body: 'The notice imposes an automatic 14-day hold on laboratory privileges for missing the October 24th date, with no mention of grace periods, appeal routes, or medical exceptions.',
      sourceQuote: '"Failure to present the dossier in person will result in a 14-day hold on laboratory privileges."',
      suggestedAction: 'File an emergency petition for retroactive verification with supporting documentation.',
      defaultQuestion:
        'Dear Academic Registrar, I was unable to complete the Notice REG-2026-44 verification by October 24th due to an emergency. As the notice does not describe an appeal or late-submission pathway, how may I petition for provisional clearance?',
    },
    'source-ambiguous': {
      headline: 'Contradictory Penalty Clause: Immediate Hold vs 14-Day Hold Period',
      statusLabel: 'Source Wording is Ambiguous',
      body: 'The notice is unclear on whether the 14-day hold begins immediately on October 25th or if students receive a reminder window before lab access is deactivated.',
      sourceQuote: '"...will result in a 14-day hold on laboratory privileges."',
      suggestedAction: 'Clarify the exact effective date of privileges suspension and expedited reinstatement steps.',
      defaultQuestion:
        'Dear Registrar, regarding Notice REG-2026-44, could you clarify when the 14-day laboratory hold takes effect, and what expedited procedure exists to verify my dossier and restore access?',
    },
  },
};

export const UI_STRINGS: Record<LanguageCode, Record<string, string>> = {
  en: {
    appTitle: 'AetherLens',
    appSubtitle: 'Inclusive Spatial Interface',
    whatIfEngine: 'What-If Pathway Engine',
    calmMode: 'Calm Mode',
    calmModeActive: 'Calm Mode Active',
    calmModeStaticPrompt: '3D motion paused. High-contrast static view enabled.',
    motionPausedBySystem: 'Motion paused by operating system prefers-reduced-motion.',
    holdToSpeak: 'Hold to Speak',
    holdToSpeakHint: 'Hold or click to simulate voice input (Demo visual only)',
    listeningSimulated: 'Listening... (simulated voice stream)',
    simplifyView: 'Simplify View',
    simplifyViewActive: 'Simplified View Active',
    standardViewActive: 'Standard View Active',
    closeDrawer: 'Close Drawer',
    fictionalNoticeBadge: 'DEMO CONTENT • FICTIONAL SCENARIO',
    sourceDocument: 'Source Document',
    selectBarrier: '1. Select the barrier you face:',
    selectEvidence: '2. Select simulated evidence state:',
    pathwayAnalysis: '3. What-If Pathway Analysis:',
    clarificationQuestion: '4. Editable Clarification Question:',
    copyQuestion: 'Copy Clarification Question',
    copiedSuccess: 'Copied to clipboard!',
    copyFallbackPrompt: 'Press Ctrl+C to copy selected question',
    exploreNode: 'Explore Feature',
    dockInstruction: 'Select any spatial node or use the dock tools to examine inclusion pathways.',
    disclaimerBanner:
      'Notice: This interface is a frontend design demo. All pathway conclusions and notices are simulated sample content and do not constitute actual legal or institutional advice.',
    feature1Name: 'What-If Pathways',
    feature2Name: 'Live Sign & Captions',
    feature3Name: 'Vernacular Bridge',
  },
  hi: {
    appTitle: 'AetherLens',
    appSubtitle: 'समावेशी स्थानिक इंटरफ़ेस (Inclusive Spatial Interface)',
    whatIfEngine: 'व्हाट-इफ़ पाथवे इंजन (What-If Pathway Engine)',
    calmMode: 'शांत मोड (Calm Mode)',
    calmModeActive: 'शांत मोड सक्रिय',
    calmModeStaticPrompt: '3D गति रुकी हुई है। उच्च-कंट्रास्ट स्थिर दृश्य सक्रिय।',
    motionPausedBySystem: 'सिस्टम वरीयता द्वारा गति रुकी हुई है।',
    holdToSpeak: 'बोलने के लिए दबाएं (Hold to Speak)',
    holdToSpeakHint: 'आवाज़ इनपुट का अनुकरण (केवल डेमो)',
    listeningSimulated: 'सुन रहा है... (डेमो ध्वनि)',
    simplifyView: 'सरल दृश्य (Simplify View)',
    simplifyViewActive: 'सरल दृश्य सक्रिय',
    standardViewActive: 'मानक दृश्य सक्रिय',
    closeDrawer: 'बंद करें (Close)',
    fictionalNoticeBadge: 'डेमो सामग्री • काल्पनिक परिदृश्य',
    sourceDocument: 'स्रोत सूचना (Source Notice)',
    selectBarrier: '1. अपनी बाधा चुनें:',
    selectEvidence: '2. साक्ष्य स्थिति चुनें:',
    pathwayAnalysis: '3. व्हाट-इफ़ पाथवे विश्लेषण:',
    clarificationQuestion: '4. स्पष्टीकरण प्रश्न (संपादन योग्य):',
    copyQuestion: 'प्रश्न कॉपी करें (Copy)',
    copiedSuccess: 'क्लिपबोर्ड पर कॉपी किया गया!',
    copyFallbackPrompt: 'कॉपी करने के लिए Ctrl+C दबाएं',
    exploreNode: 'सुविधा देखें',
    dockInstruction: 'स्थानिक नोड चुनें या टूल्स का उपयोग करें।',
    disclaimerBanner:
      'सूचना: यह केवल एक फ्रंट-एंड डेमो है। सभी परिणाम केवल उदाहरण हैं।',
    feature1Name: 'व्हाट-इफ़ पाथवे (What-If Pathways)',
    feature2Name: 'लाइव साइन और कैप्शन (Live Sign & Captions)',
    feature3Name: 'क्षेत्रीय सेतु (Vernacular Bridge)',
  },
  ta: {
    appTitle: 'AetherLens',
    appSubtitle: 'உள்ளடக்கிய இடஞ்சார்ந்த இடைமுகம் (Inclusive Spatial Interface)',
    whatIfEngine: 'மாற்று வழிப்பாதை பொறி (What-If Pathway Engine)',
    calmMode: 'அமைதியான முறை (Calm Mode)',
    calmModeActive: 'அமைதியான முறை செயலில் உள்ளது',
    calmModeStaticPrompt: '3D இயக்கம் இடைநிறுத்தப்பட்டது. நிலையான காட்சி.',
    motionPausedBySystem: 'கணினி அமைப்பால் இயக்கம் இடைநிறுத்தப்பட்டது.',
    holdToSpeak: 'பேச அழுத்தவும் (Hold to Speak)',
    holdToSpeakHint: 'குரல் உள்ளீட்டு உருவகப்படுத்துதல் (டெமோ)',
    listeningSimulated: 'கேட்கிறது... (டெமோ ஒலி)',
    simplifyView: 'எளிய பார்வை (Simplify View)',
    simplifyViewActive: 'எளிய பார்வை செயலில் உள்ளது',
    standardViewActive: 'நிலையான பார்வை செயலில் உள்ளது',
    closeDrawer: 'மூடு (Close)',
    fictionalNoticeBadge: 'மாதிரி உள்ளடக்கம் • கற்பனை காட்சி',
    sourceDocument: 'மூல அறிவிப்பு (Source Notice)',
    selectBarrier: '1. உங்கள் தடையைத் தேர்ந்தெடுக்கவும்:',
    selectEvidence: '2. சான்று நிலையைத் தேர்ந்தெடுக்கவும்:',
    pathwayAnalysis: '3. வழிப்பாதை பகுப்பாய்வு:',
    clarificationQuestion: '4. தெளிவுபடுத்தும் கேள்வி (திருத்தக்கூடியது):',
    copyQuestion: 'கேள்வியை நகலெடு (Copy)',
    copiedSuccess: 'நகலெடுக்கப்பட்டது!',
    copyFallbackPrompt: 'நகலெடுக்க Ctrl+C அழுத்தவும்',
    exploreNode: 'ஆராயுங்கள்',
    dockInstruction: 'முனையைத் தேர்ந்தெடுக்கவும் அல்லது கருவிகளைப் பயன்படுத்தவும்.',
    disclaimerBanner:
      'அறிவிப்பு: இது ஒரு காட்சி மாதிரி மட்டுமே. உண்மையான ஆலோசனை அல்ல.',
    feature1Name: 'மாற்று வழிகள் (What-If Pathways)',
    feature2Name: 'நேரலை சைகை மற்றும் தலைப்புகள் (Live Sign & Captions)',
    feature3Name: 'மொழி பாலம் (Vernacular Bridge)',
  },
  bn: {
    appTitle: 'AetherLens',
    appSubtitle: 'অন্তর্ভুক্তিমূলক স্থানিক ইন্টারফেস (Inclusive Spatial Interface)',
    whatIfEngine: 'হোয়াট-ইফ পথ ইঞ্জিন (What-If Pathway Engine)',
    calmMode: 'শান্ত মোড (Calm Mode)',
    calmModeActive: 'শান্ত মোড সক্রিয়',
    calmModeStaticPrompt: '3D গতি স্থগিত। উচ্চ-কন্ট্রাস্ট স্থির দৃশ্য সক্রিয়।',
    motionPausedBySystem: 'সিস্টেম পছন্দ দ্বারা গতি স্থগিত।',
    holdToSpeak: 'কথা বলতে চেপে রাখুন (Hold to Speak)',
    holdToSpeakHint: 'ভয়েস ইনপুট ডেমো (সিমুলেটেড)',
    listeningSimulated: 'শুনছি... (ডেমো সাউন্ড)',
    simplifyView: 'সহজ দৃশ্য (Simplify View)',
    simplifyViewActive: 'সহজ দৃশ্য সক্রিয়',
    standardViewActive: 'মানক দৃশ্য সক্রিয়',
    closeDrawer: 'বন্ধ করুন (Close)',
    fictionalNoticeBadge: 'ডেমো বিষয়বস্তু • কাল্পনিক দৃশ্যকল্প',
    sourceDocument: 'উৎস নোটিশ (Source Notice)',
    selectBarrier: '১. আপনার বাধা নির্বাচন করুন:',
    selectEvidence: '২. প্রমাণের অবস্থা নির্বাচন করুন:',
    pathwayAnalysis: '৩. পথ বিশ্লেষণ:',
    clarificationQuestion: '৪. স্পষ্টীকরণ প্রশ্ন (সম্পাদনাযোগ্য):',
    copyQuestion: 'প্রশ্ন কপি করুন (Copy)',
    copiedSuccess: 'ক্লিপবোর্ডে কপি করা হয়েছে!',
    copyFallbackPrompt: 'কপি করতে Ctrl+C চাপুন',
    exploreNode: 'অন্বেষণ করুন',
    dockInstruction: 'স্থানিক নোড বেছে নিন বা নিচের টুল ব্যবহার করুন।',
    disclaimerBanner:
      'বিজ্ঞপ্তি: এটি শুধুমাত্র একটি ফ্রন্ট-এন্ড ডেমো ইন্টারফেস।',
    feature1Name: 'হোয়াট-ইফ পথ (What-If Pathways)',
    feature2Name: 'লাইভ সাইন ও ক্যাপশন (Live Sign & Captions)',
    feature3Name: 'আঞ্চলিক সেতু (Vernacular Bridge)',
  },
};
