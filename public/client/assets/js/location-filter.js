// Province -> Ward cascading selects for room search forms.
// Markup: select[data-location-province][data-ward-target="#wardSelectId"]
//         option[data-code] holds the province code used by /api/geo.
(function () {
  const wardCache = {};

  const fetchWards = async (code) => {
    if (!wardCache[code]) {
      const res = await fetch(`/api/geo/provinces/${encodeURIComponent(code)}/wards`);
      if (!res.ok) throw new Error('Không tải được danh sách phường/xã');
      wardCache[code] = await res.json();
    }
    return wardCache[code];
  };

  const resetWardSelect = (wardSelect, placeholder) => {
    wardSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    wardSelect.appendChild(opt);
  };

  const loadWards = async (provinceSelect, wardSelect, selectedWard) => {
    const selectedOption = provinceSelect.options[provinceSelect.selectedIndex];
    const code = selectedOption ? selectedOption.dataset.code : '';

    if (!code) {
      resetWardSelect(wardSelect, 'Chọn tỉnh trước');
      wardSelect.disabled = true;
      return;
    }

    resetWardSelect(wardSelect, 'Đang tải...');
    wardSelect.disabled = true;

    try {
      const wards = await fetchWards(code);
      resetWardSelect(wardSelect, `Tất cả phường/xã (${wards.length})`);
      wards
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
        .forEach((w) => {
          const opt = document.createElement('option');
          opt.value = w.name;
          opt.textContent = w.name;
          if (selectedWard && w.name === selectedWard) opt.selected = true;
          wardSelect.appendChild(opt);
        });
      wardSelect.disabled = false;
    } catch (err) {
      resetWardSelect(wardSelect, 'Lỗi tải phường/xã');
      console.error(err);
    }
  };

  document.querySelectorAll('select[data-location-province]').forEach((provinceSelect) => {
    const wardSelect = document.querySelector(provinceSelect.dataset.wardTarget);
    if (!wardSelect) return;

    provinceSelect.addEventListener('change', () => loadWards(provinceSelect, wardSelect, ''));

    // Restore selection after a search (e.g. /rooms?province=Hà Nội&ward=Phường Ba Đình)
    if (provinceSelect.value) {
      loadWards(provinceSelect, wardSelect, wardSelect.dataset.selected || '');
    }
  });
})();
