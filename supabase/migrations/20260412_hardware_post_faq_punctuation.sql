UPDATE public.posts
SET
  faq_en = $faqen$
[
  {"question":"What is a sensor in the context of hardware product discovery?","answer":"A \"sensor\" here means any affordable, mass-market data-capture module: cameras, microphones, IMUs, heart-rate monitors, ToF depth sensors. Each has recently crossed the price threshold where embedding it in a consumer product is economically viable. Tracking which sensors have just become cheap is the starting point for finding new product opportunities, because each cost crossover unlocks an entirely new product surface."},
  {"question":"Why does China supply chain matter for hardware startups?","answer":"China's manufacturing ecosystem, especially Shenzhen, has dramatically lowered both the cost and the minimum order quantities for sensor-rich hardware. A skilled China sourcing agent or China procurement agent can turn a hardware spec into testable prototypes in two to three weeks, which directly compresses the PDCA learning cycle and lowers the capital barrier to validating a product idea. Without this access, the same cycle takes months and costs multiples more."},
  {"question":"How do LLM updates affect hardware product opportunities?","answer":"Each major LLM update expands what on-device AI can decide in real time: lower latency, smaller model footprints, better multimodal understanding. Every capability jump unlocks a new class of self-adaptive hardware that was previously too expensive, too power-hungry, or too inaccurate to ship. Tracking LLM updates is therefore equivalent to tracking which hardware product ideas just became technically feasible."},
  {"question":"What is the \"golden intersection\" in this product discovery framework?","answer":"The golden intersection is the point where three conditions are simultaneously true: the technology is feasible today (sensor plus algorithm works at production cost), the pain is genuine and high-frequency (validated in real unfiltered user behavior, not surveys), and you can actually build and ship it (your resources and China supply chain access match the requirement). Two out of three is still a dead end."},
  {"question":"How does PDCA velocity create a competitive moat?","answer":"PDCA (Plan-Do-Check-Act) velocity measures how fast a team can go from hypothesis to real user feedback. Each cycle is a unit of market information. A team running weekly cycles accumulates 52 units of knowledge per year versus 12 for a team running monthly cycles. Over two years, the compounding gap in market understanding becomes very difficult for slower competitors to close, regardless of their initial idea quality or funding level."},
  {"question":"What types of hardware categories are best suited for this framework?","answer":"The framework works best for hardware categories that are currently at stage one (fixed parameters) or stage two (manually adjustable) and have high daily usage frequency. Examples include sleep tech, kitchen appliances, ergonomic equipment, fitness trackers, industrial monitoring tools, and any device where people currently tolerate manual calibration or adjustment. The higher the usage frequency and the larger the individual variance between users, the greater the value of self-adaptive intelligence."}
]
$faqen$::jsonb,
  faq_zh = $faqzh$
[
  {"question":"在硬件产品发现语境中，\"传感器\"指什么？","answer":"这里的\"传感器\"指任何已经实现大众市场定价的数据采集模块：摄像头、麦克风、IMU、心率监测器、ToF 深度传感器。这些模块最近已跨越价格门槛，将其嵌入消费品在经济上已经可行。追踪哪些传感器刚刚变便宜，是寻找新产品机会的起点，因为每次成本跨越都会解锁一个全新的产品表面。"},
  {"question":"为什么中国供应链对硬件初创企业如此重要？","answer":"中国制造生态，尤其是深圳，已大幅降低了富含传感器的硬件产品的成本和最低起订量。一位有经验的中国采购代理，能在两到三周内将硬件规格书转化为可测试原型，直接压缩 PDCA 学习周期，降低验证产品创意的资本门槛。若没有这种资源，同样的周期需要数月，成本是数倍。"},
  {"question":"大模型更新如何影响硬件产品机会？","answer":"每次重大大模型更新，都扩展了端侧 AI 能实时决策的范围：更低延迟、更小的模型尺寸、更好的多模态理解。每次能力跃升，都解锁了一类此前因过于昂贵、功耗过高或精度不足而无法发货的自适应硬件产品。因此，追踪大模型更新，等同于追踪哪些硬件产品创意刚刚在技术上变得可行。"},
  {"question":"这个产品发现框架中的\"黄金交叉点\"是什么？","answer":"黄金交叉点是三个条件同时为真的时刻：技术今天就可行（传感器加算法在量产成本下能工作）、痛点真实且高频（在真实的非过滤用户行为中得到验证，而非问卷调查）、以及你真的能构建并交付它（你的资源和中国供应链资源与需求匹配）。三中有二，依然是死胡同。"},
  {"question":"PDCA 速度如何建立竞争护城河？","answer":"PDCA（计划-执行-检查-行动）速度衡量的是一个团队从假设到真实用户反馈的速度。每个循环是一个市场信息单元。每周循环的团队每年积累 52 个知识单元，每月循环的团队只有 12 个。两年后，市场理解上的累积差距，无论竞争对手初始创意质量或融资规模如何，都将变得极难追赶。"},
  {"question":"哪些硬件品类最适合这套框架？","answer":"这套框架最适用于目前处于第一阶段（固定参数）或第二阶段（可手动调节）、且具有高日常使用频率的硬件品类。典型例子包括：睡眠科技、厨房电器、人体工学设备、健身追踪器、工业监测工具，以及任何用户目前需要手动校准或调整的设备。使用频率越高、用户个体差异越大，自适应智能的价值就越大。"}
]
$faqzh$::jsonb,
  updated_at = now()
WHERE slug = 'hardware-product-discovery-sensors-china-supply-chain-llm';
