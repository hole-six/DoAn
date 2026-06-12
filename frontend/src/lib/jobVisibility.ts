type PublicJobLike = {
  trangThai?: string | null
  hanNop?: string | Date | null
  nhaTuyenDung?: {
    trangThaiDuyet?: string | null
  } | null
}

export function isJobExpired(hanNop?: string | Date | null) {
  if (!hanNop) return false
  const deadline = new Date(hanNop)
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()
}

export function isPublicJobVisible(job?: PublicJobLike | null) {
  if (!job) return false
  return job.trangThai === 'dang_mo'
    && job.nhaTuyenDung?.trangThaiDuyet === 'da_duyet'
    && !isJobExpired(job.hanNop)
}
