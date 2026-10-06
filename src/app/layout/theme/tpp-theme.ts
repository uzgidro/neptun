// Brand theme of JSC "Thermal Power Plants" (IES logo, assets/images/logo-tpp.svg).
// Logo colours: navy #232866, blue #486EB4, flame #EAE735 → #F47C2E, swoosh red #EE2D32.

export const TPP_THEME_NAME = 'tpp';

export const TPP_ACCENT = '#F47C2E';

// Primary scale built around the logo blue (500) and navy (900).
export const TPP_PRIMARY = {
    50: '#EEF2F9',
    100: '#D9E2F1',
    200: '#B6C6E4',
    300: '#8EA7D5',
    400: '#6A8BC6',
    500: '#486EB4',
    600: '#3B5A9A',
    700: '#314A80',
    800: '#2A3C6C',
    900: '#232866',
    950: '#161A44'
};

// Neutral surface tinted towards the logo navy.
export const TPP_SURFACE = {
    0: '#ffffff',
    50: '#F8F9FC',
    100: '#F1F3F9',
    200: '#E3E6F0',
    300: '#C9CDDC',
    400: '#A2A7BD',
    500: '#7B819B',
    600: '#5C6280',
    700: '#434A69',
    800: '#2E3454',
    900: '#1D2142',
    950: '#10132B'
};

export const tppLogo = (darkBackground: boolean | undefined): string =>
    darkBackground ? 'assets/images/logo-tpp-light.svg' : 'assets/images/logo-tpp.svg';
