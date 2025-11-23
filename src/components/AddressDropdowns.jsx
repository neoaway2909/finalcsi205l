import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../constants/translations';

const AddressDropdowns = ({ onAddressChange, initialAddress = {}, lang = 'en' }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(initialAddress.province || '');
  const [selectedDistrict, setSelectedDistrict] = useState(initialAddress.district || '');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(initialAddress.subDistrict || '');

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setSelectedSubDistrict('');
    setDistricts([]);
    setSubDistricts([]);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedSubDistrict('');
    setSubDistricts([]);
  };

  const handleSubDistrictChange = (e) => {
    setSelectedSubDistrict(e.target.value);
  };

  useEffect(() => {
    // Fetch provinces
    fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province.json')
      .then(response => response.json())
      .then(data => setProvinces(data));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      // Fetch districts for selected province
      fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/district.json')
        .then(response => response.json())
        .then(data => {
          const filteredDistricts = data.filter(d => d.province_id === parseInt(selectedProvince));
          setDistricts(filteredDistricts);
        });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      // Fetch sub-districts for selected district
      fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/sub_district.json')
        .then(response => response.json())
        .then(data => {
          const filteredSubDistricts = data.filter(sd => sd.district_id === parseInt(selectedDistrict));
          setSubDistricts(filteredSubDistricts);
        });
    }
  }, [selectedDistrict]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      onAddressChange({
        province: selectedProvince,
        district: selectedDistrict,
        subDistrict: selectedSubDistrict,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedSubDistrict, onAddressChange]);

  const nameKey = lang === 'th' ? 'name_th' : 'name_en';

  return (
    <div className="address-dropdowns-container space-y-4">
      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700">{translations[lang].province}</label>
        <select
          id="province"
          name="province"
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">{translations[lang].province}</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p[nameKey]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700">{translations[lang].district}</label>
        <select
          id="district"
          name="district"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={!selectedProvince}
        >
          <option value="">{translations[lang].district}</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d[nameKey]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="subDistrict" className="block text-sm font-medium text-gray-700">{translations[lang].subDistrict}</label>
        <select
          id="subDistrict"
          name="subDistrict"
          value={selectedSubDistrict}
          onChange={handleSubDistrictChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={!selectedDistrict}
        >
          <option value="">{translations[lang].subDistrict}</option>
          {subDistricts.map(sd => <option key={sd.id} value={sd.id}>{sd[nameKey]}</option>)}
        </select>
      </div>
    </div>
  );
};

export default AddressDropdowns;
