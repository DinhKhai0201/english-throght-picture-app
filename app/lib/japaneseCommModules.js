// Japanese Communication Complete Curriculum:
// - 100 Spoken Chunks across Casual (Friends), Intermediate N3, and Business Keigo N3-N2 (bringing total to 401 chunks = 41 lessons)
// - 15 Full Roleplay Dialogues (N5 -> N2)
// - 12 Essential Spoken Sentence Pattern Builders
// - Complete Pronunciation Guide

export function getJaTier(chunk) {
  const lvl = (chunk.level || "").toUpperCase();
  if (lvl.includes("B2") || lvl.includes("N2") || lvl.includes("N1") || lvl === "N3-N2") {
    return "advanced";
  }
  if (lvl.includes("B1") || lvl.includes("N3")) {
    return "intermediate";
  }
  return "basic";
}

export const JA_PRONUNCIATION = {
  coreRules: [
    { id: "ja_long_vowel", rule: "1. Trường âm (Kéo dài gấp đôi — Khác nghĩa hoàn toàn!)", japanese: "おばさん / おばあさん", kana: "おばさん (ngắn) vs おばあさん (dài)", romaji: "obasan (cô/dì) vs obaasan (bà)", meaning: "Kéo dài nguyên âm đúng 2 nhịp, không đọc cắt cụt", tip: "Tương tự: おじさん (chú) vs おじいさん (ông), ビル (tòa nhà) vs ビール (bia), ここ (chỗ này) vs こうこう (cấp 3)." },
    { id: "ja_sokuon", rule: "2. Âm ngắt 「っ」 (Nghỉ 1 nhịp trước phụ âm sau)", japanese: "きて / きって", kana: "きて (hãy đến) vs きって (tem thư)", romaji: "kite vs kitte", meaning: "Khựng lại đúng 1 nhịp ở chữ 'っ' rồi bật âm tiếp theo", tip: "Gặp cực nhiều: ちょっとまって (chotto matte), いっしょに (issho ni), ざっし (zasshi)." },
    { id: "ja_devoicing", rule: "3. Nuốt âm cuối 'u' ở です / ます (Nói tự nhiên như người Nhật)", japanese: "わかりました。大丈夫です。", kana: "わかりました。だいじょうぶです。", romaji: "Wakarimashita. Daijoubu desu.", meaning: "Tôi hiểu rồi. Không sao đâu ạ.", tip: "Đọc nhẹ chữ 'su' thành /s/ và 'shi' trong 'mashita' thành /sh/, không đọc nặng thành 'đê-xư'." },
  ],
  soundGroups: [
    { id: "ja_dakuten", title: "Âm trong vs Âm đục (゛ và ゜)", japanese: "か・が / さ・ざ / た・だ / は・ば・ぱ", kana: "か・が / さ・ざ / た・だ / は・ば・ぱ", romaji: "ka-ga / sa-za / ta-da / ha-ba-pa", meaning: "Phân biệt rõ âm rung cổ họng (ga, za, da, ba) và âm bật (pa)", tip: "Ví dụ: たなか (Tanaka) vs だいがく (Daigaku), ほん (hon) vs いっぽん (ippon)." },
    { id: "ja_yoon", title: "Âm ghép (Yōon): きゃ・しゅ・ちょ・りょ", japanese: "きょう、しゅみ、ちょっと、りょこう", kana: "きょう、しゅみ、ちょっと、りょこう", romaji: "kyou, shumi, chotto, ryokou", meaning: "Hôm nay, sở thích, một chút, du lịch", tip: "Đọc liền thành 1 âm gọn, không tách rời từng chữ." },
    { id: "ja_n_sound", title: "Âm mũi 「ん」 (Chiếm 1 nhịp riêng)", japanese: "すみません、にほん、しんぱい", kana: "すみません、にほん、しんぱい", romaji: "sumimasen, nihon, shinpai", meaning: "Xin lỗi, Nhật Bản, lo lắng", tip: "Trước p/b/m (như shinpai, shinbun) đọc khép môi như chữ 'm'." },
  ],
};

// 100 High-Value Spoken Chunks: Casual (35) + Intermediate N3 (30) + Business/Keigo N3-N2 (35)
const RAW_EXTRA_JA = [
  // 1. Casual Everyday Conversation (Friends & Colleagues)
  ["JP302", "Thể Thân Mật (Bạn bè)", "元気？最近どう？", "げんき？さいきんどう？", "Genki? Saikin dou?", "Khỏe không? Dạo này thế nào?", "N5-N4", "casual", "Lịch sự: お元気ですか。最近いかがですか。"],
  ["JP303", "Thể Thân Mật (Bạn bè)", "ちょっと待って！", "ちょっとまって！", "Chotto matte!", "Đợi chút đã!", "N5-N4", "casual", "Lịch sự: 少々お待ちください。"],
  ["JP304", "Thể Thân Mật (Bạn bè)", "マジで？本当？", "マジで？ほんとう？", "Maji de? Hontou?", "Thật hả? Thiệt luôn?", "N4-N3", "casual", "Lịch sự: 本当ですか。"],
  ["JP305", "Thể Thân Mật (Bạn bè)", "どうしようかな…", "どうしようかな…", "Dou shiyou kana...", "Làm sao bây giờ nhỉ…", "N4-N3", "casual", "Lịch sự: どうしましょうか。"],
  ["JP306", "Thể Thân Mật (Bạn bè)", "まあ、いいんじゃない？", "まあ、いいんじゃない？", "Maa, ii n ja nai?", "Thì cũng ổn mà, đúng không?", "N3", "casual", "Đáp: そうだね、やってみよう。"],
  ["JP307", "Thể Thân Mật (Bạn bè)", "おなかすいた。何か食べに行こう！", "おなかすいた。なにかたべにいこう！", "Onaka suita. Nanika tabe ni ikou!", "Đói bụng quá. Đi ăn gì đó đi!", "N5-N4", "casual", "Lịch sự: 何か食べに行きませんか。"],
  ["JP308", "Thể Thân Mật (Bạn bè)", "ごめん、今日ちょっと無理かも。", "ごめん、きょうちょっとむりかも。", "Gomen, kyou chotto muri kamo.", "Xin lỗi, hôm nay chắc mình không đi được rồi.", "N4-N3", "casual", "Đáp: 全然大丈夫！また今度ね。"],
  ["JP309", "Thể Thân Mật (Bạn bè)", "それ、めっちゃわかる！", "それ、めっちゃわかる！", "Sore, meccha wakaru!", "Cái đó mình hiểu cực kỳ luôn!", "N3", "casual", "Đáp: だよね！同じこと思ってた。"],
  ["JP310", "Thể Thân Mật (Bạn bè)", "今、時間ある？ちょっと話せる？", "いま、じかんある？ちょっとはなせる？", "Ima, jikan aru? Chotto hanaseru?", "Giờ có rảnh không? Nói chuyện chút được không?", "N4-N3", "casual", "Lịch sự: 今、お時間よろしいですか。"],
  ["JP311", "Thể Thân Mật (Bạn bè)", "気にしないで！よくあることだよ。", "きにしないで！よくあることだよ。", "Ki ni shinaide! Yoku aru koto da yo.", "Đừng bận tâm! Chuyện thường tình ấy mà.", "N4-N3", "casual", "Lịch sự: 気にしないでください。"],
  ["JP312", "Thể Thân Mật (Bạn bè)", "やっぱりやめておく。", "やっぱりやめておく。", "Yappari yamete oku.", "Nghĩ lại thì thôi mình không làm/mua nữa.", "N3", "casual", "Lịch sự: やはりやめておきます。"],
  ["JP313", "Thể Thân Mật (Bạn bè)", "さすがだね！すごいじゃん。", "さすがだね！すごいじゃん。", "Sasuga da ne! Sugoi jan.", "Đúng là cậu có khác! Giỏi ghê.", "N3", "casual", "Đáp: いやいや、たまたまだよ。"],
  ["JP314", "Thể Thân Mật (Bạn bè)", "どっちでもいいよ、任せる！", "どっちでもいいよ、まかせる！", "Docchi demo ii yo, makaseru!", "Cái nào cũng được, giao cho cậu quyết hết!", "N4-N3", "casual", "Lịch sự: どちらでも構いません。お任せします。"],
  ["JP315", "Thể Thân Mật (Bạn bè)", "また連絡するね！じゃあね。", "またれんらくするね！じゃあね。", "Mata renraku suru ne! Jaa ne.", "Mình liên lạc lại sau nhé! Bye nha.", "N5-N4", "casual", "Lịch sự: またご連絡いたします。失礼します。"],
  ["JP316", "Thể Thân Mật (Bạn bè)", "これ、一口食べてみる？", "これ、ひとくちたべてみる？", "Kore, hitokuchi tabete miru?", "Cậu ăn thử một miếng cái này không?", "N4-N3", "casual", "Đáp: えっ、いいの？ありがとう！"],
  ["JP317", "Thể Thân Mật (Bạn bè)", "なんかいい方法ないかな。", "なんかいいほうほうないかな。", "Nanka ii houhou nai kana.", "Không biết có cách nào hay không nhỉ.", "N3", "casual", "Lịch sự: 何か良い方法はないでしょうか。"],
  ["JP318", "Thể Thân Mật (Bạn bè)", "昨日、全然眠れなかったんだ。", "きのう、ぜんぜんねむれなかったんだ。", "Kinou, zenzen nemurenakatta n da.", "Hôm qua mình chẳng ngủ được chút nào.", "N4-N3", "casual", "Đáp: 大丈夫？無理しないでね。"],
  ["JP319", "Thể Thân Mật (Bạn bè)", "今からそっちに行くね！", "いまからそっちにいくね！", "Ima kara socchi ni iku ne!", "Bây giờ mình qua chỗ cậu đây!", "N5-N4", "casual", "Đáp: うん、気をつけて来てね。"],
  ["JP320", "Thể Thân Mật (Bạn bè)", "それってどういう意味？", "それってどういういみ？", "Sore tte dou iu imi?", "Cái đó nghĩa là sao cơ?", "N4-N3", "casual", "Lịch sự: それはどういう意味ですか。"],
  ["JP321", "Thể Thân Mật (Bạn bè)", "うそ！信じられない！", "うそ！しんじられない！", "Uso! Shinjirarenai!", "Xạoน่า! Không thể tin nổi!", "N4-N3", "casual", "Đáp: 本当なんだってば！"],
  ["JP322", "Thể Thân Mật (Bạn bè)", "手伝ってくれて助かったよ。", "てつだってくれてたすかったよ。", "Tetsudatte kurete tasukatta yo.", "May mà có cậu giúp, cứu mình một bàn thua.", "N4-N3", "casual", "Lịch sự: 手伝っていただいて助かりました。"],
  ["JP323", "Thể Thân Mật (Bạn bè)", "無理しなくていいからね。", "むりしなくていいからね。", "Muri shinakute ii kara ne.", "Đừng cố quá sức đấy nhé.", "N4-N3", "casual", "Đáp: うん、ありがとう。"],
  ["JP324", "Thể Thân Mật (Bạn bè)", "そろそろ行こっか。", "そろそろいこっか。", "Sorosoro ikokka.", "Tầm này tụi mình đi thôi nhỉ.", "N4-N3", "casual", "Lịch sự: そろそろ参りましょうか。"],
  ["JP325", "Thể Thân Mật (Bạn bè)", "割り勘にしよう！", "わりかんにしよう！", "Warikan ni shiyou!", "Chia tiền đều (campuchia) đi!", "N4-N3", "casual", "Đáp: うん、そうしよう。"],
  ["JP326", "Thể Thân Mật (Bạn bè)", "ここだけの話だけど…", "ここだけのはなしだけど…", "Koko dake no hanashi dakedo...", "Chuyện chỉ nói riêng ở đây thôi nhé…", "N3", "casual", "Đáp: えっ、何々？誰にも言わないよ。"],
  ["JP327", "Thể Thân Mật (Bạn bè)", "楽しみにしてるね！", "たのしみにしてるね！", "Tanoshimi ni shiteru ne!", "Mình hóng lắm đấy nhé!", "N5-N4", "casual", "Lịch sự: 楽しみにしております。"],
  ["JP328", "Thể Thân Mật (Bạn bè)", "せっかくの休みだし、出かけよう。", "せっかくのやすみだし、でかけよう。", "Sekkaku no yasumi dashi, dekakeyou.", "Mất công có ngày nghỉ quý giá, ra ngoài chơi đi.", "N3", "casual", "Đáp: 賛成！どこ行く？"],
  ["JP329", "Thể Thân Mật (Bạn bè)", "あ、思い出した！", "あ、おもいだした！", "A, omoidashita!", "A, nhớ ra rồi!", "N4-N3", "casual", "Đáp: 何を思い出したの？"],
  ["JP330", "Thể Thân Mật (Bạn bè)", "気のせいじゃない？", "きのせいじゃない？", "Ki no sei ja nai?", "Chắc do cậu tưởng tượng thôi phải không?", "N3", "casual", "Đáp: そうかなあ…"],
  ["JP331", "Thể Thân Mật (Bạn bè)", "とりあえず、やってみよう！", "とりあえず、やってみよう！", "Toriaezu, yatte miyou!", "Trước mắt cứ thử làm xem sao!", "N3", "casual", "Lịch sự: まずは試してみましょう。"],
  ["JP332", "Thể Thân Mật (Bạn bè)", "なんだ、そういうことか！", "なんだ、そういうことか！", "Nanda, sou iu koto ka!", "Ra thế, hóa ra là chuyện như vậy!", "N3", "casual", "Lịch sự: なるほど、そういうことですか。"],
  ["JP333", "Thể Thân Mật (Bạn bè)", "ちょっと考えさせて。", "ちょっとかんがえさせて。", "Chotto kangaesasete.", "Cho mình suy nghĩ một chút nhé.", "N4-N3", "casual", "Lịch sự: 少し考えさせてください。"],
  ["JP334", "Thể Thân Mật (Bạn bè)", "またいつでも声かけてね。", "またいつでもこえかけてね。", "Mata itsudemo koe kakete ne.", "Lần sau cứ gọi mình bất cứ lúc nào nhé.", "N4-N3", "casual", "Lịch sự: いつでもお声がけください。"],
  ["JP335", "Thể Thân Mật (Bạn bè)", "うわ、間に合わないかも！急ごう！", "うわ、まにあわないかも！いそごう！", "Uwa, maniawanai kamo! Isogou!", "Ối, có khi không kịp mất! Nhanh lên thôi!", "N4-N3", "casual", "Đáp: 走ろう！"],
  ["JP336", "Thể Thân Mật (Bạn bè)", "今日はごちそうさま！おいしかった。", "きょうはごちそうさま！おいしかった。", "Kyou wa gochisousama! Oishikatta.", "Hôm nay cảm ơn đã đãi mình nhé! Ngon lắm.", "N5-N4", "casual", "Đáp: よかった！また行こうね。"],

  // 2. Intermediate & Advanced Natural Conversation (N3 - B2 Polite)
  ["JP337", "Giao tiếp Trung - Cao cấp (N3–N2)", "実を言うと、少し迷っているんです。", "じつをいうと、すこしまよっているんです。", "Jitsu o iu to, sukoshi mayotte iru n desu.", "Nói thật lòng thì tôi đang hơi phân vân một chút.", "B2", "polite", "Thân mật: 実はね、ちょっと迷ってるんだ。"],
  ["JP338", "Giao tiếp Trung - Cao cấp (N3–N2)", "状況によって変わってきます。", "じょうきょうによってかわってきます。", "Joukyou ni yotte kawatte kimasu.", "Điều đó sẽ thay đổi tùy theo từng tình huống.", "B2", "polite", "Đáp: 確かに、ケースバイケースですね。"],
  ["JP339", "Giao tiếp Trung - Cao cấp (N3–N2)", "そういう意味ではなくて、誤解しないでください。", "そういういみではなくて、ごかいしないでください。", "Sou iu imi dewa nakute, gokai shinaide kudasai.", "Ý tôi không phải như vậy đâu, xin đừng hiểu lầm.", "N3-N2", "polite", "Đáp: ああ、そういうことでしたか。"],
  ["JP340", "Giao tiếp Trung - Cao cấp (N3–N2)", "長期的に見れば、その方がお得だと思います。", "ちょうきてきにみれば、そのほうがおとくだとおもいます。", "Choukiteki ni mireba, sono hou ga otoku da to omoimasu.", "Nhìn về dài hạn thì tôi nghĩ cách đó có lợi hơn.", "B2", "polite", "Đáp: なるほど、一理ありますね。"],
  ["JP341", "Giao tiếp Trung - Cao cấp (N3–N2)", "一概には言えませんが、メリットの方が多いです。", "いちがいにはいえませんが、メリットのほうがおおいです。", "Ichigai ni wa iemasen ga, meritto no hou ga ooi desu.", "Không thể vơ đũa cả nắm, nhưng mặt lợi vẫn nhiều hơn.", "N3-N2", "polite", "Đáp: 私もそう思います。"],
  ["JP342", "Giao tiếp Trung - Cao cấp (N3–N2)", "念のため、もう一度確認させてください。", "ねんのため、もういちどかくにんさせてください。", "Nen no tame, mou ichido kakunin sasete kudasai.", "Để cho chắc chắn, xin cho tôi xác nhận lại một lần nữa.", "N3", "polite", "Đáp: はい、どうぞ。"],
  ["JP343", "Giao tiếp Trung - Cao cấp (N3–N2)", "お気持ちは分かりますが、今回は難しいです。", "おきもちはわかりますが、こんかいはむずかしいです。", "Okimochi wa wakarimasu ga, konkai wa muzukashii desu.", "Tôi rất hiểu tâm ý của bạn, nhưng lần này thì hơi khó.", "N3-N2", "polite", "Cách từ chối lịch sự chuẩn người Nhật."],
  ["JP344", "Giao tiếp Trung - Cao cấp (N3–N2)", "そう言っていただけると、安心しました。", "そういっていただけると、あんしんしました。", "Sou itte itadakeru to, anshin shimashita.", "Nghe bạn nói được câu đó là tôi yên tâm rồi.", "N3-N2", "polite", "Đáp: いつでも相談してくださいね。"],
  ["JP345", "Giao tiếp Trung - Cao cấp (N3–N2)", "せっかくのお誘いですが、先約がありまして…", "せっかくのおさそいですが、せんやくがありまして…", "Sekkaku no osasoi desu ga, sen'yaku ga arimashite...", "Anh/chị đã có lòng rủ nhưng tiếc quá tôi lại có hẹn trước mất rồi…", "N3-N2", "polite", "Đáp: そうですか、ではまた次の機会に！"],
  ["JP346", "Giao tiếp Trung - Cao cấp (N3–N2)", "反対というわけではありませんが、少し心配です。", "はんたいというわけではありませんが、すこししんぱいです。", "Hantai to iu wake dewa arimasen ga, sukoshi shinpai desu.", "Không phải là tôi phản đối, nhưng tôi hơi lo một chút.", "N3-N2", "polite", "Đáp: どのあたりが心配ですか。"],
  ["JP347", "Giao tiếp Trung - Cao cấp (N3–N2)", "慣れるまで時間がかかるかもしれません。", "なれるまでじかんがかかるかもしれません。", "Nareru made jikan ga kakaru kamo shiremasen.", "Có lẽ sẽ mất chút thời gian cho đến khi quen.", "N3", "polite", "Đáp: 焦らず少しずつ慣れましょう。"],
  ["JP348", "Giao tiếp Trung - Cao cấp (N3–N2)", "おかげさまで、無事に終わりました。", "おかげさまで、ぶじにおわりました。", "Okagesama de, buji ni owarimashita.", "Nhờ trời / Nhờ có bạn giúp mà mọi việc đã xong xuôi êm đẹp.", "N3", "polite", "Đáp: それはよかったですね！"],
  ["JP349", "Giao tiếp Trung - Cao cấp (N3–N2)", "ついでに、これもお願いできますか。", "ついでに、これもおねがいできますか。", "Tsuide ni, kore mo onegai dekimasu ka.", "Nhân tiện, nhờ bạn làm giúp luôn cái này được không?", "N3", "polite", "Đáp: はい、いいですよ。"],
  ["JP350", "Giao tiếp Trung - Cao cấp (N3–N2)", "思ったよりずっと簡単でした。", "おもったよりずっとかんたんでした。", "Omotta yori zutto kantan deshita.", "Đơn giản hơn tôi tưởng rất nhiều.", "N3", "polite", "Thân mật: 思ったより簡単だったよ。"],
  ["JP351", "Giao tiếp Trung - Cao cấp (N3–N2)", "急用ができてしまって、行けなくなりました。", "きゅうようができてしまって、いけなくなりました。", "Kyuuyou ga dekite shimatte, ikenaku narimashita.", "Vì phát sinh việc đột xuất nên tôi không đi được nữa rồi.", "N3", "polite", "Đáp: 大丈夫ですよ、お大事に。"],
  ["JP352", "Giao tiếp Trung - Cao cấp (N3–N2)", "率直に言うと、もう少し改善が必要です。", "そっちょくにいうと、もうすこしかいぜんがひつようです。", "Socchoku ni iu to, mou sukoshi kaizen ga hitsuyou desu.", "Nói thẳng thắn thì vẫn cần cải thiện thêm một chút.", "N3-N2", "polite", "Đáp: 具体的にどこを直せばいいですか。"],
  ["JP353", "Giao tiếp Trung - Cao cấp (N3–N2)", "万が一遅れる場合は、すぐ連絡します。", "まんがいちおくれるばあいは、すぐれんらくします。", "Man ga ichi okureru baai wa, sugu renraku shimasu.", "Vạn nhất trường hợp bị trễ, tôi sẽ liên lạc ngay.", "N3-N2", "polite", "Đáp: 分かりました、気をつけて来てください。"],
  ["JP354", "Giao tiếp Trung - Cao cấp (N3–N2)", "話し合った結果、来月に延期することになりました。", "はなしあったけっか、らいげつにえんきすることになりました。", "Hanashiatta kekka, raigetsu ni enki suru koto ni narimashita.", "Sau khi bàn bạc, chúng tôi đã thống nhất dời sang tháng sau.", "N3-N2", "polite", "Đáp: 承知しました。"],
  ["JP355", "Giao tiếp Trung - Cao cấp (N3–N2)", "毎日少しずつでも続けることが大切です。", "まいにちすこしずつでもつづけることがたいせつです。", "Mainichi sukoshizutsu demo tsuzukeru koto ga taisetsu desu.", "Việc duy trì đều đặn mỗi ngày dù chỉ một chút là rất quan trọng.", "N3", "polite", "Đáp: 本当にその通りですね。"],
  ["JP356", "Giao tiếp Trung - Cao cấp (N3–N2)", "自分の意見を日本語で伝えるのは楽しいです。", "じぶんのいけんをにほんごでつたえるのはたのしいです。", "Jibun no iken o Nihongo de tsutaeru no wa tanoshii desu.", "Việc truyền đạt được ý kiến của mình bằng tiếng Nhật thật thú vị.", "N3", "polite", "Đáp: どんどん話すとさらに上達しますよ。"],
  ["JP357", "Giao tiếp Trung - Cao cấp (N3–N2)", "どちらにするか、まだ決めかねています。", "どちらにするか、まだきめかねています。", "Dochira ni suru ka, mada kimekanete imasu.", "Tôi vẫn đang phân vân chưa quyết được nên chọn bên nào.", "N3-N2", "polite", "Đáp: じっくり比較してみてください。"],
  ["JP358", "Giao tiếp Trung - Cao cấp (N3–N2)", "ご期待に添えず、申し訳ありません。", "ごきたいにそえず、もうしわけありません。", "Gokitai ni soezu, moushiwake arimasen.", "Rất xin lỗi vì chưa đáp ứng được kỳ vọng của anh/chị.", "N3-N2", "polite", "Câu từ chối/xin lỗi lịch sự chuẩn mực."],
  ["JP359", "Giao tiếp Trung - Cao cấp (N3–N2)", "わざわざ来ていただいて、ありがとうございます。", "わざわざきていただいて、ありがとうございます。", "Wazawaza kite itadaite, arigatou gozaimasu.", "Cảm ơn bạn đã cất công tới tận đây.", "N3", "polite", "Đáp: いえいえ、お会いできて嬉しいです。"],
  ["JP360", "Giao tiếp Trung - Cao cấp (N3–N2)", "体調が優れないので、今日は早めに帰ります。", "たいちょうがすぐれないので、きょうははやめにかえります。", "Taichou ga sugurenai node, kyou wa hayame ni kaerimasu.", "Vì trong người không được khỏe nên hôm nay tôi xin về sớm.", "N3-N2", "polite", "Đáp: どうぞお大事になさってください。"],
  ["JP361", "Giao tiếp Trung - Cao cấp (N3–N2)", "別の視点から考えてみてはいかがでしょうか。", "べつのしてんからかんがえてみてはいかがでしょうか。", "Betsu no shiten kara kangaete mite wa ikaga deshou ka.", "Hay là chúng ta thử suy nghĩ từ một góc nhìn khác xem sao?", "N3-N2", "polite", "Đáp: そうですね、いいアイデアかもしれません。"],
  ["JP362", "Giao tiếp Trung - Cao cấp (N3–N2)", "予算の範囲内でできる限り対応します。", "よさんのはんいないでできるかぎりたいおうします。", "Yosan no han'i nai de dekiru kagiri taiou shimasu.", "Chúng tôi sẽ hỗ trợ tối đa trong phạm vi ngân sách cho phép.", "N3-N2", "polite", "Đáp: ありがとうございます、助かります。"],
  ["JP363", "Giao tiếp Trung - Cao cấp (N3–N2)", "予約をキャンセルしたいのですが、手数料はかかりますか。", "よやくをキャンセルしたいのですが、てすうりょうはかかりますか。", "Yoyaku o kyanseru shitai no desu ga, tesuuryou wa kakarimasu ka.", "Tôi muốn hủy đặt chỗ, có mất phí hủy không ạ?", "N3", "polite", "Đáp: 前日までは無料でキャンセルできます。"],
  ["JP364", "Giao tiếp Trung - Cao cấp (N3–N2)", "荷物がまだ届いていないようなのですが、調べていただけますか。", "にもつがまだとどいていないようなのですが、しらべていただけますか。", "Nimotsu ga mada todoite inai you na no desu ga, shirabete itadakemasu ka.", "Kiện hàng hình như vẫn chưa tới, phiền kiểm tra giúp tôi được không?", "N3", "polite", "Đáp: 伝票番号を教えていただけますか。"],
  ["JP365", "Giao tiếp Trung - Cao cấp (N3–N2)", "エアコンの調子がおかしいので、見に来てもらえますか。", "エアコンのちょうしがおかしいので、みにきてもらえますか。", "Eakon no choushi ga okashii node, mi ni kite moraemasu ka.", "Điều hòa có vẻ trục trặc, nhờ người qua xem giúp tôi được không?", "N3", "polite", "Đáp: かしこまりました、すぐスタッフを向かわせます。"],
  ["JP366", "Giao tiếp Trung - Cao cấp (N3–N2)", "今の説明で分かりにくいところはありましたか。", "いまのせつめいでわかりにくいところはありましたか。", "Ima no setsumei de wakarinikui tokoro wa arimashita ka.", "Trong phần giải thích vừa rồi có chỗ nào khó hiểu không ạ?", "N3", "polite", "Đáp: とても分かりやすかったです。"],

  // 3. Business Japanese & Keigo (Formal Workplace N3-N2)
  ["JP367", "Công sở & Kính ngữ (N3–N2)", "お疲れ様です。お先に失礼します。", "おつかれさまです。おさきにしつれいします。", "Otsukaresama desu. Osaki ni shitsurei shimasu.", "Mọi người vất vả rồi. Tôi xin phép về trước ạ.", "N3-N2", "formal", "Thân mật: お疲れ！先に帰るね。"],
  ["JP368", "Công sở & Kính ngữ (N3–N2)", "お手数ですが、ご確認いただけますか。", "おてすうですが、ごかくにんいただけますか。", "Otesuu desu ga, go-kakunin itadakemasu ka.", "Xin làm phiền anh/chị kiểm tra giúp tôi được không ạ?", "N3-N2", "formal", "Đáp: 承知いたしました。すぐ確認します。"],
  ["JP369", "Công sở & Kính ngữ (N3–N2)", "おっしゃる通りです。", "おっしゃるとおりです。", "Ossharu toori desu.", "Đúng như anh/chị đã nói ạ.", "N3-N2", "formal", "Thân mật: 本当にその通りだね。"],
  ["JP370", "Công sở & Kính ngữ (N3–N2)", "申し訳ございませんが、もう一度お願いできますか。", "もうしわけございませんが、もういちどおねがいできますか。", "Moushiwake gozaimasen ga, mou ichido onegai dekimasu ka.", "Thành thật xin lỗi, anh/chị có thể nói/làm lại giúp tôi một lần nữa không ạ?", "N3-N2", "formal", "Thân mật: ごめん、もう一回言ってくれる？"],
  ["JP371", "Công sở & Kính ngữ (N3–N2)", "承知いたしました。かしこまりました。", "しょうちいたしました。かしこまりました。", "Shouchi itashimashita. Kashikomarimashita.", "Tôi đã rõ ạ / Tôi xin tuân lệnh (Kính ngữ của わかりました).", "N3-N2", "formal", "Dùng với sếp và khách hàng."],
  ["JP372", "Công sở & Kính ngữ (N3–N2)", "お忙しいところ恐れ入りますが、少々よろしいでしょうか。", "おいそがしいところおそれいりますが、しょうしょうよろしいでしょうか。", "Oisogashii tokoro osoreirimasu ga, shoushou yoroshii deshou ka.", "Xin lỗi làm phiền lúc anh/chị đang bận, cho em xin ít phút được không ạ?", "N3-N2", "formal", "Câu mở đầu chuẩn mực khi bắt chuyện với cấp trên."],
  ["JP373", "Công sở & Kính ngữ (N3–N2)", "いつもお世話になっております。", "いつもおせわになっております。", "Itsumo osewa ni natte orimasu.", "Cảm ơn anh/chị đã luôn hỗ trợ và hợp tác (Câu chào đầu cuộc gọi/email công việc).", "N3-N2", "formal", "Đáp: こちらこそお世話になっております。"],
  ["JP374", "Công sở & Kính ngữ (N3–N2)", "ただいま担当者が席を外しております。", "ただいまたんとうしゃがせきをはずしております。", "Tadaima tantousha ga seki o hazushite orimasu.", "Hiện tại người phụ trách đang tạm vắng mặt khỏi chỗ ngồi ạ.", "N3-N2", "formal", "Đáp: では、戻られたら折り返しお願いします。"],
  ["JP375", "Công sở & Kính ngữ (N3–N2)", "戻り次第、折り返しご連絡いたします。", "もどりしだい、おりかえしごれんらくいたします。", "Modori shidai, orikaeshi go-renraku itashimasu.", "Ngay khi người đó quay lại, bên tôi sẽ gọi lại cho anh/chị ngay ạ.", "N3-N2", "formal", "Đáp: よろしくお願いいたします。"],
  ["JP376", "Công sở & Kính ngữ (N3–N2)", "資料をメールにてお送りいたしましたので、ご査収ください。", "しりょうをメールにておおくりいたしましたので、ごさしゅうください。", "Shiryou o meeru nite ookuri itashimashita node, go-sashuu kudasai.", "Tôi đã gửi tài liệu qua email, xin anh/chị kiểm tra và nhận giúp ạ.", "N3-N2", "formal", "Đáp: ありがとうございます、確認いたします。"],
  ["JP377", "Công sở & Kính ngữ (N3–N2)", "ご不明な点がございましたら、お気軽にお問い合わせください。", "ごふめいなてんがございましたら、おきがるにおといあわせください。", "Gofumei na ten ga gozaimashitara, okigaru ni otoiawase kudasai.", "Nếu có điểm nào chưa rõ, xin cứ thoải mái liên hệ hỏi chúng tôi ạ.", "N3-N2", "formal", "Câu kết chuẩn trong giao tiếp khách hàng."],
  ["JP378", "Công sở & Kính ngữ (N3–N2)", "社内で検討の上、改めてお返事いたします。", "しゃないでけんとうのうえ、あらためておへんじいたします。", "Shanai de kentou no ue, aratamete ohenji itashimasu.", "Sau khi bàn bạc nội bộ trong công ty, chúng tôi sẽ phản hồi lại ạ.", "N3-N2", "formal", "Đáp: よろしくお願いいたします。"],
  ["JP379", "Công sở & Kính ngữ (N3–N2)", "ご迷惑をおかけして大変申し訳ございません。", "ごめいわくをおかけしてたいへんもうしわけございません。", "Gomeiwaku o okake shite taihen moushiwake gozaimasen.", "Thành thật xin lỗi vì đã gây phiền hà cho anh/chị.", "N3-N2", "formal", "Câu xin lỗi trang trọng trong công việc."],
  ["JP380", "Công sở & Kính ngữ (N3–N2)", "貴重なご意見をいただき、ありがとうございます。", "きちょうなごいけんをいただき、ありがとうございます。", "Kichou na go-iken o itadaki, arigatou gozaimasu.", "Xin cảm ơn anh/chị đã đóng góp ý kiến quý báu.", "N3-N2", "formal", "Đáp: 少しでもお役に立てれば幸いです。"],
  ["JP381", "Công sở & Kính ngữ (N3–N2)", "本日の会議のアジェンダを共有いたします。", "ほんじつのかいぎのアジェンダをきょうゆういたします。", "Honjitsu no kaigi no ajenda o kyouyuu itashimasu.", "Tôi xin chia sẻ chương trình nghị sự của buổi họp hôm nay.", "N3-N2", "formal", "Đáp: ありがとうございます。"],
  ["JP382", "Công sở & Kính ngữ (N3–N2)", "納期に間に合うよう、最善を尽くします。", "のうきにまにあうよう、さいぜんをつくします。", "Nouki ni maniau you, saizen o tsukushimasu.", "Chúng tôi sẽ cố gắng hết sức để kịp thời hạn bàn giao.", "N3-N2", "formal", "Đáp: 頼りにしています。"],
  ["JP383", "Công sở & Kính ngữ (N3–N2)", "スケジュールを調整していただけないでしょうか。", "スケジュールをちょうせいしていただけないでしょうか。", "Sukejuuru o chousei shite itadakenai deshou ka.", "Anh/chị có thể điều chỉnh lại lịch trình giúp được không ạ?", "N3-N2", "formal", "Đáp: 来週の水曜日なら空いています。"],
  ["JP384", "Công sở & Kính ngữ (N3–N2)", "差し支えなければ、理由を伺ってもよろしいですか。", "さしつかえなければ、りゆうをうかがってもよろしいですか。", "Sashitsukae nakereba, riyuu o ukagatte mo yoroshii desu ka.", "Nếu không có gì bất tiện, tôi xin phép hỏi lý do được không ạ?", "N3-N2", "formal", "Kính ngữ của 聞いてもいいですか."],
  ["JP385", "Công sở & Kính ngữ (N3–N2)", "おっしゃる意味がよく分かりました。", "おっしゃるいみがよくわかりました。", "Ossharu imi ga yoku wakarimashita.", "Tôi đã hiểu rất rõ ý của anh/chị rồi ạ.", "N3-N2", "formal", "Đáp: ご理解いただきありがとうございます。"],
  ["JP386", "Công sở & Kính ngữ (N3–N2)", "すぐに対応いたしますので、少々お待ちください。", "すぐにたいおういたしますので、しょうしょうおまちください。", "Sugu ni taiou itashimasu node, shoushou omachi kudasai.", "Tôi sẽ xử lý ngay lập tức, xin vui lòng đợi một lát ạ.", "N3-N2", "formal", "Đáp: よろしくお願いします。"],
  ["JP387", "Công sở & Kính ngữ (N3–N2)", "今回の件につきまして、ご報告いたします。", "こんかいのけんにつきまして、ごほうこくいたします。", "Konkai no ken ni tsukimashite, go-houkoku itashimasu.", "Về việc lần này, tôi xin phép được báo cáo ạ.", "N3-N2", "formal", "Mở đầu báo cáo công việc (Hou-Ren-Sou)."],
  ["JP388", "Công sở & Kính ngữ (N3–N2)", "ご足労いただき、誠にありがとうございます。", "ごそくろういただき、まことにありがとうございます。", "Gosokurou itadaki, makoto ni arigatou gozaimasu.", "Chân thành cảm ơn quý khách đã cất công tới tận nơi.", "N3-N2", "formal", "Đáp: いえ、こちらこそお時間をいただきありがとうございます。"],
  ["JP389", "Công sở & Kính ngữ (N3–N2)", "私の確認不足でミスをしてしまいました。", "わたしのかくにんぶそくでミスをしてしまいました。", "Watashi no kakunin busoku de misu o shite shimaimashita.", "Do thiếu sót trong khâu kiểm tra nên tôi đã để xảy ra lỗi.", "N3-N2", "formal", "Nhận trách nhiệm rõ ràng khi báo cáo lỗi."],
  ["JP390", "Công sở & Kính ngữ (N3–N2)", "二度とこのようなことがないよう気をつけます。", "にどとこのようなことがないようきをつけます。", "Nido to kono you na koto ga nai you ki o tsukemasu.", "Tôi sẽ chú ý để không bao giờ tái diễn việc như thế này nữa.", "N3-N2", "formal", "Đáp: 次から気をつけてくれれば大丈夫だよ。"],
  ["JP391", "Công sở & Kính ngữ (N3–N2)", "何かお困りのことがあれば、いつでもおっしゃってください。", "なにかおこまりのことがあれば、いつでもおっしゃってください。", "Nanika okomari no koto ga areba, itsudemo osshatte kudasai.", "Nếu có điều gì khó khăn, xin cứ nói với tôi bất cứ lúc nào ạ.", "N3-N2", "formal", "Đáp: 心強いです、ありがとうございます。"],
  ["JP392", "Công sở & Kính ngữ (N3–N2)", "それでは、本日の打ち合わせは以上となります。", "それでは、ほんじつのうちあわせはいじょうとなります。", "Soredewa, honjitsu no uchiawase wa ijou to narimasu.", "Vậy buổi trao đổi hôm nay xin kết thúc tại đây ạ.", "N3-N2", "formal", "Đáp: ありがとうございました、お疲れ様でした。"],
  ["JP393", "Công sở & Kính ngữ (N3–N2)", "お目にかかれて光栄です。", "おめにかかれてこうえいです。", "Ome ni kakarete kouei desu.", "Được gặp anh/chị là niềm vinh hạnh của tôi (Kính ngữ của 会えて嬉しい).", "N3-N2", "formal", "Đáp: こちらこそ光栄です。"],
  ["JP394", "Công sở & Kính ngữ (N3–N2)", "恐れ入りますが、お名前を頂戴できますでしょうか。", "おそれいりますが、おなまえをちょうだいできますでしょうか。", "Osoreirimasu ga, onamae o choudai dekimasu deshou ka.", "Xin thứ lỗi, anh/chị có thể cho tôi xin quý danh được không ạ?", "N3-N2", "formal", "Hỏi tên khách hàng qua điện thoại/quầy lễ tân."],
  ["JP395", "Công sở & Kính ngữ (N3–N2)", "微力ながら、精一杯サポートさせていただきます。", "びりょくながら、せいいっぱいサポートさせていただきます。", "Biryoku nagara, seiippai sapooto sasete itadakimasu.", "Dù sức mọn nhưng tôi xin phép được hỗ trợ hết mình ạ.", "N3-N2", "formal", "Đáp: 頼もしいですね、よろしくお願いします。"],
  ["JP396", "Công sở & Kính ngữ (N3–N2)", "ご検討のほど、よろしくお願いいたします。", "ごけんとうのほど、よろしくおねがいいたします。", "Go-kentou no hodo, yoroshiku onegai itashimasu.", "Kính mong anh/chị xem xét giúp ạ.", "N3-N2", "formal", "Câu chốt kinh điển khi gửi đề xuất/báo giá."],
  ["JP397", "Công sở & Kính ngữ (N3–N2)", "お返事が遅くなり、大変失礼いたしました。", "おへんじがおそくなり、たいへんしつれいいたしました。", "Ohenji ga osoku nari, taihen shitsurei itashimashita.", "Thành thật xin lỗi vì đã phản hồi trễ ạ.", "N3-N2", "formal", "Đáp: いえ、お忙しいところありがとうございます。"],
  ["JP398", "Công sở & Kính ngữ (N3–N2)", "引き続きよろしくお願いいたします。", "ひきつづきよろしくおねがいいたします。", "Hikitsuzuki yoroshiku onegai itashimasu.", "Mong tiếp tục nhận được sự hợp tác của anh/chị trong thời gian tới.", "N3-N2", "formal", "Đáp: こちらこそ引き続きよろしくお願いします。"],
  ["JP399", "Công sở & Kính ngữ (N3–N2)", "体調管理には十分お気をつけください。", "たいちょうかんりにはじゅうぶんおきをつけください。", "Taichou kanri ni wa juubun oki o tsuke kudasai.", "Xin anh/chị hãy giữ gìn sức khỏe thật tốt nhé.", "N3-N2", "formal", "Câu chào hỏi thăm cuối cuộc trò chuyện/email."],
  ["JP400", "Công sở & Kính ngữ (N3–N2)", "この件は私の方で引き継ぎますのでご安心ください。", "このけんはわたしのほうでひきつぎますのでごあんしんください。", "Kono ken wa watashi no hou de hikitsugimasu node go-anshin kudasai.", "Việc này bên tôi sẽ tiếp nhận bàn giao nên anh/chị cứ yên tâm ạ.", "N3-N2", "formal", "Đáp: ありがとうございます、お任せします。"],
  ["JP401", "Công sở & Kính ngữ (N3–N2)", "本日はお時間をいただき、誠にありがとうございました。", "ほんじつはおじかんをいただき、まことにありがとうございました。", "Honjitsu wa ojikan o itadaki, makoto ni arigatou gozaimashita.", "Hôm nay chân thành cảm ơn anh/chị đã dành thời gian quý báu.", "N3-N2", "formal", "Đáp: こちらこそ有意義な時間をありがとうございました。"],
];

export const JA_EXTRA_CHUNKS = RAW_EXTRA_JA.map(([id, category, japanese, kana, romaji, meaning_vi, level, register, noteText]) => ({
  id,
  category,
  japanese,
  kana,
  romaji,
  meaning_vi,
  level,
  register,
  extra_note: noteText,
}));

export const JA_ENRICH_MAP = {
  JP001: "Thân mật: おはよう！ • Đáp: おはようございます！",
  JP002: "Thân mật: やあ / こんにちは！ • Đáp: こんにちは、いい天気ですね。",
  JP004: "Thân mật: ありがとう！ • Đáp: いいえ、どういたしまして。",
  JP005: "Thân mật: ごめん！ • Đáp: いえいえ、大丈夫ですよ。",
  JP006: "Thân mật: 元気？ • Đáp: はい、おかげさまで元気です。",
};

export const JA_PATTERN_BUILDERS = [
  {
    id: "ja_pat_1",
    level: "Mẫu 1 • N5",
    title: "Xin phép lịch sự: 〜てもいいですか (Tôi làm ... có được không?)",
    pattern: "V-て + もいいですか (V-te mo ii desu ka)",
    note: "Với bạn bè chỉ cần bỏ 'ですか' → 〜てもいい？",
    slots: [
      { japanese: "ここに座ってもいいですか。", kana: "ここにすわってもいいですか。", romaji: "Koko ni suwatte mo ii desu ka.", vi: "Tôi ngồi ở đây có được không?" },
      { japanese: "写真を撮ってもいいですか。", kana: "しゃしんをとってもいいですか。", romaji: "Shashin o totte mo ii desu ka.", vi: "Tôi chụp ảnh được không?" },
      { japanese: "ちょっと窓を開けてもいい？", kana: "ちょっとまどをあけてもいい？", romaji: "Chotto mado o akete mo ii? (Casual)", vi: "Mở cửa sổ chút được không? (Bạn bè)" },
    ],
  },
  {
    id: "ja_pat_2",
    level: "Mẫu 2 • N5–N4",
    title: "Nhờ vả lịch sự: 〜ていただけますか / 〜てくれる？",
    pattern: "V-て + いただけますか (V-te itadakemasu ka)",
    note: "Dùng 〜ていただけますか với người lạ/công việc; dùng 〜てくれる？ với bạn thân.",
    slots: [
      { japanese: "もう少しゆっくり話していただけますか。", kana: "もうすこしゆっくりはなしていただけますか。", romaji: "Mou sukoshi yukkuri hanashite itadakemasu ka.", vi: "Anh/chị nói chậm lại một chút giúp tôi được không?" },
      { japanese: "駅までの道を教えていただけますか。", kana: "えきまでのみちをおしえていただけますか。", romaji: "Eki made no michi o oshiete itadakemasu ka.", vi: "Chỉ giúp tôi đường ra ga được không?" },
      { japanese: "これ、ちょっと手伝ってくれる？", kana: "これ、ちょっとてつだってくれる？", romaji: "Kore, chotto tetsudatte kureru? (Casual)", vi: "Giúp mình cái này một tí nhé? (Bạn bè)" },
    ],
  },
  {
    id: "ja_pat_3",
    level: "Mẫu 3 • N4",
    title: "Lời khuyên nhẹ nhàng: 〜たほうがいいですよ (Nên làm ...)",
    pattern: "V-た / V-ない + ほうがいいですよ",
    note: "Khuyên làm gì dùng V-た; khuyên đừng làm gì dùng V-ない.",
    slots: [
      { japanese: "早めに予約したほうがいいですよ。", kana: "はやめによやくしたほうがいいですよ。", romaji: "Hayame ni yoyaku shita hou ga ii desu yo.", vi: "Bạn nên đặt chỗ sớm đi nhé." },
      { japanese: "無理をしないほうがいいですよ。", kana: "むりをしないほうがいいですよ。", romaji: "Muri o shinai hou ga ii desu yo.", vi: "Bạn đừng nên cố quá sức nhé." },
    ],
  },
  {
    id: "ja_pat_4",
    level: "Mẫu 4 • N4",
    title: "Bắt buộc phải làm: 〜ないといけません / 〜なきゃ",
    pattern: "V-ない + といけません (Khẩu ngữ: 〜なきゃ)",
    note: "Trong đời sống hàng ngày, người Nhật nói rút gọn thành 〜なきゃ hoặc 〜ないと.",
    slots: [
      { japanese: "もう遅いから、そろそろ帰らないといけません。", kana: "もうおそいから、そろそろかえらないといけません。", romaji: "Mou osoi kara, sorosoro kaeranai to ikemasen.", vi: "Muộn rồi nên tôi phải về bây giờ thôi." },
      { japanese: "明日テストだから、勉強しなきゃ！", kana: "あしたテストだから、べんきょうしなきゃ！", romaji: "Ashita tesuto dakara, benkyou shinakya! (Casual)", vi: "Mai thi rồi, phải học bài thôi!" },
    ],
  },
  {
    id: "ja_pat_5",
    level: "Mẫu 5 • N4–N3",
    title: "Thói quen chủ động duy trì: 〜ようにしています (Cố gắng duy trì...)",
    pattern: "V-る / V-ない + ようにしています",
    note: "Rất hay dùng khi kể về thói quen tốt cho sức khỏe hoặc việc học.",
    slots: [
      { japanese: "毎日三十分、日本語を話すようにしています。", kana: "まいにちさんじゅっぷん、にほんごをはなすようにしています。", romaji: "Mainichi sanjuppun, Nihongo o hanasu you ni shite imasu.", vi: "Tôi luôn cố gắng duy trì nói tiếng Nhật 30 phút mỗi ngày." },
      { japanese: "夜は甘いものを食べないようにしています。", kana: "よるはあまいものをたべないようにしています。", romaji: "Yoru wa amai mono o tabenai you ni shite imasu.", vi: "Buổi tối tôi cố gắng không ăn đồ ngọt." },
    ],
  },
  {
    id: "ja_pat_6",
    level: "Mẫu 6 • N3",
    title: "Nhờ có ... (Tích cực) vs Tại vì ... (Tiêu cực): 〜のおかげで / 〜せいで",
    pattern: "N + のおかげで (Nhờ có) | N + のせいで (Tại vì)",
    note: "Phân biệt rõ sắc thái biết ơn (おかげで) và phàn nàn/đổ lỗi (せいで).",
    slots: [
      { japanese: "先生のおかげで、試験に合格できました。", kana: "せんせいのおかげで、しけんにごうかくできました。", romaji: "Sensei no okage de, shiken ni goukaku dekimashita.", vi: "Nhờ có thầy/cô mà em đã đỗ kỳ thi." },
      { japanese: "電車の遅れのせいで、会議に遅刻してしまいました。", kana: "でんしゃのおくれのせいで、かいぎにちこくしてしまいました。", romaji: "Densha no okure no sei de, kaigi ni chikoku shite shimaimashita.", vi: "Tại tàu trễ mà tôi bị muộn cuộc họp." },
    ],
  },
  {
    id: "ja_pat_7",
    level: "Mẫu 7 • N3",
    title: "Càng ... càng ...: 〜ば〜ほど",
    pattern: "V-ば + V-るほど (Càng ... càng ...)",
    note: "Dùng diễn tả mức độ tăng dần giống The more..., the more...",
    slots: [
      { japanese: "日本語は勉強すればするほど面白くなります。", kana: "にほんごはべんきょうすればするほどおもしろくなります。", romaji: "Nihongo wa benkyou sureba suru hodo omoshiroku narimasu.", vi: "Tiếng Nhật càng học càng thấy thú vị." },
      { japanese: "練習すればするほど、自信がつきます。", kana: "れんしゅうすればするほど、じしんがつきます。", romaji: "Renshuu sureba suru hodo, jishin ga tsukimasu.", vi: "Càng luyện tập nhiều thì càng tự tin hơn." },
    ],
  },
  {
    id: "ja_pat_8",
    level: "Mẫu 8 • N3",
    title: "Tuy nói là ... nhưng thực ra: 〜といっても",
    pattern: "〜といっても (Tuy nói là ... nhưng)",
    note: "Dùng khi muốn đính chính mức độ thực tế nhỏ hơn người nghe tưởng.",
    slots: [
      { japanese: "料理ができるといっても、簡単なものだけです。", kana: "りょうりができるといっても、かんたんなものだけです。", romaji: "Ryouri ga dekiru to ittemo, kantan na mono dake desu.", vi: "Tuy nói là biết nấu ăn nhưng chỉ làm được mấy món đơn giản thôi." },
      { japanese: "休みといっても、家事で一日中忙しいです。", kana: "やすみといっても、かじでいちにちじゅういそがしいです。", romaji: "Yasumi to ittemo, kaji de ichinichijuu isogashii desu.", vi: "Tuy gọi là ngày nghỉ nhưng bận việc nhà suốt cả ngày." },
    ],
  },
  {
    id: "ja_pat_9",
    level: "Mẫu 9 • N3–N2",
    title: "Không hẳn là ... đâu: 〜というわけではありません",
    pattern: "〜というわけではありません",
    note: "Mẫu câu từ chối hoặc đính chính khéo léo, tránh làm mất lòng người nghe.",
    slots: [
      { japanese: "行きたくないというわけではありません。", kana: "いきたくないというわけではありません。", romaji: "Ikitakunai to iu wake dewa arimasen.", vi: "Không phải là tôi không muốn đi đâu." },
      { japanese: "高いものがすべて良いというわけではありません。", kana: "たかいものがすべてよいというわけではありません。", romaji: "Takai mono ga subete yoi to iu wake dewa arimasen.", vi: "Không hẳn cứ đồ đắt tiền là cái nào cũng tốt đâu." },
    ],
  },
  {
    id: "ja_pat_10",
    level: "Mẫu 10 • N3–N2",
    title: "Đưa ý kiến mềm mỏng: 〜のではないでしょうか (Chẳng phải là ... sao?)",
    pattern: "〜のではないでしょうか (Casual: 〜んじゃない？)",
    note: "Tránh áp đặt ý kiến cá nhân, giúp câu nói lịch sự và thuyết phục hơn.",
    slots: [
      { japanese: "この方法が一番効率的ではないでしょうか。", kana: "このほうほうが一番こうりつてきではないでしょうか。", romaji: "Kono houhou ga ichiban kouritsuteki dewa nai deshou ka.", vi: "Chẳng phải phương pháp này là hiệu quả nhất sao?" },
      { japanese: "もう少し様子を見たほうがいいんじゃないかな。", kana: "もうすこしようすをみたほうがいいんじゃないかな。", romaji: "Mou sukoshi yousu o mita hou ga ii n ja nai kana.", vi: "Chắc là nên quan sát tình hình thêm một chút thì hơn nhỉ." },
    ],
  },
  {
    id: "ja_pat_11",
    level: "Mẫu 11 • N2",
    title: "Không còn cách nào khác đành phải: 〜ざるを得ない",
    pattern: "V-ない (bỏ ない) + ざるを得ない",
    note: "Dùng trong công việc/đời sống khi buộc phải đưa ra lựa chọn dù không muốn.",
    slots: [
      { japanese: "台風のため、イベントは中止せざるを得ません。", kana: "たいふうのため、イベントはちゅうしせざるをえません。", romaji: "Taifuu no tame, ibento wa chuushi sezaru o emasen.", vi: "Vì bão nên sự kiện đành buộc phải hủy bỏ." },
      { japanese: "予算が足りないので、計画を変更せざるを得ない。", kana: "よさんがたりないので、けいかくをへんこうせざるをえない。", romaji: "Yosan ga tarinai node, keikaku o henkou sezaru o enai.", vi: "Do thiếu ngân sách nên đành phải thay đổi kế hoạch." },
    ],
  },
  {
    id: "ja_pat_12",
    level: "Mẫu 12 • N2 Công sở",
    title: "Xin phép làm gì (Khiêm nhường ngữ trang trọng): 〜させていただきます",
    pattern: "V-さ(せ)ていただきます",
    note: "Mẫu câu lịch sự bậc cao dùng hàng ngày trong công ty Nhật.",
    slots: [
      { japanese: "私の方からご説明させていただきます。", kana: "わたしのほうからごせつめいさせていただきます。", romaji: "Watashi no hou kara go-setsumei sasete itadakimasu.", vi: "Tôi xin phép được giải thích từ phía mình ạ." },
      { japanese: "本日は定時で退社させていただきます。", kana: "ほんじつはていじでたいしゃさせていただきます。", romaji: "Honjitsu wa teiji de taisha sasete itadakimasu.", vi: "Hôm nay tôi xin phép được tan làm đúng giờ ạ." },
    ],
  },
];

export const JA_ROLEPLAYS = [
  {
    id: "ja_rp_1",
    level: "Bài 1 • N5 • Polite",
    title: "Làm quen & Giới thiệu bản thân",
    situation: "Gặp đồng nghiệp hoặc bạn mới người Nhật lần đầu.",
    lines: [
      { role: "A", japanese: "はじめまして。ミンと申します。ベトナムから来ました。", kana: "はじめまして。ミンともうします。ベトナムからきました。", romaji: "Hajimemashite. Min to moushimasu. Betonamu kara kimashita.", vi: "Rất hân hạnh. Tôi tên Minh, đến từ Việt Nam." },
      { role: "B", japanese: "はじめまして、佐藤です。日本に来てどれくらいですか。", kana: "はじめまして、さとうです。にほんにきてどれくらいですか。", romaji: "Hajimemashite, Satou desu. Nihon ni kite dore kurai desu ka.", vi: "Chào bạn, mình là Sato. Bạn sang Nhật bao lâu rồi?" },
      { role: "A", japanese: "まだ三ヶ月です。これからどうぞよろしくお願いします。", kana: "まださんかげつです。これからどうぞよろしくおねがいします。", romaji: "Mada sankagetsu desu. Korekara douzo yoroshiku onegai shimasu.", vi: "Mới được 3 tháng thôi. Từ nay rất mong được bạn giúp đỡ." },
      { role: "B", japanese: "こちらこそよろしくお願いします！分からないことがあれば何でも聞いてくださいね。", kana: "こちらこそよろしくおねがいします！わからないことがあればなんでもきいてくださいね。", romaji: "Kochirakoso yoroshiku onegai shimasu! Wakaranai koto ga areba nandemo kiite kudasai ne.", vi: "Mình cũng vậy nhé! Có gì không hiểu cứ hỏi mình bất cứ lúc nào." },
    ],
  },
  {
    id: "ja_rp_2",
    level: "Bài 2 • N5 • Polite",
    title: "Mua đồ ở Cửa hàng tiện lợi (Konbini)",
    situation: "Nhờ hâm nóng cơm hộp và thanh toán bằng thẻ IC/PayPay.",
    lines: [
      { role: "A", japanese: "いらっしゃいませ。お弁当は温めますか。", kana: "いらっしゃいませ。おべんとうはあたためますか。", romaji: "Irasshaimase. Obentou wa atatamemasu ka.", vi: "Xin chào quý khách. Cơm hộp có cần hâm nóng không ạ?" },
      { role: "B", japanese: "はい、お願いします。お箸も一膳つけてください。", kana: "はい、おねがいします。おはしもいちぜんつけてください。", romaji: "Hai, onegai shimasu. Ohashi mo ichizen tsukete kudasai.", vi: "Vâng, làm ơn hâm giúp tôi. Cho tôi xin một đôi đũa nữa nhé." },
      { role: "A", japanese: "かしこまりました。レジ袋はご利用ですか。", kana: "かしこまりました。レジぶくろはごりようですか。", romaji: "Kashikomarimashita. Rejibukuro wa goriyou desu ka.", vi: "Vâng ạ. Quý khách có lấy túi nilon không ạ?" },
      { role: "B", japanese: "袋は大丈夫です。支払いはSuicaでお願いします。", kana: "ふくろはだいじょうぶです。しはらいはスイカでおねがいします。", romaji: "Fukuro wa daijoubu desu. Shiharai wa Suica de onegai shimasu.", vi: "Không cần túi đâu ạ. Cho tôi thanh toán bằng thẻ Suica nhé." },
    ],
  },
  {
    id: "ja_rp_3",
    level: "Bài 3 • N5–N4 • Polite",
    title: "Vào quán ăn & Gọi món",
    situation: "Hỏi bàn trống, gọi món và xin thanh toán.",
    lines: [
      { role: "A", japanese: "いらっしゃいませ。何名様ですか。", kana: "いらっしゃいませ。なんめいさまですか。", romaji: "Irasshaimase. Nanmei-sama desu ka.", vi: "Xin chào quý khách. Quý khách đi mấy người ạ?" },
      { role: "B", japanese: "二人です。禁煙席をお願いします。", kana: "ふたりです。きんえんせきをおねがいします。", romaji: "Futari desu. Kin'enseki o onegai shimasu.", vi: "Hai người ạ. Cho tôi bàn không hút thuốc nhé." },
      { role: "A", japanese: "こちらへどうぞ。ご注文はお決まりですか。", kana: "こちらへどうぞ。ごちゅうもんはおきまりですか。", romaji: "Kochira e douzo. Gochuumon wa okimari desu ka.", vi: "Mời đi lối này. Quý khách đã chọn được món chưa ạ?" },
      { role: "B", japanese: "天ぷら定食を二つお願いします。あとお水もください。", kana: "てんぷらていしょくをふたつおねがいします。あとおみずもください。", romaji: "Tenpura teishoku o futatsu onegai shimasu. Ato omizu mo kudasai.", vi: "Cho tôi 2 suất Tempura. Và cho xin thêm nước lọc nữa ạ." },
    ],
  },
  {
    id: "ja_rp_4",
    level: "Bài 4 • N4 • Polite",
    title: "Hỏi đường & Tuyến tàu ở Nhà ga",
    situation: "Hỏi nhân viên nhà ga tàu nào đi tới Shinjuku nhanh nhất.",
    lines: [
      { role: "A", japanese: "すみません、新宿へ行きたいのですが、何番線ですか。", kana: "すみません、しんじゅくへいきたいのですが、なんばんせんですか。", romaji: "Sumimasen, Shinjuku e ikitai no desu ga, nanbansen desu ka.", vi: "Xin lỗi, tôi muốn đi Shinjuku thì lên sân ga số mấy ạ?" },
      { role: "B", japanese: "三番線ですよ。次に来る快速に乗ると早いです。", kana: "さんばんせんですよ。つぎにくるかいそくにのるとはやいです。", romaji: "Sanbansen desu yo. Tsugi ni kuru kaisoku ni noru to hayai desu.", vi: "Sân ga số 3 nhé. Đi chuyến tàu nhanh (Kaisoku) sắp tới sẽ nhanh đấy." },
      { role: "A", japanese: "乗り換えは必要ですか。", kana: "のりかえはひつようですか。", romaji: "Norikae wa hitsuyou desu ka.", vi: "Có cần phải đổi tàu không ạ?" },
      { role: "B", japanese: "いいえ、乗り換えなしで十五分ほどで着きますよ。", kana: "いいえ、のりかえなしでじゅうごふんほどでつきますよ。", romaji: "Iie, norikae nashi de juugofun hodo de tsukimasu yo.", vi: "Không, đi thẳng không cần đổi tàu khoảng 15 phút là tới nơi." },
    ],
  },
  {
    id: "ja_rp_5",
    level: "Bài 5 • N4 • Polite",
    title: "Mua sắm quần áo & Xin thử đồ",
    situation: "Hỏi phòng thử đồ và xin lấy size khác.",
    lines: [
      { role: "A", japanese: "すみません、このシャツを試着してもいいですか。", kana: "すみません、このシャツをしちゃくしてもいいですか。", romaji: "Sumimasen, kono shatsu o shichaku shite mo ii desu ka.", vi: "Xin lỗi, tôi mặc thử chiếc áo sơ mi này được không?" },
      { role: "B", japanese: "はい、どうぞ！試着室はあちらの奥にございます。", kana: "はい、どうぞ！しちゃくしつはあちらのおくにございます。", romaji: "Hai, douzo! Shichakushitsu wa achira no oku ni gozaimasu.", vi: "Vâng, xin mời! Phòng thử đồ ở phía bên trong đằng kia ạ." },
      { role: "A", japanese: "ちょっと小さいので、もう一つ大きいサイズはありますか。", kana: "ちょっとちいさいので、もうひとつおおきいサイズはありますか。", romaji: "Chotto chiisai node, mou hitotsu ookii saizu wa arimasu ka.", vi: "Hơi chật một chút, có cỡ lớn hơn một size không ạ?" },
      { role: "B", japanese: "Lサイズがございます。今お持ちしますね。", kana: "エルサイズがございます。いまおもちしますね。", romaji: "Eru-saizu ga gozaimasu. Ima omochi shimasu ne.", vi: "Có size L đấy ạ. Để tôi lấy ngay cho quý khách nhé." },
    ],
  },
  {
    id: "ja_rp_6",
    level: "Bài 6 • N4–N3 • Casual (Bạn bè)",
    title: "Rủ bạn thân đi chơi cuối tuần",
    situation: "Dùng thể ngắn thân mật (Casual) hẹn bạn đi quán cà phê mới.",
    lines: [
      { role: "A", japanese: "ねえ、今週の日曜日って暇？", kana: "ねえ、こんしゅうのにちようびってひま？", romaji: "Nee, konshuu no nichiyoubi tte hima?", vi: "Này, Chủ nhật tuần này cậu rảnh không?" },
      { role: "B", japanese: "午後なら空いてるよ。何かあるの？", kana: "ごごならあいてるよ。なにかあるの？", romaji: "Gogo nara aiteru yo. Nanika aru no?", vi: "Buổi chiều thì mình rảnh. Có vụ gì thế?" },
      { role: "A", japanese: "駅前に新しいカフェできたらしいよ。一緒に行かない？", kana: "えきまえにあたらしいカフェできたらしいよ。いっしょにいかない？", romaji: "Ekimae ni atarashii kafe dekita rashii yo. Issho ni ikanai?", vi: "Nghe bảo trước ga mới mở quán cà phê mới đấy. Đi chung không?" },
      { role: "B", japanese: "めっちゃいいね！二時ごろ改札の前で待ち合わせしよう。", kana: "めっちゃいいね！にじごろかいさつのまえでまちあわせしよう。", romaji: "Meccha ii ne! Niji goro kaisatsu no mae de machiawase shiyou.", vi: "Hay quá! Tầm 2 giờ hẹn gặp trước cửa soát vé nhé." },
    ],
  },
  {
    id: "ja_rp_7",
    level: "Bài 7 • N4–N3 • Casual (Bạn bè)",
    title: "Hỏi thăm bạn bị ốm & Nhắn nghỉ ngơi",
    situation: "Hỏi thăm bạn học/đồng nghiệp thân thiết khi thấy bạn mệt.",
    lines: [
      { role: "A", japanese: "顔色あんまり良くないけど、大丈夫？", kana: "かおいろあんまりよくないけど、だいじょうぶ？", romaji: "Kaoiro anmari yokunai kedo, daijoubu?", vi: "Sắc mặt cậu trông không tốt lắm, có sao không?" },
      { role: "B", japanese: "昨日からちょっと喉が痛くて、風邪ひいたかも。", kana: "きのうからちょっとのどがいたくて、かぜひいたかも。", romaji: "Kinou kara chotto nodo ga itakute, kaze hiita kamo.", vi: "Từ hôm qua hơi đau họng, có khi bị cảm rồi." },
      { role: "A", japanese: "無理しないで、今日は早く帰って休んだほうがいいよ。", kana: "むりしないで、きょうははやくかえってやすんだほうがいいよ。", romaji: "Muri shinaide, kyou wa hayaku kaette yasunda hou ga ii yo.", vi: "Đừng cố quá, hôm nay cậu nên về sớm nghỉ ngơi đi." },
      { role: "B", japanese: "うん、ありがとう。温かいもの食べてすぐ寝るよ。", kana: "うん、ありがとう。あたたかいものたべてすぐねるよ。", romaji: "Un, arigatou. Atatakai mono tabete sugu neru yo.", vi: "Ừ, cảm ơn cậu. Mình ăn chút đồ ấm rồi đi ngủ ngay đây." },
    ],
  },
  {
    id: "ja_rp_8",
    level: "Bài 8 • N3 • Polite",
    title: "Đi khám bác sĩ & Kể triệu chứng",
    situation: "Khám bệnh tại phòng khám ở Nhật.",
    lines: [
      { role: "A", japanese: "今日はどうされましたか。いつから症状がありますか。", kana: "きょうはどうされましたか。いつからしょうじょうがありますか。", romaji: "Kyou wa dou saremashita ka. Itsu kara shoujou ga arimasu ka.", vi: "Hôm nay bạn bị sao? Triệu chứng bắt đầu từ khi nào?" },
      { role: "B", japanese: "昨日の夜から熱があって、頭もガンガン痛みます。", kana: "きのうのよるからねつがあって、あたまもガンガンいたみます。", romaji: "Kinou no yoru kara netsu ga atte, atama mo gangan itamimasu.", vi: "Từ tối qua tôi bị sốt, đầu cũng đau như búa bổ." },
      { role: "A", japanese: "喉が赤く腫れていますね。薬を三日分出しておきます。", kana: "のどがあかくはれていますね。くすりをみっかぶんだしておきます。", romaji: "Nodo ga akaku harete imasu ne. Kusuri o mikkabun dashite okimasu.", vi: "Cổ họng sưng đỏ rồi. Tôi kê thuốc uống trong 3 ngày nhé." },
      { role: "B", japanese: "ありがとうございます。食後に飲めばいいですか。", kana: "ありがとうございます。しょくごにのめばいいですか。", romaji: "Arigatou gozaimasu. Shokugo ni nomeba ii desu ka.", vi: "Cảm ơn bác sĩ. Cứ uống sau bữa ăn là được phải không ạ?" },
    ],
  },
  {
    id: "ja_rp_9",
    level: "Bài 9 • N3 • Polite",
    title: "Đặt phòng khách sạn & Đổi lịch",
    situation: "Gọi điện cho khách sạn xin đổi ngày nhận phòng.",
    lines: [
      { role: "A", japanese: "お電話ありがとうございます、さくらホテルでございます。", kana: "おでんわありがとうございます、さくらホテルでございます。", romaji: "Odenwa arigatou gozaimasu, Sakura Hoteru de gozaimasu.", vi: "Cảm ơn đã gọi điện, đây là khách sạn Sakura ạ." },
      { role: "B", japanese: "来週の金曜日に予約しているグエンですが、日程を変更したいです。", kana: "らいしゅうのきんようびによやくしているグエンですが、にっていをへんこうしたいです。", romaji: "Raishuu no kin'youbi ni yoyaku shite iru Guen desu ga, nittei o henkou shitai desu.", vi: "Tôi là Nguyễn đã đặt phòng thứ Sáu tuần sau, tôi muốn đổi ngày ạ." },
      { role: "A", japanese: "かしこまりました。ご希望のお日にちはいつでしょうか。", kana: "かしこまりました。ごきぼうのおひにちはいつでしょうか。", romaji: "Kashikomarimashita. Gokibou no ohinichi wa itsu deshou ka.", vi: "Vâng ạ. Quý khách muốn đổi sang ngày nào ạ?" },
      { role: "B", japanese: "土曜日から一泊に変更できますか。", kana: "どようびからいっぱくにへんこうできますか。", romaji: "Doyoubi kara ippaku ni henkou dekimasu ka.", vi: "Có thể đổi sang ở 1 đêm từ thứ Bảy được không ạ?" },
    ],
  },
  {
    id: "ja_rp_10",
    level: "Bài 10 • N3 • Polite",
    title: "Báo mất đồ ở Nhà ga (Wasuremono)",
    situation: "Trình báo để quên túi xách trên tàu.",
    lines: [
      { role: "A", japanese: "すみません、さっきの電車の中にカバンを忘れてしまいました。", kana: "すみません、さっきのでんしゃのなかにカバンをわすれてしまいました。", romaji: "Sumimasen, sakki no densha no naka ni kaban o wasurete shimaimashita.", vi: "Xin lỗi, tôi lỡ để quên túi xách trên chuyến tàu vừa nãy mất rồi." },
      { role: "B", japanese: "どんなカバンですか。中に何が入っていますか。", kana: "どんなカバンですか。なかにになにがはいっていますか。", romaji: "Donna kaban desu ka. Naka ni nani ga haitte imasu ka.", vi: "Túi xách trông thế nào? Bên trong có đựng những gì?" },
      { role: "A", japanese: "黒いリュックで、中にノートパソコンと財布が入っています。", kana: "くろいリュックで、なかにノートパソコンとさいふがはいっています。", romaji: "Kuroi ryukku de, naka ni nooto pasokon to saifu ga haitte imasu.", vi: "Balo màu đen ạ, bên trong có laptop và ví tiền." },
      { role: "B", japanese: "終点の駅に連絡して確認しますので、連絡先を書いてください。", kana: "しゅうてんのえきにれんらくしてかくにんしますので、れんらくさきをかいてください。", romaji: "Shuuten no eki ni renraku shite kakunin shimasu node, renrakusaki o kaite kudasai.", vi: "Tôi sẽ liên lạc ga cuối để kiểm tra, xin hãy ghi thông tin liên hệ vào đây." },
    ],
  },
  {
    id: "ja_rp_11",
    level: "Bài 11 • N3–N2 • Formal (Công sở)",
    title: "Nhờ sếp/đồng nghiệp kiểm tra tài liệu",
    situation: "Sử dụng kính ngữ lịch sự khi nhờ review bản kế hoạch.",
    lines: [
      { role: "A", japanese: "今お時間よろしいでしょうか。企画書を作成しました。", kana: "いまおじかんよろしいでしょうか。きかくしょをさくせいしました。", romaji: "Ima ojikan yoroshii deshou ka. Kikakusho o sakusei shimashita.", vi: "Bây giờ anh/chị có chút thời gian không ạ? Em đã soạn xong bản kế hoạch." },
      { role: "B", japanese: "ありがとう。何か特に見てほしい点はありますか。", kana: "ありがとう。なにかとくにみてほしいてんはありますか。", romaji: "Arigatou. Nanika tokuni mite hoshii ten wa arimasu ka.", vi: "Cảm ơn em. Có điểm nào đặc biệt muốn anh xem kỹ không?" },
      { role: "A", japanese: "お手数ですが、スケジュールに無理がないかご確認いただけますか。", kana: "おてすうですが、スケジュールにむりがないかごかくにんいただけますか。", romaji: "Otesuu desu ga, sukejuuru ni muri ga nai ka go-kakunin itadakemasu ka.", vi: "Xin làm phiền anh kiểm tra giúp xem lịch trình có bị quá gấp không ạ." },
      { role: "B", japanese: "分かりました。今日中に確認して返事しますね。", kana: "わかりました。きょうじゅうにかくにんしてへんじしますね。", romaji: "Wakarimashita. Kyoujuu ni kakunin shite henji shimasu ne.", vi: "Anh hiểu rồi. Trong hôm nay anh xem xong rồi phản hồi nhé." },
    ],
  },
  {
    id: "ja_rp_12",
    level: "Bài 12 • N3–N2 • Formal (Công sở)",
    title: "Gọi điện báo đi làm muộn do tàu trễ",
    situation: "Gọi báo cáo cấp trên khi tàu điện bị dừng đột xuất.",
    lines: [
      { role: "A", japanese: "お疲れ様です、ミンです。電車が人身事故で止まってしまいました。", kana: "おつかれさまです、ミンです。でんしゃがじんしんじこでとまってしまいました。", romaji: "Otsukaresama desu, Min desu. Densha ga jinshin jiko de tomatte shimaimashita.", vi: "Em chào anh/chị, em là Minh. Tàu điện vừa bị dừng do sự cố tai nạn." },
      { role: "B", japanese: "大変だね。会社には何時ごろ着きそう？", kana: "たいへんだね。かいしゃにはなんじごろつきそう？", romaji: "Taihen da ne. Kaisha ni wa nanji goro tsukisou?", vi: "Vất vả quá. Khoảng mấy giờ thì em tới công ty được?" },
      { role: "A", japanese: "別の路線に振り替えて向かいますが、二十分ほど遅れそうです。", kana: "べつのろせんにふりかえてむかいますが、にじゅっぷんほどおくれそうです。", romaji: "Betsu no rosen ni furikaete mukaimasu ga, nijuppun hodo okuresou desu.", vi: "Em đang đổi sang tuyến khác để đi, nhưng có lẽ sẽ trễ khoảng 20 phút ạ." },
      { role: "B", japanese: "分かった。朝の会議は先に始めておくから、気をつけて来てね。", kana: "わかった。あさのかいぎはさきにはじめておくから、きをつけてきてね。", romaji: "Wakatta. Asa no kaigi wa saki ni hajimete oku kara, ki o tsukete kite ne.", vi: "Anh hiểu rồi. Cuộc họp sáng anh cứ bắt đầu trước, em đi cẩn thận nhé." },
    ],
  },
  {
    id: "ja_rp_13",
    level: "Bài 13 • N2 • Formal (Công sở)",
    title: "Báo cáo lỗi & Đề xuất hướng khắc phục (Hō-Ren-Sō)",
    situation: "Báo cáo nhanh sự cố hệ thống và phương án xử lý cho quản lý.",
    lines: [
      { role: "A", japanese: "課長、緊急でご報告したい件がございます。", kana: "かちょう、きんきゅうでごほうこくしたいけんがございます。", romaji: "Kachou, kinkyuu de go-houkoku shitai ken ga gozaimasu.", vi: "Thưa Trưởng phòng, em có việc khẩn cấp muốn báo cáo ạ." },
      { role: "B", japanese: "どうしたの？何かトラブルがあった？", kana: "どうしたの？なにかトラブルがあった？", romaji: "Dou shita no? Nanika toraburu ga atta?", vi: "Sao thế? Có sự cố gì xảy ra à?" },
      { role: "A", japanese: "決済画面でエラーが発生しております。一旦旧バージョンに戻してもよろしいでしょうか。", kana: "けっさいがめんでエラーがはっせいしております。いったんきゅうバージョンにもどしてもよろしいでしょうか。", romaji: "Kessai gamen de eraa ga hassei shite orimasu. Ittan kyuu baajon ni modoshite mo yoroshii deshou ka.", vi: "Màn hình thanh toán đang phát sinh lỗi. Em tạm rollback về bản cũ trước có được không ạ?" },
      { role: "B", japanese: "よし、すぐ戻そう。復旧したら原因を調べて報告して。", kana: "よし、すぐもどそう。ふっきゅうしたらげんいんをしらべてほうこくして。", romaji: "Yoshi, sugu modosou. Fukkyuu shitara gen'in o shirabete houkoku shite.", vi: "Được, khôi phục ngay đi. Sau khi chạy lại bình thường thì tìm nguyên nhân báo cáo anh." },
    ],
  },
  {
    id: "ja_rp_14",
    level: "Bài 14 • N2 • Formal (Phỏng vấn)",
    title: "Phỏng vấn công ty Nhật / IT",
    situation: "Trả lời về kinh nghiệm làm việc và mục tiêu nghề nghiệp.",
    lines: [
      { role: "A", japanese: "これまでのご経歴と、得意な分野について教えてください。", kana: "これまでのごけいれきと、とくいなぶんやについておしえてください。", romaji: "Kore made no go-keireki to, tokui na bun'ya ni tsuite oshiete kudasai.", vi: "Xin hãy cho biết kinh nghiệm từ trước tới nay và lĩnh vực sở trường của bạn." },
      { role: "B", japanese: "三年間ウェブ開発に携わっており、特にフロントエンドの設計が得意です。", kana: "さんねんかんウェブかいはつにたずさわっており、とくにフロントエンドのせっけいがとくいです。", romaji: "Sannenkan webu kaihatsu ni tazusawatte ori, tokuni furontoendo no sekkei ga tokui desu.", vi: "Tôi đã tham gia phát triển web 3 năm, đặc biệt mạnh về thiết kế frontend." },
      { role: "A", japanese: "弊社に入社したら、どのようなことに挑戦したいですか。", kana: "へいしゃににゅうしゃしたら、どのようなことにちょうせんしたいですか。", romaji: "Heisha ni nyuusha shitara, dono you na koto ni chousen shitai desu ka.", vi: "Nếu vào công ty chúng tôi, bạn muốn thử sức ở mảng nào?" },
      { role: "B", japanese: "大規模なサービスの開発を通じて、チームを引っ張るリーダーになりたいです。", kana: "だいきぼなサービスのかいはつをつうじて、チームをひっぱるリーダーになりたいです。", romaji: "Daikibo na saabisu no kaihatsu o tsuujite, chiimu o hipparu riidaa ni naritai desu.", vi: "Thông qua phát triển dịch vụ quy mô lớn, tôi muốn trở thành leader dẫn dắt đội ngũ." },
    ],
  },
  {
    id: "ja_rp_15",
    level: "Bài 15 • N2 • Polite/Business",
    title: "Thảo luận ý kiến & Nhượng bộ khéo léo",
    situation: "Nêu ý kiến khác biệt trong cuộc họp mà vẫn giữ hòa khí.",
    lines: [
      { role: "A", japanese: "新機能を一気に全部リリースしたほうがインパクトがあると思います。", kana: "しんきのうをいっきにぜんぶリリースしたほうがインパクトがあるとおもいます。", romaji: "Shinkinou o ikki ni zenbu ririisu shita hou ga inpakuto ga aru to omoimasu.", vi: "Tôi nghĩ tung ra toàn bộ tính năng mới cùng lúc sẽ tạo ấn tượng mạnh hơn." },
      { role: "B", japanese: "おっしゃることも分かりますが、品質面のリスクも考慮すべきではないでしょうか。", kana: "おっしゃることもわかりますが、ひんしつめんのリスクもこうりょすべきではないでしょうか。", romaji: "Ossharu koto mo wakarimasu ga, hinshitsumen no risuku mo kouryo subeki dewa nai deshou ka.", vi: "Tôi hiểu ý của bạn, nhưng chẳng phải chúng ta cũng nên cân nhắc rủi ro về chất lượng sao?" },
      { role: "A", japanese: "確かにそうですね。では、優先度の高い機能から段階的に出しましょうか。", kana: "たしかにそうですね。では、ゆうせんどのたかいきのうからだんかいてきにだしましょうか。", romaji: "Tashika ni sou desu ne. Dewa, yuusendo no takai kinou kara dankaiteki ni dashimashou ka.", vi: "Đúng vậy thật. Vậy mình phát hành theo từng giai đoạn từ các tính năng ưu tiên cao nhé." },
      { role: "B", japanese: "賛成です。その方がユーザーの反応を見ながら改善できますね。", kana: "さんせいです。そのほうがユーザーのはんのうをみながらかいぜんできますね。", romaji: "Sansei desu. Sono hou ga yuuzaa no hannou o minagara kaizen dekimasu ne.", vi: "Tán thành ạ. Làm vậy vừa theo dõi phản ứng người dùng vừa cải thiện được." },
    ],
  },
];
