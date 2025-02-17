import React from "react";

function ContactForm() {
  return (
    <div className="mt-16 w-full max-w-[1080px] max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-5 max-md:flex-col max-md:px-8">
        <div className="flex flex-col w-[38%] max-md:ml-0 max-md:w-full">
          <div className="text-4xl font-semibold tracking-tight leading-10 text-white max-md:mt-10">
            Questions? Live
            <br />
            demo? <span className="text-purple-600">Let's talk</span>
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[62%] max-md:ml-0 max-md:w-full">
          <form className="flex flex-col w-full text-sm tracking-normal text-black text-opacity-50 max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-wrap gap-5 items-start w-full whitespace-nowrap max-md:max-w-full">
              <div className="flex-1 shrink gap-2.5 self-stretch py-5 pr-2.5 pl-5 bg-white rounded-lg min-h-[56px] min-w-[240px]">
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Name"
                  className="w-full bg-transparent"
                />
              </div>
              <div className="flex-1 shrink gap-2.5 self-stretch py-5 pr-2.5 pl-5 bg-white rounded-lg min-h-[56px] min-w-[240px]">
                <label htmlFor="phone" className="sr-only">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone"
                  className="w-full bg-transparent"
                />
              </div>
            </div>
            <div className="gap-2.5 self-stretch py-5 pr-2.5 pl-5 mt-5 w-full whitespace-nowrap bg-white rounded-lg min-h-[56px] max-md:max-w-full">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                className="w-full bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="gap-2.5 self-stretch px-2.5 py-5 mt-5 w-full text-white bg-purple-600 rounded-lg min-h-[56px] max-md:max-w-full"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
