export interface Product {
  id: string;
  name: string;
  cash: number;
  syncPrice: number;
  pay12: number;
  pay24: number;
  pay48: number;
  category: string;
  image?: string;
}

export const PRODUCTS: Product[] = [
  { id: "ANKER_SOLIX_F2600", name: "ANKER SOLIX F2600", cash: 3490.00, syncPrice: 3490.00, pay12: 290.83, pay24: 145.42, pay48: 72.71, category: "Anker Battery", image: "/anker/anker-f2600.png" },
  { id: "ANKER_SOLIX_3800", name: "ANKER SOLIX 3800", cash: 6590.00, syncPrice: 7590.00, pay12: 549.16, pay24: 316.25, pay48: 158.13, category: "Anker Battery", image: "/anker/anker-3800.png" },
  { id: "EXPANSION_BATTERY_BP2600", name: "EXPANSION BATTERY BP2600", cash: 1990.00, syncPrice: 2490.00, pay12: 165.83, pay24: 103.75, pay48: 51.88, category: "Expansion", image: "/anker/bp2600.png" },
  { id: "EXPANSION_BATTERY_BP3800", name: "EXPANSION BATTERY BP3800", cash: 3290.00, syncPrice: 3790.00, pay12: 274.16, pay24: 157.92, pay48: 78.96, category: "Expansion", image: "/anker/bp3800.png" },
  { id: "PANEL_200W", name: "PANEL 200W", cash: 1090.00, syncPrice: 1290.00, pay12: 90.84, pay24: 53.75, pay48: 26.88, category: "Solar Panels", image: "/anker/panel-200w.png" },
  { id: "PANEL_400W", name: "PANEL 400W", cash: 1690.00, syncPrice: 1890.00, pay12: 140.84, pay24: 78.75, pay48: 39.38, category: "Solar Panels", image: "/anker/panel-400w.png" },
  { id: "PANEL_200W_50", name: "PANEL 200W 50%", cash: 545.00, syncPrice: 645.00, pay12: 45.41, pay24: 26.88, pay48: 13.44, category: "Solar Panels", image: "/anker/panel-200w.png" },
  { id: "PANEL_400W_50", name: "PANEL 400W 50%", cash: 845.00, syncPrice: 945.00, pay12: 70.41, pay24: 39.38, pay48: 19.69, category: "Solar Panels", image: "/anker/panel-400w.png" },
  { id: "TRANSFER_SWITH_MANUAL", name: "TRANSFER SWITCH MANUAL", cash: 1690.00, syncPrice: 1890.00, pay12: 140.83, pay24: 78.75, pay48: 39.38, category: "Transfer Switches", image: "https://i.postimg.cc/mgHQbydG/Trans-Manual.png" },
  { id: "TRANSFER_SWITH_AUTOMATICO", name: "TRANSFER SWITCH AUTOMATICO", cash: 3290.00, syncPrice: 3790.00, pay12: 274.16, pay24: 157.92, pay48: 78.96, category: "Transfer Switches", image: "https://i.postimg.cc/VkxWMVSB/Trans-Automatico.png" },
  { id: "TRANSFER_SWITH_MANUAL_APTO", name: "TRANSFER SWITCH MANUAL APARTAMENTO", cash: 1190.00, syncPrice: 1890.00, pay12: 99.16, pay24: 78.75, pay48: 39.38, category: "Transfer Switches", image: "https://i.postimg.cc/mgHQbydG/Trans-Manual.png" },
  { id: "TRANSFER_SWITH_AUTOMATICO_APTO", name: "TRANSFER SWITCH AUTOMATICO APARTAMENTO", cash: 2790.00, syncPrice: 3290.00, pay12: 232.50, pay24: 137.08, pay48: 68.54, category: "Transfer Switches", image: "https://i.postimg.cc/VkxWMVSB/Trans-Automatico.png" },
  { id: "COOLER_40", name: "COOLER 40", cash: 1590.00, syncPrice: 1790.00, pay12: 132.50, pay24: 74.58, pay48: 37.29, category: "Coolers", image: "https://i.postimg.cc/9FJWr6kC/Cooler40.png" },
  { id: "COOLER_50", name: "COOLER 50", cash: 1690.00, syncPrice: 1890.00, pay12: 140.83, pay24: 78.75, pay48: 39.38, category: "Coolers", image: "https://i.postimg.cc/KjGNj31C/Cooler50.png" },
  { id: "10M_PANEL_EXTENSION_CABLE", name: "10M Panel Extension Cable", cash: 110.00, syncPrice: 130.00, pay12: 9.17, pay24: 5.42, pay48: 2.71, category: "Accessories", image: "https://i.postimg.cc/zGs4BpqJ/Cable.png" },
];
