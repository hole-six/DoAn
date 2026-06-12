export type HomeJob = {
  id: string
  tieuDe: string
  congTy: string
  logo: string
  diaDiem: string
  luong: string
  loaiViec: string
  kyNang: string[]
  badge: string | null
  ngayDang?: string
  hanNop?: string
  hanNopConLai?: string
  featured: boolean
}

export type HomeCompany = {
  id: string
  ten: string
  logo: string
  logoBg: string
  diaDiem: string
  soViec: number
  kyNang: string[]
}

export type TrangChuLyDoIcon = 'zap' | 'shield' | 'globe' | 'check' | 'trending' | 'award'

export const thongDiepChayNgang =
  'Hơn 12.000 việc làm IT đang tuyển · Lương Backend Senior lên đến 80 triệu · ' +
  'Mở CV ẩn danh để nhà tuyển dụng tìm bạn · Phỏng vấn thực tế mỗi tuần · ' +
  'Top công ty công nghệ đang tuyển gấp · Nộp hồ sơ chỉ 1 click · '

export const trangChuFallbackCompanies: HomeCompany[] = [
  {
    id: '1',
    ten: 'Samsung Electronics HCMC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    logoBg: '#000000',
    diaDiem: 'TP Hồ Chí Minh',
    soViec: 2,
    kyNang: ['Embedded', 'Android', 'ReactJS', 'OOP', 'C++', 'Python'],
  },
  {
    id: '2',
    ten: 'FPT Software',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'Hà Nội · TP.HCM · Đà Nẵng',
    soViec: 142,
    kyNang: ['Java', 'React', '.NET', 'Python', 'AWS', 'DevOps'],
  },
  {
    id: '3',
    ten: 'Viettel Group',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Viettel_logo_2021.svg',
    logoBg: '#ffffff',
    diaDiem: 'Hà Nội · TP Hồ Chí Minh',
    soViec: 7,
    kyNang: ['JavaScript', 'Python', 'PHP', 'UI/UX', 'MySQL', 'MVC'],
  },
  {
    id: '4',
    ten: 'VNG Corporation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VNG_Corporation_logo.svg/200px-VNG_Corporation_logo.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 87,
    kyNang: ['Go', 'Kubernetes', 'React', 'AI/ML', 'gRPC', 'Redis'],
  },
  {
    id: '5',
    ten: 'Tiki',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tiki_logo.svg/200px-Tiki_logo.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 63,
    kyNang: ['Node.js', 'Vue', 'AWS', 'Data', 'Kafka', 'Spark'],
  },
  {
    id: '6',
    ten: 'MoMo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_MoMo_Square.svg/200px-Logo_MoMo_Square.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 55,
    kyNang: ['Kotlin', 'Swift', 'Spring', 'Kafka', 'iOS', 'Android'],
  },
]

export const trangChuFallbackJobs: HomeJob[] = [
  {
    id: '1',
    tieuDe: '[Đà Nẵng] Senior Backend Engineer (Node.js)',
    congTy: 'VNEXT SOFTWARE',
    logo: 'https://placehold.co/80x80/fff3e8/f97316?text=VN',
    diaDiem: 'Tại văn phòng · Đà Nẵng',
    luong: '30.000.000 - 45.000.000 VND',
    loaiViec: 'backend',
    kyNang: ['Node.js', 'PostgreSQL', 'Redis'],
    badge: 'SUPER HOT',
    ngayDang: '1 ngày trước',
    featured: true,
  },
  {
    id: '2',
    tieuDe: 'Frontend Engineer React/TypeScript',
    congTy: 'VisionTech Global',
    logo: 'https://placehold.co/80x80/e0f2fe/2563eb?text=VT',
    diaDiem: 'Làm từ xa · TP Hồ Chí Minh',
    luong: '25.000.000 - 38.000.000 VND',
    loaiViec: 'frontend',
    kyNang: ['React', 'TypeScript', 'Tailwind CSS'],
    badge: 'SUPER HOT',
    ngayDang: '3 ngày trước',
    featured: true,
  },
  {
    id: '3',
    tieuDe: '[Remote] DevOps Engineer (AWS/Kubernetes)',
    congTy: 'Edge8',
    logo: 'https://placehold.co/80x80/111827/ffffff?text=E8',
    diaDiem: 'Làm từ xa · Hà Nội',
    luong: '35.000.000 - 55.000.000 VND',
    loaiViec: 'devops',
    kyNang: ['AWS', 'Kubernetes', 'CI/CD'],
    badge: null,
    ngayDang: '4 ngày trước',
    featured: false,
  },
  {
    id: '4',
    tieuDe: 'Senior Full-stack Developer (React/Node.js)',
    congTy: 'CodeLink',
    logo: 'https://placehold.co/80x80/ecfeff/0891b2?text=CL',
    diaDiem: 'Linh hoạt · TP Hồ Chí Minh',
    luong: '32.000.000 - 48.000.000 VND',
    loaiViec: 'fullstack',
    kyNang: ['React', 'Node.js', 'MongoDB'],
    badge: 'HOT',
    ngayDang: '13 ngày trước',
    featured: false,
  },
]

export const trangChuLyDo: Array<{ icon: TrangChuLyDoIcon; tieu: string; mo: string }> = [
  { icon: 'zap', tieu: 'Ứng tuyển siêu nhanh', mo: 'Chỉ 1 click để nộp hồ sơ. Hệ thống tự điền thông tin từ CV của bạn.' },
  { icon: 'shield', tieu: 'CV ẩn danh bảo mật', mo: 'Bật chế độ tìm việc thụ động. Nhà tuyển dụng tìm bạn mà không lộ danh tính.' },
  { icon: 'globe', tieu: 'Mạng lưới rộng khắp', mo: 'Kết nối với các công ty từ startup đến tập đoàn công nghệ.' },
  { icon: 'check', tieu: 'Xác thực công ty', mo: 'Nhà tuyển dụng được kiểm duyệt để ứng viên yên tâm ứng tuyển.' },
  { icon: 'trending', tieu: 'Dữ liệu tuyển dụng rõ ràng', mo: 'Tin tuyển dụng trình bày rõ mức lương, kỹ năng, hình thức và quyền lợi.' },
  { icon: 'award', tieu: 'Hỗ trợ phỏng vấn', mo: 'Gợi ý câu hỏi phỏng vấn, cách viết CV và lộ trình chuẩn bị cho từng vai trò IT.' },
]

export const trangChuTechCategories = [
  {
    category: 'Frontend',
    techs: [
      { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
      { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    ],
  },
  {
    category: 'Backend',
    techs: [
      { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
      { name: 'Go', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' },
      { name: '.NET', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
    ],
  },
  {
    category: 'DevOps & Cloud',
    techs: [
      { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
      { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
      { name: 'Jenkins', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg' },
      { name: 'Terraform', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg' },
    ],
  },
]

export const homeAiQuickPrompts = [
  'Tìm job React Đà Nẵng',
  'CV tôi hợp job nào?',
  'Công ty nào đang tuyển Backend?',
  'Lộ trình học để ứng tuyển Frontend?',
]
