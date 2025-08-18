'use client'

import { useEffect } from 'react'
import { CheckCircle2, Cloud, HardDrive, Sparkles, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // 自动关闭
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border border-green-100 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full opacity-10 blur-2xl" />
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* 成功图标动画 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-4">
                <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in duration-500" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          {/* 标题 */}
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">
            {title || "保存成功！"}
          </h3>
          
          {/* 消息 */}
          <p className="text-center text-gray-600 mb-6">
            {message || "您的简历档案已成功保存"}
          </p>
          
          {/* 状态指示器 */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Cloud className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-600">云端已同步</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                <HardDrive className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-600">本地已备份</span>
            </div>
          </div>
          
          {/* 进度条动画 */}
          <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-[shrink_4s_linear]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 添加动画样式
const animationStyles = `
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`

// 将样式注入到页面
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = animationStyles
  document.head.appendChild(style)
}