import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Gửi dữ liệu tới BE hoặc email service ở đây nếu có
    setSubmitted(true);
    setForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center py-10">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-blue-600 mb-2 text-center">Liên hệ với chúng tôi</h2>
        <p className="text-gray-600 mb-6 text-center">
          Nếu bạn có bất kỳ câu hỏi, góp ý hoặc cần hỗ trợ, hãy gửi thông tin cho chúng tôi. Đội ngũ PipeVolt sẽ phản hồi sớm nhất!
        </p>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Thông tin liên hệ */}
          <div className="flex-1">
            <div className="mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 2v6a2 2 0 002 2h6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 16v6a2 2 0 002 2h6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 8V2a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 22h6a2 2 0 002-2v-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-700">Địa chỉ: Thái Hòa, Lập Thạch, Vĩnh Phúc</span>
            </div>
            <div className="mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16v2m0 4h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-700">Hotline: <a href="tel:0123456789" className="text-blue-500 hover:underline">0123 456 789</a></span>
            </div>
            <div className="mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10.5a8.38 8.38 0 01-7.5 7.5A8.38 8.38 0 013 10.5C3 6.36 7.03 3 12 3s9 3.36 9 7.5z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17v.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-700">Email: <a href="mailto:support@pipevolt.vn" className="text-blue-500 hover:underline">support@pipevolt.vn</a></span>
            </div>
            <div className="mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15v-6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-700">Thời gian làm việc: 8:00 - 17:30 (T2 - T7)</span>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12"/>
                </svg>
              </a>
              <a href="https://zalo.me/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#0088FF"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Arial">Zalo</text>
                </svg>
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-700">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.8 8.001a2.752 2.752 0 0 0-1.938-1.948C18.036 6 12 6 12 6s-6.036 0-7.862.053A2.752 2.752 0 0 0 2.2 8.001C2.147 9.827 2.147 12 2.147 12s0 2.173.053 3.999a2.752 2.752 0 0 0 1.938 1.948C5.964 18 12 18 12 18s6.036 0 7.862-.053a2.752 2.752 0 0 0 1.938-1.948C21.853 14.173 21.853 12 21.853 12s0-2.173-.053-3.999zM9.75 15.02V8.98l6.5 3.02-6.5 3.02z"/>
                </svg>
              </a>
            </div>
          </div>
          {/* Form liên hệ */}
          <form className="flex-1 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold mb-1">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Chủ đề</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Chủ đề liên hệ"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Nội dung</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập nội dung liên hệ..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Gửi liên hệ
            </button>
            {submitted && (
              <div className="text-green-600 font-semibold mt-2 text-center">
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;