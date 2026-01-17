import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const teamFaqs: FAQItem[] = [
  {
    question: "What should I do if a patient notifies us they are moving?",
    answer: "When a patient informs you they're moving, immediately check this state map to verify if their new state is covered for their specific service (TRT, HRT, or GLP). If the new state is available, inform the patient they can continue services after updating their address. If not covered, explain that services will need to be paused until we expand to that state, and offer to notify them when coverage becomes available."
  },
  {
    question: "How do I verify if we can serve a new patient in their state?",
    answer: "Use the 'Check My State' feature on this map or select the specific service tab (TRT, HRT, or GLP) to see if the patient's state is highlighted in color (available) or gray (coming soon). Remember that coverage varies by service—a state may be available for GLP but not for TRT, so always check the specific service the patient needs."
  },
  {
    question: "A patient moved to an uncovered state—what are their options?",
    answer: "If a patient moves to a state we don't cover: 1) Inform them we cannot legally prescribe to their new address, 2) Cancel or pause their active subscription, 3) Note their new state in their file, 4) Add them to the waitlist for that state, and 5) Let them know we're actively expanding and will reach out when their state becomes available."
  },
  {
    question: "How do I handle a patient traveling temporarily vs. moving permanently?",
    answer: "For temporary travel (vacation, business trip): Patients can continue using existing prescriptions they have on hand. For permanent moves: The patient's address of record must be updated, and we need to verify coverage in the new state. If moving to an uncovered state, services must be paused until we expand there."
  },
  {
    question: "What if a patient has multiple services and moves to a partially covered state?",
    answer: "Check each service individually using this map. For example, if a patient has both TRT and GLP and moves to Kentucky, you'd see GLP is available but TRT is not. The patient could continue GLP services but would need to pause TRT until we expand TRT coverage to Kentucky."
  },
  {
    question: "How should I document state-related coverage changes?",
    answer: "Always document: 1) The patient's previous state, 2) Their new state, 3) Date of the move, 4) Which services were affected, 5) Actions taken (paused, continued, waitlisted), and 6) Any communications sent to the patient. Use the CSV download feature to keep records of current state coverage for reference."
  },
  {
    question: "How often is this state map updated?",
    answer: "This map is updated whenever we expand to new states or add new services to existing states. Team members will receive notifications about coverage changes. If you notice a discrepancy or have questions about recent changes, contact the operations team for clarification."
  },
  {
    question: "Can I download a list of covered states for reference?",
    answer: "Yes! On each service map, use the 'Download CSV' buttons to export the current list of active states for that service, or download all services combined. This is useful for offline reference or sharing with other team members."
  },
  {
    question: "How do I use the Compare page?",
    answer: "The Compare page shows state coverage across all three services (TRT, HRT, GLP) side by side. Use it to quickly see which states have all services, which have partial coverage, and compare coverage percentages. This is helpful when advising patients about service availability in different states."
  },
  {
    question: "What's the quickest way to check a specific state?",
    answer: "Use the search bar at the top of any service map and type the state name or abbreviation. You can also click directly on a state in the map, or use the 'Check My State' button to see all services available in any state at once."
  },
  {
    question: "How do I share state coverage information with a colleague?",
    answer: "You can share a direct link to a specific service view using URL parameters. The URL automatically updates when you select different services or views. You can also use the CSV download feature to share coverage lists via email or internal systems."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white">
          Staff Reference Guide
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Guidelines for using the state coverage map
        </p>
      </div>

      <div className="space-y-3">
        {teamFaqs.map((faq, index) => {
          const key = `faq-${index}`;
          return (
            <div 
              key={key}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === key ? null : key)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-fountain-dark dark:text-white pr-4">
                  {faq.question}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === key ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === key && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
