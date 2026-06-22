export const chinaData = {
  investments: [
    { year: 2021, label: '农村供水完成投资', value: 525.02, unit: '亿元', type: 'annual' },
    { year: 2022, label: '农村供水完成投资', value: 993, unit: '亿元', type: 'annual' },
    { year: 2022, label: '环境污染治理总投资', value: 9014, unit: '亿元', type: 'reference' },
    { year: 2022, label: '城镇环境基础设施投资', value: 5972, unit: '亿元', type: 'reference' },
    { year: '2016—2023', label: '水污染防治累计资金', value: 355, unit: '亿元', type: 'cumulative' },
    { year: '2012—2022', label: '农村供水工程累计投资', value: 4667, unit: '亿元', type: 'cumulative' },
    { year: '2021—2025', label: '“十四五”农村供水落实资金', value: 5902.8, unit: '亿元', type: 'cumulative' }
  ],
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
    { year: 2018, good: 71.0, poor: 6.9 },
    { year: 2019, good: 74.9, poor: 3.4 },
    { year: 2020, good: 83.4, poor: 0.6 },
    { year: 2021, good: 84.9, poor: 1.2 },
    { year: 2022, good: 87.9, poor: 0.7 },
    { year: 2023, good: 89.4, poor: 0.7 }
  ],
  waterQualitySources: [
    { year: 2016, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201706/P020170605833655914077.pdf' },
    { year: 2017, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201805/P020180531534645032372.pdf' },
    { year: 2018, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201905/P020190619587632630618.pdf' },
    { year: 2019, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/202006/P020200602509464172096.pdf' },
    { year: 2023, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/' }
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

export const overseasProjects = [
  { project: '卡洛特水电站', type: '水电站', country: '巴基斯坦', year: 2022, investment: 18, unit: '亿美元', lon: 73.45, lat: 33.58 },
  { project: '凯乐塔水电站', type: '水电站', country: '几内亚', year: 2015, investment: 6, unit: '亿美元', lon: -13.13, lat: 10.47 },
  { project: '瓜达尔海水淡化厂', type: '供水', country: '巴基斯坦', year: 2023, lon: 62.33, lat: 25.12 },
  { project: '杰纳拉塔水坝', type: '水坝', country: '印度尼西亚', year: 2023, lon: 119.79, lat: -5.33 },
  { project: '哈努马法纳水电项目', type: '水电站', country: '马达加斯加', year: 2023, lon: 47.08, lat: -21.25 },
  { project: '尼日尔河治理项目', type: '河道治理', country: '尼日利亚', year: 2023, lon: 7.49, lat: 9.08 },
  { project: '莫汉南达橡胶坝工程', type: '橡胶坝/灌溉', country: '孟加拉国', year: 2023, lon: 88.3, lat: 24.75 },
  { project: '泡衣崂水坝', type: '水坝', country: '佛得角', year: 2006, lon: -23.6, lat: 15.1 },
  { project: '国家水资源信息数据中心', type: '水利信息化', country: '老挝', year: 2018, lon: 102.63, lat: 17.97 },
  { project: '三金考拉水电站', type: '水电站', country: '尼泊尔', year: 2024, lon: 85.32, lat: 27.71 }
]

export const pakistanData = {
  trends: {
    stress: {
      label: '水资源压力',
      unit: '%',
      note: '淡水提取占可再生淡水资源总量',
      values: [
        { year: 2012, value: 341.6 },
        { year: 2013, value: 333.636 },
        { year: 2014, value: 354.309 },
        { year: 2015, value: 358.018 },
        { year: 2016, value: 363.218 },
        { year: 2017, value: 363.582 },
        { year: 2018, value: 350.436 },
        { year: 2019, value: 322.018 },
        { year: 2020, value: 344.709 },
        { year: 2021, value: 334.836 },
        { year: 2022, value: 326 }
      ]
    },
    irrigation: {
      label: '灌溉农地占比',
      unit: '%',
      note: '灌溉农地占农业用地比例',
      values: [
        { year: 2012, value: 51.465 },
        { year: 2013, value: 49.449 },
        { year: 2014, value: 51.28 },
        { year: 2015, value: 51.737 },
        { year: 2016, value: 50.554 },
        { year: 2017, value: 49.239 },
        { year: 2018, value: 50.415 },
        { year: 2019, value: 50.532 },
        { year: 2020, value: 52.736 },
        { year: 2021, value: 54.062 },
        { year: 2022, value: 54.024 },
        { year: 2023, value: 54.174 }
      ]
    },
    yield: {
      label: '谷物单产',
      unit: 'kg/ha',
      note: 'API 实测谷物单产',
      values: [
        { year: 2012, value: 2862.6 },
        { year: 2013, value: 3001.3 },
        { year: 2014, value: 3001.2 },
        { year: 2015, value: 2942.4 },
        { year: 2016, value: 3020.7 },
        { year: 2017, value: 3180.4 },
        { year: 2018, value: 3149 },
        { year: 2019, value: 3160.6 },
        { year: 2020, value: 3353.4 },
        { year: 2021, value: 3489.4 },
        { year: 2022, value: 3463 },
        { year: 2023, value: 3634 }
      ]
    }
  },
  caseCards: [
    { label: '卡洛特水电站装机容量', value: 720, unit: 'MW', note: '2022 年投运项目' },
    { label: '项目受益人口', value: 500, unit: '万人', note: '报道口径' },
    { label: '地下水年超采量估计', value: 55, unit: '亿立方米', note: '2020 年文献估算' },
    { label: '灌溉水分生产率低效', value: 35, unit: '%', note: '2020 年文献口径' }
  ]
}

export const sourceLinks = {
  drinkingWater: 'https://data.worldbank.org/indicator/SH.H2O.BASW.ZS',
  population: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
  waterStress: 'https://data.worldbank.org/indicator/ER.H2O.FWST.ZS',
  freshwater: 'https://data.worldbank.org/indicator/ER.H2O.INTR.PC',
  pakistan: 'https://data.worldbank.org/country/pakistan',
  cidca: 'http://www.cidca.gov.cn/',
  mwrInternational: 'http://www.mwr.gov.cn/'
}
