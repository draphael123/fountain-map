import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const generalFaqs: FAQItem[] = [
  {
    question: "How do I know if I qualify for Fountain services?",
    answer: "Qualification depends on the specific service. For TRT, you'll need blood work showing low testosterone levels. For HRT, symptoms of hormonal imbalance are assessed. For GLP-1 weight loss, BMI and health history are evaluated. Our licensed providers will guide you through an online consultation to determine eligibility."
  },
  {
    question: "Why isn't my state available yet?",
    answer: "Healthcare regulations vary by state, and we must obtain proper licensing and establish compliant partnerships in each state before offering services. We're actively working to expand our coverage and add new states regularly."
  },
  {
    question: "When will services expand to my state?",
    answer: "We're continuously expanding! While we can't provide specific timelines, we prioritize states based on demand and regulatory feasibility. Check back regularly or follow our updates for the latest expansion news."
  },
  {
    question: "Can I use Fountain services if I travel between states?",
    answer: "Your prescriptions and treatments are tied to your state of residence where you were evaluated. If you move permanently to a new state where we operate, you may need to complete a new consultation to continue services in compliance with that state's regulations."
  },
  {
    question: "What's the difference between TRT and HRT?",
    answer: "TRT (Testosterone Replacement Therapy) is specifically designed for men experiencing low testosterone levels. HRT (Hormone Replacement Therapy) is tailored for women dealing with hormonal imbalances, particularly during perimenopause and menopause. Both involve personalized treatment plans but address different hormonal needs."
  },
  {
    question: "How does the GLP-1 weight loss program work?",
    answer: "Our GLP-1 program uses FDA-approved medications that help regulate appetite and blood sugar levels, promoting sustainable weight loss. You'll work with our providers to create a comprehensive plan including medication management, dosage adjustments, and ongoing support."
  },
  {
    question: "Are consultations done online or in-person?",
    answer: "All Fountain consultations are conducted online through our secure telehealth platform. This allows you to connect with licensed providers from the comfort of your home while receiving the same quality of care as an in-person visit."
  }
];

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
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const renderFAQSection = (faqs: FAQItem[], prefix: string) => (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const key = `${prefix}-${index}`;
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
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Find answers to common questions about our services
        </p>
      </div>

      {/* Team Operations Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-fountain-dark dark:text-white">Team Operations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Guidelines for handling state coverage</p>
          </div>
        </div>
        {renderFAQSection(teamFaqs, 'team')}
      </div>

      {/* General Questions Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-fountain-trt/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-fountain-trt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-fountain-dark dark:text-white">General Questions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Common patient inquiries</p>
          </div>
        </div>
        {renderFAQSection(generalFaqs, 'general')}
      </div>
    </div>
  );
}


