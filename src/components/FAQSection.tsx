import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "We strive to process and ship all orders within 24-48 hours. Standard domestic shipping typically takes 3-5 business days."
  },
  {
    question: "How can I track my delivery?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number. You can use this to track your package on our website's 'Order Tracking' page."
  },
  {
    question: "What is your quality guarantee?",
    answer: "We pride ourselves on the quality of our products. All items undergo rigorous testing before shipment. If you are unsatisfied, please contact our support team within 30 days of delivery."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within the country. We are actively working on expanding to international markets."
  }
];

const AccordionItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left"
      >
        <span className="text-lg font-semibold text-[#071E38]">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-[#12A5B0]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-[#071E38] mb-10 text-center">Frequently Asked Questions</h2>
        <div className="divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};
