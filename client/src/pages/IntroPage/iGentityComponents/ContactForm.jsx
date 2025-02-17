import React, { useState } from "react";
import api from "@/lib/api";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      await api.post("/contact", formData);
      setSubmitStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you soon."
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to send message. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 w-full max-w-[1080px] max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-5 max-md:flex-col max-md:gap-8 max-md:px-8">
        <div className="flex flex-col w-[38%] max-md:w-full max-md:text-center">
          <div className="text-4xl font-semibold tracking-tight leading-10 text-white">
            Questions? Live
            <br />
            demo? <span className="text-purple-600">Let's talk</span>
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[62%] max-md:ml-0 max-md:w-full">
          <form onSubmit={handleSubmit} className="flex flex-col w-full text-sm tracking-normal text-black text-opacity-50">
            <div className="flex flex-wrap gap-5 items-start w-full whitespace-nowrap">
              <div className="flex-1 shrink gap-2.5 self-stretch py-5 pr-2.5 pl-5 bg-white rounded-lg min-h-[56px] min-w-[240px]">
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="w-full bg-transparent outline-none"
                />
              </div>
              <div className="flex-1 shrink gap-2.5 self-stretch py-5 pr-2.5 pl-5 bg-white rounded-lg min-h-[56px] min-w-[240px]">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
            <div className="gap-2.5 self-stretch py-5 pr-2.5 pl-5 mt-5 w-full whitespace-nowrap bg-white rounded-lg min-h-[56px]">
              <label htmlFor="message" className="sr-only">Message</label>
              <input
                type="text"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                required
                className="w-full bg-transparent outline-none"
              />
            </div>
            {submitStatus.message && (
              <div className={`mt-3 text-sm ${submitStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {submitStatus.message}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gap-2.5 self-stretch px-2.5 py-5 mt-5 w-full text-white bg-purple-600 rounded-lg min-h-[56px] hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
