const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const RESTAURANTS = [
  { id: 'r001', name: '老北京铜锅涮肉', tags: ['火锅', '聚餐', '肉食系'], avgPrice: 128, location: '朝阳区三里屯', desc: '正宗铜锅，手切鲜羊肉，蘸料绝了！冬天不涮一顿等于白过', emoji: '🍲', rating: 4.7 },
  { id: 'r002', name: '粤式茶餐厅·点心局', tags: ['粤菜', '早茶', '精致'], avgPrice: 88, location: '静安区南京西路', desc: '虾饺皇一口爆汁，叉烧酥层层起酥，肠粉滑到筷子夹不住', emoji: '🥟', rating: 4.5 },
  { id: 'r003', name: '川味小馆·辣子鸡', tags: ['川菜', '辣', '下饭'], avgPrice: 68, location: '海淀区五道口', desc: '辣子鸡里找鸡，水煮鱼里捞鱼，麻到灵魂出窍的爽', emoji: '🌶️', rating: 4.6 },
  { id: 'r004', name: '日式居酒屋·深夜食堂', tags: ['日料', '小酌', '微醺'], avgPrice: 158, location: '徐汇区衡山路', desc: '清酒配烤串，刺身鲜到飞起，适合慢慢聊的那种氛围', emoji: '🍶', rating: 4.8 },
  { id: 'r005', name: '东北铁锅炖', tags: ['东北菜', '大份', '豪放'], avgPrice: 98, location: '浦东新区世纪大道', desc: '铁锅炖大鹅贴饼子，一锅够六个人吃到扶墙出', emoji: '🫕', rating: 4.4 },
  { id: 'r006', name: '素食主义·轻食沙拉', tags: ['素食', '健康', '轻食'], avgPrice: 58, location: '黄浦区新天地', desc: '牛油果藜麦碗，低卡高颜值，吃完觉得自己特别自律', emoji: '🥗', rating: 4.2 },
  { id: 'r007', name: '韩式烤肉·五花肉', tags: ['韩料', '烤肉', '肉食系'], avgPrice: 138, location: '朝阳区望京', desc: '厚切五花肉滋滋冒油，包生菜一口闷，再来碗冷面收尾', emoji: '🥩', rating: 4.6 },
  { id: 'r008', name: '泰式冬阴功', tags: ['泰菜', '酸辣', '异域'], avgPrice: 108, location: '长宁区中山公园', desc: '冬阴功汤酸辣开胃，芒果糯米饭甜到心里，假装在曼谷', emoji: '🍜', rating: 4.5 },
  { id: 'r009', name: '意式披萨·窑烤', tags: ['西餐', '披萨', '约会'], avgPrice: 118, location: '徐汇区武康路', desc: '窑烤薄底披萨，芝士拉丝半米长，配杯红酒氛围拉满', emoji: '🍕', rating: 4.7 },
  { id: 'r010', name: '兰州牛肉面', tags: ['面食', '快餐', '实惠'], avgPrice: 28, location: '西城区牛街', desc: '一清二白三红四绿五黄，毛细二细随你选，汤鲜面筋道', emoji: '🍜', rating: 4.3 },
  { id: 'r011', name: '云南过桥米线', tags: ['米线', '鲜香', '暖胃'], avgPrice: 48, location: '海淀区中关村', desc: '滚烫鸡汤烫熟食材，一碗下肚从胃暖到心，鲜到眉毛掉', emoji: '🍜', rating: 4.4 },
  { id: 'r012', name: '海鲜大排档', tags: ['海鲜', '大排档', '夜宵'], avgPrice: 188, location: '浦东新区陆家嘴', desc: '生蚝扇贝大龙虾，啤酒配海鲜，夜宵界的顶配', emoji: '🦞', rating: 4.5 },
  { id: 'r013', name: '潮汕牛肉火锅', tags: ['火锅', '牛肉', '鲜嫩'], avgPrice: 148, location: '天河区体育西', desc: '现切牛肉涮8秒，吊龙匙柄嫩到哭，沙茶酱是灵魂', emoji: '🥘', rating: 4.8 },
  { id: 'r014', name: '新疆大盘鸡', tags: ['西北菜', '大份', '下饭'], avgPrice: 78, location: '朝阳区大望路', desc: '大盘鸡拌皮带面，土豆软糯鸡肉入味，一份够三个人吃', emoji: '🍗', rating: 4.3 },
  { id: 'r015', name: '港式茶餐厅·冰室', tags: ['港式', '奶茶', '怀旧'], avgPrice: 65, location: '福田区购物公园', desc: '丝袜奶茶配菠萝油，冻柠茶配西多士，TVB同款味道', emoji: '🧋', rating: 4.4 },
  { id: 'r016', name: '墨西哥Taco', tags: ['墨西哥', '异域', '小食'], avgPrice: 88, location: '静安区愚园路', desc: '手作玉米饼包着慢炖牛肉，牛油果酱一绝，配杯Margarita', emoji: '🌮', rating: 4.3 },
  { id: 'r017', name: '重庆小面·酸辣粉', tags: ['川菜', '面食', '辣'], avgPrice: 22, location: '武昌区光谷', desc: '豌杂面杂酱浓郁，酸辣粉酸辣过瘾，一碗才二十出头', emoji: '🌶️', rating: 4.5 },
  { id: 'r018', name: '法式甜品店', tags: ['甜品', '下午茶', '拍照'], avgPrice: 98, location: '徐汇区安福路', desc: '马卡龙千层舒芙蕾，每个都像艺术品，拍照发圈必备', emoji: '🍰', rating: 4.6 },
  { id: 'r019', name: '湘菜馆·剁椒鱼头', tags: ['湘菜', '辣', '下饭'], avgPrice: 88, location: '岳麓区大学城', desc: '剁椒鱼头红彤彤，小炒肉香到邻居来敲门，米饭杀手', emoji: '🐟', rating: 4.5 },
  { id: 'r020', name: '印度咖喱屋', tags: ['印度菜', '咖喱', '异域'], avgPrice: 78, location: '朝阳区建国门外', desc: '黄油鸡咖喱配馕，香料层次丰富到舌头跳舞，越吃越上头', emoji: '🍛', rating: 4.2 },
  { id: 'r021', name: '精酿啤酒吧', tags: ['喝酒', '微醺', '夜生活'], avgPrice: 128, location: '南山区蛇口', desc: '十几种精酿轮着喝，IPA世涛酸啤总有一款对味', emoji: '🍺', rating: 4.4 },
  { id: 'r022', name: '螺蛳粉专门店', tags: ['螺蛳粉', '臭', '上瘾'], avgPrice: 32, location: '青山区红钢城', desc: '闻着臭吃着香，酸笋腐竹加鸭脚，一碗上瘾两碗入魂', emoji: '🍜', rating: 4.1 },
  { id: 'r023', name: '台湾卤肉饭', tags: ['台式', '便饭', '实惠'], avgPrice: 35, location: '思明区中山路', desc: '卤肉饭肥而不腻，卤蛋入味，配碗贡丸汤，简单却满足', emoji: '🍚', rating: 4.3 },
  { id: 'r024', name: '越南Pho', tags: ['越南菜', '清淡', '异域'], avgPrice: 52, location: '天河区珠江新城', desc: '牛骨汤底熬8小时，河粉滑嫩，九层塔配青柠，清爽治愈', emoji: '🍜', rating: 4.4 },
  { id: 'r025', name: '串串香·冷锅', tags: ['串串', '辣', '夜宵'], avgPrice: 78, location: '武侯区玉林路', desc: '冷锅串串不用自己涮，选好直接上，红油锅底香到犯规', emoji: '🍢', rating: 4.5 },
  { id: 'r026', name: '日式拉面·豚骨', tags: ['日料', '拉面', '暖胃'], avgPrice: 58, location: '长宁区古北', desc: '浓厚豚骨汤底，溏心蛋半熟完美，叉烧厚切入口即化', emoji: '🍜', rating: 4.6 },
  { id: 'r027', name: '贵州酸汤鱼', tags: ['贵州菜', '酸辣', '特色'], avgPrice: 98, location: '南明区花果园', desc: '红酸汤煮江鱼，酸得过瘾辣得舒服，蘸水是灵魂', emoji: '🐟', rating: 4.4 },
  { id: 'r028', name: '广式煲仔饭', tags: ['粤菜', '煲仔饭', '锅巴'], avgPrice: 45, location: '越秀区北京路', desc: '腊味煲仔饭，锅巴焦脆嘎嘣响，酱油一浇香气四溢', emoji: '🍚', rating: 4.5 },
  { id: 'r029', name: '土耳其烤肉', tags: ['中东菜', '烤肉', '异域'], avgPrice: 68, location: '朝阳区三里屯', desc: '旋转烤肉削下来夹饼，酸奶酱配烤饼，大口吃肉的快乐', emoji: '🥙', rating: 4.1 },
  { id: 'r030', name: '顺德双皮奶', tags: ['甜品', '广式', '下午茶'], avgPrice: 38, location: '顺德区大良', desc: '双皮奶奶香浓郁，姜撞奶现撞现吃，甜到心里暖到胃里', emoji: '🍮', rating: 4.3 },
  { id: 'r031', name: '成都冒菜', tags: ['川菜', '冒菜', '一个人的火锅'], avgPrice: 42, location: '锦江区春熙路', desc: '一个人的火锅，想吃什么夹什么，红油底料香到邻居报警', emoji: '🥘', rating: 4.4 },
  { id: 'r032', name: '上海本帮菜', tags: ['本帮菜', '浓油赤酱', '精致'], avgPrice: 138, location: '黄浦区城隍庙', desc: '红烧肉甜到心里，油爆虾壳脆肉嫩，浓油赤酱的上海味道', emoji: '🦐', rating: 4.6 },
  { id: 'r033', name: '蒙古烤全羊', tags: ['蒙古菜', '大份', '豪放'], avgPrice: 268, location: '海淀区北太平庄', desc: '整只烤全羊外焦里嫩，手撕着吃才有灵魂，适合大场面', emoji: '🐑', rating: 4.5 },
  { id: 'r034', name: '海南椰子鸡', tags: ['椰子鸡', '清淡', '养生'], avgPrice: 118, location: '福田区车公庙', desc: '椰子水煮鸡，清甜不腻，蘸酱油青桔，吃完喝汤完美', emoji: '🥥', rating: 4.5 },
  { id: 'r035', name: '西安肉夹馍', tags: ['西北菜', '面食', '实惠'], avgPrice: 18, location: '碑林区回民街', desc: '腊汁肉夹馍肉烂汁多，凉皮冰峰三秦套餐，十几块吃到撑', emoji: '🥙', rating: 4.6 },
  { id: 'r036', name: '日式寿司·Omakase', tags: ['日料', '寿司', '高端'], avgPrice: 388, location: '静安区南京西路', desc: '师傅当面捏寿司，每一贯都是艺术品，舌尖上的日本', emoji: '🍣', rating: 4.9 },
  { id: 'r037', name: '重庆老火锅', tags: ['火锅', '麻辣', '正宗'], avgPrice: 118, location: '渝中区解放碑', desc: '九宫格牛油锅底，毛肚鸭肠七上八下，辣到流泪还想吃', emoji: '🔥', rating: 4.7 },
  { id: 'r038', name: '云南菌子锅', tags: ['云南菜', '菌菇', '鲜'], avgPrice: 168, location: '五华区翠湖', desc: '野生菌火锅鲜到没朋友，见手青牛肝菌鸡枞，吃完看小人跳舞', emoji: '🍄', rating: 4.6 },
  { id: 'r039', name: '福建沙县小吃', tags: ['快餐', '实惠', '遍地'], avgPrice: 15, location: '全国人民家门口', desc: '拌面扁肉蒸饺，三件套不到20块，中国快餐之光', emoji: '🥟', rating: 4.0 },
  { id: 'r040', name: '意大利手工意面', tags: ['西餐', '意面', '约会'], avgPrice: 98, location: '徐汇区永康路', desc: '手工意面al dente，松露奶油酱裹满每一根，配杯Chianti', emoji: '🍝', rating: 4.5 },
  { id: 'r041', name: '潮汕砂锅粥', tags: ['粥', '鲜', '暖胃'], avgPrice: 68, location: '福田区八卦岭', desc: '砂锅粥鲜到眉毛掉，虾蟹粥料足味鲜，宵夜首选', emoji: '🥣', rating: 4.4 },
  { id: 'r042', name: '武汉热干面', tags: ['面食', '早餐', '地道'], avgPrice: 12, location: '江汉区万松园', desc: '芝麻酱拌面，碱面弹牙，配蛋酒和面窝，武汉人的DNA', emoji: '🍜', rating: 4.3 },
  { id: 'r043', name: '韩国炸鸡啤酒', tags: ['韩料', '炸鸡', '喝酒'], avgPrice: 98, location: '朝阳区望京', desc: '双拼炸鸡配啤酒，甜辣酱+芝士粉，来自星星同款', emoji: '🍗', rating: 4.4 },
  { id: 'r044', name: '四川钵钵鸡', tags: ['川菜', '冷吃', '小食'], avgPrice: 45, location: '武侯区宽窄巷子', desc: '冷吃串串泡红油，荤素搭配，边走边吃最巴适', emoji: '🍢', rating: 4.3 },
  { id: 'r045', name: '顺德鱼生', tags: ['粤菜', '鱼生', '鲜'], avgPrice: 158, location: '顺德区容桂', desc: '淡水鱼生薄如蝉翼，十几种配料拌着吃，顺德人的极致追求', emoji: '🐟', rating: 4.7 },
  { id: 'r046', name: '东北烧烤', tags: ['烧烤', '夜宵', '豪放'], avgPrice: 88, location: '南岗区中央大街', desc: '大腰子烤串配啤酒，东北烧烤的江湖地位无人能撼', emoji: '🍢', rating: 4.5 },
  { id: 'r047', name: '澳门茶餐厅', tags: ['澳门', '猪扒包', '奶茶'], avgPrice: 55, location: '路氹城威尼斯人', desc: '猪扒包外脆内嫩，冻柠茶解腻，赌场之间的能量补给站', emoji: '🥪', rating: 4.2 },
  { id: 'r048', name: '江西瓦罐汤', tags: ['瓦罐汤', '养生', '实惠'], avgPrice: 25, location: '东湖区八一桥', desc: '瓦罐煨汤慢火6小时，肉饼汤配拌粉，南昌人的早餐标配', emoji: '🥣', rating: 4.3 },
  { id: 'r049', name: '西班牙Tapas', tags: ['西班牙', '小食', '微醺'], avgPrice: 128, location: '静安区巨鹿路', desc: '火腿橄榄土豆饼，Sangria果酒，西班牙式的小确幸', emoji: '🫒', rating: 4.4 },
  { id: 'r050', name: '长沙臭豆腐', tags: ['小吃', '臭', '上瘾'], avgPrice: 15, location: '天心区坡子街', desc: '外焦里嫩灌汤汁，辣椒萝卜干加香菜，闻着臭排队也要吃', emoji: '🧆', rating: 4.2 }
]

const TAG_MATCH_MAP = {
  '肉肉肉': ['肉食系', '烤肉', '火锅', '大份'],
  '微醺': ['小酌', '喝酒', '微醺'],
  '好拍照': ['精致', '下午茶', '拍照'],
  '辣辣辣': ['辣', '川菜', '湘菜'],
  '清淡养生': ['清淡', '养生', '健康', '轻食'],
  '大口吃': ['大份', '豪放'],
  '小资情调': ['精致', '约会', '高端'],
  '实惠管饱': ['实惠', '快餐'],
  '夜宵走起': ['夜宵', '夜生活'],
  '甜品续命': ['甜品', '下午茶'],
  '海鲜自由': ['海鲜'],
  '面食控': ['面食', '米线', '拉面']
}

const TAG_CONFLICT_MAP = {
  '太贵不行': ['高端'],
  '不吃辣': ['辣', '川菜', '湘菜'],
  '海鲜过敏': ['海鲜'],
  '素食主义': ['肉食系', '烤肉'],
  '减肥中': ['大份', '豪放']
}

const SYSTEM_PROMPT = `你是"端水大师"——一个混迹本地生活多年、极其懂人情世故、说话幽默损人的AI裁判。

## 你的核心能力
1. **端水**：当群友口味冲突时，找到让各方都能接受的餐厅
2. **锐评**：用朋友圈文案风格说话，有梗有态度，绝不无聊
3. **说服**：给每个人一个无法拒绝的理由，让他们心服口服

## 端水策略
- 如果有人想吃辣、有人不吃辣 → 推荐有辣有不辣的店（如火锅、串串）
- 如果有人想吃肉、有人想减肥 → 推荐有沙拉也有肉的店
- 如果有人想省钱、有人想装逼 → 推荐环境好但人均不高的店
- 如果所有人都想喝酒 → 直接推酒吧或居酒屋
- 如果需求完全矛盾 → 找一个"虽然不是最优但谁都不亏"的折中方案

## 输出格式（严格JSON）
{
  "winner_id": "从餐厅列表中选出的餐厅ID",
  "ai_comment": "50-100字的AI锐评，要有梗有态度，像朋友圈文案",
  "reasons": [
    {"name": "给这个人起个搞笑外号", "reason": "针对TA的口味给一个无法拒绝的理由，30字以内"}
  ]
}

## 语言风格示例
- "本局由'无辣不欢张三'和'佛系养生李四'共同妥协达成——人生就是这样，你退一步我退一步，最后都进了同一家店。🤝"
- "当吃草的遇见喝酒的，本大师表示：成年人的世界，当然是全都要！🫗"
- "本大师端了三碗水，洒了两碗，最后一碗稳稳端到了这家店。别问为什么，问就是缘分！"`

function localJudge(votes, vetoRestaurantId, budgetRange) {
  let candidates = [...RESTAURANTS]
  if (vetoRestaurantId) {
    candidates = candidates.filter(r => r.id !== vetoRestaurantId)
  }
  if (budgetRange) {
    const filtered = candidates.filter(r => r.avgPrice >= budgetRange.min && r.avgPrice <= budgetRange.max)
    if (filtered.length > 0) candidates = filtered
  }

  const allLikes = []
  const allDislikes = []
  const supplements = []
  const userProfiles = []

  if (votes && votes.length > 0) {
    votes.forEach((v, i) => {
      const likes = v.likes || []
      const dislikes = v.dislikes || []
      const likeTexts = likes.map(t => t.text || t)
      const dislikeTexts = dislikes.map(t => t.text || t)
      allLikes.push(...likes)
      allDislikes.push(...dislikes)
      if (v.supplement) supplements.push(v.supplement)
      userProfiles.push({ index: i, likes: likeTexts, dislikes: dislikeTexts, supplement: v.supplement || '' })
    })
  }

  const scored = candidates.map(r => {
    let score = r.rating * 2
    let matchCount = 0
    let conflictCount = 0

    allLikes.forEach(tag => {
      const text = tag.text || tag
      const matchTags = TAG_MATCH_MAP[text] || []
      if (r.tags.some(t => matchTags.includes(t))) {
        score += 3
        matchCount++
      }
    })

    allDislikes.forEach(tag => {
      const text = tag.text || tag
      const conflictTags = TAG_CONFLICT_MAP[text] || []
      if (r.tags.some(t => conflictTags.includes(t))) {
        score -= 5
        conflictCount++
      }
    })

    if (r.avgPrice > 150) score -= 1
    if (r.avgPrice < 50) score += 0.5

    return { ...r, score, matchCount, conflictCount }
  })

  scored.sort((a, b) => b.score - a.score)

  const winner = scored[0] || RESTAURANTS[0]
  const runnersUp = scored.slice(1, 3)

  const nicknames = generateNicknames(userProfiles)
  const aiComment = generateLocalComment(winner, nicknames, userProfiles, supplements)
  const reasons = generateReasons(winner, userProfiles, nicknames)

  return {
    code: 0,
    data: {
      restaurant: {
        id: winner.id,
        name: winner.name,
        tags: winner.tags,
        avgPrice: winner.avgPrice,
        location: winner.location,
        desc: winner.desc,
        emoji: winner.emoji,
        rating: winner.rating
      },
      aiComment,
      reasons,
      runnersUp: runnersUp.map(r => ({
        id: r.id, name: r.name, emoji: r.emoji,
        avgPrice: r.avgPrice, tags: r.tags
      })),
      source: 'local'
    }
  }
}

function generateNicknames(userProfiles) {
  const nicknameMap = {
    '肉肉肉': '肉食狂魔',
    '微醺': '酒鬼',
    '好拍照': '朋友圈摄影师',
    '辣辣辣': '无辣不欢',
    '清淡养生': '养生达人',
    '大口吃': '大胃王',
    '小资情调': '精致达人',
    '实惠管饱': '省钱小能手',
    '夜宵走起': '夜猫子',
    '甜品续命': '甜食控',
    '海鲜自由': '海鲜脑袋',
    '面食控': '碳水教徒'
  }
  return userProfiles.map((p, i) => {
    if (p.likes.length > 0) {
      return nicknameMap[p.likes[0]] || `群友${String.fromCharCode(65 + i)}`
    }
    return `群友${String.fromCharCode(65 + i)}`
  })
}

function generateLocalComment(winner, nicknames, userProfiles, supplements) {
  const templates = [
    `本局由'${nicknames[0] || '群友A'}'和'${nicknames[1] || '群友B'}'共同妥协达成——人生就是这样，你退一步我退一步，最后都进了${winner.name}。🤝`,
    `经过本大师反复端量，${winner.name}是唯一能让'${nicknames[0] || '群友A'}'不翻脸、'${nicknames[1] || '群友B'}'不掀桌的完美选择。⚖️`,
    `本大师翻阅了${RESTAURANTS.length}家店、权衡了${userProfiles.length}个人的诉求，最终判决：去${winner.name}！谁有意见憋着！😤`,
    `本大师端了三碗水，洒了两碗，最后一碗稳稳端到了${winner.name}。别问为什么，问就是缘分！🫗`,
    `当'${nicknames[0] || '群友A'}'遇见'${nicknames[1] || '群友B'}'，就像火锅遇见冰粉——看似矛盾实则绝配。${winner.name}，就是你们的命中注定！💕`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateReasons(winner, userProfiles, nicknames) {
  const reasonMap = {
    '肉肉肉': '这家店的肉管够，放心大胆地吃！',
    '微醺': '氛围到位，小酌一杯刚刚好～',
    '好拍照': '出片率99%，朋友圈素材管够！',
    '辣辣辣': '辣度拉满，保证你吃得过瘾！',
    '清淡养生': '清淡不等于无聊，养生也快乐！',
    '大口吃': '分量管够，减肥明天再说！',
    '小资情调': '环境绝了，适合慢慢享受！',
    '实惠管饱': '性价比之王，钱包不心疼！',
    '夜宵走起': '深夜食堂已就位！',
    '甜品续命': '专治各种不开心！',
    '海鲜自由': '海鲜控的天堂！',
    '面食控': '面食的灵魂在这升华了！',
    '不要香菜': '放心，跟老板说不要香菜！',
    '海鲜过敏': '这家店没有海鲜，安全！',
    '太贵不行': '人均友好，不会吃土！',
    '不吃辣': '完全不辣，温和不刺激！',
    '减肥中': '低卡选择也有，减肥也能吃好！',
    '吃土了': '超值套餐，省钱也吃好！'
  }

  if (userProfiles.length === 0) {
    return [
      { name: '群友A', reason: '这家店综合评分最高，包你满意！' },
      { name: '群友B', reason: '口味兼顾各方，端水端得稳！' }
    ]
  }

  return userProfiles.map((p, i) => {
    const name = nicknames[i] || `群友${String.fromCharCode(65 + i)}`
    const mainTag = p.likes.length > 0 ? p.likes[0] : ''
    const reason = reasonMap[mainTag] || '这家店综合评分最高，包你满意！'
    return { name, reason }
  })
}

const AI_CONFIG = {
  apiKey: process.env.MODELSCOPE_API_KEY || '',
  baseUrl: 'https://api-inference.modelscope.cn/v1',
  model: 'deepseek-ai/DeepSeek-V4-Pro'
}

async function handleChat(question, chatHistory, contextInfo) {
  const apiKey = AI_CONFIG.apiKey
  const baseUrl = AI_CONFIG.baseUrl
  const model = AI_CONFIG.model

  if (!apiKey) {
    const localReplies = [
      '本大师觉得这个选择已经很完美了，别纠结了！',
      '你要是实在不满意，那就给大师一巴掌重新来过吧！',
      '人生没有完美答案，但这家店绝对不亏！',
      '信大师，得永生！别问了，去吃吧！'
    ]
    return {
      code: 0,
      data: { reply: localReplies[Math.floor(Math.random() * localReplies.length)] }
    }
  }

  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n你正在回答用户关于刚才判决的追问。保持幽默损人的风格，简短回答（50字以内）。` }
  ]

  if (contextInfo) {
    messages.push({ role: 'system', content: contextInfo })
  }

  if (chatHistory && chatHistory.length > 0) {
    chatHistory.forEach(msg => {
      messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content })
    })
  }

  messages.push({ role: 'user', content: question })

  try {
    const got = require('got')
    const url = `${baseUrl}/chat/completions`

    const response = await got(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      json: {
        model: model,
        messages: messages,
        temperature: 0.9,
        max_tokens: 200
      },
      timeout: 15000
    })

    const result = JSON.parse(response.body)
    const reply = result.choices[0].message.content

    return { code: 0, data: { reply } }
  } catch (err) {
    console.error('AI追问失败:', err.message || err)
    return {
      code: 0,
      data: { reply: '大师思考中出了点问题，再问一次试试？' }
    }
  }
}

exports.main = async (event, context) => {
  const { votes, sessionId, vetoRestaurantId, budgetRange, action, question, chatHistory, contextParam } = event

  if (action === 'chat') {
    return handleChat(question, chatHistory, contextParam)
  }

  const apiKey = AI_CONFIG.apiKey
  const baseUrl = AI_CONFIG.baseUrl
  const model = AI_CONFIG.model

  if (!apiKey) {
    console.log('未配置 AI_CONFIG.apiKey，使用本地判决')
    return localJudge(votes, vetoRestaurantId, budgetRange)
  }

  const allLikes = []
  const allDislikes = []
  const supplements = []
  const userSummaries = []

  if (votes && votes.length > 0) {
    votes.forEach((v, i) => {
      const likeTexts = (v.likes || []).map(t => t.text || t).join('、')
      const dislikeTexts = (v.dislikes || []).map(t => t.text || t).join('、')
      allLikes.push(...(v.likes || []))
      allDislikes.push(...(v.dislikes || []))
      if (v.supplement) supplements.push(v.supplement)
      userSummaries.push(`群友${i + 1}：想要[${likeTexts || '无'}] 避雷[${dislikeTexts || '无'}]${v.supplement ? ' 吐槽：' + v.supplement : ''}`)
    })
  }

  let candidates = [...RESTAURANTS]
  if (vetoRestaurantId) {
    candidates = candidates.filter(r => r.id !== vetoRestaurantId)
  }
  if (budgetRange) {
    const filtered = candidates.filter(r => r.avgPrice >= budgetRange.min && r.avgPrice <= budgetRange.max)
    if (filtered.length > 0) candidates = filtered
  }

  const restaurantList = candidates.map(r =>
    `ID:${r.id} ${r.name} | 标签:${r.tags.join('/')} | 人均:${r.avgPrice} | 评分:${r.rating} | ${r.desc}`
  ).join('\n')

  const budgetText = budgetRange ? `## 预算约束\n人均预算：${budgetRange.min}-${budgetRange.max}元，请只从符合预算的餐厅中选择。\n\n` : ''
  const userPrompt = `${budgetText}## 餐厅列表
${restaurantList}

## 群友表态
${userSummaries.join('\n')}

请从餐厅列表中选出最优解，给出AI锐评和每个人的理由。`

  try {
    const got = require('got')
    const url = `${baseUrl}/chat/completions`

    const response = await got(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      json: {
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      },
      timeout: 30000
    })

    const result = JSON.parse(response.body)
    const aiResult = JSON.parse(result.choices[0].message.content)
    const winner = candidates.find(r => r.id === aiResult.winner_id) || candidates[0]

    return {
      code: 0,
      data: {
        restaurant: {
          id: winner.id,
          name: winner.name,
          tags: winner.tags,
          avgPrice: winner.avgPrice,
          location: winner.location,
          desc: winner.desc,
          emoji: winner.emoji,
          rating: winner.rating
        },
        aiComment: aiResult.ai_comment,
        reasons: aiResult.reasons,
        runnersUp: candidates.slice(1, 3).map(r => ({
          id: r.id, name: r.name, emoji: r.emoji,
          avgPrice: r.avgPrice, tags: r.tags
        })),
        source: 'ai'
      }
    }
  } catch (err) {
    console.error('AI调用失败，降级到本地:', err.message || err)
    return localJudge(votes, vetoRestaurantId, budgetRange)
  }
}
