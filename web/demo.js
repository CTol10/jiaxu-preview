const peopleSeed=[
 {id:'p0',name:'林知远',sex:'M',birth:'1991',death:'',place:'福建 厦门',origin:'福建 南安',style:'',father:'p1',mother:'p2',spouse:'p15',relation:'本人',bio:'从一张旧谱和一封家书开始，整理家里那些值得留下的名字和故事。'},
 {id:'p1',name:'林建民',sex:'M',birth:'1956',death:'',place:'台湾 台南',origin:'福建 南安',father:'p3',mother:'p4',spouse:'p2',relation:'父亲',bio:'喜欢拍照与木工，保存着家中几代人的相册与家书。'},
 {id:'p2',name:'陈淑华',sex:'F',birth:'1959',death:'',place:'台湾 台南',origin:'福建 漳州',father:'p5',mother:'p6',spouse:'p1',relation:'母亲',bio:'家里故事的讲述者。正在整理长辈讲过的节日习俗和儿时往事。'},
 {id:'p3',name:'林文海',sex:'M',birth:'1924',death:'2003',place:'福建 泉州 南安',origin:'福建 南安',father:'p7',mother:'p8',spouse:'p4',relation:'祖父',style:'字承远',bio:'1924年生于福建南安。家中谱页记有名讳与字辈，后在台南生活。家人保存的家书，为两地往来留下了线索。以上为虚构演示人物经历。'},
 {id:'p4',name:'王秀兰',sex:'F',birth:'1928',death:'2016',place:'台湾 嘉义',origin:'台湾 嘉义',father:'p9',mother:'p10',spouse:'p3',relation:'祖母',bio:'擅长制作传统糕点，家人正将她的食谱、节日习俗与生活片段整理成册。'},
 {id:'p5',name:'陈德安',sex:'M',birth:'1930',death:'2012',place:'台湾 台南',origin:'福建 漳州',father:'p11',mother:'p12',spouse:'p6',relation:'外祖父',bio:'从事教学，家中保留了一本用来记录读书心得的笔记。'},
 {id:'p6',name:'黄月琴',sex:'F',birth:'1933',death:'',place:'台湾 台南',origin:'台湾 台南',father:'p13',mother:'p14',spouse:'p5',relation:'外祖母',bio:'正在通过口述记录整理自己的生活故事，在世人物资料仅向授权家人展示。'},
 {id:'p7',name:'林宗源',sex:'M',birth:'1898',death:'1976',place:'福建 南安',origin:'福建 南安',spouse:'p8',relation:'曾祖父',bio:'谱页中的记录正在逐条核对。'},
 {id:'p8',name:'黄秀英',sex:'F',birth:'1901',death:'1982',place:'福建 南安',origin:'福建 南安',spouse:'p7',relation:'曾祖母',bio:'保留母系姓名及相关记载。'},
 {id:'p9',name:'王永福',sex:'M',birth:'1903',death:'1972',place:'台湾 嘉义',origin:'台湾 嘉义',relation:'曾外祖父'},
 {id:'p10',name:'李阿香',sex:'F',birth:'1906',death:'1986',place:'台湾 嘉义',origin:'台湾 嘉义',relation:'曾外祖母'},
 {id:'p11',name:'陈清和',sex:'M',birth:'1902',death:'1979',place:'福建 漳州',origin:'福建 漳州',relation:'外曾祖父'},
 {id:'p12',name:'郑玉珍',sex:'F',birth:'1907',death:'1988',place:'台湾 台南',origin:'台湾 台南',relation:'外曾祖母'},
 {id:'p13',name:'黄天赐',sex:'M',birth:'1905',death:'1980',place:'台湾 台南',origin:'台湾 台南',relation:'外曾祖父'},
 {id:'p14',name:'吴春花',sex:'F',birth:'1910',death:'1991',place:'台湾 台南',origin:'台湾 台南',relation:'外曾祖母'},
 {id:'p15',name:'沈晓雨',sex:'F',birth:'1993',death:'',place:'福建 厦门',origin:'福建 漳州',spouse:'p0',relation:'配偶',bio:'一起保存照片，也一起发现家庭往事。'},
 {id:'p16',name:'林沐禾',sex:'F',birth:'2019',death:'',place:'福建 厦门',father:'p0',mother:'p15',relation:'女儿',bio:'未成年人档案仅授权家庭成员可见。'}
];
const memorySeed=[
 {id:'m1',title:'老家院子里的榕树',type:'image',image:'assets/courtyard.svg',year:'1986',person:'p3',desc:'那些年，每到傍晚，家人都会坐在院子里聊一聊一天的见闻。',body:'院子中央的榕树，是家里人共同的记忆。暑假时，孩子们围着树跑，长辈们在门口泡茶。这张原创示意插画代表一段待家人补充的回忆，不是真实历史照片。',privacy:'家庭成员'},
 {id:'m2',title:'一封从台南寄来的家书',type:'document',image:'assets/letter.svg',year:'1962',person:'p3',desc:'“家人平安，见字如面。”字里行间，是跨越山海的牵挂。',body:'演示家书摘录：家人平安，见字如面。岁月虽远，故乡仍在心间。每逢佳节，想起家门前的榕树和院里长辈们的声音。该文稿为虚构样例，不作为真实史料。',privacy:'家庭成员'},
 {id:'m3',title:'祖母讲的年节味道',type:'audio',year:'2024',person:'p4',desc:'一段关于做年糕、贴春联和全家团圆的讲述。',body:'小的时候，过年前几天就开始磨米。蒸笼里冒着白白的热气，院子里有人洗菜，有人写春联。孩子们最喜欢等第一笼年糕出来，一人分一小块。',privacy:'家庭成员'},
 {id:'m4',title:'林氏家谱 · 卷二',type:'document',image:'assets/genealogy.svg',year:'1936',person:'p3',desc:'保存原文字形、卷页与人物关联，慢慢接续家里的来处。',body:'演示谱页记有林文海名讳与“承远”一字。页面保留原图，并以引用记录连接人物资料。所示内容均为虚构排版，不对应真实家族谱牒。',privacy:'家庭成员'},
 {id:'m5',title:'我们一起走过的山海',type:'image',image:'assets/mountains.svg',year:'2023',person:'p0',desc:'从厦门出发，沿着家人讲过的地方，一点一点认识故乡。',body:'回到长辈口中的地方，才发现地名之外还有很多故事。路边的树、熟悉的乡音和慢下来的脚步，都成为新的家庭记忆。插画为演示素材。',privacy:'家庭成员'},
 {id:'m6',title:'把家里的故事继续讲下去',type:'story',year:'2026',person:'p1',desc:'从姓名到经历，从一张相片到一段声音，家谱也是正在发生的生活。',body:'我们从自己开始，记录父母、祖辈和孩子。每一个看似普通的日子，都可能成为下一代想了解的故事。记录可以很简单：一张图、一句话、一段声音。',privacy:'家庭成员'}
];
const sourceSeed=[{id:'s1',title:'林氏家谱 卷二 第18页',desc:'演示谱页 · 家庭收藏副本 · 卷页及字形待核',image:'assets/genealogy.svg',year:'1936',quote:'文海，字承远。原居泉州南安。',type:'谱牒',person:'p3'},{id:'s2',title:'台南家书 第1页',desc:'演示家书 · 林建民提供 · 记载往来地点',image:'assets/letter.svg',year:'1962',quote:'每逢佳节，想起家门前的榕树和院里长辈们的声音。',type:'家书',person:'p3'},{id:'s3',title:'家人补记 口述记录',desc:'演示口述 · 内容与谱页分别保留 · 待家人复核',image:'assets/courtyard.svg',year:'2024',quote:'祖父提过，先到金门，后来在台南安家。年份还要查一查。',type:'口述',person:'p3'}];
export {peopleSeed,sourceSeed};
