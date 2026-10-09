import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const comparisonData = [
    {
      feature: 'Learning Format',
      pynotes: 'Printed physical spiral book on your desk — zero screen fatigue',
      others: '800-page PDF dump or blurry pirated drive link'
    },
    {
      feature: 'Visual Explanations',
      pynotes: 'Hand-drawn memory trees, V8 call stacks & execution graphs',
      others: 'Dense walls of dry, monotonous academic text'
    },
    {
      feature: 'Interview Preparation',
      pynotes: 'Curated 15 algorithmic patterns & FAANG interview cheat cards',
      others: 'Theoretical academic syllabus rarely asked in tech rounds'
    },
    {
      feature: 'Paper Quality',
      pynotes: '100 GSM heavy opaque paper, non-bleed, spiral lay-flat binding',
      others: 'Cheap newsprint or self-printed loose sheets that tear'
    },
    {
      feature: 'Revision Speed',
      pynotes: 'Revise an entire 200-page subject in under 3 hours before an exam',
      others: 'Weeks of highlighting without retaining core mental models'
    }
  ];

  return (
    <section className="py-14 bg-[#F7FAFC] border-b border-[#CED7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#DDF3F4] text-[#0B3561] text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
            <span>The PyNotes Visual System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B3561] tracking-tight font-heading">
            Why engineers choose PyNotes over 1,000-page textbooks
          </h2>
          <p className="mt-2 text-[#3C5D81] text-sm sm:text-base font-body">
            Designed for human brains that learn through sketches, visual analogies, and practical mental models.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-[#CED7DF] rounded-3xl bg-white shadow-2xs">
              <table className="min-w-full divide-y divide-[#CED7DF] text-left text-xs sm:text-sm font-body">
                <thead>
                  <tr className="bg-[#F7FAFC]">
                    <th scope="col" className="py-4 px-6 font-bold text-[#6D86A0] w-1/4 font-heading uppercase text-xs">
                      Aspect
                    </th>
                    <th scope="col" className="py-4 px-6 font-black text-[#0B3561] bg-[#DDF3F4]/60 border-x border-[#A0DBDF] w-5/12 font-heading">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#12A5B0]"></span>
                        <span>PyNotes Visual Handwritten Books</span>
                      </div>
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-[#6D86A0] w-5/12 font-heading text-xs uppercase">
                      Standard Textbooks & Random PDFs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EBEF]">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAFC]/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#0B3561]">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#071E38] bg-[#DDF3F4]/20 border-x border-[#A0DBDF]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#DDF3F4] text-[#12A5B0] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>{row.pynotes}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#6D86A0]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#E7EBEF] text-[#9DAEC0] flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span>{row.others}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4 Result Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-5 rounded-2xl border border-[#CED7DF] text-center shadow-2xs">
            <div className="text-3xl font-black text-[#0B3561] font-heading">45,000+</div>
            <div className="text-xs font-bold text-[#071E38] mt-1 font-heading">Printed Books Dispatched</div>
            <div className="text-[10px] text-[#6D86A0] mt-0.5">Pan-India Express Logistics</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CED7DF] text-center shadow-2xs">
            <div className="text-3xl font-black text-[#12A5B0] font-heading">94.2%</div>
            <div className="text-xs font-bold text-[#071E38] mt-1 font-heading">Exam & Placement Success</div>
            <div className="text-[10px] text-[#6D86A0] mt-0.5">From 1,200 Student Survey</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CED7DF] text-center shadow-2xs">
            <div className="text-3xl font-black text-[#0B3561] font-heading">4.9 / 5</div>
            <div className="text-xs font-bold text-[#071E38] mt-1 font-heading">Verified Customer Rating</div>
            <div className="text-[10px] text-[#6D86A0] mt-0.5">From 3,800+ Verified Buyers</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CED7DF] text-center shadow-2xs">
            <div className="text-3xl font-black text-[#12A5B0] font-heading">3 - 5 Days</div>
            <div className="text-xs font-bold text-[#071E38] mt-1 font-heading">Average Delivery Time</div>
            <div className="text-[10px] text-[#6D86A0] mt-0.5">Doorstep Express Across India</div>
          </div>
        </div>
      </div>
    </section>
  );
};
