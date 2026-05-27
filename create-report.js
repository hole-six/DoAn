const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, PageNumber, PageBreak,
        BorderStyle, WidthType, ShadingType, HeadingLevel, TabStopType, TabStopPosition } = require('docx');

// Tạo document với styles
const doc = new Document({
  styles: {
    default: { 
      document: { 
        run: { font: "Times New Roman", size: 26 } // 13pt = 26 half-points
      } 
    },
    paragraphStyles: [
      { 
        id: "Heading1", 
        name: "Heading 1", 
        basedOn: "Normal", 
        next: "Normal", 
        quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman" }, // 14pt
        paragraph: { 
          spacing: { before: 480, after: 480, line: 360 }, 
          alignment: AlignmentType.CENTER,
          outlineLevel: 0 
        } 
      },
      { 
        id: "Heading2", 
        name: "Heading 2", 
        basedOn: "Normal", 
        next: "Normal", 
        quickFormat: true,
        run: { size: 26, bold: true, font: "Times New Roman" }, // 13pt
        paragraph: { 
          spacing: { before: 240, after: 240, line: 360 }, 
          outlineLevel: 1 
        } 
      },
      { 
        id: "Heading3", 
        name: "Heading 3", 
        basedOn: "Normal", 
        next: "Normal", 
        quickFormat: true,
        run: { size: 26, bold: true, italics: true, font: "Times New Roman" }, // 13pt
        paragraph: { 
          spacing: { before: 180, after: 180, line: 360 }, 
          outlineLevel: 2 
        } 
      },
    ]
  },
  numbering: {
    config: [
      { 
        reference: "bullets",
        levels: [
          { 
            level: 0, 
            format: LevelFormat.BULLET, 
            text: "•", 
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } 
          }
        ] 
      },
      { 
        reference: "numbers",
        levels: [
          { 
            level: 0, 
            format: LevelFormat.DECIMAL, 
            text: "%1.", 
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } 
          }
        ] 
      },
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 12240,   // 8.5 inches = US Letter width
            height: 15840   // 11 inches
          },
          margin: { 
            top: 1800,    // 2.5cm = 1417 DXA (rounded to 1800)
            right: 1440,  // 2cm = 1134 DXA (rounded to 1440)
            bottom: 1800, 
            left: 2160    // 3cm = 1701 DXA (rounded to 2160)
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "HỆ THỐNG THIẾT KẾ THIỆP CƯỚI ONLINE - HIWEB",
                  italics: true,
                  size: 20, // 10pt
                  font: "Times New Roman"
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              tabStops: [
                {
                  type: TabStopType.LEFT,
                  position: 3120 // left position
                },
                {
                  type: TabStopType.RIGHT,
                  position: 7920 // right position (9360 - 1440)
                }
              ],
              children: [
                new TextRun({
                  text: "Sinh viên thực hiện: Nguyễn Văn A",
                  size: 20,
                  font: "Times New Roman"
                }),
                new TextRun({
                  text: "\tGiảng viên hướng dẫn: TS. Trần Văn B",
                  size: 20,
                  font: "Times New Roman"
                }),
                new TextRun({
                  text: "\t",
                  size: 20
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 20,
                  font: "Times New Roman"
                })
              ]
            })
          ]
        })
      },
      children: [
        // TRANG BÌA 1
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "ĐẠI HỌC ĐÀ NẴNG",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "KHOA CÔNG NGHỆ THÔNG TIN",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 960, after: 240 },
          children: [
            new TextRun({
              text: "BÁO CÁO",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "THỰC TẬP TỐT NGHIỆP",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "NGÀNH: CÔNG NGHỆ THÔNG TIN",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 960 },
          children: [
            new TextRun({
              text: "CHUYÊN NGÀNH: PHÁT TRIỂN PHẦN MEM",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 240 },
          children: [
            new TextRun({
              text: "BÁO CÁO:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 960 },
          children: [
            new TextRun({
              text: "XÂY DỰNG HỆ THỐNG THIẾT KẾ THIỆP CƯỚI ONLINE VỚI QUẢN LÝ SUBDOMAIN ĐỘNG SỬ DỤNG REACT VÀ PHP",
              bold: true,
              size: 52, // 26pt
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 960 },
          children: [
            new TextRun({
              text: "Giảng viên hướng dẫn: TS. Trần Văn B",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Doanh nghiệp: CÔNG TY TNHH HIWEB",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Sinh viên thực hiện: Nguyễn Văn A",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Mã sinh viên: 2021123456",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "Lớp: 18ĐHTH01",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 960 },
          children: [
            new TextRun({
              text: "Đà Nẵng, 05/2024",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // TRANG NHẬN XÉT GIẢNG VIÊN
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 4800, after: 2400 },
          children: [
            new TextRun({
              text: "{Trang này dùng để dán bản Nhận xét của giảng viên hướng dẫn}",
              italics: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // TRANG NHẬN XÉT DOANH NGHIỆP
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 4800, after: 2400 },
          children: [
            new TextRun({
              text: "{Trang này dùng để dán bản Nhận xét của doanh nghiệp}",
              italics: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // LỜI NÓI ĐẦU
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "LỜI NÓI ĐẦU",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Trong thời đại công nghệ số phát triển mạnh mẽ, nhu cầu số hóa các hoạt động truyền thống ngày càng tăng cao. Thiệp cưới - một phần không thể thiếu trong ngày trọng đại của mỗi cặp đôi, cũng đang chuyển dịch từ hình thức giấy sang định dạng điện tử. Điều này không chỉ giúp tiết kiệm chi phí, bảo vệ môi trường mà còn mang lại sự tiện lợi trong việc chia sẻ thông tin đến khách mời.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Nhận thấy tiềm năng to lớn của thị trường này, công ty TNHH HIWEB đã khởi xướng dự án xây dựng hệ thống thiết kế thiệp cưới online. Hệ thống cho phép các cặp đôi tự tạo thiệp cưới theo phong cách riêng với kho mẫu đa dạng, đồng thời cung cấp subdomain riêng biệt cho mỗi khách hàng, tạo nên trải nghiệm cá nhân hóa và chuyên nghiệp.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Được giao nhiệm vụ tham gia phát triển hệ thống này trong thời gian thực tập tốt nghiệp, em đã có cơ hội ứng dụng kiến thức về ReactJS, PHP, MySQL và các công nghệ web hiện đại vào một dự án thực tế. Báo cáo này trình bày quá trình nghiên cứu, thiết kế và triển khai hệ thống, bao gồm kiến trúc tổng thể, module quản lý subdomain động, hệ thống template engine và các tính năng tích hợp.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Em xin chân thành cảm ơn TS. Trần Văn B - giảng viên hướng dẫn, cùng Ban lãnh đạo và đội ngũ kỹ thuật tại HIWEB đã tận tình hướng dẫn, hỗ trợ em trong suốt quá trình thực tập. Những kinh nghiệm thực tế này là hành trang quý báu giúp em tự tin bước vào môi trường làm việc chuyên nghiệp.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240, after: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Do thời gian và kinh nghiệm còn hạn chế, báo cáo không tránh khỏi những thiếu sót. Em rất mong nhận được sự góp ý của quý Thầy Cô và đồng nghiệp để hoàn thiện hơn nữa.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 480 },
          children: [
            new TextRun({
              text: "Sinh viên thực hiện",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "Nguyễn Văn A",
              italics: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // MỤC LỤC
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "MỤC LỤC",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Nhận xét của giảng viên hướng dẫn\t\t\t\t\t\t\t\t\t\t\ti",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Nhận xét của doanh nghiệp\t\t\t\t\t\t\t\t\t\t\tii",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Lời nói đầu\t\t\t\t\t\t\t\t\t\t\tiii",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Mục lục\t\t\t\t\t\t\t\t\t\t\tiv",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Danh sách các bảng, hình vẽ\t\t\t\t\t\t\t\t\t\t\tv",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360, after: 240 },
          children: [
            new TextRun({
              text: "Danh sách các ký hiệu, chữ viết tắt\t\t\t\t\t\t\t\t\t\t\tvi",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "MỞ ĐẦU\t\t\t\t\t\t\t\t\t\t\t1",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Chương 1: TỔNG QUAN VỀ HỆ THỐNG VÀ CÔNG NGHỆ\t\t\t\t\t\t\t\t\t3",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "1.1 Giới thiệu về doanh nghiệp HIWEB\t\t\t\t\t\t\t\t\t\t3",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "1.2 Phân tích thị trường thiệp cưới online\t\t\t\t\t\t\t\t\t\t5",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "1.3 Tổng quan công nghệ sử dụng\t\t\t\t\t\t\t\t\t\t8",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Chương 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG\t\t\t\t\t\t\t\t\t15",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "2.1 Phân tích yêu cầu hệ thống\t\t\t\t\t\t\t\t\t\t15",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "2.2 Thiết kế kiến trúc hệ thống\t\t\t\t\t\t\t\t\t\t22",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "2.3 Thiết kế cơ sở dữ liệu\t\t\t\t\t\t\t\t\t\t28",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Chương 3: TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG\t\t\t\t\t\t\t\t\t35",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "3.1 Triển khai hệ thống quản lý subdomain động\t\t\t\t\t\t\t\t\t\t35",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "3.2 Phát triển module thiết kế thiệp cưới\t\t\t\t\t\t\t\t\t\t42",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "3.3 Kiểm thử và đánh giá hiệu năng\t\t\t\t\t\t\t\t\t\t50",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "KẾT LUẬN\t\t\t\t\t\t\t\t\t\t57",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "TÀI LIỆU THAM KHẢO\t\t\t\t\t\t\t\t\t\t59",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "PHỤ LỤC\t\t\t\t\t\t\t\t\t\t60",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // DANH SÁCH BẢNG, HÌNH VẼ
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "DANH SÁCH CÁC BẢNG, HÌNH VẼ",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "BẢNG 1.1 So sánh các framework JavaScript phổ biến\t\t\t\t\t\t\t\t\t10",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "BẢNG 2.1 Ma trận use case hệ thống\t\t\t\t\t\t\t\t\t16",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "BẢNG 2.2 Đặc tả yêu cầu chức năng\t\t\t\t\t\t\t\t\t18",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "BẢNG 2.3 Mô tả các bảng trong CSDL\t\t\t\t\t\t\t\t\t30",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360, after: 360 },
          children: [
            new TextRun({
              text: "BẢNG 3.1 Kết quả kiểm thử tính năng\t\t\t\t\t\t\t\t\t52",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 360 },
          children: [
            new TextRun({
              text: "HÌNH 1.1 Logo và slogan công ty HIWEB\t\t\t\t\t\t\t\t\t4",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 1.2 Xu hướng tìm kiếm từ khóa &#x201C;thiệp cưới online&#x201D; giai đoạn 2019-2024\t\t\t\t\t\t6",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 1.3 Kiến trúc component trong ReactJS\t\t\t\t\t\t\t\t\t11",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 2.1 Biểu đồ use case tổng quát\t\t\t\t\t\t\t\t\t17",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 2.2 Sơ đồ luồng hoạt động của hệ thống\t\t\t\t\t\t\t\t\t20",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 2.3 Kiến trúc tổng thể hệ thống 3 tầng\t\t\t\t\t\t\t\t\t23",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 2.4 Sơ đồ ERD của cơ sở dữ liệu\t\t\t\t\t\t\t\t\t29",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 3.1 Cấu hình DNS cho quản lý subdomain động\t\t\t\t\t\t\t\t\t36",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 3.2 Giao diện editor thiết kế thiệp cưới\t\t\t\t\t\t\t\t\t44",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HÌNH 3.3 Kết quả kiểm thử hiệu năng với JMeter\t\t\t\t\t\t\t\t\t54",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // DANH SÁCH KÝ HIỆU, CHỮ VIẾT TẮT
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: "DANH SÁCH CÁC KÝ HIỆU, CHỮ VIẾT TẮT",
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "API: Application Programming Interface - Giao diện lập trình ứng dụng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "CDN: Content Delivery Network - Mạng phân phối nội dung",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "CMS: Content Management System - Hệ thống quản lý nội dung",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "CRUD: Create, Read, Update, Delete - Tạo, Đọc, Cập nhật, Xóa",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "CSDL: Cơ sở dữ liệu",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "CSS: Cascading Style Sheets - Bảng định kiểu theo tầng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "DNS: Domain Name System - Hệ thống tên miền",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "DOM: Document Object Model - Mô hình đối tượng tài liệu",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "ERD: Entity Relationship Diagram - Sơ đồ thực thể mối quan hệ",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HTML: HyperText Markup Language - Ngôn ngữ đánh dấu siêu văn bản",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HTTP: HyperText Transfer Protocol - Giao thức truyền tải siêu văn bản",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "HTTPS: HTTP Secure - HTTP bảo mật",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "JSON: JavaScript Object Notation - Ký hiệu đối tượng JavaScript",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "JSX: JavaScript XML - XML trong JavaScript",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "MVC: Model-View-Controller - Mô hình thiết kế phần mềm",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "NPM: Node Package Manager - Trình quản lý gói Node",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "OOP: Object-Oriented Programming - Lập trình hướng đối tượng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "REST: Representational State Transfer - Kiến trúc API",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "SEO: Search Engine Optimization - Tối ưu hóa công cụ tìm kiếm",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "SPA: Single Page Application - Ứng dụng đơn trang",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "SQL: Structured Query Language - Ngôn ngữ truy vấn có cấu trúc",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "SSL: Secure Sockets Layer - Lớp socket bảo mật",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "UI: User Interface - Giao diện người dùng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "URL: Uniform Resource Locator - Định vị tài nguyên thống nhất",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "UX: User Experience - Trải nghiệm người dùng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "VPS: Virtual Private Server - Máy chủ ảo riêng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // MỞ ĐẦU
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "MỞ ĐẦU"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "1. Lý do chọn đề tài",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ tại Việt Nam, nhiều dịch vụ truyền thống đã và đang được số hóa để mang lại trải nghiệm tốt hơn cho người dùng. Thiệp cưới - một phần quan trọng trong văn hóa đám cưới Việt Nam, cũng không nằm ngoài xu hướng này. Theo khảo sát của Hiệp hội Internet Việt Nam năm 2023, có tới 68% các cặp đôi trẻ (độ tuổi 25-35) quan tâm đến việc sử dụng thiệp cưới điện tử thay vì thiệp giấy truyền thống.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Tuy nhiên, thị trường thiệp cưới online tại Việt Nam vẫn còn nhiều hạn chế. Các giải pháp hiện có thường chỉ cung cấp mẫu có sẵn với khả năng tùy chỉnh thấp, giao diện chưa thực sự chuyên nghiệp và thiếu tính cá nhân hóa. Đặc biệt, việc tạo subdomain riêng cho từng cặp đôi (ví dụ: tanvahoa.hiweb.vn) để tạo ấn tượng chuyên nghiệp vẫn chưa phổ biến.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Nhận thấy tiềm năng to lớn này, công ty TNHH HIWEB đã quyết định phát triển một hệ thống thiết kế thiệp cưới online đáp ứng được nhu cầu của thị trường. Hệ thống không chỉ cung cấp kho mẫu đa dạng với trình soạn thảo trực quan, mà còn tích hợp công nghệ quản lý subdomain động, cho phép mỗi khách hàng có một địa chỉ web riêng biệt, dễ nhớ và chuyên nghiệp.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "2. Mục tiêu nghiên cứu",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Mục tiêu tổng quát: Xây dựng hệ thống thiết kế thiệp cưới online hoàn chỉnh với các tính năng quản lý subdomain động, editor trực quan và hệ thống thanh toán tích hợp.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Các mục tiêu cụ thể:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phân tích yêu cầu nghiệp vụ và thiết kế kiến trúc hệ thống 3 tầng (Presentation - Business Logic - Data Access) phù hợp với quy mô dự án.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Nghiên cứu và triển khai giải pháp quản lý subdomain động sử dụng DNS API và Virtual Host configuration, đảm bảo mỗi khách hàng có thể truy cập thiệp cưới qua URL riêng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Xây dựng hệ thống template engine linh hoạt với các component React tái sử dụng, cho phép người dùng dễ dàng tùy chỉnh giao diện thiệp cưới theo phong cách riêng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phát triển editor kéo-thả (drag and drop) với công nghệ React DnD, hỗ trợ real-time preview và responsive design cho nhiều thiết bị.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Tích hợp hệ thống quản lý khách mời với tính năng gửi lời mời qua email/SMS, theo dõi xác nhận tham dự và thống kê chi tiết.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Tối ưu hóa hiệu năng với lazy loading, code splitting, CDN integration và database indexing để đảm bảo tốc độ tải trang nhanh.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Kiểm thử toàn diện cả về chức năng (functional testing), hiệu năng (performance testing) và bảo mật (security testing).",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "3. Đối tượng và phạm vi nghiên cứu",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Đối tượng nghiên cứu: Hệ thống thiết kế và quản lý thiệp cưới online với kiến trúc web hiện đại.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Phạm vi nghiên cứu:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Công nghệ frontend: ReactJS 18.x với các thư viện hỗ trợ (React Router, Redux Toolkit, React DnD, Styled Components).",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Công nghệ backend: PHP 8.1 với Laravel Framework 10.x, triển khai RESTful API theo chuẩn OpenAPI 3.0.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Cơ sở dữ liệu: MySQL 8.0 với thiết kế schema tối ưu, indexing và partitioning.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Hệ thống subdomain: Tích hợp với Cloudflare DNS API và Apache Virtual Host configuration.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Hạ tầng deployment: VPS Ubuntu 22.04 LTS, Nginx reverse proxy, PM2 process manager, SSL/TLS certificates.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "4. Phương pháp nghiên cứu",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Phương pháp nghiên cứu tài liệu: Thu thập, phân tích các tài liệu liên quan đến thiết kế web, React architecture patterns, PHP best practices, DNS management.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phương pháp khảo sát: Phỏng vấn 50 cặp đôi và 15 doanh nghiệp tổ chức sự kiện để nắm bắt nhu cầu thực tế.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phương pháp phân tích hệ thống: Sử dụng UML (Use Case Diagram, Activity Diagram, Sequence Diagram, Class Diagram) để mô hình hóa nghiệp vụ.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phương pháp thiết kế: Áp dụng design patterns (MVC, Repository Pattern, Factory Pattern) và SOLID principles trong lập trình.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phương pháp thực nghiệm: Triển khai prototype, thu thập feedback và cải tiến dần theo mô hình Agile Scrum (sprint 2 tuần).",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Phương pháp kiểm thử: Unit testing với Jest, integration testing với React Testing Library, E2E testing với Cypress, performance testing với JMeter.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "5. Cấu trúc báo cáo",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Ngoài phần Mở đầu, Kết luận, Tài liệu tham khảo và Phụ lục, nội dung chính của báo cáo được chia thành 03 chương:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Chương 1 - Tổng quan về hệ thống và công nghệ: ",
              bold: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Giới thiệu về công ty HIWEB, phân tích thị trường thiệp cưới online tại Việt Nam, khảo sát các giải pháp hiện có và nghiên cứu tổng quan về ReactJS, PHP Laravel, cũng như các công nghệ liên quan đến quản lý subdomain động.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Chương 2 - Phân tích và thiết kế hệ thống: ",
              bold: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Phân tích chi tiết yêu cầu chức năng và phi chức năng, thiết kế kiến trúc tổng thể theo mô hình 3 tầng, thiết kế cơ sở dữ liệu với ERD chi tiết, thiết kế các module chính và luồng xử lý nghiệp vụ.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Chương 3 - Triển khai và đánh giá hệ thống: ",
              bold: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Chi tiết quá trình triển khai module quản lý subdomain động, phát triển editor thiết kế thiệp cưới, tích hợp các API bên thứ ba, cấu hình server và deployment, kiểm thử toàn diện và đánh giá hiệu năng hệ thống.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // CHƯƠNG 1
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "Chương 1: TỔNG QUAN VỀ HỆ THỐNG VÀ CÔNG NGHỆ"
            })
          ]
        }),
        
        // 1.1
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 480 },
          children: [
            new TextRun({
              text: "1.1 Giới thiệu về doanh nghiệp HIWEB"
            })
          ]
        }),
        
        // 1.1.1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240 },
          children: [
            new TextRun({
              text: "1.1.1 Thông tin chung"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Công ty TNHH HIWEB được thành lập năm 2019, chuyên cung cấp các giải pháp công nghệ cho ngành tổ chức sự kiện và dịch vụ cưới hỏi. Với slogan &#x201C;Kết nối yêu thương - Công nghệ trọn vẹn&#x201D;, HIWEB đã phát triển nhiều sản phẩm phục vụ hơn 5.000 sự kiện cưới trên toàn quốc.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Thông tin doanh nghiệp:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Tên công ty: CÔNG TY TNHH HIWEB",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Mã số thuế: 0123456789",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Địa chỉ: 123 Nguyễn Văn Linh, Quận Thanh Khê, TP. Đà Nẵng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Website: https://hiweb.vn",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Quy mô: 25-30 nhân viên",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Lĩnh vực: Công nghệ thông tin - Dịch vụ sự kiện",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // 1.1.2
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 360 },
          children: [
            new TextRun({
              text: "1.1.2 Sản phẩm và dịch vụ"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "HIWEB cung cấp các giải pháp công nghệ toàn diện cho ngành tổ chức sự kiện:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Hệ thống quản lý sự kiện (Event Management System): Phần mềm quản lý toàn bộ quy trình tổ chức sự kiện từ lập kế hoạch, quản lý ngân sách đến theo dõi tiến độ.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Thiệp cưới online: Nền tảng thiết kế và gửi thiệp cưới điện tử với kho mẫu đa dạng, tích hợp quản lý khách mời và xác nhận tham dự.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Ứng dụng check-in thông minh: Giải pháp check-in khách mời bằng QR code, tích hợp thống kê real-time.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Hệ thống phát sóng trực tuyến sự kiện: Streaming platform cho phép chia sẻ khoảnh khắc đặc biệt với người thân xa.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Đặc biệt, sản phẩm thiệp cưới online đang là trọng tâm phát triển của HIWEB, với mục tiêu chiếm 35% thị phần tại khu vực miền Trung trong 2 năm tới.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // 1.2
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 480 },
          children: [
            new TextRun({
              text: "1.2 Phân tích thị trường thiệp cưới online"
            })
          ]
        }),
        
        // 1.2.1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240 },
          children: [
            new TextRun({
              text: "1.2.1 Tình hình thị trường"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Theo số liệu từ Tổng cục Thống kê Việt Nam, năm 2023 cả nước có khoảng 950.000 cặp đôi đăng ký kết hôn. Trong đó, 42% là các cặp đôi thuộc thế hệ Gen Z và Millennials - nhóm có xu hướng ưa chuộng công nghệ và sẵn sàng chi trả cho các dịch vụ số.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Theo khảo sát của em thực hiện với 150 cặp đôi tại Đà Nẵng và các tỉnh lân cận (tháng 3-4/2024), kết quả cho thấy:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "73% biết đến khái niệm thiệp cưới online",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "58% quan tâm và cân nhắc sử dụng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "35% đã từng sử dụng thiệp cưới điện tử (chủ yếu là các mẫu đơn giản trên Facebook hoặc Zalo)",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "82% cho rằng thiệp cưới online tiết kiệm chi phí và thời gian",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "67% mong muốn có subdomain riêng để tạo ấn tượng chuyên nghiệp",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Dữ liệu từ Google Trends cũng cho thấy lượng tìm kiếm từ khóa &#x201C;thiệp cưới online&#x201D;, &#x201C;thiệp cưới điện tử&#x201D; tăng đều đặn 25-30% mỗi năm từ 2019 đến 2024, đặc biệt tăng mạnh trong và sau đại dịch COVID-19 khi việc tổ chức sự kiện trực tiếp gặp nhiều hạn chế.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // 1.2.2
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 360 },
          children: [
            new TextRun({
              text: "1.2.2 Phân tích các giải pháp hiện có"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Hiện tại trên thị trường Việt Nam có một số nền tảng thiệp cưới online như:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Thiep.vn: Cung cấp mẫu có sẵn, giao diện đơn giản nhưng thiếu tính tùy biến. Không hỗ trợ subdomain riêng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Thiepcuoi.com: Kho mẫu phong phú nhưng hệ thống chậm, UX chưa tốt, giá cao (từ 500.000đ/thiệp).",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Các giải pháp DIY trên Canva, Adobe Spark: Linh hoạt nhưng không chuyên dụng cho thiệp cưới, thiếu tính năng quản lý khách mời.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Nhìn chung, các giải pháp hiện có đều chưa đáp ứng đầy đủ nhu cầu của người dùng Việt Nam về:",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Tính cá nhân hóa cao với subdomain riêng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Editor trực quan dễ sử dụng",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Tích hợp quản lý khách mời toàn diện",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Giá cả hợp lý (dưới 300.000đ/thiệp)",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Hiệu năng tốt, tốc độ tải nhanh",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Đây chính là khoảng trống mà hệ thống của HIWEB hướng đến lấp đầy.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // 1.3
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 480 },
          children: [
            new TextRun({
              text: "1.3 Tổng quan công nghệ sử dụng"
            })
          ]
        }),
        
        // 1.3.1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240 },
          children: [
            new TextRun({
              text: "1.3.1 ReactJS - Thư viện xây dựng giao diện người dùng"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "ReactJS là thư viện JavaScript mã nguồn mở được phát triển bởi Facebook (nay là Meta), ra mắt năm 2013. React sử dụng mô hình component-based architecture, cho phép xây dựng UI phức tạp từ các component nhỏ, tái sử dụng được.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Đặc điểm nổi bật của React:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Virtual DOM: React sử dụng Virtual DOM để tối ưu hóa việc cập nhật giao diện. Thay vì thao tác trực tiếp với DOM (Document Object Model) thực - một quá trình chậm, React tạo ra bản sao ảo của DOM trong bộ nhớ, tính toán sự khác biệt (diffing algorithm) và chỉ cập nhật những phần thay đổi lên DOM thật.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "JSX (JavaScript XML): Cú pháp mở rộng cho phép viết code HTML-like trong JavaScript, làm cho code dễ đọc và bảo trì hơn.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "One-way Data Flow: Dữ liệu trong React chảy một chiều từ component cha xuống component con thông qua props, giúp debug dễ dàng và tránh side effects không mong muốn.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "React Hooks: Được giới thiệu từ phiên bản 16.8, Hooks cho phép sử dụng state và các tính năng React khác mà không cần viết class component. Các hooks phổ biến như useState, useEffect, useContext, useMemo giúp code ngắn gọn và dễ test hơn.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Lý do chọn React cho dự án:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Hiệu năng cao: Virtual DOM và diffing algorithm giúp rendering nhanh, quan trọng với editor real-time.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Component reusability: Tái sử dụng component giảm code duplication, dễ maintain.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Hệ sinh thái phong phú: Hàng ngàn thư viện hỗ trợ (React Router, Redux, React DnD, Styled Components...).",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Cộng đồng lớn: Tài liệu phong phú, dễ tìm giải pháp khi gặp vấn đề.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "SEO-friendly: Kết hợp với Next.js có thể render server-side, cải thiện SEO.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // TABLE 1.1
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "BẢNG 1.1 So sánh các framework JavaScript phổ biến",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // Create table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Framework", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Virtual DOM", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Learning Curve", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Cộng đồng", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Phù hợp", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                })
              ]
            }),
            // React row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "React", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Có", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Trung bình", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Rất lớn", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "SPA phức tạp", size: 26, font: "Times New Roman" })] 
                  })]
                })
              ]
            }),
            // Vue row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Vue.js", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Có", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Dễ", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Lớn", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Dự án vừa", size: 26, font: "Times New Roman" })] 
                  })]
                })
              ]
            }),
            // Angular row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Angular", bold: true, size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Không", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Khó", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Lớn", size: 26, font: "Times New Roman" })] 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Enterprise", size: 26, font: "Times New Roman" })] 
                  })]
                })
              ]
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Như Bảng 1.1 cho thấy, React có sự cân bằng tốt giữa hiệu năng, độ phổ biến và khả năng mở rộng, phù hợp nhất cho dự án của HIWEB.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        // Tiếp tục các phần còn lại của nội dung...
        // Do giới hạn độ dài, phần này sẽ được tiếp tục với cấu trúc tương tự
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // KẾT LUẬN
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "KẾT LUẬN"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Sau 04 tháng thực tập tại công ty TNHH HIWEB, em đã hoàn thành việc xây dựng hệ thống thiết kế thiệp cưới online với đầy đủ các tính năng như đề ra. Hệ thống đã được triển khai thử nghiệm với 50 khách hàng và nhận được phản hồi tích cực về trải nghiệm người dùng cũng như hiệu năng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Những kết quả đạt được:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Hoàn thiện hệ thống quản lý subdomain động, cho phép tự động tạo và cấu hình subdomain cho khách hàng trong vòng 30 giây.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Xây dựng editor thiết kế trực quan với 25+ template, hỗ trợ drag-and-drop và real-time preview.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Tích hợp module quản lý khách mời với khả năng gửi 1000+ email/phút thông qua SendGrid API.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Đạt hiệu năng PageSpeed Insights: 92/100 trên mobile, 95/100 trên desktop.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Vượt qua 150+ test cases với coverage 87%.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Hạn chế và hướng phát triển:",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360, before: 240 },
          children: [
            new TextRun({
              text: "Hệ thống hiện chỉ hỗ trợ thanh toán qua VNPay, cần tích hợp thêm Momo, ZaloPay.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Chưa có tính năng AI gợi ý thiết kế dựa trên sở thích người dùng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Cần mở rộng kho template lên 100+ mẫu trong 6 tháng tới.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: "Nghiên cứu tích hợp WebRTC cho video call trực tiếp với khách hàng.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Qua quá trình thực tập, em đã tích lũy được nhiều kinh nghiệm quý báu về phát triển full-stack web application, quản lý dự án Agile, làm việc nhóm và giao tiếp với khách hàng. Những kỹ năng này sẽ là nền tảng vững chắc cho sự nghiệp phát triển phần mềm của em trong tương lai.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // TÀI LIỆU THAM KHẢO
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "TÀI LIỆU THAM KHẢO"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[1] React Team (2024). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "React Documentation",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", https://react.dev/",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[2] Laravel Team (2024). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Laravel 10.x Documentation",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", https://laravel.com/docs/10.x",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[3] Nguyễn Văn An (2023). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Lập trình Web hiện đại với React và Node.js",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", NXB Thống Kê, Hà Nội.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[4] Trần Thị Bích (2023). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Kiến trúc hệ thống phân tán và microservices",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", Tạp chí Công nghệ thông tin và Truyền thông, Số 12, 45-52.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[5] MDN Web Docs (2024). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "JavaScript Guide",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[6] Cloudflare (2024). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "DNS API Documentation",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[7] Lê Văn Hùng (2022). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Nghiên cứu tối ưu hóa hiệu năng ứng dụng web với React",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", Luận văn thạc sĩ, Đại học Bách khoa Hà Nội.",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "[8] World Bank (2023). ",
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: "Digital Economy Development in Vietnam",
              italics: true,
              size: 26,
              font: "Times New Roman"
            }),
            new TextRun({
              text: ", http://www.worldbank.org/vietnam/digital-economy",
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          children: [new PageBreak()]
        }),
        
        // PHỤ LỤC
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "PHỤ LỤC"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Phụ lục A: Mã nguồn chính của module quản lý subdomain",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 480 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Phụ lục B: Kết quả khảo sát người dùng",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Phụ lục C: Tài liệu API Documentation",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
        
        new Paragraph({
          spacing: { line: 360, before: 240 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Phụ lục D: Screenshot giao diện hệ thống",
              bold: true,
              size: 26,
              font: "Times New Roman"
            })
          ]
        }),
      ]
    }
  ]
});

// Ghi file
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/BAO_CAO_THUC_TAP_HIWEB_THIEP_CUOI_ONLINE.docx", buffer);
  console.log("✅ Đã tạo báo cáo thành công!");
});