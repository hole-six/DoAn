const fs = require('fs')
const path = require('path')

const outPath = path.join(process.cwd(), 'postman', 'EffortIT_Runtime_API_Coder.postman_collection.json')

function lines(...parts) {
  return parts.filter(Boolean).join('\n')
}

function buildUrl(routePath, query = []) {
  const clean = routePath.replace(/^\/+/, '')
  const [pathname] = clean.split('?')
  const segments = pathname.split('/').filter(Boolean)
  const variables = segments
    .filter(seg => seg.startsWith(':'))
    .map(seg => ({ key: seg.slice(1), value: `{{${seg.slice(1)}}}` }))
  const pathSegments = segments.map(seg => (seg.startsWith(':') ? `:${seg.slice(1)}` : seg))
  const rawQuery = query.length
    ? `?${query.map(item => `${item.key}=${item.value}`).join('&')}`
    : ''
  return {
    raw: `{{base_url}}/${clean}${rawQuery}`,
    host: ['{{base_url}}'],
    path: pathSegments,
    ...(query.length ? { query } : {}),
    ...(variables.length ? { variable: variables } : {}),
  }
}

function rawBody(data) {
  return {
    mode: 'raw',
    raw: JSON.stringify(data, null, 2),
    options: { raw: { language: 'json' } },
  }
}

function formBody(items) {
  return {
    mode: 'formdata',
    formdata: items,
  }
}

function testSaveId(variableName) {
  return {
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: [
        'if (pm.response.code >= 200 && pm.response.code < 300) {',
        '  const data = pm.response.json();',
        '  const id = data?.duLieu?.id || data?.duLieu?._id || data?.id || data?._id;',
        `  if (id) pm.collectionVariables.set('${variableName}', String(id));`,
        '}',
      ],
    },
  }
}

function testSaveTokens() {
  return {
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: [
        'if (pm.response.code >= 200 && pm.response.code < 300) {',
        '  const data = pm.response.json();',
        '  const accessToken = data?.duLieu?.accessToken;',
        '  const refreshToken = data?.duLieu?.refreshToken;',
        "  if (accessToken) pm.collectionVariables.set('access_token', accessToken);",
        "  if (refreshToken) pm.collectionVariables.set('refresh_token', refreshToken);",
        '}',
      ],
    },
  }
}

function testSaveField(variableName, exprLines) {
  return {
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: exprLines.concat([`if (value) pm.collectionVariables.set('${variableName}', String(value));`]),
    },
  }
}

function req({ method, routePath, description, body, formdata, query, publicAuth = false, events = [] }) {
  const header = []
  if (body) header.push({ key: 'Content-Type', value: 'application/json' })
  const routeLabel = routePath.startsWith('/') ? routePath : `/${routePath}`
  return {
    name: `${method.toUpperCase()} ${routeLabel}`,
    request: {
      method: method.toUpperCase(),
      header,
      ...(publicAuth ? { auth: { type: 'noauth' } } : {}),
      url: buildUrl(routePath, query),
      ...(body ? { body: rawBody(body) } : {}),
      ...(formdata ? { body: formBody(formdata) } : {}),
      description,
    },
    ...(events.length ? { event: events } : {}),
  }
}

const groups = [
  {
    name: 'Health',
    item: [
      req({
        method: 'GET',
        routePath: 'trangthai',
        publicAuth: true,
        description: lines(
          'Purpose: API health check.',
          'Auth: public.',
          'Response: { thongBao, thoiGian }.'
        ),
      }),
    ],
  },
  {
    name: 'Auth',
    item: [
      req({
        method: 'POST',
        routePath: 'xacthuc/dang-nhap',
        publicAuth: true,
        body: { email: 'ungvien@example.com', matKhau: '123456', vaiTro: 'ung_vien' },
        description: lines(
          'Purpose: login by email/password.',
          'Auth: public.',
          'Fields:',
          '- email: string, required',
          '- matKhau: string, required',
          '- vaiTro: ung_vien | nha_tuyen_dung | admin, optional',
          'Response: { thongBao, duLieu } and token payload.'
        ),
        events: [testSaveTokens()],
      }),
      req({
        method: 'POST',
        routePath: 'xacthuc/dang-nhap-google',
        publicAuth: true,
        body: { credential: '{{google_credential}}', vaiTro: 'ung_vien' },
        description: lines(
          'Purpose: login by Google credential.',
          'Auth: public.',
          'Fields: credential required, vaiTro optional.',
          'Response: { thongBao, duLieu }.'
        ),
        events: [testSaveTokens()],
      }),
      req({
        method: 'POST',
        routePath: 'xacthuc/lam-moi-token',
        publicAuth: true,
        body: { refreshToken: '{{refresh_token}}' },
        description: lines(
          'Purpose: refresh access token.',
          'Auth: public, based on refresh token.',
          'Fields: refreshToken required.'
        ),
        events: [testSaveTokens()],
      }),
      req({
        method: 'POST',
        routePath: 'xacthuc/quen-mat-khau',
        publicAuth: true,
        body: { email: 'ungvien@example.com' },
        description: lines(
          'Purpose: start forgot password flow.',
          'Auth: public.',
          'Fields: email required.'
        ),
      }),
      req({
        method: 'GET',
        routePath: 'xacthuc/dat-lai-mat-khau/:token',
        publicAuth: true,
        description: lines(
          'Purpose: validate reset token.',
          'Auth: public.',
          'Params: token.'
        ),
      }),
      req({
        method: 'POST',
        routePath: 'xacthuc/dat-lai-mat-khau',
        publicAuth: true,
        body: { token: '{{reset_token}}', matKhau: '123456' },
        description: lines(
          'Purpose: reset password by token.',
          'Auth: public.',
          'Fields: token required, matKhau required min 6.'
        ),
      }),
      req({
        method: 'GET',
        routePath: 'xacthuc/toi',
        description: lines(
          'Purpose: get current account from bearer token.',
          'Auth: bearer token required.',
          'Response: { duLieu }.'
        ),
      }),
      req({
        method: 'POST',
        routePath: 'xacthuc/dang-xuat',
        description: lines(
          'Purpose: logout contract endpoint.',
          'Auth: optional in practice.',
          'Response: 204 No Content.'
        ),
      }),
    ],
  },
  {
    name: 'Users',
    item: [
      req({ method: 'GET', routePath: 'nguoidung', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list users. Auth: admin.' }),
      req({ method: 'GET', routePath: 'nguoidung/:ma', description: 'Purpose: get user by id. Auth: admin or owner.' }),
      req({
        method: 'POST', routePath: 'nguoidung', publicAuth: true,
        body: { email: 'candidate.new@example.com', matKhau: '123456', hoTen: 'Candidate New', soDienThoai: '0900000001', vaiTro: 'ung_vien' },
        description: lines('Purpose: create user account.', 'Auth: public self-register or admin create.', 'Fields: email, matKhau, hoTen required; soDienThoai optional; vaiTro optional.', 'Admin can also set trangThai.'),
        events: [testSaveId('user_id')],
      }),
      req({
        method: 'PATCH', routePath: 'nguoidung/:ma',
        body: { hoTen: 'Candidate Updated', soDienThoai: '0900000011', matKhau: '12345678' },
        description: lines('Purpose: update user.', 'Auth: admin or owner.', 'Admin can also update email, vaiTro, trangThai.'),
      }),
      req({ method: 'DELETE', routePath: 'nguoidung/:ma', description: 'Purpose: delete user. Auth: admin. Response: 204.' }),
    ],
  },
  {
    name: 'Candidates',
    item: [
      req({ method: 'GET', routePath: 'ungvien/dashboard', description: 'Purpose: candidate dashboard aggregate. Auth: login required.' }),
      req({ method: 'GET', routePath: 'ungvien/toi', description: 'Purpose: current candidate profile. Auth: login required.' }),
      req({ method: 'GET', routePath: 'ungvien', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list candidate profiles. Auth: login required.' }),
      req({ method: 'GET', routePath: 'ungvien/:ma', description: 'Purpose: candidate profile detail. Auth: login required.' }),
      req({
        method: 'POST', routePath: 'ungvien',
        body: {
          maNguoiDung: '{{user_id}}',
          ngaySinh: '1999-01-01',
          gioiTinh: 'nam',
          diaChi: 'Da Nang',
          anhDaiDien: 'https://example.com/avatar.jpg',
          tomTat: 'React developer with backend exposure.',
          kinhNghiem: 2,
          viTriMongMuon: 'Frontend Developer',
          mucLuongMongMuon: 18000000,
          kyNang: [
            { maKyNang: '{{skill_id}}', mucDo: 8, soNamKinhNghiem: 2 }
          ]
        },
        description: lines('Purpose: create candidate profile.', 'Auth: login required.', 'Required: maNguoiDung.', 'Optional: ngaySinh, gioiTinh, diaChi, anhDaiDien, tomTat, kinhNghiem, viTriMongMuon, mucLuongMongMuon, kyNang[].'),
        events: [testSaveId('candidate_id')],
      }),
      req({
        method: 'PATCH', routePath: 'ungvien/:ma',
        body: { tomTat: 'Updated summary', kinhNghiem: 3, viTriMongMuon: 'Senior Frontend Developer' },
        description: 'Purpose: update candidate profile. Auth: login required with ownership check.',
      }),
      req({ method: 'DELETE', routePath: 'ungvien/:ma', description: 'Purpose: delete candidate profile. Auth: login required with ownership check.' }),
    ],
  },
  {
    name: 'Candidate Profiles (CV)',
    item: [
      req({ method: 'GET', routePath: 'hosonangluc', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list CV profiles.' }),
      req({ method: 'GET', routePath: 'hosonangluc/:ma', description: 'Purpose: CV detail.' }),
      req({
        method: 'POST', routePath: 'hosonangluc',
        body: {
          maUngVien: '{{candidate_id}}',
          tieuDe: 'Frontend CV 2026',
          hoTenHienThi: 'Candidate New',
          chucDanh: 'Frontend Developer',
          soDienThoai: '0900000001',
          emailLienHe: 'candidate.new@example.com',
          github: 'https://github.com/example',
          portfolioUrl: 'https://portfolio.example.com',
          diaDiem: 'Da Nang',
          tomTatKinhNghiem: ['2 years React', 'REST API integration'],
          kyNangMem: ['Teamwork', 'Communication'],
          kyNangLapTrinh: [{ nhom: 'Frontend', muc: ['React', 'TypeScript', 'Tailwind'] }],
          hocVan: [{ tieuDe: 'Bachelor of IT', donVi: 'DUT', thoiGian: '2018-2022', moTa: 'Software engineering' }],
          kinhNghiemLam: [{ tieuDe: 'Frontend Developer', donVi: 'ABC Tech', thoiGian: '2023-2026', moTa: 'Build web apps' }],
          chungChi: [{ tieuDe: 'AWS CCP', donVi: 'AWS', thoiGian: '2025', moTa: 'Cloud basics' }],
          duAn: [{ tieuDe: 'Recruitment Platform', donVi: 'Internal', thoiGian: '2025', moTa: 'Candidate flow and dashboard' }],
          baiVietKyThuat: [{ nhan: 'Blog', url: 'https://blog.example.com/post-1' }],
          duAnChiTiet: [{ tenDuAn: 'Recruitment Platform', thoiGian: '2025-2026', viTri: 'Frontend', moTa: 'Portal for jobs', trachNhiem: ['Build UI', 'Integrate APIs'] }],
          fileCvTen: 'candidate-cv.pdf',
          fileCvLoai: 'application/pdf',
          fileCvPath: '{{uploaded_cv_file_path}}',
          fileCvText: 'Extracted text placeholder',
          fileCvTextStatus: 'ok',
          loaiHoSo: 'builder',
          anhDaiDien: '{{uploaded_cv_image_path}}',
          templateCv: 'modern',
          mauChinh: '#0e4d7d',
          mauPhu: '#1a6ba8',
          font: 'Roboto',
          markdownGoc: '# Candidate CV',
          ghiChuAi: 'Generated with AI assistance',
          cvChinh: true,
          congKhai: true
        },
        description: lines('Purpose: create CV profile.', 'Auth: login required.', 'Required: maUngVien, tieuDe.', 'Supports builder sections, uploaded PDF metadata, style config, public/private flags.'),
        events: [testSaveId('cv_id')],
      }),
      req({ method: 'PATCH', routePath: 'hosonangluc/:ma', body: { tieuDe: 'Frontend CV 2026 Updated', congKhai: false }, description: 'Purpose: update CV profile.' }),
      req({ method: 'DELETE', routePath: 'hosonangluc/:ma', description: 'Purpose: delete CV profile. Response: 204.' }),
      req({
        method: 'POST', routePath: 'hosonangluc/upload-anh',
        formdata: [{ key: 'anh', type: 'file', src: '' }],
        description: lines('Purpose: upload CV image/avatar.', 'Auth: ung_vien or admin.', 'Content-Type: multipart/form-data.', 'Field: anh (image, max 3 MB).'),
        events: [testSaveField('uploaded_cv_image_path', [
          'const data = pm.response.json();',
          'const value = data?.duLieu?.duongDan || data?.duLieu?.url;'
        ])],
      }),
      req({
        method: 'POST', routePath: 'hosonangluc/upload-file',
        formdata: [{ key: 'tep', type: 'file', src: '' }],
        description: lines('Purpose: upload raw CV PDF.', 'Auth: ung_vien or admin.', 'Content-Type: multipart/form-data.', 'Field: tep (PDF, max 10 MB).', 'Response also includes fileCvText and fileCvTextStatus.'),
        events: [testSaveField('uploaded_cv_file_path', [
          'const data = pm.response.json();',
          'const value = data?.duLieu?.duongDan || data?.duLieu?.fileCvPath || data?.duLieu?.url;'
        ])],
      }),
    ],
  },
  {
    name: 'Employers',
    item: [
      req({ method: 'GET', routePath: 'nhatuyendung', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], publicAuth: true, description: 'Purpose: list employers/companies. Public endpoint.' }),
      req({ method: 'GET', routePath: 'nhatuyendung/:ma', publicAuth: true, description: 'Purpose: employer/company detail. Public endpoint.' }),
      req({
        method: 'POST', routePath: 'nhatuyendung',
        body: {
          maNguoiDung: '{{user_id}}',
          tenCongTy: 'ABC Technology',
          maSoThue: '0400123456',
          moTa: 'Software outsourcing company',
          diaChi: 'Hai Chau, Da Nang',
          website: 'https://abc.example.com',
          logo: '{{uploaded_logo_path}}',
          quyMo: 120,
          nganh: 'Software Development',
          trangThaiDuyet: 'cho_duyet'
        },
        description: lines('Purpose: create employer/company profile.', 'Auth: used after employer registration.', 'Required: maNguoiDung, tenCongTy.', 'Admin/service may also set trangThaiDuyet.'),
        events: [testSaveId('company_id')],
      }),
      req({ method: 'PATCH', routePath: 'nhatuyendung/:ma', body: { tenCongTy: 'ABC Technology Updated', trangThaiDuyet: 'da_duyet' }, description: 'Purpose: update company profile or moderation status.' }),
      req({ method: 'DELETE', routePath: 'nhatuyendung/:ma', description: 'Purpose: delete company profile. Response: 204.' }),
      req({
        method: 'POST', routePath: 'nhatuyendung/upload-logo',
        formdata: [{ key: 'logo', type: 'file', src: '' }],
        description: lines('Purpose: upload company logo.', 'Content-Type: multipart/form-data.', 'Field: logo (image, max 3 MB).'),
        events: [testSaveField('uploaded_logo_path', [
          'const data = pm.response.json();',
          'const value = data?.duLieu?.duongDan || data?.duLieu?.url;'
        ])],
      }),
    ],
  },
  {
    name: 'Job Posts',
    item: [
      req({ method: 'GET', routePath: 'tintuyendung', publicAuth: true, query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list job posts. Public list with role-based filtering when token exists.' }),
      req({ method: 'GET', routePath: 'tintuyendung/:ma', publicAuth: true, description: 'Purpose: job post detail. Public if visible under business rules.' }),
      req({
        method: 'POST', routePath: 'tintuyendung',
        body: {
          maNhaTuyenDung: '{{company_id}}',
          tieuDe: 'Senior React Developer',
          yeuCauKinhNghiem: '2+ years React',
          diaChi: 'Da Nang',
          luongMin: 18000000,
          luongMax: 30000000,
          loaiHinh: 'toan_thoi_gian',
          capBac: 'senior',
          anhDaiDien: '{{uploaded_job_image_path}}',
          hanNop: '2026-12-31T17:00:00.000Z',
          soLuong: 2,
          moTa: 'Build and maintain frontend systems with React and TypeScript.',
          yeuCau: 'Strong React, TS, API integration, testing.',
          quyenLoi: 'Salary, insurance, hybrid work',
          kyNang: [
            { maKyNang: '{{skill_id}}', batBuoc: true }
          ]
        },
        description: lines('Purpose: create job post.', 'Auth: employer or admin.', 'Employer flow will auto-fill maNhaTuyenDung and force trangThai=cho_duyet.', 'Required: tieuDe, moTa, yeuCau.'),
        events: [testSaveId('job_id')],
      }),
      req({ method: 'PATCH', routePath: 'tintuyendung/:ma', body: { tieuDe: 'Senior React Developer Updated', quyenLoi: 'Updated benefits' }, description: 'Purpose: update job post. Auth: employer/admin with workflow restrictions.' }),
      req({ method: 'DELETE', routePath: 'tintuyendung/:ma', description: 'Purpose: delete job post. Auth: employer/admin. Response: 204.' }),
      req({ method: 'POST', routePath: 'tintuyendung/:ma/duyet', description: 'Purpose: approve job post. Auth: admin.' }),
      req({ method: 'POST', routePath: 'tintuyendung/:ma/tu-choi', description: 'Purpose: reject job post. Auth: admin.' }),
      req({ method: 'POST', routePath: 'tintuyendung/:ma/mo-lai', description: 'Purpose: reopen job post. Auth: employer/admin.' }),
      req({ method: 'POST', routePath: 'tintuyendung/:ma/tam-dong', description: 'Purpose: pause job post. Auth: employer/admin.' }),
      req({
        method: 'POST', routePath: 'tintuyendung/upload-anh',
        formdata: [{ key: 'anh', type: 'file', src: '' }],
        description: lines('Purpose: upload job image.', 'Content-Type: multipart/form-data.', 'Field: anh (image, max 5 MB).'),
        events: [testSaveField('uploaded_job_image_path', [
          'const data = pm.response.json();',
          'const value = data?.duLieu?.duongDan || data?.duLieu?.url;'
        ])],
      }),
    ],
  },
  {
    name: 'Saved Jobs',
    item: [
      req({ method: 'GET', routePath: 'viec-lam-da-luu', description: 'Purpose: list saved jobs for current candidate. Auth: ung_vien.' }),
      req({ method: 'POST', routePath: 'viec-lam-da-luu/:maTinTuyenDung', description: 'Purpose: save a job. Auth: ung_vien.' }),
      req({ method: 'DELETE', routePath: 'viec-lam-da-luu/:maTinTuyenDung', description: 'Purpose: unsave a job. Auth: ung_vien.' }),
    ],
  },
  {
    name: 'Skill Catalog',
    item: [
      req({ method: 'GET', routePath: 'danhmuckynang', publicAuth: true, query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '50' }], description: 'Purpose: list skill catalog. Public.' }),
      req({ method: 'GET', routePath: 'danhmuckynang/:ma', publicAuth: true, description: 'Purpose: skill detail. Public.' }),
      req({ method: 'POST', routePath: 'danhmuckynang', body: { tenKyNang: 'ReactJS', loaiKyNang: 'frontend' }, description: 'Purpose: create skill. Runtime route exists; use admin token in practice.', events: [testSaveId('skill_id')] }),
      req({ method: 'PATCH', routePath: 'danhmuckynang/:ma', body: { tenKyNang: 'React', loaiKyNang: 'frontend' }, description: 'Purpose: update skill.' }),
      req({ method: 'DELETE', routePath: 'danhmuckynang/:ma', description: 'Purpose: delete skill.' }),
    ],
  },
  {
    name: 'Applications',
    item: [
      req({ method: 'GET', routePath: 'hosoungtuyen', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list applications. Auth: login required; data scope depends on role.' }),
      req({ method: 'GET', routePath: 'hosoungtuyen/:ma', description: 'Purpose: application detail.' }),
      req({
        method: 'POST', routePath: 'hosoungtuyen',
        body: { maUngVien: '{{candidate_id}}', maTinTuyenDung: '{{job_id}}', maHoSoNangLuc: '{{cv_id}}', thuXinViec: 'I want to join your team.', diemKhopKyNang: 80, trangThai: 'da_nop' },
        description: 'Purpose: raw CRUD create application. For product flow prefer /hosoungtuyen/ung-tuyen.',
        events: [testSaveId('application_id')],
      }),
      req({ method: 'PATCH', routePath: 'hosoungtuyen/:ma', body: { thuXinViec: 'Updated cover letter' }, description: 'Purpose: update non-business application fields. trangThai and diemKhopKyNang are blocked.' }),
      req({ method: 'DELETE', routePath: 'hosoungtuyen/:ma', description: 'Purpose: delete application.' }),
      req({
        method: 'POST', routePath: 'hosoungtuyen/ung-tuyen',
        body: { maTinTuyenDung: '{{job_id}}', maHoSoNangLuc: '{{cv_id}}', thuXinViec: 'I am interested in this position.' },
        description: 'Purpose: apply with selected CV. Auth: ung_vien. This is the main business endpoint.',
        events: [testSaveId('application_id')],
      }),
      req({
        method: 'POST', routePath: 'hosoungtuyen/ung-tuyen-nhanh',
        body: { maTinTuyenDung: '{{job_id}}', thuXinViec: 'Quick apply from mobile.' },
        description: 'Purpose: quick apply without explicit CV field in request. Auth: ung_vien.',
        events: [testSaveId('application_id')],
      }),
      req({ method: 'POST', routePath: 'hosoungtuyen/:ma/rut', body: { ghiChu: 'I accepted another offer.' }, description: 'Purpose: withdraw application. Auth: ung_vien.' }),
      req({ method: 'POST', routePath: 'hosoungtuyen/:ma/xem', description: 'Purpose: mark application as viewed. Auth: nha_tuyen_dung.' }),
      req({ method: 'POST', routePath: 'hosoungtuyen/:ma/danh-gia', body: { trangThai: 'dang_xet_duyet', ghiChu: 'Good profile', giaiDoanTuChoi: 'sang_loc' }, description: 'Purpose: employer review application. Auth: nha_tuyen_dung.' }),
      req({
        method: 'POST', routePath: 'hosoungtuyen/:ma/moi-phong-van',
        body: { thoiGianBatDau: '2026-07-10T09:00:00.000Z', thoiGianKetThuc: '2026-07-10T10:00:00.000Z', diaChi: '123 Nguyen Van Linh, Da Nang', hinhThuc: 'online', linkHop: 'https://meet.example.com/abc', ghiChu: 'Bring portfolio examples' },
        description: 'Purpose: create interview from application. Auth: nha_tuyen_dung. Main interview creation endpoint.',
        events: [testSaveId('interview_id')],
      }),
      req({ method: 'POST', routePath: 'hosoungtuyen/:ma/chuyen-trang-thai', body: { trangThai: 'dat' }, description: 'Purpose: runtime stub that always returns 409. Included for completeness only.' }),
    ],
  },
  {
    name: 'Application History',
    item: [
      req({ method: 'GET', routePath: 'lichsuhosoungtuyen', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list application history records.' }),
      req({ method: 'GET', routePath: 'lichsuhosoungtuyen/:ma', description: 'Purpose: application history detail.' }),
      req({ method: 'POST', routePath: 'lichsuhosoungtuyen', body: { maHoSoUngTuyen: '{{application_id}}', trangThaiCu: 'da_nop', trangThaiMoi: 'da_xem', ghiChu: 'Manual audit note', maNguoiDung: '{{user_id}}', thoiGian: '2026-06-27T08:00:00.000Z' }, description: 'Purpose: create history record.' }),
      req({ method: 'PATCH', routePath: 'lichsuhosoungtuyen/:ma', body: { ghiChu: 'Updated audit note' }, description: 'Purpose: update history record.' }),
      req({ method: 'DELETE', routePath: 'lichsuhosoungtuyen/:ma', description: 'Purpose: delete history record.' }),
    ],
  },
  {
    name: 'Interviews',
    item: [
      req({ method: 'GET', routePath: 'lichphongvan', query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list interviews.' }),
      req({ method: 'GET', routePath: 'lichphongvan/:ma', description: 'Purpose: interview detail.' }),
      req({ method: 'POST', routePath: 'lichphongvan', body: { maHoSoUngTuyen: '{{application_id}}', thoiGianBatDau: '2026-07-10T09:00:00.000Z' }, description: 'Purpose: runtime stub. Backend returns 409 and asks to use /hosoungtuyen/:ma/moi-phong-van.' }),
      req({ method: 'PATCH', routePath: 'lichphongvan/:ma', body: { diaChi: 'Updated room', ghiChu: 'Only non-business fields here' }, description: 'Purpose: update non-business interview fields. trangThai/ketQua are blocked.' }),
      req({ method: 'DELETE', routePath: 'lichphongvan/:ma', description: 'Purpose: delete interview. Auth: employer/admin.' }),
      req({ method: 'POST', routePath: 'lichphongvan/:ma/xac-nhan', description: 'Purpose: candidate confirms interview schedule.' }),
      req({ method: 'POST', routePath: 'lichphongvan/:ma/doi-lich', body: { ghiChu: 'Need to move to afternoon.' }, description: 'Purpose: candidate requests reschedule.' }),
      req({ method: 'PATCH', routePath: 'lichphongvan/:ma/cap-nhat', body: { thoiGianBatDau: '2026-07-10T14:00:00.000Z', thoiGianKetThuc: '2026-07-10T15:00:00.000Z', diaChi: 'Meeting Room B', hinhThuc: 'offline', ghiChu: 'Updated by employer' }, description: 'Purpose: employer updates interview schedule.' }),
      req({ method: 'POST', routePath: 'lichphongvan/:ma/hoan-thanh', body: { ketQua: 'dat', ghiChu: 'Strong communication and technical fit.' }, description: 'Purpose: employer completes interview and sets result.' }),
      req({ method: 'POST', routePath: 'lichphongvan/:ma/huy', body: { ghiChu: 'Cancelled due to schedule conflict.' }, description: 'Purpose: cancel interview.' }),
    ],
  },
  {
    name: 'Notifications',
    item: [
      req({ method: 'GET', routePath: 'thongbao', query: [{ key: 'limit', value: '30' }, { key: 'sort', value: '-ngayTao' }], description: 'Purpose: list notifications for current user.' }),
      req({ method: 'GET', routePath: 'thongbao/dem-chua-doc', description: 'Purpose: unread notification count.' }),
      req({ method: 'GET', routePath: 'thongbao/:ma', description: 'Purpose: notification detail.' }),
      req({ method: 'POST', routePath: 'thongbao', body: { loai: 'he_thong', tieuDe: 'System notification', noiDung: 'This is a manual notification seed.', lienKet: '/quan-tri/thong-bao', mucDoUuTien: 'trung_binh' }, description: 'Purpose: create notification manually.' }),
      req({ method: 'PATCH', routePath: 'thongbao/:ma', body: { daDoc: true }, description: 'Purpose: update notification.' }),
      req({ method: 'PATCH', routePath: 'thongbao/:id/danh-dau-da-doc', description: 'Purpose: mark one notification as read.' }),
      req({ method: 'POST', routePath: 'thongbao/danh-dau-tat-ca-da-doc', description: 'Purpose: mark all notifications as read.' }),
      req({ method: 'DELETE', routePath: 'thongbao/:ma', description: 'Purpose: delete notification.' }),
    ],
  },
  {
    name: 'Messaging',
    item: [
      req({ method: 'GET', routePath: 'tinnhan/admin-support/contacts', description: 'Purpose: admin support contact list.' }),
      req({ method: 'GET', routePath: 'tinnhan/cuoc-tro-chuyen', description: 'Purpose: list conversations.' }),
      req({
        method: 'POST', routePath: 'tinnhan/cuoc-tro-chuyen',
        body: { nguoiNhan: '{{user_id}}', loai: 'admin_support', maHoSoUngTuyen: '{{application_id}}', maTinTuyenDung: '{{job_id}}' },
        description: 'Purpose: get or create conversation. Runtime field is nguoiNhan, not nguoiNhanId.',
        events: [testSaveId('conversation_id')],
      }),
      req({ method: 'GET', routePath: 'tinnhan/cuoc-tro-chuyen/:id', description: 'Purpose: conversation detail.' }),
      req({ method: 'POST', routePath: 'tinnhan/cuoc-tro-chuyen/:id/danh-dau-da-doc', description: 'Purpose: mark conversation as read.' }),
      req({ method: 'GET', routePath: 'tinnhan/nhom-cong-dong', description: 'Purpose: list community groups.' }),
      req({ method: 'POST', routePath: 'tinnhan/nhom-cong-dong/tham-gia/:id', description: 'Purpose: join community group.' }),
      req({ method: 'GET', routePath: 'tinnhan/cuoc-tro-chuyen/:id/tin-nhan', query: [{ key: 'limit', value: '50' }], description: 'Purpose: list messages in a conversation. Runtime FE uses limit, not page-based params.' }),
      req({
        method: 'POST', routePath: 'tinnhan/cuoc-tro-chuyen/:id/tin-nhan',
        body: { noiDung: 'Hello from Postman collection.', traloiTinNhan: '{{message_id}}' },
        description: 'Purpose: send message. traloiTinNhan optional.',
        events: [testSaveId('message_id')],
      }),
      req({ method: 'DELETE', routePath: 'tinnhan/tin-nhan/:maTinNhan', description: 'Purpose: soft delete message.' }),
      req({ method: 'POST', routePath: 'tinnhan/tin-nhan/:maTinNhan/phan-ung', body: { emoji: 'like' }, description: 'Purpose: react to a message. Runtime field is emoji.' }),
    ],
  },
  {
    name: 'Company Reviews',
    item: [
      req({ method: 'GET', routePath: 'danhgiacongty', publicAuth: true, query: [{ key: 'trang', value: '1' }, { key: 'soPhanTu', value: '20' }], description: 'Purpose: list company reviews. Public.' }),
      req({ method: 'GET', routePath: 'danhgiacongty/toi', description: 'Purpose: current candidate reviews.' }),
      req({
        method: 'POST', routePath: 'danhgiacongty/tu-ho-so/:maHoSoUngTuyen',
        body: { diem: 5, noiDung: 'Professional interview process and clear communication throughout.', anDanh: false },
        description: 'Purpose: create review from application after interview result exists.',
        events: [testSaveId('review_id')],
      }),
      req({ method: 'GET', routePath: 'danhgiacongty/:ma', publicAuth: true, description: 'Purpose: review detail. Public.' }),
      req({ method: 'POST', routePath: 'danhgiacongty', body: { maUngVien: '{{candidate_id}}', maNhaTuyenDung: '{{company_id}}', maHoSoUngTuyen: '{{application_id}}', diem: 5, noiDung: 'Strong company culture.', anDanh: false, daDuyet: true }, description: 'Purpose: create review manually. Auth: admin.', events: [testSaveId('review_id')] }),
      req({ method: 'PATCH', routePath: 'danhgiacongty/:ma', body: { daDuyet: true, noiDung: 'Approved review content.' }, description: 'Purpose: moderate or update review. Auth: admin.' }),
      req({ method: 'DELETE', routePath: 'danhgiacongty/:ma', description: 'Purpose: delete review. Auth: admin.' }),
    ],
  },
  {
    name: 'AI',
    item: [
      req({ method: 'POST', routePath: 'ai/chatbot', publicAuth: true, body: { cauHoi: 'Tim viec React Developer tai Da Nang', lichSu: [], boLoc: { diaDiem: 'Da Nang' } }, description: 'Purpose: public AI chatbot. Backend reads cauHoi or message.' }),
      req({ method: 'GET', routePath: 'ai/goi-y-viec-lam', description: 'Purpose: get candidate job suggestions. Auth: ung_vien. Runtime method is GET.' }),
      req({ method: 'POST', routePath: 'ai/goi-y-viec-lam/chay-ngay', description: 'Purpose: recompute job suggestions now. Auth: ung_vien.' }),
      req({ method: 'POST', routePath: 'ai/goi-y-viec-lam/gui-email', description: 'Purpose: send suggestion email to current candidate. Auth: ung_vien.' }),
      req({ method: 'POST', routePath: 'ai/goi-y-cv', body: { cvText: 'Experienced React developer with TypeScript and API integration.', targetRole: 'Frontend Developer' }, description: 'Purpose: AI-assisted CV suggestion/fill endpoint. Auth: ung_vien.' }),
      req({ method: 'GET', routePath: 'ai/goi-y-viec-lam/admin/preview', query: [{ key: 'diemToiThieu', value: '55' }, { key: 'soJobMoiEmail', value: '5' }], description: 'Purpose: preview admin bulk recommendation email campaign. Auth: admin.' }),
      req({ method: 'POST', routePath: 'ai/goi-y-viec-lam/admin/gui-email-hang-loat', body: { diemToiThieu: 55, soJobMoiEmail: 5 }, description: 'Purpose: trigger admin bulk recommendation email campaign. Auth: admin.' }),
    ],
  },
  {
    name: 'Admin Alerts',
    item: [
      req({ method: 'GET', routePath: 'canhbaoquantri', description: 'Purpose: get admin alert snapshot. Auth: admin.' }),
      req({ method: 'POST', routePath: 'canhbaoquantri/tinh-lai', description: 'Purpose: recompute admin alert snapshot now. Auth: admin.' }),
    ],
  },
  {
    name: 'Deploy',
    item: [
      req({ method: 'GET', routePath: 'deploy/sitemap.xml', publicAuth: true, description: 'Purpose: generate runtime sitemap XML. Public endpoint.' }),
    ],
  },
]

const collection = {
  info: {
    name: 'EffortIT Runtime API - Coder Collection',
    description: [
      'Runtime-aligned Postman collection generated from backend routes.',
      'Source of truth: backend/src/dinhtuyen/apitong.ts and backend/src/modules/*/*.dinhtuyen.ts.',
      'This collection intentionally uses coder-facing names: METHOD /path.',
      'Icons removed. Request bodies were expanded to be practical seed/insert examples.',
      'When Postman legacy files differ from runtime, this collection follows backend runtime.',
    ].join('\n'),
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'base_url', value: 'http://localhost:5000/api' },
    { key: 'access_token', value: '' },
    { key: 'refresh_token', value: '' },
    { key: 'google_credential', value: '' },
    { key: 'reset_token', value: '' },
    { key: 'user_id', value: '' },
    { key: 'candidate_id', value: '' },
    { key: 'company_id', value: '' },
    { key: 'job_id', value: '' },
    { key: 'cv_id', value: '' },
    { key: 'application_id', value: '' },
    { key: 'interview_id', value: '' },
    { key: 'skill_id', value: '' },
    { key: 'review_id', value: '' },
    { key: 'notification_id', value: '' },
    { key: 'conversation_id', value: '' },
    { key: 'message_id', value: '' },
    { key: 'ma', value: '' },
    { key: 'id', value: '' },
    { key: 'token', value: '' },
    { key: 'maTinTuyenDung', value: '' },
    { key: 'maTinNhan', value: '' },
    { key: 'maHoSoUngTuyen', value: '' },
    { key: 'uploaded_logo_path', value: '' },
    { key: 'uploaded_job_image_path', value: '' },
    { key: 'uploaded_cv_image_path', value: '' },
    { key: 'uploaded_cv_file_path', value: '' },
  ],
  auth: {
    type: 'bearer',
    bearer: [
      { key: 'token', value: '{{access_token}}', type: 'string' },
    ],
  },
  item: groups,
}

fs.writeFileSync(outPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')
console.log(`Wrote ${outPath}`)
