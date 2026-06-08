import React, { useState } from 'react';
import http from '../../../common/http-common';

// ─── FAQ DATA ───────────────────────────────────────────────────────────────
const FAQ_LIST = [
  {
    q: 'PipeVolt có giao hàng toàn quốc không?',
    a: 'Có! Chúng tôi giao hàng đến tất cả 63 tỉnh thành trên cả nước. Thời gian giao hàng từ 2–5 ngày làm việc tùy khu vực.',
  },
  {
    q: 'Chính sách đổi trả sản phẩm như thế nào?',
    a: 'Sản phẩm được đổi trả trong vòng 30 ngày kể từ ngày nhận hàng nếu có lỗi kỹ thuật từ nhà sản xuất. Khách hàng vui lòng liên hệ hotline để được hướng dẫn.',
  },
  {
    q: 'Làm thế nào để theo dõi đơn hàng?',
    a: 'Sau khi đặt hàng thành công, bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi" tại tài khoản cá nhân hoặc liên hệ hotline để được hỗ trợ.',
  },
  {
    q: 'PipeVolt có hỗ trợ mua hàng theo dự án/số lượng lớn không?',
    a: 'Có! Chúng tôi có chính sách giá ưu đãi cho khách hàng dự án và mua số lượng lớn. Liên hệ trực tiếp với đội kinh doanh qua hotline hoặc email để được tư vấn.',
  },
  {
    q: 'Sản phẩm có bảo hành không? Thời gian bảo hành bao lâu?',
    a: 'Tất cả sản phẩm tại PipeVolt đều có bảo hành chính hãng. Thời gian bảo hành từ 12–36 tháng tùy sản phẩm. Chi tiết xem tại trang sản phẩm.',
  },
  {
    q: 'Tôi có thể thanh toán bằng những hình thức nào?',
    a: 'PipeVolt hỗ trợ: Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay), và quét mã QR SePay.',
  },
];

// ─── CONTACT INFO ───────────────────────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Địa chỉ',
    value: 'Thái Hòa, Lập Thạch, Vĩnh Phúc',
    link: null,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Hotline',
    value: '0123 456 789',
    link: 'tel:0123456789',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'support@pipevolt.vn',
    link: 'mailto:support@pipevolt.vn',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Giờ làm việc',
    value: 'T2 – T7: 08:00 – 17:30',
    link: null,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

// ─── GOOGLE MAPS URL (Lập Thạch, Vĩnh Phúc) ─────────────────────────────────
const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.0!2d105.47!3d21.37!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134f29b9e6c5c5d%3A0xabcdef1234567890!2sL%E1%BA%ADp%20Th%E1%BA%A1ch%2C%20V%C4%A9nh%20Ph%C3%BAc!5e0!3m2!1svi!2svn!4v1700000000000';

// ─── FAQ ITEM ───────────────────────────────────────────────────────────────
const FaqItem = ({ q, a, isOpen, onToggle }) => (
  <div
    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
      isOpen ? 'border-blue-300 shadow-md' : 'border-gray-200'
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-blue-50 transition-colors"
    >
      <span className={`font-semibold text-sm ${isOpen ? 'text-blue-700' : 'text-gray-800'}`}>{q}</span>
      <span
        className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
    {isOpen && (
      <div className="px-5 pb-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700 leading-relaxed pt-3">{a}</p>
      </div>
    )}
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Giả lập gửi (có thể tích hợp email service hoặc API sau)
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-20 px-4 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white opacity-5 rounded-full" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-100 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Luôn sẵn sàng hỗ trợ bạn
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Liên hệ với <span className="text-yellow-300">PipeVolt</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn mọi thắc mắc về vật tư điện nước.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* ── CONTACT INFO CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {CONTACT_INFO.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-start gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>{item.icon}</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                {item.link ? (
                  <a href={item.link} className={`text-sm font-bold ${item.color} hover:underline`}>
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── FORM + MAP ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          {/* FORM */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Gửi yêu cầu hỗ trợ</h2>
            <p className="text-sm text-gray-500 mb-6">Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>

            {submitted ? (
              <div className="flex flex-col items-center py-12 text-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Gửi thành công!</h3>
                <p className="text-gray-500 text-sm">Cảm ơn bạn đã liên hệ. Đội ngũ PipeVolt sẽ phản hồi sớm nhất.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-blue-600 font-semibold text-sm hover:underline"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Chủ đề</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    <option value="Tư vấn sản phẩm">Tư vấn sản phẩm</option>
                    <option value="Hỗ trợ đơn hàng">Hỗ trợ đơn hàng</option>
                    <option value="Khiếu nại / Đổi trả">Khiếu nại / Đổi trả</option>
                    <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Gửi yêu cầu
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* MAP */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Tìm chúng tôi trên bản đồ</h2>
              <p className="text-sm text-gray-500">Thái Hòa, Lập Thạch, Vĩnh Phúc, Việt Nam</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <iframe
                title="PipeVolt Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.0634897023!2d105.4700!3d21.3700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134f29b9e6c5c5d%3A0xabcdef1234567890!2zTOG6rXAgVGjhuqFjaCwgVuG4qW5oIFBow7pj!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* Quick actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <a
                href="https://maps.google.com/?q=Lập+Thạch,+Vĩnh+Phúc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition"
              >
                📍 Mở Google Maps
              </a>
              <a
                href="tel:0123456789"
                className="flex-1 text-center text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 py-2 rounded-xl transition"
              >
                📞 Gọi ngay
              </a>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-14">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-xl flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
              <p className="text-sm text-gray-500 mt-1">Giải đáp nhanh những thắc mắc phổ biến của khách hàng.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FAQ_LIST.map((item, i) => (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* ── SOCIAL & CTA ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Kết nối với chúng tôi</h3>
            <p className="text-blue-100 text-sm">Theo dõi PipeVolt để cập nhật sản phẩm mới và khuyến mãi hấp dẫn.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
              title="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12" />
              </svg>
            </a>
            {/* Zalo */}
            <a
              href="https://zalo.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
              title="Zalo"
            >
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fontFamily="Arial, sans-serif" fontWeight="bold">Z</text>
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
              title="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.8 8.001a2.752 2.752 0 0 0-1.938-1.948C18.036 6 12 6 12 6s-6.036 0-7.862.053A2.752 2.752 0 0 0 2.2 8.001C2.147 9.827 2.147 12 2.147 12s0 2.173.053 3.999a2.752 2.752 0 0 0 1.938 1.948C5.964 18 12 18 12 18s6.036 0 7.862-.053a2.752 2.752 0 0 0 1.938-1.948C21.853 14.173 21.853 12 21.853 12s0-2.173-.053-3.999zM9.75 15.02V8.98l6.5 3.02-6.5 3.02z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;