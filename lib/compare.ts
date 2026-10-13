export const GAINS = [
  { value: '~20%', label: 'larger effective speaker area' },
  { value: '+15%', label: 'bigger earbud battery' },
  { value: '-0.3 g', label: 'lighter per earbud' },
  { value: 'BT 6.1', label: 'newer Bluetooth' },
];

export const ROWS: { label: string; pro4: string; pro3: string; up?: boolean }[] = [
  { label: 'Speakers', pro4: '11 mm woofer + 5.5 mm tweeter', pro3: '2-way, woofer + planar tweeter', up: true },
  { label: 'Hi-Fi', pro4: '24-bit / 96 kHz', pro3: '24-bit / 96 kHz' },
  { label: 'Design', pro4: 'Metal-finish blade, engraved pinch area', pro3: 'Blade with Blade Lights', up: true },
  { label: 'Earbud battery', pro4: '61 mAh', pro3: '53 mAh', up: true },
  { label: 'Case battery', pro4: '530 mAh', pro3: '515 mAh', up: true },
  { label: 'Playback (ANC on)', pro4: 'Up to 6 h', pro3: 'Up to 6 h' },
  { label: 'With case (ANC on)', pro4: 'Up to 26 h', pro3: 'Up to 26 h' },
  { label: 'Weight', pro4: '5.1 g', pro3: '5.4 g', up: true },
  { label: 'Bluetooth', pro4: '6.1', pro3: '5.4', up: true },
  { label: 'Water resistance', pro4: 'IP57', pro3: 'IP57' },
];
