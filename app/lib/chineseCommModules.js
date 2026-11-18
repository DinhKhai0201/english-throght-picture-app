// Chinese Communication Complete Curriculum:
// - 100 Intermediate & Advanced Spoken Chunks (bringing total to 600 chunks = 60 lessons)
// - 15 Full Roleplay Dialogues (HSK 1 -> HSK 6)
// - 12 Essential Spoken Sentence Pattern Builders
// - Complete Pronunciation & Tone Sandhi Guide

export function getZhTier(chunk) {
  const lvl = (chunk.level || "").toUpperCase();
  if (lvl.includes("5") || lvl.includes("6") || lvl === "HSK4-5" || lvl === "HSK4-6") {
    return "advanced";
  }
  if (lvl.includes("3") || lvl.includes("4")) {
    return "intermediate";
  }
  return "basic";
}

export const ZH_PRONUNCIATION = {
  tones: [
    { id: "tone_1", name: "Thanh 1 (Cao, ngang, đều)", mark: "mā (ˉ)", hanzi: "妈", pinyin: "mā", meaning: "mẹ", tip: "Giữ giọng cao và thẳng đều, không lên xuống." },
    { id: "tone_2", name: "Thanh 2 (Đi lên dứt khoát)", mark: "má (ˊ)", hanzi: "麻", pinyin: "má", meaning: "tê / cây gai", tip: "Đẩy giọng từ tầm trung vút lên cao như hỏi 'Hả?'." },
    { id: "tone_3", name: "Thanh 3 (Trầm xuống đáy)", mark: "mǎ (ˇ)", hanzi: "马", pinyin: "mǎ", meaning: "con ngựa", tip: "Khi nói trong câu, chỉ cần hạ giọng thật trầm (nửa thanh 3)." },
    { id: "tone_4", name: "Thanh 4 (Rơi nhanh, mạnh)", mark: "mà (ˋ)", hanzi: "骂", pinyin: "mà", meaning: "mắng", tip: "Giáng nhanh từ cao xuống thấp dứt khoát." },
    { id: "tone_0", name: "Thanh nhẹ (Ngắn, lướt nhẹ)", mark: "ma", hanzi: "好吗", pinyin: "hǎo ma", meaning: "được không?", tip: "Đọc nhẹ và ngắn bằng nửa âm tiết bình thường." },
  ],
  sandhiRules: [
    { id: "sandhi_33", rule: "Thanh 3 + Thanh 3 → Đọc thành (Thanh 2 + Thanh 3)", exampleHanzi: "你好！我可以帮你吗？", examplePinyin: "Ní hǎo! Wǒ kěyǐ bāng nǐ ma?", meaning: "Xin chào! Tôi có thể giúp bạn không?", note: "nǐ hǎo → ní hǎo; kě yǐ → ké yǐ." },
    { id: "sandhi_bu", rule: "Biến điệu 不 (bù) → Đổi thành bú trước Thanh 4", exampleHanzi: "不是，我不要去，不客气！", examplePinyin: "Bú shì, wǒ bú yào qù, bú kèqi!", meaning: "Không phải, tôi không muốn đi, đừng khách sáo!", note: "Trước thanh 1, 2, 3 giữ nguyên bù (bù hǎo, bù máng); trước thanh 4 đổi thành bú." },
    { id: "sandhi_yi", rule: "Biến điệu 一 (yī) → yí (trước thanh 4) / yì (trước thanh 1, 2, 3)", exampleHanzi: "看一下，等一会儿，一杯水", examplePinyin: "Kàn yíxià, děng yíhuìr, yì bēi shuǐ", meaning: "Xem một chút, đợi một lát, một cốc nước", note: "Khi đếm số (第一 dì-yī) giữ nguyên thanh 1; khi ghép từ thì đổi thanh." },
  ],
  soundPairs: [
    { id: "pair_retroflex", pair: "z / c / s (thẳng lưỡi) vs zh / ch / sh / r (uốn lưỡi)", sampleHanzi: "四十四，十是十", samplePinyin: "Sì shí sì, shí shì shí", meaning: "44 là 44, 10 là 10", tip: "z/c/s đặt lưỡi sau răng cửa; zh/ch/sh cong đầu lưỡi lên vòm miệng." },
    { id: "pair_jqx", pair: "j / q / x đi với u thực chất là âm tròn môi ü", sampleHanzi: "请问，你去哪里学习？", samplePinyin: "Qǐngwèn, nǐ qù nǎlǐ xuéxí?", meaning: "Xin hỏi, bạn đi đâu học?", tip: "qu, xu, ju đều giữ môi tròn như huýt sáo. Chữ q bật hơi mạnh." },
    { id: "pair_aspiration", pair: "Bật hơi vs Không bật hơi: b/p, d/t, g/k", sampleHanzi: "喝茶还是喝咖啡？", samplePinyin: "Hē chá háishi hē kāfēi?", meaning: "Uống trà hay uống cà phê?", tip: "p, t, k, c, ch, q phải bật luồng hơi mạnh ra khỏi miệng." },
  ],
};

// 100 High-Value Intermediate & Advanced Spoken Chunks (zh_501 .. zh_600)
const RAW_EXTRA_ZH = [
  // Natural Fillers & Connectors (HSK 4-6)
  ["zh_501", "natural_speech_fillers", "其实说白了，就是这样。", "Qíshí shuōbái le, jiùshì zhèyàng.", "Thật ra nói thẳng ra thì chính là như vậy.", "HSK4-5", "对，一点也没错。 (Đúng, không sai chút nào.)"],
  ["zh_502", "natural_speech_fillers", "说句实话，我有点儿犹豫。", "Shuō jù shíhuà, wǒ yǒudiǎnr yóuyù.", "Nói thật lòng là tôi hơi do dự.", "HSK4-5", "没关系，你再考虑一下。 (Không sao, bạn cứ cân nhắc thêm.)"],
  ["zh_503", "natural_speech_fillers", "怪不得他今天没来！", "Guàibude tā jīntiān méi lái!", "Thảo nào hôm nay anh ấy không đến!", "HSK4-5", "原来他请假了。 (Hóa ra anh ấy xin nghỉ phép.)"],
  ["zh_504", "natural_speech_fillers", "按理说，应该没问题。", "Ànlǐ shuō, yīnggāi méi wèntí.", "Theo lý mà nói thì chắc không có vấn đề gì.", "HSK4-5", "那我就放心了。 (Vậy thì tôi yên tâm rồi.)"],
  ["zh_505", "natural_speech_fillers", "话虽这么说，但做起来不容易。", "Huà suī zhème shuō, dàn zuò qǐlái bù róngyì.", "Nói thì nói vậy, nhưng làm không dễ đâu.", "HSK5-6", "确实，我们得一步一步来。 (Đúng thật, phải làm từng bước.)"],
  ["zh_506", "natural_speech_fillers", "总而言之，先试试看再说。", "Zǒng'éryánzhī, xiān shìshi kàn zài shuō.", "Nói tóm lại, cứ thử trước rồi tính tiếp.", "HSK5-6", "行，听你的！ (Được, nghe theo bạn!)"],
  ["zh_507", "natural_speech_fillers", "说来话长，改天慢慢跟你聊。", "Shuō lái huà cháng, gǎitiān mànmàn gēn nǐ liáo.", "Nói ra thì dài lắm, hôm khác kể kỹ cho bạn nghe.", "HSK4-5", "好，那我们周末约咖啡。 (Ok, vậy cuối tuần hẹn cà phê nhé.)"],
  ["zh_508", "natural_speech_fillers", "幸亏你提醒了我，不然我全忘了。", "Xìngkuī nǐ tíxǐng le wǒ, bùrán wǒ quán wàng le.", "May mà bạn nhắc tôi, không thì tôi quên sạch rồi.", "HSK4-5", "小事一桩，别客气。 (Chuyện nhỏ thôi, đừng khách sáo.)"],
  ["zh_509", "natural_speech_fillers", "难怪大家都推荐这家店。", "Nánguài dàjiā dōu tuījiàn zhè jiā diàn.", "Chả trách mọi người đều giới thiệu quán này.", "HSK4-5", "味道确实很正宗。 (Hương vị quả thực rất chuẩn.)"],
  ["zh_510", "natural_speech_fillers", "不管怎么说，安全第一。", "Bùguǎn zěnme shuō, ānquán dì-yī.", "Dù nói thế nào đi nữa, an toàn là trên hết.", "HSK4-5", "完全同意。 (Hoàn toàn đồng ý.)"],
  ["zh_511", "natural_speech_fillers", "归根结底，还是沟通不够。", "Guīgēn jiédǐ, háishi gōutōng bú gòu.", "Suy cho cùng thì vẫn là do giao tiếp chưa đủ.", "HSK5-6", "那我们以后多开短会同步。 (Vậy sau này mình họp ngắn thường xuyên hơn.)"],
  ["zh_512", "natural_speech_fillers", "顺便问一下，洗手机在哪儿？", "Shùnbiàn wèn yíxià, xǐshǒujiān zài nǎr?", "Nhân tiện hỏi chút, nhà vệ sinh ở đâu vậy?", "HSK3-4", "一直走，右转就是。 (Đi thẳng rồi rẽ phải là tới.)"],
  ["zh_513", "natural_speech_fillers", "老实说，我对这个领域不太熟。", "Lǎoshí shuō, wǒ duì zhège lǐngyù bú tài shú.", "Thú thật là tôi không rành lĩnh vực này lắm.", "HSK4-5", "没事，我可以带你一起做。 (Không sao, tôi có thể hướng dẫn bạn cùng làm.)"],
  ["zh_514", "natural_speech_fillers", "换句话说，我们得重新计划。", "Huàn jù huà shuō, wǒmen děi chóngxīn jìhuà.", "Nói cách khác là chúng ta phải lên kế hoạch lại.", "HSK4-5", "好的，现在就开始改吧。 (Được, bắt đầu sửa ngay bây giờ đi.)"],
  ["zh_515", "natural_speech_fillers", "老实讲，性价比挺高的。", "Lǎoshí jiǎng, xìngjiàbǐ tǐng gāo de.", "Nói thật là tỷ lệ giá/chất lượng khá cao đấy.", "HSK4-5", "那我就买这款了。 (Vậy tôi mua mẫu này luôn.)"],

  // Opinions & Discussion (HSK 4-6)
  ["zh_516", "opinions_discussion", "从长远来看，这样更划算。", "Cóng chángyuǎn lái kàn, zhèyàng gèng huásuàn.", "Xét về lâu dài thì làm vậy có lợi/đáng tiền hơn.", "HSK5-6", "有道理，不能只看眼前。 (Có lý, không thể chỉ nhìn trước mắt.)"],
  ["zh_517", "opinions_discussion", "这得看具体情况。", "Zhè děi kàn jùtǐ qíngkuàng.", "Cái này còn phải tùy tình hình cụ thể.", "HSK4-5", "明白，那我们先去调查一下。 (Hiểu rồi, vậy ta đi khảo sát trước đã.)"],
  ["zh_518", "opinions_discussion", "在我看来，经验比学历更重要。", "Zài wǒ kànlái, jīngyàn bǐ xuélì gèng zhòngyào.", "Theo cách nhìn của tôi, kinh nghiệm quan trọng hơn bằng cấp.", "HSK4-5", "我也赞同你的看法。 (Tôi cũng tán đồng quan điểm của bạn.)"],
  ["zh_519", "opinions_discussion", "各有各的好处，很难一概而论。", "Gè yǒu gè de hǎochù, hěn nán yígài'érlùn.", "Mỗi cái có ưu điểm riêng, rất khó vơ đũa cả nắm.", "HSK5-6", "你说得很客观。 (Bạn nói rất khách quan.)"],
  ["zh_520", "opinions_discussion", "我完全理解你的意思，不过我有一点不同看法。", "Wǒ wánquán lǐjiě nǐ de yìsi, búguò wǒ yǒu yìdiǎn bùtóng kànfǎ.", "Tôi hoàn toàn hiểu ý bạn, nhưng tôi có chút góc nhìn khác.", "HSK5-6", "请讲，我很想听听你的建议。 (Mời nói, tôi rất muốn nghe góp ý của bạn.)"],
  ["zh_521", "opinions_discussion", "这只是我个人的看法，仅供参考。", "Zhè zhǐshì wǒ gèrén de kànfǎ, jǐn gōng cānkǎo.", "Đây chỉ là ý kiến cá nhân của tôi, chỉ để tham khảo thôi.", "HSK5-6", "你的建议非常有价值。 (Đề xuất của bạn rất có giá trị.)"],
  ["zh_522", "opinions_discussion", "关键在于我们怎么落实。", "Guānjiàn zàiyú wǒmen zěnme luòshí.", "Mấu chốt nằm ở chỗ chúng ta triển khai thực tế thế nào.", "HSK5-6", "对，执行力最重要。 (Đúng, năng lực thực thi là quan trọng nhất.)"],
  ["zh_523", "opinions_discussion", "我对这个方案持保留态度。", "Wǒ duì zhège fāng'àn chí bǎoliú tàidù.", "Tôi giữ thái độ dè dặt với phương án này.", "HSK5-6", "你主要担心哪方面のリスク？ (Bạn chủ yếu lo ngại rủi ro ở khía cạnh nào?)"],
  ["zh_524", "opinions_discussion", "凡事都有两面性。", "Fánshì dōu yǒu liǎngmiànxìng.", "Mọi việc đều có hai mặt của nó.", "HSK4-5", "是啊，有利也有弊。 (Đúng vậy, có lợi mà cũng có hại.)"],
  ["zh_525", "opinions_discussion", "我们没必要在这个细节上纠结。", "Wǒmen méi bìyào zài zhège xìjié shàng jiūjié.", "Chúng ta không cần phải xoắn xuýt mãi ở chi tiết nhỏ này.", "HSK5-6", "好，那抓大放小，先往下走。 (Ok, nắm việc lớn bỏ việc nhỏ, đi tiếp thôi.)"],

  // Workplace & Business Negotiation (HSK 4-6)
  ["zh_526", "workplace_meetings", "我们换个角度来看这个问题。", "Wǒmen huàn ge jiǎodù lái kàn zhège wèntí.", "Chúng ta thử đổi góc nhìn để xem vấn đề này nhé.", "HSK5-6", "好主意，你有什么新思路？ (Ý hay đấy, bạn có hướng mới nào không?)"],
  ["zh_527", "workplace_meetings", "这事儿交给我来跟进吧。", "Zhè shìr jiāo gěi wǒ lái gēnjìn ba.", "Việc này cứ giao cho tôi theo dõi xử lý nhé.", "HSK4-5", "太好了，有进展随时告诉我。 (Tuyệt quá, có tiến triển báo tôi ngay nhé.)"],
  ["zh_528", "workplace_meetings", "今天的会议就先到这儿吧。", "Jīntiān de huìyì jiù xiān dào zhèr ba.", "Buổi họp hôm nay tạm dừng ở đây nhé.", "HSK3-4", "好的，大家辛苦了！ (Vâng, mọi người vất vả rồi!)"],
  ["zh_529", "workplace_meetings", "麻烦你今天下班前发给我。", "Máfan nǐ jīntiān xiàbān qián fā gěi wǒ.", "Phiền bạn gửi cho tôi trước giờ tan làm hôm nay nhé.", "HSK3-4", "没问题，我马上整理好发您。 (Không vấn đề, tôi tổng hợp xong gửi ngay.)"],
  ["zh_530", "workplace_meetings", "目前进度还在可控范围内。", "Mùqián jìndù hái zài kěkòng fànwéi nèi.", "Hiện tại tiến độ vẫn nằm trong tầm kiểm soát.", "HSK5-6", "那就好，需要支援随时说。 (Vậy thì tốt, cần hỗ trợ cứ nói nhé.)"],
  ["zh_531", "workplace_meetings", "这个需求优先级比较高，得先处理。", "Zhège xūqiú yōuxiānjí bǐjiào gāo, děi xiān chǔlǐ.", "Yêu cầu này độ ưu tiên khá cao, phải xử lý trước.", "HSK4-5", "明白，我先手头的工作放一放。 (Rõ rồi, để tôi tạm gác việc đang làm lại.)"],
  ["zh_532", "workplace_meetings", "我先把会议纪要发到群里。", "Wǒ xiān bǎ huìyì jìyào fā dào qún lǐ.", "Tôi gửi biên bản cuộc họp vào nhóm chat trước nhé.", "HSK4-5", "收到，谢谢！ (Đã nhận, cảm ơn!)"],
  ["zh_533", "workplace_meetings", "关于预算的问题，我还需要跟领导请示一下。", "Guānyú yùsuàn de wèntí, wǒ hái xūyào gēn lǐngdǎo qǐngshì yíxià.", "Về vấn đề ngân sách, tôi cần xin ý kiến cấp trên một chút.", "HSK5-6", "好的，我们等您的答复。 (Vâng, chúng tôi chờ phản hồi của bạn.)"],
  ["zh_534", "business_negotiation", "能不能稍微通融一下？", "Néng bu néng shāowēi tōngróng yíxià?", "Có thể linh động châm chước một chút được không?", "HSK5-6", "好吧，这次就破例帮您办。 (Thôi được, lần này phá lệ hỗ trợ bạn.)"],
  ["zh_535", "business_negotiation", "如果订购量大的话，价格还能再优惠吗？", "Rúguǒ dìnggòuliàng dà dehuà, jiàgé hái néng zài yōuhuì ma?", "Nếu số lượng đặt hàng lớn thì giá có ưu đãi thêm được không?", "HSK4-5", "满一千件的话可以再打九五折。 (Từ 1.000 chiếc trở lên có thể giảm thêm 5%.)"],
  ["zh_536", "business_negotiation", "我们希望建立长期的合作关系。", "Wǒmen xīwàng jiànlì chángqī de hézuò guānxi.", "Chúng tôi hy vọng xây dựng mối quan hệ hợp tác lâu dài.", "HSK4-5", "我们也是这么想的，合作愉快！ (Chúng tôi cũng nghĩ vậy, hợp tác vui vẻ!)"],
  ["zh_537", "business_negotiation", "这个报价已经是我们最大的诚意了。", "Zhège bàojià yǐjīng shì wǒmen zuìdà de chéngyì le.", "Báo giá này đã là thành ý lớn nhất của chúng tôi rồi.", "HSK5-6", "那我们回去内部讨论一下再定。 (Vậy chúng tôi về bàn nội bộ rồi chốt nhé.)"],
  ["zh_538", "business_negotiation", "合同条款我大致看过了，有两处想确认。", "Hétong tiáokuǎn wǒ dàzhì kànguò le, yǒu liǎng chù xiǎng quèrèn.", "Điều khoản hợp đồng tôi đã xem qua, có hai chỗ muốn xác nhận lại.", "HSK5-6", "您请说，哪两个地方？ (Mời bạn nói, hai chỗ nào ạ?)"],
  ["zh_539", "business_negotiation", "交货期能不能提前三天？", "Jiāohuòqī néng bu néng tíqián sān tiān?", "Thời hạn giao hàng có thể đẩy sớm lên 3 ngày không?", "HSK4-5", "我跟工厂协调一下，尽量满足。 (Để tôi điều phối với xưởng, cố gắng đáp ứng.)"],
  ["zh_540", "business_negotiation", "只要质量过关，价格好商量。", "Zhǐyào zhìliàng guòguān, jiàgé hǎo shāngliang.", "Chỉ cần chất lượng đạt chuẩn, giá cả dễ bàn bạc.", "HSK5-6", "您放心，我们品质绝对有保障。 (Bạn yên tâm, chất lượng bên tôi tuyệt đối đảm bảo.)"],

  // Problem Solving, Complaints & Emergencies (HSK 3-6)
  ["zh_541", "problem_solving_complaints", "别着急，总会有办法的。", "Bié zháojí, zǒng huì yǒu bànfǎ de.", "Đừng sốt ruột, rồi sẽ có cách giải quyết thôi.", "HSK4-5", "谢谢，我现在冷静多了。 (Cảm ơn, giờ tôi bình tĩnh hơn nhiều rồi.)"],
  ["zh_542", "problem_solving_complaints", "不好意思，我的订单好像下错了。", "Bù hǎoyìsi, wǒ de dìngdān hǎoxiàng xià cuò le.", "Xin lỗi, đơn hàng của tôi hình như đặt nhầm rồi.", "HSK3-4", "没关系，我帮您取消重新下。 (Không sao, để tôi giúp bạn hủy rồi đặt lại.)"],
  ["zh_543", "problem_solving_complaints", "这个跟图片上的差别太大了，我想退货。", "Zhège gēn túpiàn shàng de chābié tài dà le, wǒ xiǎng tuìhuò.", "Cái này khác ảnh chụp quá nhiều, tôi muốn trả hàng.", "HSK4-5", "实在抱歉，我们马上为您办理退款。 (Thực sự xin lỗi, chúng tôi làm hoàn tiền ngay cho bạn.)"],
  ["zh_544", "problem_solving_complaints", "房间的空调不制冷，能派人来看看吗？", "Fángjiān de kōngtiáo bú zhìlěng, néng pài rén lái kànkan ma?", "Điều hòa trong phòng không mát, có thể cử người lên xem không?", "HSK4-5", "好的，工程部五分钟内到。 (Vâng, bộ phận kỹ thuật sẽ tới trong 5 phút.)"],
  ["zh_545", "problem_solving_complaints", "网络断断续续的，根本连不上。", "Wǎngluò duànduàn-xùxù de, gēnběn lián bú shàng.", "Mạng chập chờn lúc được lúc mất, không kết nối nổi.", "HSK4-5", "我帮您重启一下路由器试试。 (Để tôi khởi động lại router giúp bạn thử xem.)"],
  ["zh_546", "problem_solving_complaints", "这完全是个误会，我来解释一下。", "Zhè wánquán shì ge wùhuì, wǒ lái jiěshì yíxià.", "Đây hoàn toàn là hiểu lầm thôi, để tôi giải thích một chút.", "HSK4-5", "好，你慢慢说。 (Được, bạn cứ từ từ nói.)"],
  ["zh_547", "problem_solving_complaints", "事情已经发生了，埋怨也没用。", "Shìqing yǐjīng fāshēng le, mányuàn yě méi yòng.", "Chuyện cũng đã xảy ra rồi, trách móc cũng chẳng ích gì.", "HSK5-6", "对，先想办法补救吧。 (Đúng, nghĩ cách khắc phục trước đã.)"],
  ["zh_548", "problem_solving_complaints", "我的护照不小心弄丢了，该去哪儿补办？", "Wǒ de hùzhào bù xiǎoxīn nòng diū le, gāi qù nǎr bǔbàn?", "Hộ chiếu của tôi lỡ làm mất rồi, phải đi đâu làm lại?", "HSK4-5", "先去派出所报案，再去大使馆。 (Trước tiên ra đồn công an trình báo, rồi tới đại sứ quán.)"],
  ["zh_549", "problem_solving_complaints", "这附近的治安怎么样？晚上出门安全吗？", "Zhè fùjìn de zhì'ān zěnmeyàng? Wǎnshang chūmén ānquán ma?", "An ninh quanh đây thế nào? Tối ra ngoài có an toàn không?", "HSK4-5", "挺安全的，到处都有监控。 (Khá an toàn, khắp nơi đều có camera.)"],
  ["zh_550", "problem_solving_complaints", "万一赶不上末班车，我们就打车回去。", "Wànyī gǎn bú shàng mòbānchē, wǒmen jiù dǎchē huíqù.", "Nhỡ không kịp chuyến xe cuối thì tụi mình bắt taxi về.", "HSK4-5", "好，那不用太赶了。 (Ok, vậy không cần quá vội nữa.)"],

  // Daily Digital Life, Payments, Delivery & Transport (HSK 3-5)
  ["zh_551", "online_social_media", "我扫你还是你扫我？", "Wǒ sǎo nǐ háishi nǐ sǎo wǒ?", "Tôi quét mã của bạn hay bạn quét mã của tôi?", "HSK3-4", "你扫我吧，我把二维码打开了。 (Bạn quét tôi đi, tôi mở mã QR rồi.)"],
  ["zh_552", "online_social_media", "加个微信吧，以后方便联系。", "Jiā ge Wēixìn ba, yǐhòu fāngbiàn liánxì.", "Kết bạn WeChat đi, sau này tiện liên lạc.", "HSK3-4", "好呀，我扫你。 (Được đấy, để tôi quét mã bạn.)"],
  ["zh_553", "online_social_media", "我把定位发给你了，按导航走就行。", "Wǒ bǎ dìngwèi fā gěi nǐ le, àn dǎoháng zǒu jiù xíng.", "Tôi gửi định vị cho bạn rồi, cứ đi theo bản đồ là được.", "HSK3-4", "收到了，我大概十分钟到。 (Nhận được rồi, tầm 10 phút nữa tôi tới.)"],
  ["zh_554", "transport_delivery", "师傅，外卖放门口就行，谢谢！", "Shīfu, wàimài fàng ménkǒu jiù xíng, xièxie!", "Anh ơi, đồ ăn giao tới cứ để trước cửa là được, cảm ơn nhé!", "HSK3-4", "好嘞，已经放好了。 (Ok, đã đặt xong rồi nhé.)"],
  ["zh_555", "transport_delivery", "请问这个快递什么时候能派送？", "Qǐngwèn zhège kuàidì shénme shíhou néng pàisòng?", "Xin hỏi kiện chuyển phát nhanh này khi nào giao tới?", "HSK3-4", "今天下午四点前会送到。 (Trước 4 giờ chiều nay sẽ giao tới.)"],
  ["zh_556", "transport_delivery", "手机快没电了，这儿有共享充电宝吗？", "Shǒujī kuài méi diàn le, zhèr yǒu gòngxiǎng chōngdiànbǎo ma?", "Điện thoại sắp hết pin rồi, ở đây có sạc dự phòng thuê không?", "HSK3-4", "收银台旁边就有一台。 (Ngay cạnh quầy thu ngân có một máy đấy.)"],
  ["zh_557", "transport_delivery", "到了给我发个消息，我下楼接你。", "Dào le gěi wǒ fā ge xiāoxi, wǒ xià lóu jiē nǐ.", "Tới nơi thì nhắn tin cho tôi, tôi xuống lầu đón bạn.", "HSK3-4", "好的，快到了跟你说。 (Ok, sắp tới tôi báo.)"],
  ["zh_558", "banking_payments", "这笔钱我们AA制吧，我转给你。", "Zhè bǐ qián wǒmen AA-zhì ba, wǒ zhuǎn gěi nǐ.", "Khoản này tụi mình chia đều (AA) nhé, tôi chuyển khoản cho bạn.", "HSK3-4", "行，那我收一下。 (Được, vậy để tôi nhận.)"],
  ["zh_559", "banking_payments", "今天我请客，谁都别跟我抢！", "Jīntiān wǒ qǐngkè, shéi dōu bié gēn wǒ qiǎng!", "Hôm nay tôi mời, đừng ai giành trả với tôi nhé!", "HSK3-4", "那太破费了，下次我请！ (Vậy tốn kém cho bạn quá, lần sau tôi mời!)"],
  ["zh_560", "banking_payments", "麻烦帮我开一张增值税发票。", "Máfan bāng wǒ kāi yì zhāng zēngzhíshuì fāpiào.", "Phiền bạn xuất giúp tôi một hóa đơn VAT để thanh toán công ty.", "HSK4-5", "好的，请把公司抬头写一下。 (Vâng, xin ghi giúp tên công ty lên đây.)"],

  // Dining, Socializing & Polite Boundaries (HSK 3-5)
  ["zh_561", "restaurant_advanced", "这道菜是店里的招牌菜，强烈推荐！", "Zhè dào cài shì diàn lǐ de zhāopáicài, qiángliè tuījiàn!", "Món này là món tủ (đặc trưng) của quán, cực kỳ khuyến khích thử!", "HSK4-5", "那来一份尝尝吧！ (Vậy cho một phần nếm thử đi!)"],
  ["zh_562", "restaurant_advanced", "我对海鲜过敏，里面有虾仁吗？", "Wǒ duì hǎixiān guòmǐn, lǐmiàn yǒu xiārén ma?", "Tôi bị dị ứng hải sản, bên trong có tôm không ạ?", "HSK3-4", "有的，那我帮您换成鸡肉吧。 (Có đấy ạ, vậy để tôi đổi sang thịt gà cho bạn.)"],
  ["zh_563", "restaurant_advanced", "老板，麻烦帮我打包，带走吃。", "Lǎobǎn, máfan bāng wǒ dǎbāo, dàizǒu chī.", "Chủ quán ơi, phiền gói mang về giúp tôi nhé.", "HSK3-4", "好嘞，马上给您拿打包盒。 (Vâng, lấy hộp mang về cho bạn ngay.)"],
  ["zh_564", "conflict_and_boundaries", "真不巧，那天我已经有安排了。", "Zhēn bùqiǎo, nà tiān wǒ yǐjīng yǒu ānpái le.", "Thật không巧 (tiếc quá), hôm đó tôi có lịch mất rồi.", "HSK3-4", "没关系，我们下次再约！ (Không sao, hẹn lần sau nhé!)"],
  ["zh_565", "conflict_and_boundaries", "你的好意我心领了，但这真的不能收。", "Nǐ de hǎoyì wǒ xīnlǐng le, dàn zhè zhēnde bù néng shōu.", "Tấm lòng của bạn tôi xin ghi nhận, nhưng món này thật sự không nhận được.", "HSK5-6", "那好吧，下次有机会再聚。 (Vậy thôi được, lần sau có dịp lại tụ họp.)"],
  ["zh_566", "conflict_and_boundaries", "这件事我还不太方便透露。", "Zhè jiàn shì wǒ hái bú tài fāngbiàn tòulù.", "Chuyện này hiện tôi chưa tiện tiết lộ lắm.", "HSK5-6", "理解，我不问了。 (Hiểu mà, tôi không hỏi nữa.)"],
  ["zh_567", "conflict_and_boundaries", "如果没什么别的事，我就先走了。", "Rúguǒ méi shénme bié de shì, wǒ jiù xiān zǒu le.", "Nếu không còn việc gì khác thì tôi xin phép đi trước nhé.", "HSK3-4", "好的，路上慢点儿！ (Ok, đi đường cẩn thận nhé!)"],
  ["zh_568", "conflict_and_boundaries", "不好意思打断一下，我补充两句。", "Bù hǎoyìsi dǎduàn yíxià, wǒ bǔchōng liǎng jù.", "Xin lỗi ngắt lời một chút, tôi xin bổ sung đôi câu.", "HSK4-5", "请讲！ (Mời bạn nói!)"],
  ["zh_569", "emotions_relationships", "你看起来脸色不太好，是不是累着了？", "Nǐ kàn qǐlái liǎnsè bú tài hǎo, shì bu shì lèizhe le?", "Trông sắc mặt bạn không tốt lắm, có phải mệt quá rồi không?", "HSK4-5", "昨晚熬夜加班，休息一下就好。 (Tối qua thức khuya tăng ca, nghỉ chút là ổn.)"],
  ["zh_570", "emotions_relationships", "有你这句话，我心里踏实多了。", "Yǒu nǐ zhè jù huà, wǒ xīnlǐ tāshi duō le.", "Có câu nói này của bạn, trong lòng tôi vững dạ hơn hẳn.", "HSK5-6", "放心吧，有我呢。 (Yên tâm đi, có tôi ở đây mà.)"],

  // Advanced Idiomatic Spoken Expressions & Structures (HSK 4-6)
  ["zh_571", "reusable_patterns", "与其在家无聊，不如出去走走。", "Yǔqí zài jiā wúliáo, bùrú chūqù zǒuzou.", "Thà ra ngoài đi dạo còn hơn ở nhà buồn chán.", "HSK4-5", "走，我们去公园逛逛。 (Đi, tụi mình ra công viên dạo đi.)"],
  ["zh_572", "reusable_patterns", "哪怕只有一点儿希望，我也要试一试。", "Nǎpà zhǐ yǒu yìdiǎnr xīwàng, wǒ yě yào shì yi shì.", "Dù chỉ có một chút hy vọng, tôi cũng muốn thử xem sao.", "HSK4-5", "支持你，加油！ (Ủng hộ bạn, cố lên!)"],
  ["zh_573", "reusable_patterns", "他之所以成功，是因为坚持了十年。", "Tā zhīsuǒyǐ chénggōng, shì yīnwèi jiānchí le shí nián.", "Sở dĩ anh ấy thành công là vì đã kiên trì suốt 10 năm.", "HSK4-5", "确实令人佩服。 (Quả thực rất đáng khâm phục.)"],
  ["zh_574", "reusable_patterns", "这不仅浪费时间，而且效果也不好。", "Zhè bùjǐn làngfèi shíjiān, érqiě xiàoguǒ yě bù hǎo.", "Cách này không những tốn thời gian mà hiệu quả cũng không tốt.", "HSK4-5", "那我们立刻换方案。 (Vậy ta đổi phương án ngay đi.)"],
  ["zh_575", "reusable_patterns", "一听到这个好消息，大家都高兴坏了。", "Yì tīngdào zhège hǎo xiāoxi, dàjiā dōu gāoxìng huài le.", "Vừa nghe tin vui này, ai nấy đều mừng rỡ vô cùng.", "HSK4-5", "值得好好庆祝一下！ (Đáng để ăn mừng thật lớn!)"],
  ["zh_576", "reusable_patterns", "中文越学越有意思。", "Zhōngwén yuè xué yuè yǒu yìsi.", "Tiếng Trung càng học càng thấy thú vị.", "HSK3-4", "坚持每天说就会进步很快。 (Kiên trì nói mỗi ngày sẽ tiến bộ rất nhanh.)"],
  ["zh_577", "reusable_patterns", "这么简单的道理，连小孩子都懂。", "Zhème jiǎndān de dàolǐ, lián xiǎoháizi dōu dǒng.", "Đạo lý đơn giản thế này, ngay cả trẻ con cũng hiểu.", "HSK3-4", "是啊，只是做起来难。 (Đúng vậy, chỉ là làm mới khó.)"],
  ["zh_578", "reusable_patterns", "除了周末以外，我平时都在公司。", "Chúle zhōumò yǐwài, wǒ píngshí dōu zài gōngsī.", "Ngoài cuối tuần ra, ngày thường tôi đều ở công ty.", "HSK3-4", "那我周三过去找你。 (Vậy thứ Tư tôi qua tìm bạn nhé.)"],
  ["zh_579", "reusable_patterns", "既然大家都同意，那就这么定了。", "Jìrán dàjiā dōu tóngyì, nà jiù zhème dìng le.", "Đã là mọi người đều đồng ý, vậy cứ chốt như thế nhé.", "HSK4-5", "好，散会！ (Ok, tan họp!)"],
  ["zh_580", "reusable_patterns", "无论遇到什么困难，都别轻易放弃。", "Wúlùn yùdào shénme kùnnan, dōu bié qīngyì fàngqì.", "Bất luận gặp khó khăn gì, cũng đừng dễ dàng bỏ cuộc.", "HSK4-5", "我记住了，谢谢鼓励！ (Tôi nhớ rồi, cảm ơn lời khích lệ!)"],

  // Housing, Medical, Travel & Practical Life (HSK 3-5)
  ["zh_581", "housing_renting", "房租是押一付三，水电费另算。", "Fángzū shì yā yī fù sān, shuǐdiànfèi lìng suàn.", "Tiền thuê nhà là cọc 1 tháng đóng 3 tháng, điện nước tính riêng.", "HSK4-5", "物业费包含在房租里吗？ (Phí quản lý có bao gồm trong tiền thuê chưa?)"],
  ["zh_582", "housing_renting", "这附近交通很方便，出门就是地铁口。", "Zhè fùjìn jiāotōng hěn fāngbiàn, chūmén jiùshì dìtiěkǒu.", "Giao thông quanh đây rất tiện, bước ra cửa là ga tàu điện ngầm.", "HSK3-4", "太好了，上班不用转车。 (Tuyệt quá, đi làm không cần chuyển tuyến.)"],
  ["zh_583", "medical_pharmacy", "我头疼得厉害，还一直流鼻涕。", "Wǒ tóuténg de lìhai, hái yìzhí liú bítì.", "Tôi đau đầu dữ dội, lại còn sổ mũi liên tục.", "HSK4-5", "先量一下体温，看看发不发烧。 (Đo nhiệt độ trước xem có sốt không nhé.)"],
  ["zh_584", "medical_pharmacy", "这药一天吃三次，饭后半小时温水送服。", "Zhè yào yì tiān chī sān cì, fànhòu bàn xiǎoshí wēnshuǐ sòngfú.", "Thuốc này ngày uống 3 lần, sau ăn 30 phút uống với nước ấm.", "HSK4-5", "好的，有什么忌口的吗？ (Vâng, có cần kiêng ăn món gì không ạ?)"],
  ["zh_585", "travel_airport", "请给我靠窗的座位，我想看风景。", "Qǐng gěi wǒ kàochuāng de zuòwèi, wǒ xiǎng kàn fēngjǐng.", "Cho tôi ghế cạnh cửa sổ nhé, tôi muốn ngắm cảnh.", "HSK3-4", "好的，这是您的登机牌。 (Vâng, đây là thẻ lên máy bay của quý khách.)"],
  ["zh_586", "travel_airport", "航班因为天气原因延误了两个小时。", "Hángbān yīnwèi tiānqì yuányīn yánwù le liǎng ge xiǎoshí.", "Chuyến bay bị hoãn 2 tiếng vì lý do thời tiết.", "HSK4-5", "那我们先去休息室等吧。 (Vậy mình vào phòng chờ nghỉ trước đi.)"],
  ["zh_587", "hotel_service", "请问退房时间是几点？可以延迟到两点吗？", "Qǐngwèn tuìfáng shíjiān shì jǐ diǎn? Kěyǐ yánchí dào liǎng diǎn ma?", "Xin hỏi mấy giờ trả phòng? Có thể lùi tới 2 giờ chiều không?", "HSK4-5", "没问题，免费为您延迟到下午两点。 (Không vấn đề, miễn phí lùi tới 2 giờ chiều cho bạn.)"],
  ["zh_588", "hotel_service", "麻烦借我一个转换插头。", "Máfan jiè wǒ yí ge zhuǎnhuàn chātóu.", "Phiền cho tôi mượn một ổ cắm chuyển đổi đa năng.", "HSK3-4", "好的，稍等我让人送到房间。 (Vâng, đợi chút tôi cho người mang lên phòng.)"],
  ["zh_589", "time_scheduling", "我临时有点儿急事，能不能改到明天？", "Wǒ línshí yǒudiǎnr jíshì, néng bu néng gǎi dào míngtiān?", "Tôi đột xuất có chút việc gấp, dời sang ngày mai được không?", "HSK4-5", "没关系，你先忙你的。 (Không sao, bạn cứ lo việc của bạn trước đi.)"],
  ["zh_590", "time_scheduling", "我们还是老时间、老地方见！", "Wǒmen háishi lǎo shíjiān, lǎo dìfang jiàn!", "Tụi mình vẫn hẹn giờ cũ, chỗ cũ nhé!", "HSK3-4", "一言为定，不见不散！ (Một lời đã chốt, không gặp không về!)"],

  // Idiomatic Everyday Reactions (HSK 4-6)
  ["zh_591", "conversation_reactions", "可不是嘛！我也正想说这个。", "Kě bú shì ma! Wǒ yě zhèng xiǎng shuō zhège.", "Chứ còn gì nữa! Tôi cũng vừa định nói cái này.", "HSK4-5", "我们真是想到一块儿去了。 (Tụi mình đúng là nghĩ giống hệt nhau.)"],
  ["zh_592", "conversation_reactions", "差点儿忘了！多亏你提醒。", "Chàdiǎnr wàng le! Duōkuī nǐ tíxǐng.", "Suýt nữa thì quên! Nhờ cả vào bạn nhắc đấy.", "HSK4-5", "快去办吧，还来得及。 (Mau đi làm đi, vẫn còn kịp đấy.)"],
  ["zh_593", "conversation_reactions", "这事儿说不准，还得再观察。", "Zhè shìr shuō bu zhǔn, hái děi zài guānchá.", "Chuyện này chưa nói chắc được, còn phải quan sát thêm.", "HSK5-6", "嗯，稳妥一点儿好。 (Ừ, cứ chắc chắn một chút vẫn hơn.)"],
  ["zh_594", "conversation_reactions", "你别往心里去，他只是开个玩笑。", "Nǐ bié wǎng xīnlǐ qù, tā zhǐshì kāi ge wánxiào.", "Bạn đừng để bụng, anh ấy chỉ đùa chút thôi.", "HSK4-5", "我知道，我没生气。 (Tôi biết mà, tôi không giận đâu.)"],
  ["zh_595", "conversation_reactions", "随你的便，你想怎么安排都行。", "Suí nǐ de biàn, nǐ xiǎng zěnme ānpái dōu xíng.", "Tùy bạn đấy, bạn muốn sắp xếp thế nào cũng được.", "HSK4-5", "那我就做主啦！ (Vậy tôi quyết luôn nhé!)"],
  ["zh_596", "conversation_reactions", "真让人头疼，一时半会儿解决不了。", "Zhēn ràng rén tóuténg, yìshí-bànhuìr jiějué bùliǎo.", "Thật đau đầu, một sớm một chiều chưa giải quyết xong được.", "HSK5-6", "别急，我们分步骤慢慢处理。 (Đừng vội, mình chia từng bước xử lý dần.)"],
  ["zh_597", "conversation_reactions", "一分钱一分货，贵有贵的道理。", "Yì fēn qián yì fēn huò, guì yǒu guì de dàolǐ.", "Tiền nào của nấy, đắt có cái lý của đắt.", "HSK4-5", "确实，用起来质感完全不一样。 (Đúng thật, dùng thấy chất lượng khác hẳn.)"],
  ["zh_598", "conversation_reactions", "百闻不如一见，现场看太震撼了！", "Bǎi wén bùrú yí jiàn, xiànchǎng kàn tài zhènhàn le!", "Trăm nghe không bằng một thấy, xem tận mắt choáng ngợp thật sự!", "HSK5-6", "这趟来得太值了！ (Chuyến này đi quá xứng đáng!)"],
  ["zh_599", "conversation_reactions", "入乡随俗，我们按当地的习惯来吧。", "Rùxiāng-suísú, wǒmen àn dāngdì de xíguàn lái ba.", "Nhập gia tùy tục, mình cứ theo phong tục địa phương đi.", "HSK5-6", "好呀，这样才更有体验感。 (Được đấy, như vậy mới càng có trải nghiệm.)"],
  ["zh_600", "conversation_reactions", "熟能生巧，多开口说自然就流利了。", "Shú néng shēng qiǎo, duō kāikǒu shuō zìrán jiù liúlì le.", "Trăm hay không bằng tay quen, mở miệng nói nhiều tự khắc sẽ trôi chảy.", "HSK5-6", "没错，每天坚持练习！ (Chuẩn luôn, kiên trì luyện tập mỗi ngày!)"],
];

export const ZH_EXTRA_CHUNKS = RAW_EXTRA_ZH.map(([id, category, hanzi, pinyin, meaning_vi, level, replyText]) => ({
  id,
  category,
  hanzi,
  pinyin,
  meaning_vi,
  level,
  reply_line: replyText,
}));

export const ZH_REPLY_MAP = {
  zh_001: "你好！很高兴认识你。 (Chào bạn! Rất vui được quen bạn.)",
  zh_002: "挺好的，谢谢！你呢？ (Khá ổn, cảm ơn! Còn bạn?)",
  zh_003: "最近有点儿忙，不过还好。 (Dạo này hơi bận chút, nhưng vẫn ổn.)",
  zh_004: "是啊，好久没见了！ (Đúng rồi, lâu quá không gặp!)",
  zh_006: "我叫明，你可以叫我小明。 (Tôi tên Minh, gọi tôi là Tiểu Minh nhé.)",
  zh_007: "我来自越南河内。 (Tôi đến từ Hà Nội, Việt Nam.)",
  zh_008: "不客气，应该的！ (Đừng khách sáo, việc nên làm mà!)",
  zh_009: "没关系，别放在心上。 (Không sao đâu, đừng để bụng.)",
};

export const ZH_PATTERN_BUILDERS = [
  {
    id: "zh_pat_1",
    level: "Cơ bản • HSK 1–2",
    title: "1. Bày tỏ mong muốn lịch sự: 我想 + [Hành động]",
    pattern: "我想 ... (Wǒ xiǎng ...)",
    note: "Dùng lịch sự, nhẹ nhàng hơn '我要' khi gọi món, mua đồ hoặc nói dự định.",
    slots: [
      { hanzi: "我想喝一杯冰美式。", pinyin: "Wǒ xiǎng hē yì bēi bīng měishì.", vi: "Tôi muốn uống một ly Americano đá." },
      { hanzi: "我想换一些人民币。", pinyin: "Wǒ xiǎng huàn yìxiē Rénmínbì.", vi: "Tôi muốn đổi một ít Nhân dân tệ." },
      { hanzi: "我想预订今晚七点的位子。", pinyin: "Wǒ xiǎng yùdìng jīnwǎn qī diǎn de wèizi.", vi: "Tôi muốn đặt bàn lúc 7 giờ tối nay." },
    ],
  },
  {
    id: "zh_pat_2",
    level: "Cơ bản • HSK 1–2",
    title: "2. Xin phép & Nhờ vả: 可以 + [Động từ] + 吗？",
    pattern: "可以 ... 吗？ (Kěyǐ ... ma?)",
    note: "Khung xin phép hoặc nhờ người khác giúp đỡ thông dụng nhất.",
    slots: [
      { hanzi: "我可以坐这里吗？", pinyin: "Wǒ kěyǐ zuò zhèlǐ ma?", vi: "Tôi có thể ngồi đây không?" },
      { hanzi: "你可以再说慢一点儿吗？", pinyin: "Nǐ kěyǐ zài shuō màn yìdiǎnr ma?", vi: "Bạn có thể nói chậm lại một chút không?" },
      { hanzi: "可以用微信或者支付宝吗？", pinyin: "Kěyǐ yòng Wēixìn huòzhě Zhīfùbǎo ma?", vi: "Có dùng WeChat hoặc Alipay được không?" },
    ],
  },
  {
    id: "zh_pat_3",
    level: "Cơ bản • HSK 2",
    title: "3. Hỏi thời lượng / khoảng cách: 需要多长时间？",
    pattern: "去 [Địa điểm] 需要多长时间？",
    note: "Dùng khi đi taxi, tàu điện hoặc hỏi thời gian hoàn thành công việc.",
    slots: [
      { hanzi: "去机场大概需要多长时间？", pinyin: "Qù jīchǎng dàgài xūyào duō cháng shíjiān?", vi: "Đi ra sân bay mất khoảng bao lâu?" },
      { hanzi: "修好这个电脑需要多长时间？", pinyin: "Xiūhǎo zhège diànnǎo xūyào duō cháng shíjiān?", vi: "Sửa xong máy tính này mất bao lâu?" },
      { hanzi: "走路过去要多久？", pinyin: "Zǒulù guòqù yào duō jiǔ?", vi: "Đi bộ qua đó mất bao lâu?" },
    ],
  },
  {
    id: "zh_pat_4",
    level: "Trung cấp • HSK 3",
    title: "4. Càng ... càng ...: 越 A 越 B",
    pattern: "越 ... 越 ... (Yuè ... yuè ...)",
    note: "Diễn tả mức độ tăng tiến theo thời gian hoặc điều kiện.",
    slots: [
      { hanzi: "中文越学越有意思。", pinyin: "Zhōngwén yuè xué yuè yǒu yìsi.", vi: "Tiếng Trung càng học càng thú vị." },
      { hanzi: "雨越下越大了，我们打车吧。", pinyin: "Yǔ yuè xià yuè dà le, wǒmen dǎchē ba.", vi: "Mưa càng lúc càng to rồi, mình bắt taxi đi." },
      { hanzi: "这件事越想越觉得不对劲。", pinyin: "Zhè jiàn shì yuè xiǎng yuè juéde bú duìjìn.", vi: "Chuyện này càng nghĩ càng thấy không ổn." },
    ],
  },
  {
    id: "zh_pat_5",
    level: "Trung cấp • HSK 3",
    title: "5. Vừa ... đã ...: 一 [Hành động 1] 就 [Hành động 2]",
    pattern: "一 ... 就 ... (Yī ... jiù ...)",
    note: "Nối 2 hành động xảy ra nối tiếp nhau ngay lập tức.",
    slots: [
      { hanzi: "我一到家就给你发微信。", pinyin: "Wǒ yí dào jiā jiù gěi nǐ fā Wēixìn.", vi: "Tôi vừa về tới nhà là nhắn WeChat cho bạn ngay." },
      { hanzi: "他一喝咖啡就睡不着觉。", pinyin: "Tā yì hē kāfēi jiù shuì bù zháo jiào.", vi: "Anh ấy cứ uống cà phê vào là không ngủ được." },
      { hanzi: "有问题你一说我就明白了。", pinyin: "Yǒu wèntí nǐ yì shuō wǒ jiù míngbai le.", vi: "Có vấn đề bạn vừa nói là tôi hiểu ngay." },
    ],
  },
  {
    id: "zh_pat_6",
    level: "Trung cấp • HSK 3–4",
    title: "6. Không những ... mà còn ...: 不仅 ... 而且 ...",
    pattern: "不仅 ... 而且 ... (Bùjǐn ... érqiě ...)",
    note: "Khen ngợi hoặc phân tích 2 mặt của sự việc.",
    slots: [
      { hanzi: "这家店不仅便宜，而且味道很好。", pinyin: "Zhè jiā diàn bùjǐn piányi, érqiě wèidào hěn hǎo.", vi: "Quán này không những rẻ mà vị còn rất ngon." },
      { hanzi: "他不仅会说中文，而且说得很流利。", pinyin: "Tā bùjǐn huì shuō Zhōngwén, érqiě shuō de hěn liúlì.", vi: "Anh ấy không chỉ biết nói tiếng Trung mà còn nói rất trôi chảy." },
    ],
  },
  {
    id: "zh_pat_7",
    level: "Trung cấp • HSK 3–4",
    title: "7. Ngay cả ... cũng ...: 连 [Đối tượng] 都/也 ...",
    pattern: "连 ... 都 ... (Lián ... dōu ...)",
    note: "Nhấn mạnh trường hợp cực đoan để làm nổi bật ý nói.",
    slots: [
      { hanzi: "今天太忙了，我连午饭都没吃。", pinyin: "Jīntiān tài máng le, wǒ lián wǔfàn dōu méi chī.", vi: "Hôm nay bận quá, tôi ngay cả cơm trưa cũng chưa ăn." },
      { hanzi: "这么简单的问题，连小学生都会。", pinyin: "Zhème jiǎndān de wèntí, lián xiǎoxuéshēng dōu huì.", vi: "Câu hỏi đơn giản thế này, ngay cả học sinh tiểu học cũng biết." },
    ],
  },
  {
    id: "zh_pat_8",
    level: "Trung cấp • HSK 4",
    title: "8. Giá mà / Nếu ... thì tốt biết mấy: 要是 ... 就好了",
    pattern: "要是 ... 就好了 (Yàoshi ... jiù hǎo le)",
    note: "Bày tỏ điều ước hoặc sự tiếc nuối nhẹ nhàng.",
    slots: [
      { hanzi: "要是周末不加班就好了。", pinyin: "Yàoshi zhōumò bù jiābān jiù hǎo le.", vi: "Giá mà cuối tuần không phải tăng ca thì tốt biết mấy." },
      { hanzi: "要是能再便宜一点儿就好了。", pinyin: "Yàoshi néng zài piányi yìdiǎnr jiù hǎo le.", vi: "Nếu rẻ thêm được một chút nữa thì hay quá." },
    ],
  },
  {
    id: "zh_pat_9",
    level: "Nâng cao • HSK 4–5",
    title: "9. Thà ... còn hơn ...: 与其 [A]，不如 [B]",
    pattern: "与其 ... 不如 ... (Yǔqí ... bùrú ...)",
    note: "Dùng khi so sánh hai lựa chọn và khuyên chọn phương án B tốt hơn hẳn.",
    slots: [
      { hanzi: "与其在这儿干等，不如先去吃饭。", pinyin: "Yǔqí zài zhèr gānděng, bùrú xiān qù chīfàn.", vi: "Thà đi ăn cơm trước còn hơn ngồi đây đợi suông." },
      { hanzi: "与其买便宜但容易坏的，不如买个质量好的。", pinyin: "Yǔqí mǎi piányi dàn róngyì huài de, bùrú mǎi ge zhìliàng hǎo de.", vi: "Thà mua cái chất lượng tốt còn hơn mua đồ rẻ mà dễ hỏng." },
    ],
  },
  {
    id: "zh_pat_10",
    level: "Nâng cao • HSK 4–5",
    title: "10. Sở dĩ ... là vì ...: 之所以 [Kết quả]，是因为 [Nguyên nhân]",
    pattern: "之所以 ... 是因为 ...",
    note: "Nhấn mạnh kết quả trước rồi mới giải thích lý do — rất hay dùng trong công việc.",
    slots: [
      { hanzi: "我之所以迟到，是因为路上堵车太严重了。", pinyin: "Wǒ zhīsuǒyǐ chídào, shì yīnwèi lùshang dǔchē tài yánzhòng le.", vi: "Sở dĩ tôi đến muộn là vì trên đường kẹt xe nghiêm trọng quá." },
      { hanzi: "他之所以进步这么快，是因为每天都坚持跟读。", pinyin: "Tā zhīsuǒyǐ jìnbù zhème kuài, shì yīnwèi měitiān dōu jiānchí gēndú.", vi: "Sở dĩ anh ấy tiến bộ nhanh thế là nhờ ngày nào cũng kiên trì đọc nhại theo." },
    ],
  },
  {
    id: "zh_pat_11",
    level: "Nâng cao • HSK 5",
    title: "11. Cho dù ... đi nữa thì cũng ...: 哪怕 [Giả định] 也 ...",
    pattern: "哪怕 ... 也 ... (Nǎpà ... yě ...)",
    note: "Nhấn mạnh quyết tâm không thay đổi trước tình huống giả định khó khăn.",
    slots: [
      { hanzi: "哪怕每天只学二十分钟，日积月累也会有大变化。", pinyin: "Nǎpà měitiān zhǐ xué èrshí fēnzhōng, rìjī-yuèlěi yě huì yǒu dà biànhuà.", vi: "Dù mỗi ngày chỉ học 20 phút, tích tiểu thành đại cũng sẽ tạo ra thay đổi lớn." },
      { hanzi: "哪怕再忙，也要抽空锻炼身体。", pinyin: "Nǎpà zài máng, yě yào chōukòng duànliàn shēntǐ.", vi: "Cho dù bận đến mấy cũng phải tranh thủ rèn luyện sức khỏe." },
    ],
  },
  {
    id: "zh_pat_12",
    level: "Nâng cao • HSK 5–6",
    title: "12. Phản biện lịch sự: 话虽这么说，但是...",
    pattern: "话虽这么说，但是 ... (Huà suī zhème shuō, dànshì ...)",
    note: "Đồng tình một phần với người nghe trước khi đưa ra thực tế/góc nhìn ngược lại.",
    slots: [
      { hanzi: "话虽这么说，但是预算确实不够。", pinyin: "Huà suī zhème shuō, dànshì yùsuàn quèshí bú gòu.", vi: "Nói thì nói vậy, nhưng ngân sách quả thực không đủ." },
      { hanzi: "话虽这么说，实际操作起来还是有很多难点。", pinyin: "Huà suī zhème shuō, shíjì cāozuò qǐlái háishi yǒu hěn duō nándiǎn.", vi: "Tuy nói là vậy, nhưng khi bắt tay làm thực tế vẫn có rất nhiều điểm khó." },
    ],
  },
];

export const ZH_ROLEPLAYS = [
  {
    id: "zh_rp_1",
    level: "Bài 1 • HSK 1",
    title: "Làm quen & Kết bạn WeChat",
    situation: "Gặp đồng nghiệp mới và xin WeChat liên lạc.",
    lines: [
      { role: "A", hanzi: "你好！你是新来的同事吗？", pinyin: "Nǐ hǎo! Nǐ shì xīn lái de tóngshì ma?", vi: "Chào bạn! Bạn là đồng nghiệp mới đến phải không?" },
      { role: "B", hanzi: "对，我叫安，刚来这儿工作。请多关照！", pinyin: "Duì, wǒ jiào Ān, gāng lái zhèr gōngzuò. Qǐng duō guānzhào!", vi: "Đúng rồi, tôi tên An, mới đến làm. Mong bạn giúp đỡ nhiều!" },
      { role: "A", hanzi: "我叫明。我们加个微信吧，有事随时找我。", pinyin: "Wǒ jiào Míng. Wǒmen jiā ge Wēixìn ba, yǒushì suíshí zhǎo wǒ.", vi: "Tôi tên Minh. Mình kết bạn WeChat đi, có việc cứ tìm tôi bất cứ lúc nào." },
      { role: "B", hanzi: "太好了，我扫你吧！", pinyin: "Tài hǎo le, wǒ sǎo nǐ ba!", vi: "Tuyệt quá, để tôi quét mã của bạn nhé!" },
    ],
  },
  {
    id: "zh_rp_2",
    level: "Bài 2 • HSK 1–2",
    title: "Mua cà phê & Chọn lượng đường đá",
    situation: "Gọi đồ uống tại quán trà sữa / cà phê.",
    lines: [
      { role: "A", hanzi: "你好，请问想喝点儿什么？", pinyin: "Nǐ hǎo, qǐngwèn xiǎng hē diǎnr shénme?", vi: "Xin chào, bạn muốn uống gì ạ?" },
      { role: "B", hanzi: "我要一杯冰拿铁，中杯，少冰微糖。", pinyin: "Wǒ yào yì bēi bīng nátiě, zhōngbēi, shǎobīng wēitáng.", vi: "Cho tôi 1 ly Latte đá, size vừa, ít đá ít đường." },
      { role: "A", hanzi: "好的，在这里喝还是打包带走？", pinyin: "Hǎo de, zài zhèlǐ hē háishi dǎbāo dàizǒu?", vi: "Vâng, uống tại quán hay gói mang đi ạ?" },
      { role: "B", hanzi: "打包带走，我扫微信付款。", pinyin: "Dǎbāo dàizǒu, wǒ sǎo Wēixìn fùkuǎn.", vi: "Gói mang đi nhé, tôi quét WeChat thanh toán." },
    ],
  },
  {
    id: "zh_rp_3",
    level: "Bài 3 • HSK 2",
    title: "Gọi món tại nhà hàng & Nhắc khẩu vị",
    situation: "Vào quán ăn cùng bạn và dặn đầu bếp không cho rau mùi / ít cay.",
    lines: [
      { role: "A", hanzi: "欢迎光临，请问两位想点什么菜？", pinyin: "Huānyíng guānglín, qǐngwèn liǎng wèi xiǎng diǎn shénme cài?", vi: "Hoan nghênh quý khách, hai vị muốn gọi món gì ạ?" },
      { role: "B", hanzi: "这儿有什么招牌菜可以推荐一下吗？", pinyin: "Zhèr yǒu shénme zhāopáicài kěyǐ tuījiàn yíxià ma?", vi: "Ở đây có món tủ nào giới thiệu giúp tôi được không?" },
      { role: "A", hanzi: "我们的水煮鱼和宫保鸡丁非常受欢迎。", pinyin: "Wǒmen de shuǐzhǔyú hé gōngbǎo jīdīng fēicháng shòu huānyíng.", vi: "Món cá luộc cay và gà Kung Pao của quán được ưa chuộng lắm ạ." },
      { role: "B", hanzi: "那就点这两个，不过请微辣，而且不要放香菜。", pinyin: "Nà jiù diǎn zhè liǎng ge, búguò qǐng wēilà, érqiě búyào fàng xiāngcài.", vi: "Vậy gọi hai món này đi, nhưng cho cay nhẹ thôi và đừng bỏ rau mùi nhé." },
    ],
  },
  {
    id: "zh_rp_4",
    level: "Bài 4 • HSK 2–3",
    title: "Hỏi đường đi Tàu điện ngầm",
    situation: "Hỏi người đi đường cách ra ga метро và đổi tuyến.",
    lines: [
      { role: "A", hanzi: "打扰一下，请问最近的地铁站在哪儿？", pinyin: "Dǎrǎo yíxià, qǐngwèn zuìjìn de dìtiězhàn zài nǎr?", vi: "Xin làm phiền chút, ga tàu điện ngầm gần nhất ở đâu ạ?" },
      { role: "B", hanzi: "顺着这条路往前走两百米，在左手边。", pinyin: "Shùnzhe zhè tiáo lù wǎng qián zǒu liǎngbǎi mǐ, zài zuǒshǒubiān.", vi: "Cứ đi dọc đường này về trước 200 mét, nó nằm bên tay trái." },
      { role: "A", hanzi: "去天安门应该坐几号线？", pinyin: "Qù Tiān'ānmén yīnggāi zuò jǐ hào xiàn?", vi: "Đi Thiên An Môn thì nên đi tuyến số mấy ạ?" },
      { role: "B", hanzi: "先坐二号线，坐两站然后换乘一号线就到了。", pinyin: "Xiān zuò èr hào xiàn, zuò liǎng zhàn ránhòu huànchéng yī hào xiàn jiù dào le.", vi: "Đi tuyến số 2 trước, đi 2 trạm rồi đổi sang tuyến số 1 là tới." },
    ],
  },
  {
    id: "zh_rp_5",
    level: "Bài 5 • HSK 3",
    title: "Đi Taxi & Giục kịp giờ",
    situation: "Bắt taxi đi ga tàu cao tốc trong giờ cao điểm.",
    lines: [
      { role: "A", hanzi: "师傅，去高铁站大概需要多长时间？", pinyin: "Shīfu, qù gāotiězhàn dàgài xūyào duō cháng shíjiān?", vi: "Bác tài ơi, đi ga tàu cao tốc mất khoảng bao lâu ạ?" },
      { role: "B", hanzi: "现在是下班高峰期，估计得四十分钟。", pinyin: "Xiànzài shì xiàbān gāofēngqī, gūjì děi sìshí fēnzhōng.", vi: "Giờ đang cao điểm tan tầm, ước chừng phải 40 phút." },
      { role: "A", hanzi: "我赶时间，麻烦您走高架路，快一点儿可以吗？", pinyin: "Wǒ gǎn shíjiān, máfan nín zǒu gāojiàlù, kuài yìdiǎnr kěyǐ ma?", vi: "Tôi đang vội, phiền bác đi đường trên cao nhanh hơn chút được không?" },
      { role: "B", hanzi: "放心吧，走高架二十五分钟就能送到。", pinyin: "Fàngxīn ba, zǒu gāojià èrshíwǔ fēnzhōng jiù néng sòngdào.", vi: "Yên tâm đi, đi đường trên cao 25 phút là đưa bạn tới nơi." },
    ],
  },
  {
    id: "zh_rp_6",
    level: "Bài 6 • HSK 3",
    title: "Mua quần áo, Thử size & Mặc cả",
    situation: "Thử áo khoác và thương lượng giảm giá.",
    lines: [
      { role: "A", hanzi: "这件毛衣有大一号的吗？我穿有点儿紧。", pinyin: "Zhè jiàn máoyī yǒu dà yí hào de ma? Wǒ chuān yǒudiǎnr jǐn.", vi: "Chiếc áo len này có cỡ lớn hơn 1 size không? Tôi mặc hơi chật." },
      { role: "B", hanzi: "有的，给您拿件L码的试试。颜色很衬您的皮肤！", pinyin: "Yǒu de, gěi nín ná jiàn L-mǎ de shìshi. Yánsè hěn chèn nín de pífū!", vi: "Có ạ, lấy size L cho bạn thử nhé. Màu này rất tôn da bạn đấy!" },
      { role: "A", hanzi: "大小合适。如果我买两件，能不能便宜一点儿？", pinyin: "Dàxiǎo héshì. Rúguǒ wǒ mǎi liǎng jiàn, néng bu néng piányi yìdiǎnr?", vi: "Cỡ vừa rồi. Nếu tôi mua 2 chiếc thì bớt chút được không?" },
      { role: "B", hanzi: "行，给您打八五折，再送您一双袜子。", pinyin: "Xíng, gěi nín dǎ bāwǔ zhé, zài sòng nín yì shuāng wàzi.", vi: "Được, giảm cho bạn 15%, tặng thêm một đôi tất nữa." },
    ],
  },
  {
    id: "zh_rp_7",
    level: "Bài 7 • HSK 3–4",
    title: "Nhận phòng Khách sạn & Đổi phòng yên tĩnh",
    situation: "Làm thủ tục check-in và nhờ đổi phòng xa thang máy.",
    lines: [
      { role: "A", hanzi: "您好，我预订了今晚的标准间，这是我的护照。", pinyin: "Nínhǎo, wǒ yùdìng le jīnwǎn de biāozhǔnjiān, zhè shì wǒ de hùzhào.", vi: "Xin chào, tôi đã đặt phòng tiêu chuẩn tối nay, đây là hộ chiếu của tôi." },
      { role: "B", hanzi: "查到了，给您安排在五楼靠电梯的房间。", pinyin: "Chádào le, gěi nín ānpái zài wǔ lóu kào diàntī de fángjiān.", vi: "Tìm thấy rồi ạ, xếp cho bạn phòng tầng 5 gần thang máy." },
      { role: "A", hanzi: "我睡觉比较轻，能不能换一间安静一点儿的？", pinyin: "Wǒ shuìjiào bǐjiào qīng, néng bu néng huàn yì jiān ānjìng yìdiǎnr de?", vi: "Tôi ngủ khá tỉnh, có thể đổi sang phòng nào yên tĩnh hơn chút không?" },
      { role: "B", hanzi: "没问题，帮您换到八楼走廊尽头那间，含双早。", pinyin: "Méi wèntí, bāng nín huàn dào bā lóu zǒuláng jìntóu nà jiān, hán shuāngzǎo.", vi: "Không vấn đề, đổi cho bạn lên tầng 8 cuối hành lang, gồm 2 suất ăn sáng." },
    ],
  },
  {
    id: "zh_rp_8",
    level: "Bài 8 • HSK 4",
    title: "Đi hiệu thuốc & Khám cảm cúm",
    situation: "Kể triệu chứng đau họng, sốt nhẹ cho dược sĩ.",
    lines: [
      { role: "A", hanzi: "大夫，我从昨天开始嗓子疼，还有点儿低烧。", pinyin: "Dàifu, wǒ cóng zuótiān kāishǐ sǎngzi téng, hái yǒudiǎnr dīshāo.", vi: "Bác sĩ ơi, từ hôm qua tôi bị đau họng, còn hơi sốt nhẹ nữa." },
      { role: "B", hanzi: "咳嗽吗？有没有对什么药物过敏？", pinyin: "Késou ma? Yǒu méiyǒu duì shénme yàowù guòmǐn?", vi: "Có ho không? Có bị dị ứng với loại thuốc nào không?" },
      { role: "A", hanzi: "偶尔咳两声，没有药物过敏。", pinyin: "Ǒu'ěr ké liǎng shēng, méiyǒu yàowù guòmǐn.", vi: "Thỉnh thoảng ho vài tiếng, không dị ứng thuốc gì cả." },
      { role: "B", hanzi: "先吃这盒感冒药，一天三次，多喝温水少吃辣。", pinyin: "Xiān chī zhè hé gǎnmàoyào, yì tiān sān cì, duō hē wēnshuǐ shǎo chī là.", vi: "Uống hộp thuốc cảm này trước, ngày 3 lần, uống nhiều nước ấm và kiêng cay." },
    ],
  },
  {
    id: "zh_rp_9",
    level: "Bài 9 • HSK 4",
    title: "Xem nhà & Thương lượng tiền thuê",
    situation: "Hỏi chủ nhà/môi giới về hợp đồng thuê căn hộ.",
    lines: [
      { role: "A", hanzi: "这套一居室采光不错，家用电器都齐全吗？", pinyin: "Zhè tào yìjūshì cǎiguāng búcuò, jiāyòng diànqì dōu qíquán ma?", vi: "Căn 1 phòng ngủ này ánh sáng tốt đấy, đồ điện gia dụng có đủ cả không?" },
      { role: "B", hanzi: "全配齐了，洗衣机和冰箱都是去年新买的。", pinyin: "Quán pèiqí le, xǐyījī hé bīngxiāng dōu shì qùnián xīn mǎi de.", vi: "Trang bị đủ hết rồi, máy giặt và tủ lạnh đều mới mua năm ngoái." },
      { role: "A", hanzi: "如果我签一年合同，房租能少两百块吗？", pinyin: "Rúguǒ wǒ qiān yì nián hétong, fángzū néng shǎo liǎngbǎi kuài ma?", vi: "Nếu tôi ký hợp đồng 1 năm, tiền nhà bớt 200 tệ được không?" },
      { role: "B", hanzi: "行，看你挺爽快的，押一付三，今天就能签。", pinyin: "Xíng, kàn nǐ tǐng shuǎngkuai de, yā yī fù sān, jīntiān jiù néng qiān.", vi: "Được, thấy bạn nhanh gọn, cọc 1 đóng 3, hôm nay ký luôn được." },
    ],
  },
  {
    id: "zh_rp_10",
    level: "Bài 10 • HSK 4–5",
    title: "Đổi trả hàng mua Online",
    situation: "Liên hệ chăm sóc khách hàng khi nhận sản phẩm bị lỗi.",
    lines: [
      { role: "A", hanzi: "客服你好，我刚收到的耳机左边没有声音。", pinyin: "Kèfú nǐ hǎo, wǒ gāng shōudào de ěrjī zuǒbiān méiyǒu shēngyīn.", vi: "Chào CSKH, tai nghe tôi vừa nhận bên trái không có tiếng." },
      { role: "B", hanzi: "非常抱歉给您带来不便！您充满电试过了吗？", pinyin: "Fēicháng bàoqiàn gěi nín dàilái búbiàn! Nín chōngmǎn diàn shìguò le ma?", vi: "Vô cùng xin lỗi vì sự bất tiện! Bạn đã sạc đầy pin thử chưa ạ?" },
      { role: "A", hanzi: "试过了，还是不行。我想申请换一个新的。", pinyin: "Shìguò le, háishi bù xíng. Wǒ xiǎng shēnqǐng huàn yí ge xīn de.", vi: "Thử rồi mà vẫn không được. Tôi muốn đăng ký đổi chiếc mới." },
      { role: "B", hanzi: "没问题，我们安排快递员免费上门取件换新。", pinyin: "Méi wèntí, wǒmen ānpái kuàidìyuán miǎnfèi shàngmén qǔjiàn huànxīn.", vi: "Không vấn đề, bên tôi sẽ xếp shipper tới tận nhà lấy đổi mới miễn phí." },
    ],
  },
  {
    id: "zh_rp_11",
    level: "Bài 11 • HSK 4–5",
    title: "Xin nghỉ phép & Bàn giao việc cho đồng nghiệp",
    situation: "Nhờ đồng nghiệp hỗ trợ xử lý việc gấp trong ngày nghỉ.",
    lines: [
      { role: "A", hanzi: "小李，我明天家里有点急事，请了一天假。", pinyin: "Xiǎo Lǐ, wǒ míngtiān jiālǐ yǒudiǎn jíshì, qǐng le yì tiān jià.", vi: "Tiểu Lý ơi, mai nhà tôi có chút việc gấp nên xin nghỉ 1 ngày." },
      { role: "B", hanzi: "怎么了？严重吗？手头的项目需要我帮忙吗？", pinyin: "Zěnme le? Yánzhòng ma? Shǒutóu de xiàngmù xūyào wǒ bāngmáng ma?", vi: "Sao thế? Có nghiêm trọng không? Dự án đang làm cần tôi giúp không?" },
      { role: "A", hanzi: "常规工作我处理完了，万一客户催合同，麻烦你帮我盯一下。", pinyin: "Chángguī gōngzuò wǒ chǔlǐ wán le, wànyī kèhù cuī hétong, máfan nǐ bāng wǒ dīng yíxià.", vi: "Việc thường ngày tôi xử lý xong rồi, nhỡ khách giục hợp đồng thì phiền bạn để ý giúp." },
      { role: "B", hanzi: "放心去办你的事吧，这边包在我身上！", pinyin: "Fàngxīn qù bàn nǐ de shì ba, zhèbiān bāo zài wǒ shēnshang!", vi: "Cứ yên tâm lo việc của bạn đi, bên này cứ để tôi lo!" },
    ],
  },
  {
    id: "zh_rp_12",
    level: "Bài 12 • HSK 5",
    title: "Họp nhóm & Điều chỉnh tiến độ dự án",
    situation: "Bàn cách tháo gỡ khi tiến độ上线 (go-live) bị gấp.",
    lines: [
      { role: "A", hanzi: "说句实话，这周把所有功能都上线有点儿赶。", pinyin: "Shuō jù shíhuà, zhè zhōu bǎ suǒyǒu gōngnéng dōu shàngxiàn yǒudiǎnr gǎn.", vi: "Nói thật lòng, tuần này đưa hết toàn bộ tính năng lên hơi gấp." },
      { role: "B", hanzi: "我理解你的顾虑。要不我们分两期发布，先保核心流程？", pinyin: "Wǒ lǐjiě nǐ de gùlǜ. Yàobu wǒmen fēn liǎng qī fābù, xiān bǎo héxīn liúchéng?", vi: "Tôi hiểu lo ngại của bạn. Hay mình chia 2 đợt phát hành, ưu tiên luồng cốt lõi trước?" },
      { role: "A", hanzi: "从长远来看，这样做系统稳定性更有保障。", pinyin: "Cóng chángyuǎn lái kàn, zhèyàng zuò xìtǒng wěndìngxìng gèng yǒu bǎozhàng.", vi: "Xét về lâu dài, làm vậy độ ổn định hệ thống sẽ đảm bảo hơn." },
      { role: "B", hanzi: "好，那我去跟产品经理对齐一下时间表。", pinyin: "Hǎo, nà wǒ qù gēn chǎnpǐn jīnglǐ duìqí yíxià shíjiānbiǎo.", vi: "Ok, vậy để tôi đi thống nhất lại lịch trình với Product Manager." },
    ],
  },
  {
    id: "zh_rp_13",
    level: "Bài 13 • HSK 5",
    title: "Phỏng vấn xin việc bằng tiếng Trung",
    situation: "Trả lời câu hỏi về điểm mạnh và lý do chuyển việc.",
    lines: [
      { role: "A", hanzi: "能简单介绍一下你最大的优势是什么吗？", pinyin: "Néng jiǎndān jièshào yíxià nǐ zuìdà de yōushì shì shénme ma?", vi: "Bạn có thể giới thiệu ngắn gọn thế mạnh lớn nhất của mình là gì không?" },
      { role: "B", hanzi: "我觉得是学习能力强，而且在跨部门沟通上很有经验。", pinyin: "Wǒ juéde shì xuéxí nénglì qiáng, érqiě zài kuàbùmén gōutōng shàng hěn yǒu jīngyàn.", vi: "Tôi nghĩ là khả năng tự học nhanh và có nhiều kinh nghiệm phối hợp liên phòng ban." },
      { role: "A", hanzi: "为什么想离开上一家公司呢？", pinyin: "Wèishénme xiǎng líkāi shàng yì jiā gōngsī ne?", vi: "Vì sao bạn muốn rời công ty trước?" },
      { role: "B", hanzi: "我希望接触更大规模的业务，贵公司的平台非常适合我发展。", pinyin: "Wǒ xīwàng jiēchù gèng dà guīmó de yèwù, guì gōngsī de píngtái fēicháng shìhé wǒ fāzhǎn.", vi: "Tôi mong muốn tiếp xúc nghiệp vụ quy mô lớn hơn, nền tảng của quý công ty rất hợp để tôi phát triển." },
    ],
  },
  {
    id: "zh_rp_14",
    level: "Bài 14 • HSK 5–6",
    title: "Đàm phán giá & Điều khoản hợp đồng với Đối tác",
    situation: "Thương lượng chiết khấu và thời hạn thanh toán.",
    lines: [
      { role: "A", hanzi: "王总，这个报价比我们的预算高出了百分之十。", pinyin: "Wáng zǒng, zhège bàojià bǐ wǒmen de yùsuàn gāochū le bǎifēnzhī shí.", vi: "Giám đốc Vương, báo giá này cao hơn ngân sách của chúng tôi 10%." },
      { role: "B", hanzi: "一分钱一分货，我们用的都是进口原材料。", pinyin: "Yì fēn qián yì fēn huò, wǒmen yòng de dōu shì jìnkǒu yuáncáiliào.", vi: "Tiền nào của nấy mà, bên tôi dùng toàn bộ nguyên liệu nhập khẩu." },
      { role: "A", hanzi: "如果首期先签两年的框架协议，能不能再让一步？", pinyin: "Rúguǒ shǒuqī xiān qiān liǎng nián de kuàngjià xiéyì, néng bu néng zài ràng yí bù?", vi: "Nếu giai đoạn đầu ký thỏa thuận khung 2 năm luôn, có nhượng bộ thêm một bước được không?" },
      { role: "B", hanzi: "既然贵方这么有诚意，那我们按九五折成交！", pinyin: "Jìrán guìfāng zhème yǒu chéngyì, nà wǒmen àn jiǔwǔ zhé chéngjiāo!", vi: "Đã là bên bạn có thành ý như vậy, ta chốt theo mức giảm 5% nhé!" },
    ],
  },
  {
    id: "zh_rp_15",
    level: "Bài 15 • HSK 6",
    title: "Tranh luận quan điểm: Làm việc từ xa vs Tại văn phòng",
    situation: "Trao đổi đa chiều trong buổi thảo luận chuyên đề.",
    lines: [
      { role: "A", hanzi: "居家办公虽然省去了通勤时间，但容易降低团队凝聚力。", pinyin: "Jūjiā bàngōng suīrán shěngqù le tōngqín shíjiān, dàn róngyì jiàngdī tuánduì níngjùlì.", vi: "Làm việc tại nhà tuy tiết kiệm thời gian đi lại nhưng dễ làm giảm sự gắn kết nhóm." },
      { role: "B", hanzi: "话虽这么说，只要目标明确，混合办公反而效率更高。", pinyin: "Huà suī zhème shuō, zhǐyào mùbiāo míngquè, hùnhé bàngōng fǎn'ér xiàolǜ gèng gāo.", vi: "Nói thì nói vậy, chỉ cần mục tiêu rõ ràng thì làm việc kết hợp (hybrid) ngược lại hiệu quả cao hơn." },
      { role: "A", hanzi: "这得看具体岗位，研发岗确实更适合灵活办公。", pinyin: "Zhè děi kàn jùtǐ gǎngwèi, yánfāgǎng quèshí gèng shìhé línghuó bàngōng.", vi: "Cái này phải tùy vị trí cụ thể, vị trí R&D quả thực hợp làm việc linh hoạt hơn." },
      { role: "B", hanzi: "没错，归根结底，管理应该看结果而不是看工时。", pinyin: "Méicuò, guīgēn jiédǐ, guǎnlǐ yīnggāi kàn jiéguǒ ér búshì kàn gōngshí.", vi: "Đúng vậy, suy cho cùng quản lý nên nhìn vào kết quả chứ không phải nhìn số giờ ngồi." },
    ],
  },
];
