import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import { TEXTS, URLS } from '../../config/config';

const T = TEXTS.welcomePage;

interface PhoneInputScreenProps {
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  countryCode: string;
  setCountryCode: (val: string) => void;
  selectedCountry: string;
  setSelectedCountry: (val: string) => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  onNext: () => void;
  onConfirm: () => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (show: boolean) => void;
  formattedPhone: string;
}

export const PhoneInputScreen: React.FC<PhoneInputScreenProps> = ({
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
  selectedCountry,
  setSelectedCountry,
  showConfirmDialog,
  setShowConfirmDialog,
  onNext,
  onConfirm,
  showMenu,
  setShowMenu,
  showCountryDropdown,
  setShowCountryDropdown,
  formattedPhone
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [countriesList, setCountriesList] = useState<{name: string, code: string}[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const res = await fetch(URLS.api.countries);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        
        const mappedCountries = data
          .filter((c: any) => c.idd && c.idd.root)
          .map((c: any) => {
            const root = c.idd.root;
            const suffix = (c.idd.suffixes && c.idd.suffixes.length > 0) ? c.idd.suffixes[0] : '';
            return {
              name: c.name.common,
              code: root + suffix
            };
          })
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
          
        setCountriesList(mappedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesList([]);
      } finally {
        setLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowMenu, setShowCountryDropdown]);

  return (
    <div className="h-screen w-full bg-white flex flex-col relative">
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-lg w-full max-w-[320px] p-6 shadow-xl">
            <p className="text-[15px] text-[#3b4a54] mb-4 leading-relaxed">
              {T.phone.confirmTitle}
            </p>
            <p className="text-[20px] text-[#1e2e36] font-medium mb-6">
              {formattedPhone}
            </p>
            <div className="flex justify-end gap-8">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="text-[#008069] text-[15px] font-medium px-3 py-1 hover:bg-[#e7fcf5] rounded transition"
              >
                {T.phone.confirmEdit}
              </button>
              <button
                onClick={onConfirm}
                className="text-[#008069] text-[15px] font-medium px-3 py-1 hover:bg-[#e7fcf5] rounded transition"
              >
                {T.phone.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end px-2 pt-3 pb-1 relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <MoreVertical size={20} className="text-[#54656f]" />
        </button>

        {showMenu && (
          <div className="absolute top-12 right-3 bg-white rounded-md shadow-lg py-2 z-50 min-w-[280px] border border-gray-50 animate-in fade-in duration-150">
            <button className="w-full text-left px-6 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition">
              {T.phone.menuLinkDevice}
            </button>
            <button className="w-full text-left px-6 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition">
              {T.phone.menuParentAccount}
            </button>
            <button className="w-full text-left px-6 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition">
              {T.common.help}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4">
        <h1 className="text-[22px] text-[#1e2e36] font-bold mb-3">
          {T.phone.title}
        </h1>

        <p className="text-[14.5px] text-[#667781] leading-[20px] mb-6">
          {T.phone.description}{' '}
          <span className="text-[#008069] cursor-pointer hover:underline">{T.phone.phoneHelp}</span>
        </p>

        <div className="relative mb-5" ref={dropdownRef}>
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full max-w-[280px] mx-auto flex items-center justify-between px-2 py-2 border-b-2 border-[#00a884] text-[16px] text-[#3b4a54] transition hover:bg-gray-50"
          >
            <span>{selectedCountry}</span>
            <ChevronDown size={18} className="text-[#00a884]" />
          </button>

          {showCountryDropdown && (
            <div className="absolute top-full left-0 right-0 max-w-[280px] mx-auto bg-white border border-gray-200 rounded-md shadow-lg z-40 max-h-[240px] overflow-y-auto custom-scrollbar">
              {loadingCountries ? (
                <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{T.phone.loadingCountries}</div>
              ) : countriesList.length === 0 ? (
                <div className="px-4 py-3 text-[14px] text-red-500 text-center">
                  {T.phone.loadFailed}<br/>
                  <button onClick={() => window.location.reload()} className="text-blue-500 underline mt-2">{T.phone.reloadPage}</button>
                </div>
              ) : (
                countriesList.map((country: { name: string; code: string }, index: number) => (
                  <button
                    key={`${country.code}-${index}`}
                    className="w-full text-left px-4 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f0f2f5] transition flex items-center justify-between"
                    onClick={() => {
                      setSelectedCountry(country.name);
                      setCountryCode(country.code);
                      setShowCountryDropdown(false);
                    }}
                  >
                    <span className="truncate mr-2">{country.name}</span>
                    <span className="text-[#667781] text-[13px] whitespace-nowrap">{country.code}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 max-w-[280px] mx-auto w-full">
          <div className="w-[70px] border-b-2 border-[#00a884] pb-2 text-[16px] text-[#3b4a54] flex items-center gap-1">
            <span className="text-[#667781]">+</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={countryCode.replace('+', '')}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const newCode = '+' + val;
                setCountryCode(newCode);
                
                if (countriesList.length > 0) {
                  const match = countriesList.find(c => c.code === newCode);
                  if (match) {
                    setSelectedCountry(match.name);
                  } else if (val === '') {
                    setSelectedCountry(T.phone.selectCountry);
                  }
                }
              }}
              className="w-full outline-none bg-transparent text-[16px] text-[#3b4a54]"
            />
          </div>
          <div className="flex-1 border-b-2 border-[#00a884] pb-2">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={T.phone.phonePlaceholder}
              value={(() => {
                const digits = phoneNumber.replace(/\D/g, '');
                if (digits.length <= 3) return digits;
                if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
                return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
              })()}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.startsWith('08')) {
                  val = '8' + val.substring(2);
                }
                setPhoneNumber(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phoneNumber.length >= 8) {
                  onNext();
                }
              }}
              className="w-full outline-none text-[16px] text-[#3b4a54] placeholder:text-[#8696a0] bg-transparent"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="pb-8 px-6 flex justify-center">
        <button
          onClick={onNext}
          disabled={phoneNumber.length < 8}
          className={`w-full max-w-[360px] py-3 rounded-full text-[16px] font-medium transition-all ${phoneNumber.length >= 8
              ? 'bg-[#00a884] text-white hover:bg-[#008f72] active:bg-[#017561] shadow-sm'
              : 'bg-[#f0f2f5] text-[#8696a0] cursor-default'
            }`}
        >
          {T.phone.nextButton}
        </button>
      </div>
    </div>
  );
};
