function Tabs1() {
  return (
    <div className="absolute content-stretch flex items-center left-0 top-0" data-name="Tabs">
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative rounded-tl-[4px] shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Details
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#dddbda]" />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Critical Dates
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#dddbda]" />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Clauses
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#dddbda]" />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Payment Terms
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_0px_0px_#00847c]" />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Payments
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#dddbda]" />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0" data-name="Tab">
        <p className="font-['SF_Pro:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#080707] text-[13px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          History
        </p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#dddbda]" />
      </div>
    </div>
  );
}

export default function Tabs() {
  return (
    <div className="border-[#dddbda] border-b border-solid relative size-full" data-name="Tabs">
      <Tabs1 />
    </div>
  );
}