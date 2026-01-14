import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
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
  },
  {
    question: "What is Fountain State Planning?",
    answer: "Fountain State Planning provides comprehensive planning services to help you navigate important life decisions. Our expert team offers personalized guidance to help you prepare for the future with the right strategies and resources in place."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="font-medium text-fountain-dark dark:text-white pr-4">
                {faq.question}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openIndex === index && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


