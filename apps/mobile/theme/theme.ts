const neutrals = {
	whitesmoke: "#fcfcfc",
	platinum: "#e4e2e1",
	dune: "#32302f",
	grey: "#94908d",
	silver: "#bfbebe",
	white: "#ffffff",
	darkSilver: "#a9a6a4",
	darkGrey: "#615e5c",
	black: "#000000",
} as const;

const alpha = {
	dune3: "#32302f08",
	dune5: "#32302f0d",
	dune8: "#32302f14",
	whitesmoke3: "#fcfcfc08",
	whitesmoke5: "#fcfcfc0d",
	whitesmoke12: "#fcfcfc1f",
} as const;

const palette = {
	red: {
		100: "#fbe4de",
		200: "#f9b4a9",
		300: "#f89789",
		400: "#f76b5a",
		500: "#bf3722",
		600: "#8f2e1f",
		700: "#60241c",
		800: "#411e1a",
	},
	vibrantGreen: {
		100: "#ebf8de",
		200: "#cce5ad",
		300: "#acd37d",
		400: "#97c75c",
		500: "#62a215",
		600: "#4c7a15",
		700: "#426120",
		800: "#39492c",
	},
	green: {
		100: "#d5eab8",
		200: "#b3d088",
		300: "#99b56e",
		400: "#7b9b54",
		500: "#5c8145",
		600: "#486635",
		700: "#364d27",
		800: "#243519",
	},
	blue: {
		100: "#dde9f1",
		200: "#a5d4f1",
		300: "#78bfea",
		400: "#4ba9e3",
		500: "#1e94dc",
		600: "#196ea4",
		700: "#104b71",
		800: "#24333d",
	},
	steelBlue: {
		100: "#d5e1ea",
		200: "#c7d7e3",
		300: "#b4cada",
		400: "#a5bdce",
		500: "#95afc2",
		600: "#7d94a4",
		700: "#677987",
		800: "#51606c",
	},
	purple: {
		100: "#dccade",
		200: "#d0b9d3",
		300: "#c0a1c5",
		400: "#ac82b2",
		500: "#916a96",
		600: "#735378",
		700: "#573e5b",
		800: "#3c2a3f",
	},
	pink: {
		100: "#f4d9ed",
		200: "#ecb7dc",
		300: "#e495cb",
		400: "#b27291",
		500: "#965876",
		600: "#730046",
		700: "#522d41",
		800: "#3b232e",
	},
	gold: {
		100: "#f7f6f2",
		200: "#e9e3de",
		300: "#fceee5",
		400: "#f9a471",
		500: "#e29c57",
		600: "#bb6e3d",
		700: "#763d16",
		800: "#463b33",
	},
} as const;

export const borderRadius = {
	xxs: 2,
	xs: 4,
	s: 8,
	m: 12,
	l: 16,
	xl: 24,
	xxl: 32,
} as const;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 32,
	xl: 64,
} as const;

export const fontFamily = {
	regular: "LeagueSpartan_400Regular",
	bold: "LeagueSpartan_700Bold",
} as const;

export const fontSize = {
	xs: 10,
	sm: 14,
	body: 16,
	h6: 16,
	h5: 20,
	h4: 25,
	h3: 31,
	h2: 39,
	h1: 49,
} as const;

export const lineHeight = {
	heading: 1.1,
	body: 1.4,
} as const;

export const letterSpacing = {
	default: 0,
	decreased: -0.05,
	increased: 0.15,
} as const;

export const light = {
	assets: {
		bgPage: neutrals.whitesmoke,
		bgCardPrimary: "#ffffff",
		bgCardSecondary: "#f2f2f2",
		bgCard: neutrals.white,
		bgForeground: neutrals.white,
		bgField: neutrals.white,
		bgDisabled: alpha.dune3,
		text: neutrals.dune,
		subtext: neutrals.darkGrey,
		textDisabled: neutrals.grey,
		iconActive: neutrals.dune,
		iconInactive: neutrals.darkSilver,
		strokeActive: neutrals.dune,
		strokeInactive: neutrals.platinum,
		border: "#e2e2e2",
	},
	buttons: {
		primary: {
			bgActive: neutrals.dune,
			containActive: neutrals.whitesmoke,
			bgDisabled: alpha.dune3,
			containDisabled: neutrals.grey,
		},
		secondary: {
			bgActive: neutrals.white,
			containActive: neutrals.dune,
			borderActive: neutrals.platinum,
			bgDisabled: neutrals.white,
			containDisabled: neutrals.grey,
			borderDisabled: alpha.dune3,
		},
		tertiary: {
			bgActive: alpha.dune8,
			containActive: neutrals.darkGrey,
			bgDisabled: alpha.dune3,
			containDisabled: neutrals.silver,
		},
		warning: {
			bgActive: palette.red[100],
			containActive: palette.red[500],
		},
	},
	sentiment: {
		positive: palette.vibrantGreen[600],
		positiveBg: palette.vibrantGreen[100],
		negative: palette.red[500],
		negativeBg: palette.red[100],
		informative: palette.blue[600],
		informativeBg: palette.blue[100],
	},
	accent: {
		blue: "#1e94dc",
		blueBg: "#196ea426",
		darkBlue: "#196ea4",
		green: "#62a215",
		lightSilver: "#d5d9db",
		paleSilver: "#c4c9b5",
		tan: "#d6b9a5",
		icons: {
			greenContain: "#3f660f",
			greenBg: "#eff5ea",
			orangeContain: "#973400",
			orangeBg: "#fcf0e8",
			pinkContain: palette.pink[600],
			pinkBg: palette.pink[100],
			purpleContain: "#4e33a9",
			purpleBg: "#e2dcf8",
			blueContain: "#1c56b0",
			blueBg: "#e3ecf8",
		},
	},
	gradient: {
		mainStart: neutrals.platinum,
		mainEnd: neutrals.whitesmoke,
		cardStart: palette.gold[200],
		cardEnd: palette.gold[100],
	},
} as const;

export const dark = {
	assets: {
		bgPage: neutrals.black,
		bgCardPrimary: "#171717",
		bgCardSecondary: "#0f0f0f",
		bgCard: neutrals.dune,
		bgForeground: neutrals.black,
		bgField: alpha.whitesmoke3,
		bgDisabled: alpha.whitesmoke12,
		text: neutrals.platinum,
		subtext: neutrals.silver,
		textDisabled: neutrals.silver,
		iconActive: neutrals.platinum,
		iconInactive: neutrals.darkGrey,
		strokeActive: neutrals.whitesmoke,
		strokeInactive: neutrals.darkGrey,
		border: "#2c2c2c",
	},
	buttons: {
		primary: {
			bgActive: neutrals.whitesmoke,
			containActive: neutrals.dune,
			bgDisabled: alpha.whitesmoke5,
			containDisabled: neutrals.darkGrey,
		},
		secondary: {
			bgActive: neutrals.black,
			containActive: neutrals.whitesmoke,
			borderActive: neutrals.darkGrey,
			bgDisabled: neutrals.black,
			containDisabled: neutrals.darkGrey,
			borderDisabled: alpha.whitesmoke5,
		},
		tertiary: {
			bgActive: alpha.whitesmoke12,
			containActive: neutrals.whitesmoke,
			bgDisabled: alpha.whitesmoke3,
			containDisabled: neutrals.darkGrey,
		},
		warning: {
			bgActive: palette.red[800],
			containActive: palette.red[400],
		},
	},
	sentiment: {
		positive: palette.vibrantGreen[400],
		positiveBg: palette.vibrantGreen[800],
		negative: palette.red[400],
		negativeBg: palette.red[800],
		informative: palette.blue[300],
		informativeBg: palette.blue[800],
	},
	accent: {
		blue: "#1e94dc",
		blueBg: "#196ea426",
		darkBlue: "#196ea4",
		green: "#62a215",
		lightSilver: "#d5d9db",
		paleSilver: "#c4c9b5",
		tan: "#d6b9a5",
		icons: {
			greenContain: "#62bb58",
			greenBg: "#374732",
			orangeContain: "#ffa968",
			orangeBg: "#7f460a",
			pinkContain: palette.pink[300],
			pinkBg: palette.pink[700],
			purpleContain: "#bd96ea",
			purpleBg: "#41376a",
			blueContain: "#80a6ec",
			blueBg: "#294176",
		},
	},
	gradient: {
		mainStart: neutrals.dune,
		mainEnd: neutrals.black,
		cardStart: palette.gold[800],
		cardEnd: neutrals.dune,
	},
} as const;

export const components = {
	button: {
		borderRadius: borderRadius.m,
		borderWidth: spacing.sm,
	},
	card: {
		borderRadius: borderRadius.m,
		padding: spacing.md,
	},
	shadow: {
		default: {
			shadowOffset: { width: 5, height: 5 },
			shadowRadius: 5,
			shadowOpacity: 0.15,
			elevation: 5,
		},
	},
} as const;

export const theme = {
	neutrals,
	alpha,
	palette,
	borderRadius,
	spacing,
	fontFamily,
	fontSize,
	lineHeight,
	letterSpacing,
	components,
	light,
	dark,
};

export type Theme = typeof theme;
export default theme;
