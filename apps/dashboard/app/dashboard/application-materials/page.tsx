'use client'

import { useI18n } from '@/lib/i18n/context'
import { Card } from '@/components/ui/card'
import { FileText, Mail, Linkedin } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ApplicationMaterialsPage() {
  const { t } = useI18n()

  const materials = [
    {
      title: t.navigation.cv,
      description: 'Manage and optimize your CV/Resume documents',
      icon: FileText,
      href: '/application-materials/cv',
      color: 'bg-blue-500'
    },
    {
      title: t.navigation.coverLetters,
      description: 'Generate targeted cover letters for specific jobs',
      icon: Mail,
      href: '/application-materials/cover-letters',
      color: 'bg-green-500'
    },
    {
      title: t.navigation.linkedinProfile,
      description: 'Analyze and optimize your LinkedIn profile',
      icon: Linkedin,
      href: '/application-materials/linkedin-profile',
      color: 'bg-linkedin'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.navigation.applicationMaterials}</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your job application materials in one place
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {materials.map((material) => {
          const Icon = material.icon
          return (
            <Link key={material.href} href={material.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-12 h-12 ${material.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
                <p className="text-gray-600 text-sm">{material.description}</p>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}