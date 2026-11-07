import React from 'react';

export const BronzeAmenityStrip = () => {
  const items = [
    {
      icon: 'fa-solid fa-map-location-dot',
      title: 'Vị Trí Đắc Địa',
      desc: 'Kết nối trường học & trung tâm'
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Phòng Xác Thực 100%',
      desc: 'Kiểm duyệt thực tế minh bạch'
    },
    {
      icon: 'fa-solid fa-couch',
      title: 'Nội Thất Tinh Tế',
      desc: 'Tiện nghi sẵn sàng dọn vào ở'
    },
    {
      icon: 'fa-solid fa-lock',
      title: 'An Ninh & Riêng Tư',
      desc: 'Khóa vân tay, camera 24/7'
    },
    {
      icon: 'fa-solid fa-headset',
      title: 'Hỗ Trợ Tận Tâm 24/7',
      desc: 'Kết nối trực tiếp chủ nhà uy tín'
    }
  ];

  return (
    <section className="bg-gradient-to-r from-[#8C6239] via-[#A67C52] to-[#8C6239] py-6 border-y border-white/15 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-full bg-white/16 border border-white/30 flex items-center justify-center shrink-0 text-base text-[#FAF7F2] shadow-xs">
                <i className={item.icon}></i>
              </span>
              <div className="flex flex-col justify-center">
                <strong className="text-[13.5px] font-bold text-white leading-tight">
                  {item.title}
                </strong>
                <span className="text-[11.5px] text-[#FAF7F2]/85 leading-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

