import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wide text-slate-600">{label}</span>{children}{error && <span className="text-xs font-bold text-rose-600">{error}</span>}</label>
}

export function Input({ error, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...props} aria-invalid={Boolean(error)} className={clsx('min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-rose-400', className)} />
}

export function Select({ error, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return <select {...props} aria-invalid={Boolean(error)} className={clsx('min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-rose-400', className)}>{children}</select>
}

export function Textarea({ error, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...props} aria-invalid={Boolean(error)} className={clsx('min-h-28 rounded-xl border border-slate-300 p-3 text-sm font-semibold outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-rose-400', className)} />
}
