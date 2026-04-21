import React from 'react';
import { Phone, CheckCircle, Droplets, Wrench, ShieldCheck, MapPin } from 'lucide-react';

const AquaSoft = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans bg-white pb-0">
      {/* 1. HERO SECTION */}
      <section className="bg-[#eef4fb] flex flex-col md:flex-row items-center justify-between min-h-[500px]">
        {/* Left: Image (use RO purifier / kitchen / water theme placeholder) */}
        <div className="w-full md:w-1/2 h-64 md:h-[500px]">
          <img 
            src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776803502/420832a4-7371-45ec-9d87-34ec7b707b37_yzgpcf.png" 
            alt="Water Purifier and Kitchen" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right: Text */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-start text-left">
          <span className="text-[#A7C7E7] font-semibold tracking-wider uppercase mb-2">Kitchen Gallery</span>
          <h1 className="sr-only">Aqua Soft RO</h1>
          <img src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776803754/sttic_2_qxt916.png" alt="Aqua Soft RO" className="h-16 md:h-20 w-auto object-contain mb-4" />
          <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed">
            Complete solutions for RO water purifiers and modern modular kitchens.
          </p>
          <a href="tel:+919839511015" className="bg-[#5F86D6] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-[#4a72c2] transition-all transform hover:-translate-y-1 inline-flex items-center gap-2">
            <Phone size={20} />
            Call Now
          </a>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#5F86D6] mb-6">About Aqua Soft RO</h2>
        <div className="w-16 h-1 bg-[#A7C7E7] mx-auto mb-8 rounded-full"></div>
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light mb-6">
          Aqua Soft RO, a unified branch of <strong className="font-semibold text-gray-800">Carry Soft Industries</strong>, has been a trusted pioneer in transforming homes across Varanasi and beyond. We bring world-class purity to your drinking water with our advanced RO purification systems, while simultaneously redefining your cooking experience with our premium modular kitchens.
        </p>
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light">
          We pride ourselves on an uncompromising commitment to quality, aesthetic design, and unparalleled customer satisfaction. From seamless appliance installations to dedicated after-sales maintenance, our expert technicians ensure your home runs beautifully and healthily.
        </p>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="bg-[#f8fafd] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#5F86D6] mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-[0_10px_30px_rgba(95,134,214,0.1)] text-center transition-transform hover:-translate-y-2">
              <div className="bg-[#eef4fb] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#5F86D6]">
                <Wrench size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">RO Installation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Fast, neat, and professional setup of reverse osmosis systems. Our certified technicians ensure leak-proof fitting and optimal water pressure calibrated for your home's water quality.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-[0_10px_30px_rgba(95,134,214,0.1)] text-center transition-transform hover:-translate-y-2">
              <div className="bg-[#eef4fb] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#5F86D6]">
                <Droplets size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">RO Repair & Maint.</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Preventative annual maintenance contracts (AMC), filter replacements, and rapid troubleshooting to ensure your drinking water remains 100% pure and safe all year round.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-[0_10px_30px_rgba(95,134,214,0.1)] text-center transition-transform hover:-translate-y-2">
              <div className="bg-[#eef4fb] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#5F86D6]">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Universal Servicing</h3>
              <p className="text-gray-500 text-sm leading-relaxed">No matter the brand or model. We possess the genuine spare parts and technical know-how to repair and service any water purifier available on the market.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: WHY CHOOSE US SECTION */}
      <section className="py-16 px-6 bg-white border-t border-[#eef4fb]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#5F86D6] mb-12">Why Choose Aqua Soft?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
             <div className="p-6">
                <div className="text-4xl font-extrabold text-[#A7C7E7] mb-2">10+</div>
                <div className="font-semibold text-gray-800">Years Experience</div>
                <div className="text-sm text-gray-500 mt-2">Trusted by thousands of homes.</div>
             </div>
             <div className="p-6">
                <div className="text-4xl font-extrabold text-[#A7C7E7] mb-2">100%</div>
                <div className="font-semibold text-gray-800">Genuine Parts</div>
                <div className="text-sm text-gray-500 mt-2">Authentic spares for longevity.</div>
             </div>
             <div className="p-6">
                <div className="text-4xl font-extrabold text-[#A7C7E7] mb-2">24/7</div>
                <div className="font-semibold text-gray-800">Customer Support</div>
                <div className="text-sm text-gray-500 mt-2">We are always here to help.</div>
             </div>
             <div className="p-6">
                <div className="text-4xl font-extrabold text-[#A7C7E7] mb-2">Fast</div>
                <div className="font-semibold text-gray-800">Doorstep Service</div>
                <div className="text-sm text-gray-500 mt-2">Prompt response to your calls.</div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCTS SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto bg-[#f8fafd] rounded-[3rem] mb-20 shadow-sm border border-[#eef4fb]">
        <h2 className="text-3xl font-bold text-center text-[#5F86D6] mb-12">Explore Our Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-10">
          {[
            { name: 'Modular Kitchen', desc: 'Customized ergonomic designs matching your style.' },
            { name: 'Smart Chimney', desc: 'Auto-clean technology with powerful suction.' },
            { name: 'Glass Gas Stove', desc: 'Toughened glass top, high-efficiency brass burners.' },
            { name: 'Premium Sink', desc: 'Scratch-resistant quartz and stainless steel.' },
            { name: 'Kitchen Accessories', desc: 'Pull-outs, organizers, and durable hardware.' },
            { name: 'RO Purifiers', desc: 'Latest Copper + Alkaline RO+UV water filters.' }
          ].map((product, idx) => (
            <div key={idx} className="bg-white border border-[#eef4fb] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#5F86D6] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
               <CheckCircle className="text-[#A7C7E7] mb-2" size={32} />
               <span className="font-bold text-xl text-gray-800">{product.name}</span>
               <p className="text-sm text-gray-500">{product.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HINDI SECTION (LOCAL TRUST SECTION) */}
      <section className="bg-[#5F86D6] py-16 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed drop-shadow-sm">
            "मॉड्यूलर किचन आटो, चूल्हा और चिमनी बनाएं एवं अन्य कुकवेयर"
          </p>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-b border-[#eef4fb]">
         <h2 className="text-3xl font-bold text-center text-[#5F86D6] mb-12">Contact Us</h2>
         <div className="flex flex-col md:flex-row gap-12 bg-white p-8 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#f0f4fa]">
            
            {/* Contact Details */}
            <div className="flex-1 space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#eef4fb] flex items-center justify-center flex-shrink-0 text-[#5F86D6]">
                     <MapPin size={22} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">Address</h4>
                     <p className="text-gray-600 text-sm leading-relaxed">Tripathi Katra, Madwa, Lamahi, Varanasi<br/>(In front of Gautam Garden Marriage Lawn)<br/>PIN 221007</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#eef4fb] flex items-center justify-center flex-shrink-0 text-[#5F86D6]">
                     <Phone size={22} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">Phone</h4>
                     <p className="text-gray-600 text-sm">+91 9839511015</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#eef4fb] flex items-center justify-center flex-shrink-0 text-[#5F86D6]">
                     <ShieldCheck size={22} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">GST</h4>
                     <p className="text-gray-600 text-sm">09AATFC9794Q1ZX</p>
                  </div>
               </div>

               <div className="pt-6">
                  <a href="tel:+919839511015" className="bg-[#5F86D6] text-white w-full py-4 rounded-xl font-semibold shadow-md inline-flex justify-center items-center gap-2 hover:bg-[#4a72c2] transition-colors">
                     <Phone size={20} />
                     Call For Service
                  </a>
               </div>
            </div>

            {/* Simple Form */}
            <div className="flex-1 bg-[#f8fafd] p-8 rounded-2xl">
               <h3 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h3>
               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                     <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#5F86D6] transition-all bg-white" />
                  </div>
                  <div>
                     <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#5F86D6] transition-all bg-white" />
                  </div>
                  <div>
                     <textarea placeholder="How can we help you?" rows={3} className="w-full px-4 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#5F86D6] transition-all bg-white resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-white text-[#5F86D6] border-2 border-[#5F86D6] py-3 rounded-xl font-bold hover:bg-[#5F86D6] hover:text-white transition-colors">
                     Submit Request
                  </button>
               </form>
            </div>

         </div>
      </section>

      {/* 7. FOOTER (ONLY FOR THIS PAGE) */}
      <footer className="bg-white text-gray-600 py-12 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
               <img src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776803754/sttic_2_qxt916.png" alt="Aqua Soft RO" className="h-10 mx-auto md:mx-0 w-auto object-contain mb-2" />
               <h3 className="sr-only">Aqua Soft RO</h3>
               <p className="text-sm">A unit of Carry Soft Industries</p>
            </div>
            <div className="text-center md:text-right md:block text-sm space-y-1">
               <p>Tripathi Katra, Madwa, Lamahi, Varanasi</p>
               <p>+91 9839511015</p>
            </div>
         </div>
      </footer>

    </div>
  );
};

export default AquaSoft;
