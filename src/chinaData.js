export const chinaData = {
  investments: [
    { year: 2018, label: '农村供水完成投资', value: 416, unit: '亿元', type: 'annual', source: '水利部' },
    { year: 2019, label: '农村供水完成投资', value: 438, unit: '亿元', type: 'annual', source: '中国政府网' },
    { year: 2020, label: '农村供水完成投资', value: 481, unit: '亿元', type: 'annual', source: '中国政府网' },
    { year: 2021, label: '农村供水完成投资', value: 525.02, unit: '亿元', type: 'annual', source: '中国政府网' },
    { year: 2022, label: '农村供水落实资金', value: 993, unit: '亿元', type: 'annual', source: '中国政府网' },
    { year: 2023, label: '农村供水落实资金', value: 1111, unit: '亿元', type: 'annual', source: '中国政府网' },
    { year: 2023, label: '水污染防治专项资金', value: 237, unit: '亿元', type: 'pollution', source: '财政部' },
    { year: 2024, label: '水污染防治专项资金', value: 242, unit: '亿元', type: 'pollution', source: '财政部' },
    { year: '党的十八大以来', label: '农村供水累计投资', value: 4667, unit: '亿元', type: 'cumulative' },
    { year: '“十四五”期间', label: '农村供水累计落实资金', value: 5902.8, unit: '亿元', type: 'cumulative' },
    { year: 2022, label: '环境污染治理总投资', value: 9014, unit: '亿元', type: 'reference' },
    { year: 2022, label: '城镇环境基础设施投资', value: 5972, unit: '亿元', type: 'reference' }
  ],
  ruralCoverage: [
    { year: 2015, tap: 75.0 },
    { year: 2016, tap: 79.0 },
    { year: 2017, tap: 80.4 },
    { year: 2018, tap: 81.0 },
    { year: 2019, tap: 82.0 },
    { year: 2020, tap: 83.0 },
    { year: 2021, tap: 84.0 },
    { year: 2022, tap: 87.0, scaled: 60.0 },
    { year: 2023, tap: 90.0, scaled: 62.0 }
  ],
  ruralWater: {
    tapWater2023: 90,
    tapWater2025: 96,
    scaledSupply2023: 62,
    scaledSupply2025: 71,
    target2030: 98,
    source: 'https://www.gov.cn/lianbo/bumen/202401/content_6925816.htm',
    sourceLabel: '中国政府网'
  },
  surfaceWater: [
    { year: 2016, good: 67.8, poor: 8.6 },
    { year: 2017, good: 67.9, poor: 8.3 },
    { year: 2018, good: 71.0, poor: 6.9 },
    { year: 2019, good: 74.9, poor: 3.4 },
    { year: 2020, good: 83.4, poor: 0.6 },
    { year: 2021, good: 84.9, poor: 1.2 },
    { year: 2022, good: 87.9, poor: 0.7 },
    { year: 2023, good: 89.4, poor: 0.7 },
    { year: 2024, good: 89.8, poor: 0.5 },
    { year: 2025, good: 90.2, poor: 0.4, note: '季度通报数据' }
  ],
  waterQualitySources: [
    { year: 2016, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201706/P020170605833655914077.pdf' },
    { year: 2017, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201805/P020180531534645032372.pdf' },
    { year: 2018, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/201905/P020190619587632630618.pdf' },
    { year: 2019, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/202006/P020200602509464172096.pdf' },
    { year: 2024, url: 'https://www.mee.gov.cn/hjzl/sthjzk/zghjzkgb/' }
  ],
  waterGovernanceFocus: [
    '流域统筹',
    '农村供水',
    '水环境治理',
    '节水型社会建设'
  ]
}

export const overseasProjects = [
  { project: '泡衣崂水坝', type: '水坝', country: '佛得角', year: 2006, lon: -23.6, lat: 15.1, unit: '中国政府援助' },
  { project: '凯乐塔水电站', type: '水电站', country: '几内亚', year: 2015, capacity: 240, investment: 5.6, unit: '亿美元', lon: -13.13, lat: 10.47 },
  { project: '杰纳拉塔水坝', type: '水坝/灌溉', country: '印度尼西亚', year: 2023, lon: 119.79, lat: -5.33, unit: '贷款，金额待公开' },
  { project: '吉布三期水电站', type: '水电站', country: '埃塞俄比亚', year: 2016, capacity: 1870, investment: 18, unit: '亿美元', lon: 37.3, lat: 6.85 },
  { project: '莫汉南达橡胶坝工程', type: '灌溉/橡胶坝', country: '孟加拉国', year: 2023, lon: 88.3, lat: 24.75 },
  { project: '尼日尔河治理项目', type: '河道治理', country: '尼日利亚', year: 2023, lon: 7.49, lat: 9.08 },
  { project: '三金考拉水电站', type: '水电站', country: '尼泊尔', year: 2024, lon: 85.32, lat: 27.71 },
  { project: '塔贝拉四期扩建', type: '水电扩建', country: '巴基斯坦', year: 2018, capacity: 1410, investment: 7.8, unit: '亿美元', lon: 72.82, lat: 34.09 },
  { project: '卡洛特水电站', type: '水电站', country: '巴基斯坦', year: 2022, capacity: 720, investment: 17.4, unit: '亿美元', lon: 73.45, lat: 33.58 },
  { project: '瓜达尔海水淡化厂', type: '供水', country: '巴基斯坦', year: 2023, lon: 62.33, lat: 25.12, unit: '中国政府援助，金额未公开' },
  { project: '达苏水电站', type: '水电站', country: '巴基斯坦', year: 2023, capacity: 4320, investment: 40, unit: '亿美元', lon: 73.3, lat: 35.3 },
  { project: '援津巴布韦水井项目', type: '供水/水井', country: '津巴布韦', year: 2023, lon: 31.05, lat: -17.83, unit: '中国政府援助' },
  { project: '伊洛瓦底江水资源合作', type: '水资源合作', country: '缅甸', year: 2019, lon: 96.13, lat: 19.76 },
  { project: '国家水资源信息数据中心', type: '水利信息化', country: '老挝', year: 2018, lon: 102.63, lat: 17.97, unit: '中国政府援助' },
  { project: '哈努马法纳水电项目', type: '水电站', country: '马达加斯加', year: 2023, lon: 47.08, lat: -21.25, unit: '贷款，金额待公开' }
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
      note: 'World Bank API 实测谷物单产',
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
    },
    guarantee: {
      label: '全国灌溉保证率',
      unit: '%',
      note: '中巴水利合作项目数与全国灌溉保证率',
      values: [
        { year: 2015, value: 72.4, projects: 2 },
        { year: 2016, value: 74.1, projects: 3 },
        { year: 2017, value: 75.8, projects: 5 },
        { year: 2018, value: 75.2, projects: 6 },
        { year: 2019, value: 77.0, projects: 8 },
        { year: 2020, value: 79.5, projects: 9 },
        { year: 2021, value: 81.2, projects: 11 },
        { year: 2022, value: 80.8, projects: 12 },
        { year: 2023, value: 83.5, projects: 14 },
        { year: 2024, value: 84.1, projects: 16 }
      ]
    }
  },
  cooperationCards: [
    { label: '中巴水利合作项目数', value: 16, unit: '个', note: '2024 年统计' },
    { label: '全国灌溉保证率', value: 84.1, unit: '%', note: '2024 年统计' },
    { label: '人均水资源量下降', value: 83, unit: '%', note: '1951—2017 年变化' },
    { label: '农业用水地表水满足', value: 40, unit: '%', note: '政府文件与研究资料' }
  ],
  caseCards: [
    { label: '卡洛特水电站装机容量', value: 720, unit: 'MW', note: '2022 年投运项目' },
    { label: '塔贝拉四期扩建装机', value: 1410, unit: 'MW', note: '2018 年项目' },
    { label: '达苏水电站规划装机', value: 4320, unit: 'MW', note: '在建项目' },
    { label: '地下水年超采量估计', value: 55, unit: '亿立方米', note: '2020 年文献估算' }
  ]
}

export const sourceLinks = {
  drinkingWater: 'https://data.worldbank.org/indicator/SH.H2O.BASW.ZS',
  population: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
  waterStress: 'https://data.worldbank.org/indicator/ER.H2O.FWST.ZS',
  freshwater: 'https://data.worldbank.org/indicator/ER.H2O.INTR.PC',
  pakistan: 'https://data.worldbank.org/country/pakistan',
  pakistanWaterReport: 'https://documents.worldbank.org/curated/en/251191548275645649/pdf/133964-WP-PUBLIC-ADD-SERIES-22-1-2019-18-56-25-W.pdf',
  pakistanGroundwater: 'https://documents1.worldbank.org/curated/en/174121579803266899/pdf/Groundwater-and-Surface-Water-in-the-Mega-Irrigation-Systems-of-Pakistan-The-Case-for-Conjunctive-Management.pdf',
  cidca: 'http://www.cidca.gov.cn/',
  mwrInternational: 'http://www.mwr.gov.cn/',
  nsbd: 'https://www.nsbd.cn/zt/zxgctsszn/',
  turkanaCase: 'https://www.unicef.org/kenya/stories/drought-hope-advancing-water-sanitation-and-hygiene-turkana-county'
}
