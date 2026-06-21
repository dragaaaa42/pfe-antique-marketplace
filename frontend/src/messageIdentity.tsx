import { useEffect, useState } from 'react'
import type { AuthUser } from './api'
import type { ConversationDetail, ConversationSummary } from './types'

type ConversationRecord = ConversationSummary | ConversationDetail

const avatarImagePattern = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i

function emailHandle(value?: string | null) {
  const normalized = (value ?? '').trim()
  if (!normalized) return ''
  return normalized.split('@')[0]?.trim() ?? ''
}

function normalizeAvatarSource(value?: string | null) {
  const normalized = (value ?? '').trim()
  if (!normalized) return ''
  if (normalized.startsWith('data:image/')) return normalized
  if (avatarImagePattern.test(normalized)) return normalized
  return ''
}

export function makeInitials(label: string) {
  const clean = label.trim()
  if (!clean) return 'AE'
  const parts = clean.split(/\s+/).slice(0, 2)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function buildDisplayName({
  firstName,
  lastName,
  username,
  email,
  fallback,
}: {
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  email?: string | null
  fallback: string
}) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()
  if (fullName) return fullName

  const cleanUsername = (username ?? '').trim()
  if (cleanUsername) {
    return cleanUsername.includes('@') ? emailHandle(cleanUsername) || fallback : cleanUsername
  }

  const handle = emailHandle(email)
  return handle || fallback
}

export function currentUserDisplayName(user: AuthUser | null | undefined, fallback: string) {
  return buildDisplayName({
    firstName: user?.first_name,
    lastName: user?.last_name,
    username: user?.username,
    email: user?.email,
    fallback,
  })
}

export function currentUserAvatarPath(user: AuthUser | null | undefined) {
  return normalizeAvatarSource(user?.profile?.avatar_3d_path)
}

export function getConversationBuyerIdentity(conversation: ConversationRecord) {
  return {
    label: buildDisplayName({
      firstName: conversation.buyer_first_name,
      lastName: conversation.buyer_last_name,
      username: conversation.buyer_username,
      email: conversation.buyer_email,
      fallback: 'Collector',
    }),
    avatarPath: normalizeAvatarSource(conversation.buyer_avatar_path),
  }
}

export function getConversationSellerIdentity(conversation: ConversationRecord) {
  return {
    label: buildDisplayName({
      firstName: conversation.seller_first_name,
      lastName: conversation.seller_last_name,
      username: conversation.seller_username,
      email: conversation.seller_email,
      fallback: 'Verified seller',
    }),
    avatarPath: normalizeAvatarSource(conversation.seller_avatar_path),
  }
}

export function UserAvatar({
  label,
  avatarPath,
  className,
  initialsClassName,
  imageClassName = 'h-full w-full object-cover',
}: {
  label: string
  avatarPath?: string | null
  className: string
  initialsClassName: string
  imageClassName?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSource = imageFailed ? '' : normalizeAvatarSource(avatarPath)

  useEffect(() => {
    setImageFailed(false)
  }, [avatarPath])

  return (
    <div className={className}>
      {imageSource ? (
        <img
          alt={label}
          className={imageClassName}
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={imageSource}
        />
      ) : (
        <span className={initialsClassName}>{makeInitials(label)}</span>
      )}
    </div>
  )
}
