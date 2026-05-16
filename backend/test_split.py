import json

def test_algo():
    segments = [
    {
      "start": 0.79,
      "end": 5.77,
      "text": "đi để nâng cao hiệu suất làm việc với xác đi ti thì mình là quý nghị mà người chúng ta nên nâng"
    },
    {
      "start": 5.77,
      "end": 12.43,
      "text": "cấp tên phiên bản trả phí mọi người nhé để mà chúng ta có thể khai thác những tăng tối đa nhất và cũng"
    },
    {
      "start": 12.43,
      "end": 18.42,
      "text": "như là cái tốc độ làm việc nhanh nhất thì ở đây mình sẽ cho mọi người xem với một cái phiên bản"
    },
    {
      "start": 18.42,
      "end": 23.28,
      "text": "nâng cấp có ý chả phí thì chúng ta nó đi mỏng và lút khoảng 20 đô một tháng tương đương nó khoảng"
    },
    {
      "start": 23.28,
      "end": 30.07,
      "text": "sắp xỉ 500.000 đi vào thời điểm thì mọi người có sẽ có được mọi tính năng free này mà rộng quyền"
    },
    {
      "start": 30.07,
      "end": 35.11,
      "text": "tập truy cập vào các tính năng nhắn tin tẹp tải đánh niệu này phân tích dữ liệu riêng này nó ra"
    },
    {
      "start": 35.11,
      "end": 40.95,
      "text": "thì chúng ta có thể tạo sử dụng các nhiệm vụ dự án cũng như là tùy chỉnh xác vị thì thay vì chúng"
    },
    {
      "start": 40.95,
      "end": 46.63,
      "text": "ta thuê một trợ lý 57 triệu 20 năm 20 triệu thì chúng ta có thể là sử dụng một cái trợ lý ảo hỗ"
    },
    {
      "start": 46.63,
      "end": 51.13,
      "text": "trợ ta rất là nhiều trong công việc và với chỉ khoảng 500.000 một tháng thì đây là một chút kỹ phí"
    },
    {
      "start": 51.13,
      "end": 56.11,
      "text": "mình theo mình là nên đầu tư một người nhé cái gì với cái tính năng này thì ở đây nó có rất nhiều"
    },
    {
      "start": 56.11,
      "end": 61.69,
      "text": "phiên bản mọi người nhé Nếu như phiên bản miễn phí bình thường thì chúng ta chỉ sử dụng được 4 o trong"
    },
    {
      "start": 61.69,
      "end": 68.02,
      "text": "khoảng là một số ký tự giới hạn ban đầu thôi sau đó thì muốn sử dụng thì chúng ta phải nâng cấp hoặc"
    },
    {
      "start": 68.02,
      "end": 74.56,
      "text": "là chúng ta lại sử dụng những cái tính năng cơ bản nó thấp hơn thì thứ nhất cái tốc độ nó trả lời câu"
    },
    {
      "start": 74.56,
      "end": 80.14,
      "text": "hỏi chúng ta thì nó sẽ không nhanh bằng để công bản có phí cái thứ hai chất lượng đưa ra câu trả lời"
    },
    {
      "start": 80.14,
      "end": 87.16,
      "text": "không hoàn toàn hữu ích nắm đúng không ạ hoàn toàn là tốt bằng công cụ bốn ô thì ngày hôm nay chúng"
    },
    {
      "start": 87.16,
      "end": 91.96,
      "text": "ta cố gắng sử dụng cái nâng cấp đi mà trả phí để chúng ta có thể sử dụng được những kính năng tốt"
    },
    {
      "start": 91.96,
      "end": 96.86,
      "text": "nhất ngoài ra trong chat VT này thì có rất nhiều kỹ tiện ích tích hợp mà để chúng ta sử dụng những"
    },
    {
      "start": 96.86,
      "end": 103.06,
      "text": "cái này hiệu quả làm video trực tiếp trên đây hoặc là thiết kế là sân ai ảnh trình chiếu trên chat VT"
    },
    {
      "start": 103.06,
      "end": 107.83,
      "text": "chúng ta phải trả phí để dùng những công cụ tích hợp này nhé mọi người nhé thì theo mình là bước"
    },
    {
      "start": 107.83,
      "end": 109.47,
      "text": "chúng ta sẽ nên đầu tư cái khoản"
    },
    {
      "start": 109.47,
      "end": 110.91,
      "text": "HPT lên bản"
    },
    {
      "start": 110.91,
      "end": 113.57,
      "text": "phí rồi nhé. Cái thứ hai đó là chúng ta"
    },
    {
      "start": 113.57,
      "end": 115.55,
      "text": "xác định vai trò. Thì chúng ta nhìn thấy"
    },
    {
      "start": 115.55,
      "end": 117.39,
      "text": "tầm là câu trong đảnh phần câu lệnh nâng cao"
    },
    {
      "start": 117.39,
      "end": 119.41,
      "text": "thì Rốt xác định vai trò là"
    },
    {
      "start": 119.41,
      "end": 121.57,
      "text": "một trong những yếu tố đầu tiên. Nếu như ngày hôm nay"
    },
    {
      "start": 121.57,
      "end": 123.51,
      "text": "chúng ta viết content hoặc là viết một cái"
    },
    {
      "start": 123.51,
      "end": 125.29,
      "text": "đoạn văn hoặc là kịch bản"
    },
    {
      "start": 125.29,
      "end": 127.17,
      "text": "tiktok hay facebook thì chúng ta"
    },
    {
      "start": 127.17,
      "end": 129.35,
      "text": "ở cái việc mà chúng ta thấy đóng vai"
    },
    {
      "start": 129.35,
      "end": 131.45,
      "text": "một chuyên gia sáng tạo nội dung trên mạng xã hội"
    },
    {
      "start": 131.45,
      "end": 133.49,
      "text": "thì câu trả lời nó sẽ khác"
    },
    {
      "start": 133.49,
      "end": 135.29,
      "text": "hoàn toàn với việc đóng vai một doanh nhân"
    },
    {
      "start": 135.29,
      "end": 136.47,
      "text": "tỷ phú người Mỹ"
    },
    {
      "start": 136.47,
      "end": 143.19,
      "text": "hoặc là chúng ta thì câu trả lời nó cũng khác biệt hoàn toàn với là cái ngay từ đầu cái câu lệnh"
    },
    {
      "start": 143.19,
      "end": 148.71,
      "text": "chúng ta là đóng vai trò một khách hàng đang quan tâm sản phẩm vụ thế thì ngày hôm nay khi các bạn"
    },
    {
      "start": 148.71,
      "end": 154.59,
      "text": "mình muốn viết cho đối tượng nào và mình muốn hướng tới điều gì ví dụ chúng ta muốn cái con"
    },
    {
      "start": 154.59,
      "end": 159.63,
      "text": "tên này hướng đến khách hàng ta thì chúng ta phải đóng vai trò ta là người khách hàng để trải nghiệm"
    },
    {
      "start": 159.63,
      "end": 164.67,
      "text": "sản phẩm thì lúc đó thì góc nhìn nó mới thực sự là sâu sắc nếu như chúng ta là một chuyên gia sản"
    },
    {
      "start": 164.67,
      "end": 170.55,
      "text": "thì cái văn phong và cái cách viết thì nó lại khác hoàn toàn với lại như cái của các chuyên gia tài"
    },
    {
      "start": 170.55,
      "end": 175.65,
      "text": "chính hoặc là những cái vị tùy tỷ phú cái đi ngày hôm nay ngay từ cái việc mà mọi người xác"
    },
    {
      "start": 175.65,
      "end": 180.13,
      "text": "định cái vai trò nó cực kỳ quan trọng nhé thì đấy là cái điểm mà một người nên ghi nhớ rằng là"
    },
    {
      "start": 180.13,
      "end": 186.15,
      "text": "ngay trong câu lệnh đầu chúng ta xác định tao biết cho ai đối tượng chúng ta là gì để chúng ta đặt cái"
    },
    {
      "start": 186.15,
      "end": 192.52,
      "text": "mục tiêu vai trò cho cái chắc chữ thì nó hiệu quả nhất mà người nhé Ngoài ra để mà chúng ta có"
    },
    {
      "start": 192.52,
      "end": 197.02,
      "text": "sẽ có hơn ví dụ chúng ta nên Google chúng ta tìm những quyển sách hay này chúng ta cũng đọc rất"
    },
    {
      "start": 197.02,
      "end": 201.34,
      "text": "nhiều sách rồi nhưng mà thực sự là chúng ta chưa thể áp dụng được cái thì ngày hôm nay ngoài có thể sử"
    },
    {
      "start": 201.34,
      "end": 205.28,
      "text": "dụng chắc VT để ông ta có này này áp dụng những kiến thức trong quyển sách để vào công việc của"
    },
    {
      "start": 205.28,
      "end": 212.27,
      "text": "mình ví dụ mình sẽ tải một quyển sách như đây là hạn mình sẽ tải một quyển nghìn nít nên sau đó mình"
    },
    {
      "start": 212.27,
      "end": 228.32,
      "text": "mình sẽ đặt hai câu hỏi bạn biết gì về cuốn sách này thì sau này nó sẽ đọc toàn bộ cái thông tin"
    },
    {
      "start": 228.32,
      "end": 237.17,
      "text": "quyển sách này gì ở đây thì sau khi mà chắc đi đọc chúng ta cái thông tin dữ liệu từ quyển sách thì"
    },
    {
      "start": 237.17,
      "end": 250.27,
      "text": "bước thứ hai ở chúng ta là dựa vào những thông tin mà đã cung cấp những tin bạn đã học được từ"
    },
    {
      "start": 250.27,
      "end": 281.09,
      "text": "cuốn sách giúp tôi xây dựng kinh doanh em chị nắm chẳng hạn ấy thì khi mà nó sẽ gọi người thấy rằng"
    },
    {
      "start": 281.09,
      "end": 286.11,
      "text": "khi mà nó tổng hợp tất cả những kiến thức của quyển sách thì bước thứ hai khi mà chúng ta muốn áp"
    },
    {
      "start": 286.11,
      "end": 291.15,
      "text": "cái công việc của mình đôi khi được anh chị chúng ta cũng không có nghĩ rằng là phải ứng dụng như nào"
    },
    {
      "start": 291.15,
      "end": 298.41,
      "text": "thì đây mình có thể là ứng dụng một kem chị nám này rất là hay nhé thì đây là cái cách mà chúng ta có"
    },
    {
      "start": 298.41,
      "end": 302.85,
      "text": "thể làm mẹo đấy là có thể sử dụng với sát viti hiệu quả hơn ngoài ra thì khi mọi người muốn đọc"
    },
    {
      "start": 302.85,
      "end": 308.91,
      "text": "bất kỳ một quyển sách nào ở đây người chỉ cần copy cái tiêu đề đây mình sẽ ví dụ mình sẽ copy"
    },
    {
      "start": 308.91,
      "end": 324.14,
      "text": "tiêu đề của người nhé lụng ví dụ mình sẽ copy quyển cái này chẳng hạn rồi sau đó mình sẽ sẵn"
    },
    {
      "start": 324.14,
      "end": 338.73,
      "text": "của tên mỹ tí nhé bạn biết gì về cuốn sách này khi mà chúng ta muốn đọc hay là chúng ta khi mà chúng ta"
    },
    {
      "start": 338.73,
      "end": 342.75,
      "text": "muốn định mua một cuốn sách đọc thì chúng ta xem có nội dung nó có hay không hay thực sự nó có như"
    },
    {
      "start": 342.75,
      "end": 349.18,
      "text": "trải nghiệm hay không thì mọi người có thể nào lên đây một người nhé thì như trên đây thì một người"
    },
    {
      "start": 349.18,
      "end": 353.78,
      "text": "nhìn thấy rằng khi mình áp dụng vào cái sản phẩm mà chị nám thì nó ra chúng ta rất là nhiều những"
    },
    {
      "start": 353.78,
      "end": 360.22,
      "text": "cái nội dung quảng cáo để ta ghét định dạng để có thể là tạo ra những cái chiến dịch tiếp thị"
    },
    {
      "start": 360.22,
      "end": 372.78,
      "text": "sách sách sách sách sách mang thông điệp tích cực về nỗ lực và chủ động tên sách thể hiện một"
    },
    {
      "start": 372.78,
      "end": 377.67,
      "text": "quan bằng tự nhiên nội dung xoay canh những câu chuyện chuyện độc lực này kiên trì này đây là một"
    },
    {
      "start": 377.67,
      "end": 384.51,
      "text": "trong những cái nhiều bạn trẻ cuốn này khi học khó khăn trong việc học tập mất niềm tin đây cũng có"
    },
    {
      "start": 384.51,
      "end": 390.54,
      "text": "thể là trích nội dung chi tiết hoặc to tán sâu hơn được sách này tên tác giả thì mọi người thấy rằng"
    },
    {
      "start": 390.54,
      "end": 396.06,
      "text": "Facebook chúng ta nếu như mà chúng ta thực sự rất là biết cái thác một cách tối đa thì rất là tốt"
    },
    {
      "start": 396.06,
      "end": 400.06,
      "text": "mọi người nhé thì thấy là cái cách mà chúng ta có những cái tiếp nhỏ đẹp và để chúng ta có thể là"
    },
    {
      "start": 400.06,
      "end": 405.04,
      "text": "khai thác chấp nhu ti tạo ra những cái bài viết content mà mang cái tụ trạng với các hàng hơn"
    },
    {
      "start": 405.04,
      "end": 411.52,
      "text": "chúng ta phải đắm rõ cái phần văn phòng và phong cách viết với mỗi một đối tượng mỗi một khách"
    },
    {
      "start": 411.52,
      "end": 415.68,
      "text": "hàng hướng đến mà chúng ta nhắm đến thì lại có cái văn phòng khác nhau ví dụ như học sinh"
    },
    {
      "start": 415.68,
      "end": 418.64,
      "text": "Văn phòng thường là gần gũi hài hước, trẻ hóa này"
    },
    {
      "start": 418.64,
      "end": 424.53,
      "text": "Còn người đi nam thì người ta thì cần được cái thực tế, lấy gọn, hiệu suất đúng không ạ?"
    },
    {
      "start": 424.91,
      "end": 427.43,
      "text": "Còn doanh nhân thì người ta thường hướng tư duy và tài pháp"
    },
    {
      "start": 427.43,
      "end": 430.93,
      "text": "Cụ nữ là mẹ nội trợ thì đồng cảm, chân thành và nhạt nhạt"
    },
    {
      "start": 430.93,
      "end": 434.05,
      "text": "Khi mà chúng ta nắm được cái gọi là cái đối tượng hướng đến"
    },
    {
      "start": 434.05,
      "end": 438.23,
      "text": "Thì chúng ta sẽ tạo ra những cái văn phòng, cái cách viết làm sao tạo điểm trạm cho khách hàng của chúng ta"
    },
    {
      "start": 438.23,
      "end": 440.27,
      "text": "Thế thì mình sẽ ví dụ trực tiếp vào đây"
    },
    {
      "start": 440.27,
      "end": 445.63,
      "text": "Ví dụ đây là một cái bài content viết về một cách mạng thầm nặng định hình lại thế giới"
    },
    {
      "start": 445.63,
      "end": 452.14,
      "text": "tươi mới đó là ai đúng không ạ thì mình sẽ copy đó này ví dụ mình sẽ là chắc đi tiên mình hãy viết"
    },
    {
      "start": 452.14,
      "end": 474.55,
      "text": "lại với phong cách con nửa tuổi anh từ học sinh sinh viên nhé thế này phải biết sau với tượng"
    },
    {
      "start": 474.55,
      "end": 491.11,
      "text": "hiện đồng học sinh sinh viên được hạ em nói ai đang âm thầm chiếm sóng ở mọi mặt trận đúng"
    },
    {
      "start": 491.11,
      "end": 496.11,
      "text": "đổi ai chỉ tạo nhân trực cơn gì nữa các bạn ơi em rất là cung tia đúng không nghe rất là phong"
    },
    {
      "start": 496.11,
      "end": 503.64,
      "text": "hài hước đúng không tươi trẻ đúng không ai lên Google tra bài này ai gợi ý luôn đáp án này GBT"
    },
    {
      "start": 503.64,
      "end": 510,
      "text": "nếu bạn học giỏi nhưng không bao giờ kêu mượn vở này tôi ai là ai ai còn trả lời hơn cơ rắc trả lời"
    },
    {
      "start": 510,
      "end": 516.22,
      "text": "tin nhắn này thế thì đây là một trong những phong cách ví dụ mình sẽ đổi với phong cách này này với"
    },
    {
      "start": 516.22,
      "end": 539.22,
      "text": "lại phong cách văn phòng đi làm đi đổi lại với phong cách mà muốn những cái nữ tuổi nào thì chúng"
    },
    {
      "start": 539.22,
      "end": 544.43,
      "text": "cái thường thường chúng ta có nhận thức nó lại khác nhau và cái văn phòng nó khác như tợ lý thầm nặng giúp"
    },
    {
      "start": 544.43,
      "end": 549.95,
      "text": "dân phòng thở được này bạn có nhận ra chúng ta đang sống trong một thời kỳ thời đại ai mà không đây không"
    },
    {
      "start": 549.95,
      "end": 555.13,
      "text": "còn là tương lai mà ngay cạnh bạn và làm việc của bạn âm thầm thay đổi cách chúng ta làm việc mỗi"
    },
    {
      "start": 555.13,
      "end": 560.23,
      "text": "ngày hay hỗ trợ email nên kế hoạch này thì lúc đó lại cá nhân hóa thành một trong những cái văn phòng"
    },
    {
      "start": 560.23,
      "end": 564.55,
      "text": "của những người nằm văn phòng ấy cho nên cái việc mà mọi người xác định ngay từ đầu đối tượng người"
    },
    {
      "start": 564.55,
      "end": 570.49,
      "text": "không biết ai thì mình sẽ thử một cái văn phòng ví dụ cho những người mà doanh nhân chủ doanh nghiệp"
    },
    {
      "start": 570.49,
      "end": 589.27,
      "text": "xem văn phòng phụ nữ làm nội trợ này thế này với văn phòng thằng miệng người phụ nữ làm mẹ nội trợ"
    },
    {
      "start": 589.27,
      "end": 596,
      "text": "này thì mọi người nhìn ai người thầm nặng giúp mẹ bớt non nhà thêm An Yên này để làm việc mới đâu"
    },
    {
      "start": 596,
      "end": 602.42,
      "text": "mới hiểu việc nhà không tên tăm con không nghỉ lo toan chẳng dứt nhiều khi chỉ mong đó ai đó giúp"
    },
    {
      "start": 602.42,
      "end": 608.78,
      "text": "tạo một tay dễ nhàng hiểu ý không cần nhất nhỏ nhiều và rồi ai trí tuệ nhân tạo âm thầm xuất hiện giúp"
    },
    {
      "start": 608.78,
      "end": 615.11,
      "text": "mẹ áp lực mỗi ngày đối với một đối tượng ấy mọi người này đến đôi mẹ lội trợ đi trong căn bếp nhỏ"
    },
    {
      "start": 615.11,
      "end": 620.75,
      "text": "này khi chăm con này thì nó là cá nhân hóa chúng ta rất là cái nhiều cái trải nghiệm cực kỳ tốt đối"
    },
    {
      "start": 620.75,
      "end": 625.19,
      "text": "với khách hàng ta thì ngay này chúng ta hãy cố gắng đối với những cái đối tượng khách hàng ta hướng"
    },
    {
      "start": 625.19,
      "end": 631.53,
      "text": "đến là ai thì chúng ta hãy yêu cầu thì chắc đi đi này nó chả đúng cái văn phòng của đối tượng đó"
    },
    {
      "start": 631.53,
      "end": 636.51,
      "text": "thì khi đó cái bài viết cái con tên của người nó sẽ có điểm chạm rất là lớn một người nhé"
    },
    {
      "start": 636.51,
      "end": 638.41,
      "text": "mọi người ghi nhớ cho mình đi điều này"
    }
    ]

    min_gap_sec = 15.0
    min_chapter_sec = 8.0
    ideal_chapter_sec = 90.0

    valid = segments
    blocks = []
    current_block = [valid[0]]

    for i in range(1, len(valid)):
        prev = valid[i - 1]
        curr = valid[i]

        gap = curr["start"] - prev.get("end", prev["start"])
        block_duration = curr["start"] - current_block[0]["start"]

        # 1. Nếu có khoảng lặng lớn (e.g. 5s) và chapter đủ dài (30s) -> cắt
        # 2. HOẶC nếu chapter đã quá dài (>= ideal_chapter_sec) -> ép cắt ở câu tiếp theo
        should_split = False
        
        # Giảm gap xuống 3.0s nếu block_duration > 30s
        if gap >= 3.0 and block_duration >= 30.0:
            should_split = True
        elif gap >= min_gap_sec and block_duration >= min_chapter_sec:
            should_split = True
        elif block_duration >= ideal_chapter_sec:
            # force split
            should_split = True

        if should_split:
            blocks.append(current_block)
            current_block = [curr]
        else:
            current_block.append(curr)

    blocks.append(current_block)

    print(f"Total blocks: {len(blocks)}")
    for i, b in enumerate(blocks):
        start = b[0]["start"]
        end = b[-1]["end"]
        dur = end - start
        print(f"Block {i}: {start:.1f}s -> {end:.1f}s (dur: {dur:.1f}s, segments: {len(b)})")

test_algo()
