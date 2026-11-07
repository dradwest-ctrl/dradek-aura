'use client'

import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, AlertCircle, Send, Globe, MessageSquare, Facebook, Instagram, ShieldCheck, Upload, Video, Image as ImageIcon, Film } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    whatsapp_token: '',
    whatsapp_phone_number_id: '',
    whatsapp_enabled: true,
    facebook_page_id: '',
    facebook_access_token: '',
    facebook_enabled: false,
    instagram_username: 'aurora.luxe0',
    instagram_enabled: true,
    announcement_text: 'LIVRAISON GRATUITE PARTOUT AU MAROC',
    announcement_enabled: true,
    shipping_fee: '30',
    free_shipping_threshold: '500',
    hero_banner_url: '/assets/banners/luxury_watch_banner_4k.png',
    hero_title: 'L\'élégance à chaque instant',
    hero_subtitle: 'Montres de luxe pour homme et femme — livrées partout au Maroc avec paiement à la livraison.',
    hero_badge: 'Collection 2026 · Maroc',
    cinematic_video_url: '/assets/videos/auroraluxe-showreel.mp4.mp4',
    cinematic_badge: 'Cinematic Experience',
    cinematic_title: 'EXPERIENCE AURORALUXE',
    cinematic_desc: 'Plongez dans l\'univers de l\'horlogerie de prestige. Découvrez l\'art et la précision de nos créations exclusives.',
    cinematic_enabled: true,
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testingWa, setTestingWa] = useState(false)
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [bannerUploadMsg, setBannerUploadMsg] = useState<string | null>(null)
  const [videoUploadMsg, setVideoUploadMsg] = useState<string | null>(null)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          whatsapp_number: data.whatsapp_number || '212664810767',
          whatsapp_token: data.whatsapp_token || '',
          whatsapp_phone_number_id: data.whatsapp_phone_number_id || '',
          whatsapp_enabled: data.whatsapp_enabled !== 'false',
          facebook_page_id: data.facebook_page_id || '',
          facebook_access_token: data.facebook_access_token || '',
          facebook_enabled: data.facebook_enabled === 'true',
          instagram_username: data.instagram_username || 'aurora.luxe0',
          instagram_enabled: data.instagram_enabled !== 'false',
          announcement_text: data.announcement_text || 'LIVRAISON GRATUITE PARTOUT AU MAROC',
          announcement_enabled: data.announcement_enabled === 'true',
          shipping_fee: data.shipping_fee || '30',
          free_shipping_threshold: data.free_shipping_threshold || '500',
          hero_banner_url: data.hero_banner_url || '/assets/banners/luxury_watch_banner_4k.png',
          hero_title: data.hero_title || 'L\'élégance à chaque instant',
          hero_subtitle: data.hero_subtitle || 'Montres de luxe pour homme et femme — livrées partout au Maroc avec paiement à la livraison.',
          hero_badge: data.hero_badge || 'Collection 2026 · Maroc',
          cinematic_video_url: data.cinematic_video_url || '/assets/videos/auroraluxe-showreel.mp4.mp4',
          cinematic_badge: data.cinematic_badge || 'Cinematic Experience',
          cinematic_title: data.cinematic_title || 'EXPERIENCE AURORALUXE',
          cinematic_desc: data.cinematic_desc || 'Plongez dans l\'univers de l\'horlogerie de prestige. Découvrez l\'art et la précision de nos créations exclusives.',
          cinematic_enabled: data.cinematic_enabled !== 'false',
        }))
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }))
      for (const entry of entries) {
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'banner' | 'video') => {
    if (type === 'banner') {
      setUploadingBanner(true)
      setBannerUploadMsg(null)
    } else {
      setUploadingVideo(true)
      setVideoUploadMsg(null)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du téléchargement')
      }

      if (type === 'banner') {
        setSettings((s) => ({ ...s, hero_banner_url: data.url }))
        setBannerUploadMsg('Bannière 4K téléchargée avec succès ! N\'oubliez pas de sauvegarder.')
      } else {
        setSettings((s) => ({ ...s, cinematic_video_url: data.url }))
        setVideoUploadMsg('Vidéo cinématique téléchargée avec succès ! N\'oubliez pas de sauvegarder.')
      }
    } catch (err: any) {
      if (type === 'banner') {
        setBannerUploadMsg(err.message || 'Erreur lors du téléchargement de la bannière')
      } else {
        setVideoUploadMsg(err.message || 'Erreur lors du téléchargement de la vidéo')
      }
    } finally {
      if (type === 'banner') {
        setUploadingBanner(false)
      } else {
        setUploadingVideo(false)
      }
    }
  }

  const handleTestWhatsApp = async () => {
    setTestingWa(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: settings.whatsapp_number,
          whatsapp_token: settings.whatsapp_token,
          whatsapp_phone_number_id: settings.whatsapp_phone_number_id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestResult({ success: true, message: 'Message de test WhatsApp envoyé avec succès !' })
      } else {
        setTestResult({ success: false, message: data.error || 'Échec de l\'envoi du message de test' })
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Erreur réseau' })
    } finally {
      setTestingWa(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Paramètres & Intégrations</h1>
          <p className="text-sm text-neutral-400 mt-1">Gérez la configuration générale, la bannière Hero 4K, la vidéo cinématique et les notifications sociales.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 text-sm shadow-md"
        >
          {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Sauvegarder tout'}
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-sm font-medium flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          Paramètres mis à jour avec succès dans toute l'application.
        </div>
      )}

      {/* ── 1. Homepage Hero Banner & Cinematic Video Management ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm space-y-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2 text-white">
            <Film className="h-5 w-5 text-amber-400" />
            Gestion de la Page d'Accueil (Hero Banner & Vidéo Cinématique)
          </h2>
          <p className="text-sm text-neutral-400">Personnalisez les visuels, les textes et les médias phares de la page d'accueil d'Aurora Luxe.</p>
        </div>

        {/* Hero Banner Section */}
        <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Bannière Hero (4K)</h3>
                <p className="text-xs text-neutral-400">Image de fond principale de la page d'accueil (haute résolution).</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingBanner ? 'Téléchargement...' : 'Changer l\'image 4K'}
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'banner')
              }}
            />
          </div>

          {bannerUploadMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium ${bannerUploadMsg.includes('succès') ? 'bg-emerald-950 text-emerald-200 border border-emerald-800' : 'bg-red-950 text-red-200 border border-red-800'}`}>
              {bannerUploadMsg}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">URL / Chemin de l'image actuelle</label>
                <input
                  type="text"
                  value={settings.hero_banner_url}
                  onChange={(e) => setSettings((s) => ({ ...s, hero_banner_url: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Badge (Au-dessus du titre)</label>
                <input
                  type="text"
                  value={settings.hero_badge}
                  onChange={(e) => setSettings((s) => ({ ...s, hero_badge: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Titre Principal (H1)</label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) => setSettings((s) => ({ ...s, hero_title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Sous-titre / Description</label>
                <textarea
                  rows={2}
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings((s) => ({ ...s, hero_subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Aperçu en direct (Hero)</label>
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-black border border-neutral-800 flex items-end p-4">
                <img
                  src={settings.hero_banner_url}
                  alt="Aperçu bannière"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] tracking-widest uppercase text-white/90 font-semibold">{settings.hero_badge}</span>
                  <p className="font-serif text-lg font-bold text-white leading-tight">{settings.hero_title}</p>
                  <p className="text-[11px] text-white/80 line-clamp-1">{settings.hero_subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Experience Video Section */}
        <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Vidéo Cinématique (Showreel)</h3>
                <p className="text-xs text-neutral-400">Section vidéo immersive de la page d'accueil (MP4 haute qualité).</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cinematic_enabled}
                  onChange={(e) => setSettings((s) => ({ ...s, cinematic_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
                />
                <span className="text-xs font-medium text-white">Afficher sur le site</span>
              </label>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingVideo ? 'Téléchargement...' : 'Changer la vidéo MP4'}
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'video')
                }}
              />
            </div>
          </div>

          {videoUploadMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium ${videoUploadMsg.includes('succès') ? 'bg-emerald-950 text-emerald-200 border border-emerald-800' : 'bg-red-950 text-red-200 border border-red-800'}`}>
              {videoUploadMsg}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">URL / Chemin de la vidéo</label>
                <input
                  type="text"
                  value={settings.cinematic_video_url}
                  onChange={(e) => setSettings((s) => ({ ...s, cinematic_video_url: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Badge</label>
                  <input
                    type="text"
                    value={settings.cinematic_badge}
                    onChange={(e) => setSettings((s) => ({ ...s, cinematic_badge: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Titre Section</label>
                  <input
                    type="text"
                    value={settings.cinematic_title}
                    onChange={(e) => setSettings((s) => ({ ...s, cinematic_title: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Description</label>
                <textarea
                  rows={2}
                  value={settings.cinematic_desc}
                  onChange={(e) => setSettings((s) => ({ ...s, cinematic_desc: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Aperçu vidéo en direct</label>
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-black border border-neutral-800">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={settings.cinematic_video_url} type="video/mp4" />
                </video>
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <p className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase">{settings.cinematic_badge}</p>
                  <p className="text-xs text-white font-serif">{settings.cinematic_title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. General Store Settings ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-neutral-400" />
          Paramètres généraux du magasin
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Frais de livraison (MAD)</label>
            <input
              type="number"
              value={settings.shipping_fee}
              onChange={(e) => setSettings((s) => ({ ...s, shipping_fee: e.target.value }))}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Seuil livraison gratuite (MAD)</label>
            <input
              type="number"
              value={settings.free_shipping_threshold}
              onChange={(e) => setSettings((s) => ({ ...s, free_shipping_threshold: e.target.value }))}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white text-sm"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-800">
          <h3 className="font-semibold text-base mb-3 text-neutral-200">Annonce du site (Barre supérieure)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Texte de l'annonce</label>
              <input
                type="text"
                value={settings.announcement_text}
                onChange={(e) => setSettings((s) => ({ ...s, announcement_text: e.target.value }))}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white text-sm"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, announcement_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-white focus:ring-white"
              />
              <span className="text-sm font-medium text-neutral-300">Activer la barre d'annonce sur le site</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── 3. Social & Notifications Integrations ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm space-y-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            Intégrations Sociales & Notifications
          </h2>
          <p className="text-sm text-neutral-400">Configurez vos canaux de notification WhatsApp et vos pages professionnelles Facebook & Instagram.</p>
        </div>

        {/* ── WhatsApp Notifications ── */}
        <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">WhatsApp Cloud API (Notifications de commandes)</h3>
                <p className="text-xs text-neutral-400">Envoie un récapitulatif instantané de chaque nouvelle commande sur votre WhatsApp.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, whatsapp_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
              />
              <span className="text-sm font-medium text-white">Activer WhatsApp</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Numéro de téléphone (Destinataire)</label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value }))}
                placeholder="212664810767"
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Format international sans + (ex: 212664810767)</span>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Phone Number ID (Meta API)</label>
              <input
                type="text"
                value={settings.whatsapp_phone_number_id}
                onChange={(e) => setSettings((s) => ({ ...s, whatsapp_phone_number_id: e.target.value }))}
                placeholder="Ex: 10482910..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Access Token (Meta Cloud API)</label>
              <input
                type="password"
                value={settings.whatsapp_token}
                onChange={(e) => setSettings((s) => ({ ...s, whatsapp_token: e.target.value }))}
                placeholder="EAA..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={testingWa || !settings.whatsapp_token || !settings.whatsapp_phone_number_id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {testingWa ? 'Envoi du test...' : 'Envoyer un message de test WhatsApp'}
            </button>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Sécurisé par le chiffrement Meta Cloud API
            </span>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${testResult.success ? 'bg-emerald-950 text-emerald-200 border border-emerald-800' : 'bg-red-950 text-red-200 border border-red-800'}`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
              {testResult.message}
            </div>
          )}
        </div>

        {/* ── Facebook Integration ── */}
        <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                <Facebook className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Facebook Business Page Integration</h3>
                <p className="text-xs text-neutral-400">Connecté à <a href="https://www.facebook.com/profile.php?id=61595991281125" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">Aurora Luxe Facebook Page</a>.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={settings.facebook_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, facebook_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
              />
              <span className="text-sm font-medium text-white">Activer Facebook</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Facebook Page ID</label>
              <input
                type="text"
                value={settings.facebook_page_id}
                onChange={(e) => setSettings((s) => ({ ...s, facebook_page_id: e.target.value }))}
                placeholder="Ex: 61595991281125"
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Page Access Token</label>
              <input
                type="password"
                value={settings.facebook_access_token}
                onChange={(e) => setSettings((s) => ({ ...s, facebook_access_token: e.target.value }))}
                placeholder="EAA..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-between pt-1">
            <span>Statut: <strong className={settings.facebook_enabled && settings.facebook_access_token ? 'text-emerald-400' : 'text-amber-400'}>{settings.facebook_enabled && settings.facebook_access_token ? 'Connecté et Actif' : 'En attente de configuration'}</strong></span>
            <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Obtenir un jeton d'accès Graph API →</a>
          </div>
        </div>

        {/* ── Instagram Integration ── */}
        <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-950/80 border border-pink-800 flex items-center justify-center text-pink-400">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Instagram Official Integration</h3>
                <p className="text-xs text-neutral-400">Connecté au compte officiel <a href="https://www.instagram.com/aurora.luxe0/" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">@aurora.luxe0</a>.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={settings.instagram_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, instagram_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
              />
              <span className="text-sm font-medium text-white">Activer Instagram</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Nom d'utilisateur Instagram</label>
              <input
                type="text"
                value={settings.instagram_username}
                onChange={(e) => setSettings((s) => ({ ...s, instagram_username: e.target.value }))}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
            <div className="flex items-center pt-6">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg w-full flex items-center justify-between">
                <span className="text-xs text-neutral-300">Lien public:</span>
                <a href="https://www.instagram.com/aurora.luxe0/" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 font-medium hover:underline">
                  instagram.com/aurora.luxe0 ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 text-sm shadow-xl"
        >
          {saving ? 'Enregistrement en cours...' : 'Enregistrer toutes les modifications'}
        </button>
      </div>
    </div>
  )
}
