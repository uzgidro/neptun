/**
 * Static registry mapping GES organization IDs to their SVG mnemonic diagram filenames.
 */
const GES_SVG_MAP = new Map<number, string>([
    [16, 'ges-16-chorbog.svg'],
    [17, 'ges-17-hodzhikent.svg'],
    [18, 'ges-18-gazalkent.svg'],
    [19, 'ges-19-ugam.svg'],
    [22, 'ges-22-ispaysoy.svg'],
    [23, 'ges-23-tavoqsoy.svg'],
    [24, 'ges-24-chirchiq.svg'],
    [25, 'ges-25-kamolot.svg'],
    [26, 'ges-26-oqqovoq.svg'],
    [28, 'ges-28-oqqovoq-2.svg'],
    [29, 'ges-29-qibray.svg'],
    [30, 'ges-30-qodiriya.svg'],
    [31, 'ges-31-salar.svg'],
    [32, 'ges-32-bozsuy.svg'],
    [33, 'ges-33-shayxontohur.svg'],
    [34, 'ges-34-borijiar.svg'],
    [35, 'ges-35-oqtepa.svg'],
    [36, 'ges-36-quyi-bozsuy-14.svg'],
    [37, 'ges-37-quyi-bozsuy-18.svg'],
    [38, 'ges-38-quyi-bozsuy-19.svg'],
    [39, 'ges-39-quyi-bozsuy-23.svg'],
    [40, 'ges-40-quyi-bozsuy-22.svg'],
    [41, 'ges-41-tuyabugiz.svg'],
    [42, 'ges-42-farhod.svg'],
    [44, 'ges-44-zomin.svg'],
    [46, 'ges-46-hishrov.svg'],
    [47, 'ges-47-irtishar.svg'],
    [49, 'ges-49-taliguliyan-1.svg'],
    [52, 'ges-52-taliguliyan-3.svg'],
    [53, 'ges-53-micro-5b.svg'],
    [54, 'ges-54-urgut.svg'],
    [59, 'ges-59-shaudar-2.svg'],
    [60, 'ges-60-shaudar-1.svg'],
    [61, 'ges-61-shaudar-3.svg'],
    [62, 'ges-62-andijon-1.svg'],
    [63, 'ges-63-andijon-2.svg'],
    [64, 'ges-64-kudash.svg'],
    [66, 'ges-66-ges5a.svg'],
    [67, 'ges-67-ges6a.svg'],
    [68, 'ges-68-jfk-1.svg'],
    [69, 'ges-69-jfk-2.svg'],
    [70, 'ges-70-zavraq.svg'],
    [76, 'ges-76-ges9a.svg'],
    [77, 'ges-77-chortoq.svg'],
    [78, 'ges-78-yangiariq.svg'],
    [79, 'ges-79-norin.svg'],
    [80, 'ges-80-tupolang.svg'],
    [81, 'ges-81-zarchob-1.svg'],
    [83, 'ges-83-zarchob-2.svg'],
    [88, 'ges-88-ohangaron.svg'],
    [90, 'ges-90-ertoshsoy.svg'],
    [91, 'ges-91-tuyamuyun.svg'],
    [92, 'ges-92-hisorak.svg'],
    [94, 'ges-94-samak.svg'],
    [95, 'ges-95-qamchiq.svg'],
    [102, 'ges-102-qodiriya-3a.svg'],
    [104, 'ges-104-chotqol.svg']
]);

export function getSvgAssetUrl(gesId: number): string | null {
    const filename = GES_SVG_MAP.get(gesId);
    return filename ? `assets/svg/${filename}` : null;
}

export function hasSvgSchema(gesId: number): boolean {
    return GES_SVG_MAP.has(gesId);
}
