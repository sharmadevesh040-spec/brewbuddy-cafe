import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext.js';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Feedback',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please provide your name';
    if (!form.email.trim()) {
      errs.email = 'Please provide your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please provide a valid email format';
    }
    if (!form.message.trim() || form.message.length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSubmitted(true);
    showToast('Feedback submitted! (Demo mode: no data stored)', 'success');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Sample Contact Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            Contact BrewBuddy Café
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Fictional café contact details for project demonstration and assessment viva.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* DEMO NOTICE BANNER */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3 mb-8">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">Fictional Demonstration Information Only</p>
            <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
              The phone numbers, address, and email addresses below are simulated sample data. Form submissions are validated in the frontend only and do not store any personal data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* LEFT: FICTIONAL DETAILS */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
              <h2 className="text-lg font-serif font-bold">Café Location & Hours</h2>

              <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B77B4B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">BrewBuddy Flagship Roastery</strong>
                    <span>104 Indiranagar 100ft Road, Bangalore, KA 560038 (Demo Sample)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#284C42] dark:text-[#86EFAC] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Operating Hours</strong>
                    <span>Mon - Sun: 7:30 AM – 11:00 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#B77B4B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Concierge & Table Enquiries</strong>
                    <span>+91 80 5550 0192 (Simulated)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#B77B4B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Barista Desk</strong>
                    <span>hello@brewbuddy-demo.cafe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: VALIDATED FEEDBACK FORM */}
          <div className="md:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-1">Send Us a Message</h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Client-side validated demo form. No PII is collected or stored.
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-[#284C42]/10 border border-[#284C42]/20 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#284C42] dark:text-[#86EFAC] mx-auto" />
                  <h4 className="text-base font-serif font-bold text-[var(--text-primary)]">
                    Feedback Received!
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Thank you, {form.name}! Your demo message has been processed successfully with full client-side validation.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: 'General Feedback', message: '' });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-[var(--text-primary)] block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none"
                    />
                    {errors.name && <span className="text-rose-500 text-[11px] mt-1 block">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="font-semibold text-[var(--text-primary)] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none"
                    />
                    {errors.email && <span className="text-rose-500 text-[11px] mt-1 block">{errors.email}</span>}
                  </div>

                  <div>
                    <label className="font-semibold text-[var(--text-primary)] block mb-1">
                      Topic
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none"
                    >
                      <option value="General Feedback">General Guest Feedback</option>
                      <option value="AI Recommendation Feedback">AI Recommendation Accuracy</option>
                      <option value="Table QR System">Table QR Service Experience</option>
                      <option value="Academic Viva">Academic Viva / Project Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[var(--text-primary)] block mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your thoughts about our single-origin roasts, AI barista, or table ordering experience..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none"
                    />
                    {errors.message && (
                      <span className="text-rose-500 text-[11px] mt-1 block">{errors.message}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Demo Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
