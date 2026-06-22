export const chinaData = {
  ruralWater: {
    tapWater2025: 96,
    scaledSupply2025: 71,
    target2030: 98,
    source: 'http://www.mwr.gov.cn/hd/zxft/2026/fbh20260512/index.html',
    sourceLabel: '水利部新闻发布会'
  },
  surfaceWater: [
    { year: 2016, good: 67.8, poor: 8.6 },
    { year: 2017, good: 67.9, poor: 8.3 },
    { year: 2018, good: 71.0, poor: 6.7 },
    { year: 2019, good: 74.9, poor: 3.4 }
  ],
  waterQualitySources: [
    { year: 2016, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201706/P020170605833655914077.pdf' },
    { year: 2017, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201805/P020180531534645032372.pdf' },
    { year: 2018, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201905/P020190619587632630618.pdf' },
    { year: 2019, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/202006/P020200602509464172096.pdf' }
  ],
  diversion: {
    waterYear: '2025—2026',
    supply: 3.59,
    unit: '亿立方米',
    destination: '河北、天津',
    source: 'https://epaper.gmw.cn/gmrb/html/content/202606/03/content_15633.html',
    sourceLabel: '光明日报'
  }
}

export const sourceLinks = {
  drinkingWater: 'https://data.worldbank.org/indicator/SH.H2O.BASW.ZS',
  population: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
  waterStress: 'https://data.worldbank.org/indicator/ER.H2O.FWST.ZS',
  freshwater: 'https://data.worldbank.org/indicator/ER.H2O.INTR.PC'
}
